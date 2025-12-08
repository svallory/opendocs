// Load React synchronously before any components
(function() {
  // Check if React is already loaded
  if (typeof window.React !== 'undefined' && typeof window.ReactDOM !== 'undefined') {
    console.log('React already loaded');
    return;
  }

  // Load React and ReactDOM synchronously
  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // Force synchronous loading
    document.head.appendChild(script);
  }

  loadScript('https://unpkg.com/react@19/umd/react.production.min.js');
  loadScript('https://unpkg.com/react-dom@19/umd/react-dom.production.min.js');
})();
