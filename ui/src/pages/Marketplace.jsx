import React, { useEffect, useState } from 'react'

export default function Marketplace() {
  const [plugins, setPlugins] = useState([])
  useEffect(() => {
    fetch('/api/marketplace/plugins').then((r) => r.json()).then((d) => setPlugins(d.plugins || []))
  }, [])
  return (
    <div style={{ padding: 20 }}>
      <h2>Plugin Marketplace (Prototype)</h2>
      <ul>
        {plugins.map((p) => (<li key={p.id}><strong>{p.name}</strong> — {p.description}</li>))}
      </ul>
    </div>
  )
}
