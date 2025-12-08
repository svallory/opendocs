import React from 'react'
import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import '../styles/model-diagram.css'
import '../styles/feature-panel.css'
import '../styles/feature-explorer.css'
import { FeatureExplorer } from '../components/FeatureExplorer'

// Auto-hydrate all elements with data-component="feature-explorer"
function hydrate() {
  const elements = document.querySelectorAll('[data-component="feature-explorer"]')

  elements.forEach((el) => {
    // Skip if already hydrated
    if (el.dataset.hydrated === 'true') return

    // Extract props from data attributes
    const props = {
      variant: el.dataset.variant || 'simple',
      showKind: el.dataset.showKind === 'true',
      defaultFeature: el.dataset.defaultFeature || null,
      useAutoLayout: el.dataset.useAutoLayout !== 'false',
    }

    // Mark as hydrated
    el.dataset.hydrated = 'true'

    // Create root and render
    const root = createRoot(el)
    root.render(<FeatureExplorer {...props} />)
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
window.FeatureExplorer = FeatureExplorer
