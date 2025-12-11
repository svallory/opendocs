import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { PropertyList } from './PropertyList'

export function ClassNode({ data }) {
  const {
    name,
    color,
    properties,
    kind,
    showKind = false,
    highlighted = false,
    onPropertyClick = null
  } = data

  const classNameLower = name.toLowerCase()
  const hasProperties = properties && properties.length > 0

  return (
    <div
      className={`class-node class-node--${classNameLower} ${
        highlighted ? 'class-node--highlighted' : ''
      } ${!hasProperties ? 'class-node--empty' : ''}`}
      style={{ backgroundColor: color }}
    >
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      {/* Header */}
      <div className="class-node__header">
        {showKind && <div className="class-node__label">{kind || 'Class'}</div>}
        <h3 className="class-node__name">{name}</h3>
      </div>

      {/* Properties */}
      {hasProperties && (
        <PropertyList
          properties={properties}
          className={name}
          color={color}
          onPropertyClick={onPropertyClick}
        />
      )}
    </div>
  )
}

export default ClassNode
