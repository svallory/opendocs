import React from 'react'
import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import '../styles/model-diagram.css'
import '../styles/documentation-panel.css'
import '../styles/full-model-explorer.css'
import { FullModelExplorer } from '../components/FullModelExplorer'

// Auto-hydrate all elements with data-component="full-model-explorer"
function hydrate() {
  const elements = document.querySelectorAll('[data-component="full-model-explorer"]')

  elements.forEach((el) => {
    // Skip if already hydrated
    if (el.dataset.hydrated === 'true') return

    // Extract props from data attributes
    const props = {
      variant: el.dataset.variant || 'full',
      showKind: el.dataset.showKind !== 'false',
    }

    // Mark as hydrated
    el.dataset.hydrated = 'true'

    // Create root and render
    const root = createRoot(el)
    root.render(<FullModelExplorer {...props} />)
  })
}

// Run hydration immediately and when DOM changes
hydrate()

// Watch for new elements being added
const observer = new MutationObserver(() => {
  hydrate()
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})

// Also try on DOMContentLoaded and load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', hydrate)
}
window.addEventListener('load', hydrate)

// Expose for manual use
window.FullModelExplorer = FullModelExplorer
