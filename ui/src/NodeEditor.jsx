import React, { useRef, useState } from 'react'

function Node({ node, onDrag }) {
  const ref = useRef()
  function handleMouseDown(e) {
    const startX = e.clientX
    const startY = e.clientY
    const rect = ref.current.getBoundingClientRect()
    function onMove(ev) {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      onDrag(node.id, rect.left + dx, rect.top + dy)
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div ref={ref} onMouseDown={handleMouseDown} style={{ position: 'absolute', left: node.x, top: node.y, padding: 10, background: '#fff', border: '1px solid #ccc', borderRadius: 6, cursor: 'grab' }}>
      <div style={{ fontWeight: 'bold' }}>{node.type}</div>
      <div style={{ fontSize: 12 }}>{node.label}</div>
    </div>
  )
}

export default function NodeEditor({ nodes, setNodes }) {
  function addNode(type = 'entry') {
    const id = 'n' + Date.now()
    const node = { id, type, label: type + '-' + id.slice(-4), x: 50, y: 50 }
    setNodes((s) => [...s, node])
  }

  function onDrag(id, x, y) {
    setNodes((s) => s.map((n) => (n.id === id ? { ...n, x, y } : n)))
  }

  return (
    <div style={{ position: 'relative', height: 400, background: '#f6f7fb', border: '1px dashed #ddd', overflow: 'hidden' }}>
      <div style={{ padding: 8 }}>
        <button onClick={() => addNode('entry')}>Add entry</button>
        <button onClick={() => addNode('plugin')} style={{ marginLeft: 8 }}>Add plugin</button>
      </div>
      {nodes.map((n) => <Node key={n.id} node={n} onDrag={onDrag} />)}
    </div>
  )
}
