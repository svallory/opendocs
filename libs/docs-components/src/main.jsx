import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import './styles/model-diagram.css'
import './styles/feature-panel.css'
import './styles/feature-explorer.css'
import './styles/documentation-panel.css'
import './styles/full-model-explorer.css'
import { ModelDiagram } from './components/ModelDiagram'
import { FeatureExplorer } from './components/FeatureExplorer'
import { FullModelExplorer } from './components/FullModelExplorer'

// ============================================
// Legacy Demo Diagram (diagram-root)
// ============================================

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  { id: '3', position: { x: 200, y: 50 }, data: { label: 'Node 3' } },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
]

function DemoFlow() {
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

// ============================================
// Render Functions
// ============================================

const roots = {}
const containers = {}

function renderDemoFlow(container) {
  // Check if already rendered to this specific container
  if (roots['demo'] && containers['demo'] === container && container.hasChildNodes()) {
    return
  }

  // Clean up old root if container changed
  if (roots['demo'] && containers['demo'] !== container) {
    try {
      roots['demo'].unmount()
    } catch (e) {
      // Ignore unmount errors
    }
  }

  if (!container.style.height) {
    container.style.height = '600px'
  }
  if (!container.style.width) {
    container.style.width = '100%'
  }

  containers['demo'] = container
  roots['demo'] = createRoot(container)
  roots['demo'].render(<DemoFlow />)
}

function renderModelDiagram(container) {
  // Check if already rendered to this specific container
  if (roots['model'] && containers['model'] === container && container.hasChildNodes()) {
    return
  }

  // Clean up old root if container changed
  if (roots['model'] && containers['model'] !== container) {
    try {
      roots['model'].unmount()
    } catch (e) {
      // Ignore unmount errors
    }
  }

  if (!container.style.height) {
    container.style.height = '600px'
  }
  if (!container.style.width) {
    container.style.width = '100%'
  }

  // Get options from data attributes
  const variant = container.dataset.variant || 'full'
  const showKind = container.dataset.showKind === 'true'

  containers['model'] = container
  roots['model'] = createRoot(container)
  roots['model'].render(<ModelDiagram variant={variant} showKind={showKind} />)
}

function renderFeatureExplorer(container) {
  // Check if already rendered to this specific container
  if (roots['feature'] && containers['feature'] === container && container.hasChildNodes()) {
    return
  }

  // Clean up old root if container changed
  if (roots['feature'] && containers['feature'] !== container) {
    try {
      roots['feature'].unmount()
    } catch (e) {
      // Ignore unmount errors
    }
  }

  // Get options from data attributes
  const variant = container.dataset.variant || 'simple'
  const showKind = container.dataset.showKind === 'true'
  const defaultFeature = container.dataset.defaultFeature || null
  const useAutoLayout = container.dataset.useAutoLayout !== 'false'

  containers['feature'] = container
  roots['feature'] = createRoot(container)
  roots['feature'].render(
    <FeatureExplorer
      variant={variant}
      showKind={showKind}
      defaultFeature={defaultFeature}
      useAutoLayout={useAutoLayout}
    />
  )
}

function renderFullModelExplorer(container) {
  // Check if already rendered to this specific container
  if (roots['fullmodel'] && containers['fullmodel'] === container && container.hasChildNodes()) {
    return
  }

  // Clean up old root if container changed
  if (roots['fullmodel'] && containers['fullmodel'] !== container) {
    try {
      roots['fullmodel'].unmount()
    } catch (e) {
      // Ignore unmount errors
    }
  }

  // Get options from data attributes
  const variant = container.dataset.variant || 'full'
  const showKind = container.dataset.showKind !== 'false'

  containers['fullmodel'] = container
  roots['fullmodel'] = createRoot(container)
  roots['fullmodel'].render(
    <FullModelExplorer
      variant={variant}
      showKind={showKind}
    />
  )
}

function renderAll() {
  // Check for legacy demo diagram
  const demoContainer = document.getElementById('diagram-root')
  if (demoContainer) {
    renderDemoFlow(demoContainer)
  }

  // Check for model diagram
  const modelContainer = document.getElementById('model-diagram-root')
  if (modelContainer) {
    renderModelDiagram(modelContainer)
  }

  // Check for feature explorer
  const featureContainer = document.getElementById('feature-explorer-root')
  if (featureContainer) {
    renderFeatureExplorer(featureContainer)
  }

  // Check for full model explorer
  const fullModelContainer = document.getElementById('full-model-explorer-root')
  if (fullModelContainer) {
    renderFullModelExplorer(fullModelContainer)
  }
}

// Wait for Next.js hydration to complete before rendering
function waitAndRender() {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      setTimeout(renderAll, 100)
    })
  } else {
    setTimeout(renderAll, 500)
  }
}

// Run after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitAndRender)
} else {
  waitAndRender()
}

// Watch for DOM changes (e.g., theme switches that re-render the page)
const observer = new MutationObserver((mutations) => {
  // Check if our containers were re-added or emptied
  const modelContainer = document.getElementById('model-diagram-root')
  const demoContainer = document.getElementById('diagram-root')
  const featureContainer = document.getElementById('feature-explorer-root')
  const fullModelContainer = document.getElementById('full-model-explorer-root')

  if (modelContainer && !modelContainer.hasChildNodes()) {
    setTimeout(() => renderModelDiagram(modelContainer), 100)
  }
  if (demoContainer && !demoContainer.hasChildNodes()) {
    setTimeout(() => renderDemoFlow(demoContainer), 100)
  }
  if (featureContainer && !featureContainer.hasChildNodes()) {
    setTimeout(() => renderFeatureExplorer(featureContainer), 100)
  }
  if (fullModelContainer && !fullModelContainer.hasChildNodes()) {
    setTimeout(() => renderFullModelExplorer(fullModelContainer), 100)
  }
})

// Observe the document body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
})

// Export for external use
export { ModelDiagram }
export { FeatureExplorer }
export { FullModelExplorer }
export { FeaturePanel } from './components/FeaturePanel'
export { DocumentationPanel } from './components/DocumentationPanel'
export { fireModelSelectEvent, onModelSelect } from './utils/events'
export { FEATURES } from './data/features'
