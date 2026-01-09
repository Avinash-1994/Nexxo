import m from 'mithril';
import './index.css';

const App: m.Component = {
    view: () => m(".app-container", [
        m("header.hero", [
            m("span.badge", "v1.0.0 Stable"),
            m("h1", "Nexxo"),
            m("p.subtitle", [
                "The high-performance build engine for modern web applications.",
                m("br"),
                "Built with Mithril + Nexxo."
            ])
        ]),
        m("main.features", [
            m(".feature-card", [
                m("h3", "Native Core"),
                m("p", "Rust-powered hashing and scanning.")
            ]),
            m(".feature-card", [
                m("h3", "Sub-100ms HMR"),
                m("p", "Instant feedback loop.")
            ]),
            m(".feature-card", [
                m("h3", "10k Module Scale"),
                m("p", "Architected for massive graphs.")
            ])
        ]),
        m(".code-area", [
            m("span", { style: { color: '#6366F1' } }, "$ "),
            "nexxo build --optimize",
            m("br"),
            m("span", { style: { color: '#94A3B8', opacity: 0.6 } }, "// Generating optimized production bundle..."),
            m("br"),
            m("span", { style: { color: '#10B981' } }, "✓ Build complete in 1.4s")
        ]),
        m("footer.footer", [
            "Powered by ",
            m("a", { href: "https://nexxo.dev", target: "_blank" }, "Nexxo Build Tool")
        ])
    ])
};

m.mount(document.getElementById('root')!, App);
