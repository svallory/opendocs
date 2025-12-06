import React from 'react'
import { fireModelSelectEvent } from '../utils/events'

export function PropertyList({ properties, className, color }) {
  const handlePropertyClick = (e, property) => {
    e.stopPropagation()
    fireModelSelectEvent({
      type: 'property',
      class: className,
      property: property.name,
      propertyType: property.type,
      required: property.required
    })
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
