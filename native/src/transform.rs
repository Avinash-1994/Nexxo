
use swc_common::{SourceMap, FileName, FilePathMapping, GLOBALS, Mark};
use swc_common::sync::Lrc;
use swc_core::ecma::parser::{Parser, StringInput, Syntax, TsConfig};
use swc_core::ecma::codegen::{Config, Emitter, text_writer::JsWriter};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::ecma::minifier::{optimize, option::{MinifyOptions, ExtraOptions, TopLevelOptions}};
use swc_ecma_transforms_base::fixer::fixer;
use swc_ecma_transforms_base::hygiene::hygiene;
use swc_ecma_transforms_base::resolver;
use lightningcss::stylesheet::{StyleSheet, ParserOptions, MinifyOptions as CssMinifyOptions, PrinterOptions};
use regex::Regex;

pub fn transform_vue(code: String, filename: String, _is_dev: bool) -> Result<String, String> {
    // 1. Extract script
    let script_regex = Regex::new(r"(?s)<script[^>]*>(.*?)</script>").map_err(|e| e.to_string())?;
    let script_content = script_regex.captures(&code)
        .map(|c| c.get(1).unwrap().as_str().to_string())
        .unwrap_or_else(|| "export default {};".to_string());

    // 2. Transform script
    let js_res = transform_js(script_content, filename.clone(), false)?;

    // 3. Extract template
    let template_regex = Regex::new(r"(?s)<template>(.*?)</template>").map_err(|e| e.to_string())?;
    let template_content = template_regex.captures(&code)
        .map(|c| c.get(1).unwrap().as_str())
        .unwrap_or("");

    let output = format!(
        "{}\n
        // Native Vue Transform
        const __sfc_main = exports.default || module.exports;
        __sfc_main.template = `{}`;
        exports.default = __sfc_main;",
        js_res,
        template_content.replace('`', "\\`").replace("${", "\\${")
    );

    Ok(output)
}

pub fn transform_css(code: String, _filename: String, minify: bool) -> Result<String, String> {
    let mut stylesheet = StyleSheet::parse(&code, ParserOptions::default())
        .map_err(|e| format!("CSS Parse Error: {:?}", e))?;

    if minify {
        stylesheet.minify(CssMinifyOptions::default())
            .map_err(|e| format!("CSS Minify Error: {:?}", e))?;
    }

    let res = stylesheet.to_css(PrinterOptions {
        minify,
        ..Default::default()
    }).map_err(|e| format!("CSS Print Error: {:?}", e))?;

    Ok(res.code)
}

pub fn transform_js(code: String, filename: String, minify_opts: bool) -> Result<String, String> {
    GLOBALS.set(&Default::default(), || {
        let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));
        let fm = cm.new_source_file(FileName::Real(filename.into()), code);

        let mut parser = Parser::new(
            Syntax::Typescript(TsConfig {
                tsx: true,
                decorators: true,
                ..Default::default()
            }),
            StringInput::from(&*fm),
            None,
        );

        let mut module = parser.parse_module().map_err(|e| format!("Parser Error: {:?}", e))?;

        let unresolved_mark = Mark::new();
        let top_level_mark = Mark::new();
        module.visit_mut_with(&mut resolver(unresolved_mark, top_level_mark, false));

        // 2. ESM Conversion (Lunx Runtime Format)
        // Instead of stripping, we convert 'export' to 'exports' assignments
        // and 'import' to 'require' calls.
        use swc_core::ecma::ast::*;
        let mut new_body = vec![];

        // Helpers for generating CJS nodes
        let create_exports_assign = |name: String, expr: Box<Expr>| -> ModuleItem {
            ModuleItem::Stmt(Stmt::Expr(ExprStmt {
                span: swc_common::DUMMY_SP,
                expr: Box::new(Expr::Assign(AssignExpr {
                    span: swc_common::DUMMY_SP,
                    op: AssignOp::Assign,
                    left: AssignTarget::Simple(SimpleAssignTarget::Member(MemberExpr {
                        span: swc_common::DUMMY_SP,
                        obj: Box::new(Expr::Ident(Ident::new("exports".into(), swc_common::DUMMY_SP))),
                        prop: MemberProp::Ident(Ident::new(name.into(), swc_common::DUMMY_SP)),
                    })),
                    right: expr,
                })),
            }))
        };

        for item in module.body {
            match item {
                ModuleItem::ModuleDecl(decl) => {
                    match decl {
                        ModuleDecl::ExportDecl(ed) => {
                            match ed.decl {
                                Decl::Var(var) => {
                                    new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Var(var.clone()))));
                                    for def in &var.decls {
                                        if let Pat::Ident(ident) = &def.name {
                                            let name = ident.sym.to_string();
                                            new_body.push(create_exports_assign(name.clone(), Box::new(Expr::Ident(Ident::new(name.into(), swc_common::DUMMY_SP)))));
                                        }
                                    }
                                }
                                Decl::Class(cls) => {
                                    let name = cls.ident.sym.to_string();
                                    new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Class(cls.clone()))));
                                    new_body.push(create_exports_assign(name.clone(), Box::new(Expr::Ident(Ident::new(name.into(), swc_common::DUMMY_SP)))));
                                }
                                Decl::Fn(f) => {
                                    let name = f.ident.sym.to_string();
                                    new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Fn(f.clone()))));
                                    new_body.push(create_exports_assign(name.clone(), Box::new(Expr::Ident(Ident::new(name.into(), swc_common::DUMMY_SP)))));
                                }
                                _ => {
                                    new_body.push(ModuleItem::Stmt(Stmt::Decl(ed.decl.clone())));
                                }
                            }
                        }
                        ModuleDecl::ExportDefaultDecl(edd) => {
                            match edd.decl {
                                DefaultDecl::Class(cls) => {
                                    let name = cls.ident.as_ref().map(|i| i.sym.to_string()).unwrap_or_else(|| "_default_class".to_string());
                                    new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Class(ClassDecl {
                                        ident: Ident::new(name.clone().into(), swc_common::DUMMY_SP),
                                        class: cls.class,
                                        declare: false,
                                    }))));
                                    new_body.push(create_exports_assign("default".to_string(), Box::new(Expr::Ident(Ident::new(name.into(), swc_common::DUMMY_SP)))));
                                }
                                DefaultDecl::Fn(f) => {
                                    let name = f.ident.as_ref().map(|i| i.sym.to_string()).unwrap_or_else(|| "_default_fn".to_string());
                                    new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Fn(FnDecl {
                                        ident: Ident::new(name.clone().into(), swc_common::DUMMY_SP),
                                        function: f.function,
                                        declare: false,
                                    }))));
                                    new_body.push(create_exports_assign("default".to_string(), Box::new(Expr::Ident(Ident::new(name.into(), swc_common::DUMMY_SP)))));
                                }
                                _ => {}
                            }
                        }
                        ModuleDecl::ExportDefaultExpr(ede) => {
                            new_body.push(create_exports_assign("default".to_string(), ede.expr));
                        }
                        ModuleDecl::Import(import) => {
                            let src = import.src.value.to_string();
                            let mut props = vec![];
                            let mut default_ident = None;
                            let mut namespace_ident = None;

                            for spec in &import.specifiers {
                                match spec {
                                    ImportSpecifier::Named(named) => {
                                        let local = named.local.sym.to_string();
                                        let imported = named.imported.as_ref().map(|i| match i {
                                            ModuleExportName::Ident(id) => id.sym.to_string(),
                                            ModuleExportName::Str(s) => s.value.to_string(),
                                        }).unwrap_or_else(|| local.clone());
                                        
                                        props.push(ObjectPatProp::KeyValue(KeyValuePatProp {
                                            key: PropName::Ident(Ident::new(imported.into(), swc_common::DUMMY_SP)),
                                            value: Box::new(Pat::Ident(BindingIdent {
                                                id: Ident::new(local.into(), swc_common::DUMMY_SP),
                                                type_ann: None,
                                            })),
                                        }));
                                    }
                                    ImportSpecifier::Default(d) => {
                                        default_ident = Some(d.local.sym.to_string());
                                    }
                                    ImportSpecifier::Namespace(ns) => {
                                        namespace_ident = Some(ns.local.sym.to_string());
                                    }
                                }
                            }

                            fn create_require(src: &str) -> Box<Expr> {
                                Box::new(Expr::Call(CallExpr {
                                    span: swc_common::DUMMY_SP,
                                    callee: Callee::Expr(Box::new(Expr::Ident(Ident::new("require".into(), swc_common::DUMMY_SP)))),
                                    args: vec![ExprOrSpread {
                                        spread: None,
                                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                                            span: swc_common::DUMMY_SP,
                                            value: src.into(),
                                            raw: None,
                                        }))),
                                    }],
                                    type_args: None,
                                }))
                            }

                            if let Some(ns) = namespace_ident {
                                new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
                                    span: swc_common::DUMMY_SP,
                                    kind: VarDeclKind::Const,
                                    declare: false,
                                    decls: vec![VarDeclarator {
                                        span: swc_common::DUMMY_SP,
                                        name: Pat::Ident(BindingIdent { id: Ident::new(ns.into(), swc_common::DUMMY_SP), type_ann: None }),
                                        init: Some(create_require(&src)),
                                        definite: false,
                                    }],
                                })))));
                            } else if let Some(d) = default_ident {
                                new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
                                    span: swc_common::DUMMY_SP,
                                    kind: VarDeclKind::Const,
                                    declare: false,
                                    decls: vec![VarDeclarator {
                                        span: swc_common::DUMMY_SP,
                                        name: Pat::Ident(BindingIdent { id: Ident::new(d.into(), swc_common::DUMMY_SP), type_ann: None }),
                                        init: Some(Box::new(Expr::Bin(BinExpr {
                                            span: swc_common::DUMMY_SP,
                                            op: BinaryOp::LogicalOr,
                                            left: Box::new(Expr::Member(MemberExpr {
                                                span: swc_common::DUMMY_SP,
                                                obj: create_require(&src),
                                                prop: MemberProp::Ident(Ident::new("default".into(), swc_common::DUMMY_SP)),
                                            })),
                                            right: create_require(&src),
                                        }))),
                                        definite: false,
                                    }],
                                })))));
                            } else if !props.is_empty() {
                                new_body.push(ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
                                    span: swc_common::DUMMY_SP,
                                    kind: VarDeclKind::Const,
                                    declare: false,
                                    decls: vec![VarDeclarator {
                                        span: swc_common::DUMMY_SP,
                                        name: Pat::Object(ObjectPat { span: swc_common::DUMMY_SP, props, type_ann: None, optional: false }),
                                        init: Some(create_require(&src)),
                                        definite: false,
                                    }],
                                })))));
                            } else {
                                new_body.push(ModuleItem::Stmt(Stmt::Expr(ExprStmt {
                                    span: swc_common::DUMMY_SP,
                                    expr: create_require(&src),
                                })));
                            }
                        }
                        _ => {
                            new_body.push(ModuleItem::Stmt(Stmt::Empty(EmptyStmt { span: swc_common::DUMMY_SP })));
                        }
                    }
                }
                ModuleItem::Stmt(s) => new_body.push(ModuleItem::Stmt(s)),
            }
        }
        module.body = new_body;

        if minify_opts {
            let mut options = MinifyOptions::default();
            let mut compress = swc_core::ecma::minifier::option::CompressOptions::default();
            
            // In dev mode (handled by caller passing minify_opts=true), 
            // we should be careful about unused top-level functions
            compress.unused = false; // Disable unused elimination for top-level exports in this pass
            compress.dead_code = true;
            compress.top_level = Some(TopLevelOptions { functions: false });
            
            options.compress = Some(compress);
            options.mangle = Some(Default::default());
            
            module = optimize(
                module.into(),
                cm.clone(),
                None,
                None,
                &options,
                &ExtraOptions {
                    top_level_mark,
                    unresolved_mark,
                },
            ).expect_module();
        }

        module.visit_mut_with(&mut hygiene());
        module.visit_mut_with(&mut fixer(None));

        let mut buf = vec![];
        {
            let mut wr = JsWriter::new(cm.clone(), "", &mut buf, None);
            let mut cfg = Config::default();
            cfg.minify = true;
            cfg.omit_last_semi = true;
            let mut gen = Emitter {
                cfg,
                cm: cm.clone(),
                comments: None,
                wr: &mut wr,
            };
            gen.emit_module(&module).map_err(|e| format!("Codegen Error: {:?}", e))?;
        }

        String::from_utf8(buf).map_err(|e| format!("UTF8 Error: {:?}", e))
    })
}

pub fn minify_js(code: String) -> Result<String, String> {
    GLOBALS.set(&Default::default(), || {
        let cm = Lrc::new(SourceMap::new(FilePathMapping::empty()));

        // PRE-PASS: Convert any remaining ESM import/export to CJS before parsing.
        // The bundle uses globalThis.d/r runtime, so ESM syntax would break the parser.
        let cleaned_code = pre_convert_esm_to_cjs(code);

        let fm = cm.new_source_file(FileName::Anon, cleaned_code);

        // Parse as Script (NOT Module) - the bundle is a plain script using a custom runtime,
        // not native ES modules. Module mode rejects top-level require() calls.
        let mut parser = Parser::new(
            Syntax::Es(Default::default()),
            StringInput::from(&*fm),
            None,
        );

        let script = parser.parse_script().map_err(|e| format!("Parser Error (M): {:?}", e))?;

        let unresolved_mark = Mark::new();
        let top_level_mark = Mark::new();

        // Convert Script -> Module so we can use the SWC optimizer API
        use swc_core::ecma::ast::*;
        let mut module = Module {
            span: script.span,
            body: script.body.into_iter().map(ModuleItem::Stmt).collect(),
            shebang: None,
        };

        module.visit_mut_with(&mut resolver(unresolved_mark, top_level_mark, false));

        let mut options = swc_core::ecma::minifier::option::MinifyOptions::default();
        let mut compress = swc_core::ecma::minifier::option::CompressOptions::default();
        
        compress.unused = false;        // Don't remove - might be used by runtime
        compress.dead_code = true;      // Strip unreachable code
        compress.join_vars = true;
        compress.collapse_vars = true;  // Safe with passes:3
        compress.reduce_vars = true;    // Needed for full compression
        compress.drop_console = false;
        compress.top_level = None;
        compress.passes = 3;            // Multiple passes for better compression
        
        options.compress = Some(compress);
        
        let mut mangle = swc_core::ecma::minifier::option::MangleOptions::default();
        mangle.top_level = Some(true);  // Aggressive mangling
        mangle.keep_class_names = true; // Preserve class names (Angular/React compat)
        mangle.keep_fn_names = true;    // Preserve function names
        options.mangle = Some(mangle);
        options.rename = false;         // Don't rename - can break runtime references
        
        module = optimize(
            module.into(),
            cm.clone(),
            None,
            None,
            &options,
            &ExtraOptions {
                top_level_mark,
                unresolved_mark,
            },
        ).expect_module();

        module.visit_mut_with(&mut hygiene());
        module.visit_mut_with(&mut fixer(None));

        let mut buf = vec![];
        {
            let mut wr = JsWriter::new(cm.clone(), "", &mut buf, None);
            let mut cfg = Config::default();
            cfg.minify = true;
            cfg.omit_last_semi = true;
            let mut gen = Emitter {
                cfg,
                cm: cm.clone(),
                comments: None,
                wr: &mut wr,
            };
            gen.emit_module(&module).map_err(|e| format!("Codegen Error (M): {:?}", e))?;
        }

        String::from_utf8(buf).map_err(|e| format!("UTF8 Error: {:?}", e))
    })
}

/// Pre-converts any remaining ESM import/export statements to CJS-compatible code
/// before native minification. Handles external library code with hash-based module IDs.
fn pre_convert_esm_to_cjs(code: String) -> String {
    use regex::Regex;
    
    let mut result = code;
    
    // import Default, { Named } from "hash16chars"
    let re1 = Regex::new(r#"(?m)\bimport\s+(\w+)\s*,\s*\{([^}]+)\}\s+from\s+["']([a-f0-9]{16})["'];?"#).unwrap();
    result = re1.replace_all(&result, |caps: &regex::Captures| {
        format!("const {} = require(\"{}\");const {{{}}} = require(\"{}\");",
            &caps[1], &caps[3], &caps[2], &caps[3])
    }).to_string();
    
    // import { Named } from "hash16chars"
    let re2 = Regex::new(r#"(?m)\bimport\s+\{([^}]+)\}\s+from\s+["']([a-f0-9]{16})["'];?"#).unwrap();
    result = re2.replace_all(&result, |caps: &regex::Captures| {
        format!("const {{{}}} = require(\"{}\");", &caps[1], &caps[2])
    }).to_string();
    
    // import Default from "hash16chars"
    let re3 = Regex::new(r#"(?m)\bimport\s+(\w+)\s+from\s+["']([a-f0-9]{16})["'];?"#).unwrap();
    result = re3.replace_all(&result, |caps: &regex::Captures| {
        format!("const {} = require(\"{}\");", &caps[1], &caps[2])
    }).to_string();
    
    // import * as NS from "hash16chars"
    let re4 = Regex::new(r#"(?m)\bimport\s+\*\s+as\s+(\w+)\s+from\s+["']([a-f0-9]{16})["'];?"#).unwrap();
    result = re4.replace_all(&result, |caps: &regex::Captures| {
        format!("const {} = require(\"{}\");", &caps[1], &caps[2])
    }).to_string();
    
    // import "hash16chars" (side-effect only)
    let re5 = Regex::new(r#"(?m)\bimport\s+["']([a-f0-9]{16})["'];?"#).unwrap();
    result = re5.replace_all(&result, |caps: &regex::Captures| {
        format!("require(\"{}\");", &caps[1])
    }).to_string();
    
    result
}
