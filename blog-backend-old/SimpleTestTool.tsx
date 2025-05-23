import React from 'react'

export default function SimpleTestTool() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Tool</h1>
      <p>If you can see this, custom tools are working!</p>
      <button onClick={() => alert('Tool is working!')}>Click me</button>
    </div>
  )
} 