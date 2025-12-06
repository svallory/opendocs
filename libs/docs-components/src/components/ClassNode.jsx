import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { PropertyList } from './PropertyList'
import { fireModelSelectEvent } from '../utils/events'

export function ClassNode({ data }) {
  const { name, color, bgColor, properties, kind, showKind = false } = data

  const handleClassClick = () => {
    fireModelSelectEvent({
      type: 'class',
      class: name
    })
  }

  const classNameLower = name.toLowerCase()

  return (
    <div
      className={`class-node class-node--${classNameLower}`}
      onClick={handleClassClick}
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
      <PropertyList
        properties={properties}
        className={name}
        color={color}
      />
    </div>
  )
}

export default ClassNode
