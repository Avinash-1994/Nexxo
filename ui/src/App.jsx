import React, { useEffect, useState } from 'react'
import './style.css'
import NodeEditor from './NodeEditor'

export default function App() {
  const [configText, setConfigText] = useState('')
  const [status, setStatus] = useState('')
  const [nodes, setNodes] = useState([])

  async function load() {
    setStatus('loading...')
    try {
      const res = await fetch('/api/config')
      if (res.ok) {
        const j = await res.json()
        setConfigText(JSON.stringify(j, null, 2))
        if (j && j.pipeline && Array.isArray(j.pipeline)) {
          setNodes(j.pipeline.map((p, i) => ({ id: 'n' + i, type: p.type || 'step', label: p.name || p.type || 'step', x: 60 + i * 120, y: 60 })))
        }
      } else {
        setConfigText('{}')
      }
    } catch (e) {
      setConfigText('{}')
    }
    setStatus('')
  }

  async function save() {
    setStatus('saving...')
    try {
      const pipeline = nodes.map((n) => ({ type: n.type, name: n.label, position: { x: n.x, y: n.y } }))
      let parsed = {}
      try { parsed = JSON.parse(configText) } catch (e) { parsed = {} }
      parsed.pipeline = pipeline
      await fetch('/api/config', { method: 'POST', body: JSON.stringify(parsed), headers: { 'Content-Type': 'application/json' } })
      setConfigText(JSON.stringify(parsed, null, 2))
      setStatus('saved')
    } catch (e) {
      setStatus('Save failed')
    }
    setTimeout(() => setStatus(''), 1500)
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ padding: 12 }}>
      <h2>NextGen Build - Visual Editor (prototype)</h2>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <textarea value={configText} onChange={(e) => setConfigText(e.target.value)} style={{ width: '100%', height: 200 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={load}>Reload</button>
            <button onClick={save} style={{ marginLeft: 8 }}>Save</button>
            <span style={{ marginLeft: 12 }}>{status}</span>
          </div>
        </div>
        <div style={{ width: 520 }}>
          <NodeEditor nodes={nodes} setNodes={setNodes} />
        </div>
      </div>
    </div>
  )
}
