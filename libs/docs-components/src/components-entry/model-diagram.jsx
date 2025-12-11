import React from 'react'
import { createRoot } from 'react-dom/client'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '../styles/model-diagram.css'
import { ModelDiagram } from '../components/ModelDiagram'

// Auto-hydrate all elements with data-component="model-diagram"
function hydrate() {
  document.querySelectorAll('[data-component="model-diagram"]').forEach((el) => {
    // Skip if already hydrated
    if (el.dataset.hydrated === 'true') return

    // Extract props from data attributes
    const props = {
      variant: el.dataset.variant || 'full',
      showKind: el.dataset.showKind === 'true',
      feature: el.dataset.feature || null,
      useAutoLayout: el.dataset.useAutoLayout !== 'false',
      customLayout: null,
    }

    // Load custom layout if provided
    if (el.dataset.customLayout) {
      try {
        // If it's a URL, fetch it
        if (el.dataset.customLayout.startsWith('http') || el.dataset.customLayout.startsWith('/')) {
          fetch(el.dataset.customLayout)
            .then(res => res.json())
            .then(layout => {
              props.customLayout = layout
              renderDiagram(el, props)
            })
            .catch(err => {
              console.error('Failed to load custom layout:', err)
              renderDiagram(el, props)
            })
          return // Exit early, will render after fetch
        } else {
          // Otherwise treat it as inline JSON
          props.customLayout = JSON.parse(el.dataset.customLayout)
        }
      } catch (e) {
        console.warn('Failed to parse custom layout:', e)
      }
    }

    renderDiagram(el, props)
  })
}

function renderDiagram(el, props) {
  // Mark as hydrated
  el.dataset.hydrated = 'true'

  // Create root and render with ReactFlowProvider
  const root = createRoot(el)
  root.render(
    <ReactFlowProvider>
      <ModelDiagram {...props} />
    </ReactFlowProvider>
  )
}

// Run hydration when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrate)
} else {
  hydrate()
}

// Also expose for manual use
window.ModelDiagram = ModelDiagram
