// Component loader - ensures React loads before component bundles
(function() {
  // Load scripts sequentially
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Load React, then ReactDOM, then component bundles
  async function loadComponents() {
    try {
      // Load React first
      if (typeof window.React === 'undefined') {
        await loadScript('https://unpkg.com/react@19/umd/react.production.min.js');
      }

      // Then load ReactDOM
      if (typeof window.ReactDOM === 'undefined') {
        await loadScript('https://unpkg.com/react-dom@19/umd/react-dom.production.min.js');
      }

      // Now load component bundles
      await loadScript('/feature-explorer.iife.js');
      await loadScript('/full-model-explorer.iife.js');

      console.log('All components loaded successfully');
    } catch (error) {
      console.error('Error loading components:', error);
    }
  }

  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadComponents);
  } else {
    loadComponents();
  }
})();
