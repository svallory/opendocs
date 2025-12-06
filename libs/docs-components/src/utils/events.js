/**
 * Fire a custom event when a model class or property is selected
 * @param {Object} detail - Event detail object
 * @param {string} detail.type - 'class' or 'property'
 * @param {string} detail.class - The class name (Project, DocItem, DocBlock, DocTag)
 * @param {string} [detail.property] - The property name (only when type is 'property')
 * @param {string} [detail.propertyType] - The property type
 */
export function fireModelSelectEvent(detail) {
  const event = new CustomEvent('opendocs:model-select', {
    detail,
    bubbles: true,
    cancelable: true
  })
  document.dispatchEvent(event)
}

/**
 * Subscribe to model selection events
 * @param {Function} callback - Function to call when event fires
 * @returns {Function} Unsubscribe function
 */
export function onModelSelect(callback) {
  const handler = (e) => callback(e.detail)
  document.addEventListener('opendocs:model-select', handler)
  return () => document.removeEventListener('opendocs:model-select', handler)
}
