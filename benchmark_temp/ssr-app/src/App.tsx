
import React, { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Nexxo SSR + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Nexxo logo to learn more
      </p>
    </>
  )
}

export default App
