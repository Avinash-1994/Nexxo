/// Phase 3.2 — Source Map Merger
///
/// Correctly composes N source maps (from SWC + LightningCSS) into one
/// final merged map. Uses the `sourcemap` crate for VLQ encoding.
use napi_derive::napi;
use napi::bindgen_prelude::*;
use sourcemap::{SourceMap, SourceMapBuilder};

/// Merge an ordered list of serialised source maps into a single map.
///
/// Maps are applied left-to-right: the output of map[0] is the input of map[1], etc.
///
/// N-API export (new, additive): mergeSourceMaps(maps: string[]): string
#[napi(js_name = "mergeSourceMaps")]
pub fn merge_source_maps(maps: Vec<String>) -> Result<String> {
    if maps.is_empty() {
        return Ok("{}".to_string());
    }

    if maps.len() == 1 {
        // Validate and return as-is
        SourceMap::from_slice(maps[0].as_bytes())
            .map_err(|e| Error::new(Status::GenericFailure, format!("Invalid source map: {}", e)))?;
        return Ok(maps[0].clone());
    }

    // Parse first map as base
    let mut merged = SourceMap::from_slice(maps[0].as_bytes())
        .map_err(|e| Error::new(Status::GenericFailure, format!("Invalid source map [0]: {}", e)))?;

    // Compose each subsequent map
    for (idx, raw) in maps[1..].iter().enumerate() {
        let next = SourceMap::from_slice(raw.as_bytes())
            .map_err(|e| Error::new(Status::GenericFailure,
                format!("Invalid source map [{}]: {}", idx + 1, e)))?;

        merged = compose_maps(merged, next)
            .map_err(|e| Error::new(Status::GenericFailure, e))?;
    }

    // Serialise to JSON
    let mut buf: Vec<u8> = Vec::new();
    merged.to_writer(&mut buf)
        .map_err(|e| Error::new(Status::GenericFailure, format!("Serialise error: {}", e)))?;

    String::from_utf8(buf)
        .map_err(|e| Error::new(Status::GenericFailure, format!("UTF-8 error: {}", e)))
}

/// Compose two source maps: `inner` maps generated → original1,
/// `outer` maps generated → original2 where generated == output of inner.
/// Result maps generated → original1.
fn compose_maps(inner: SourceMap, outer: SourceMap) -> std::result::Result<SourceMap, String> {
    let mut builder = SourceMapBuilder::new(None);

    for token in outer.tokens() {
        // Look up the token in the inner map to find the real source position
        if let Some(inner_token) = inner.lookup_token(
            token.get_src_line(),
            token.get_src_col(),
        ) {
            if let Some(src) = inner_token.get_source() {
                let src_id = builder.add_source(src);
                builder.set_source_contents(
                    src_id,
                    inner_token.get_source_view().map(|v| v.source()),
                );
                let name_id = inner_token.get_name().map(|n| builder.add_name(n));

                // add_raw(dst_line, dst_col, src_line, src_col, src_id, name_id, is_range)
                builder.add_raw(
                    token.get_dst_line(),
                    token.get_dst_col(),
                    inner_token.get_src_line(),
                    inner_token.get_src_col(),
                    Some(src_id),
                    name_id,
                    false,
                );
            }
        } else {
            // No inner mapping — carry outer token through
            let src_id = token.get_source().map(|s| builder.add_source(s));
            let name_id = token.get_name().map(|n| builder.add_name(n));

            builder.add_raw(
                token.get_dst_line(),
                token.get_dst_col(),
                token.get_src_line(),
                token.get_src_col(),
                src_id,
                name_id,
                false,
            );
        }
    }

    Ok(builder.into_sourcemap())
}
