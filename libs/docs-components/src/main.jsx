import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: '3', position: { x: 200, y: 50 }, data: { label: 'Node 3' } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

function Flow() {
  const [nodes] = useState(initialNodes)
  const [edges] = useState(initialEdges)

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
    />
  )
}

let root = null

function renderDiagram() {
  const container = document.getElementById('diagram-root')
  if (!container) return

  // Skip if already rendered
  if (root) return

  // Ensure container has dimensions
  if (!container.style.height) {
    container.style.height = '600px'
  }
  if (!container.style.width) {
    container.style.width = '100%'
  }

  root = createRoot(container)
  root.render(<Flow />)
}

// Wait for Next.js hydration to complete before rendering
function waitAndRender() {
  // Use requestIdleCallback or setTimeout to wait for hydration
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      setTimeout(renderDiagram, 100)
    })
  } else {
    setTimeout(renderDiagram, 500)
  }
}

// Run after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitAndRender)
} else {
  waitAndRender()
}
