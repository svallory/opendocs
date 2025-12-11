import React from 'react'

export function PropertyList({ properties, className, onPropertyClick }) {
  const handlePropertyClick = (e, property) => {
    e.stopPropagation()
    if (onPropertyClick) {
      onPropertyClick(className, property.name)
    }
  }

  return (
    <div className="class-node__body">
      {properties.map((prop) => (
        <div
          key={prop.name}
          className="property-row"
          onClick={(e) => handlePropertyClick(e, prop)}
        >
          <span className="property-name">{prop.name}</span>
          <span className="property-separator">:</span>
          <span className={`property-type ${!prop.required ? 'property-optional' : ''}`}>
            {prop.type}
          </span>
        </div>
      ))}
    </div>
  )
}

export default PropertyList
