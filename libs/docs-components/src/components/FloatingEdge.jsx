import React from 'react'
import { getBezierPath, useInternalNode, BaseEdge } from '@xyflow/react'
import { getEdgeParams } from '../utils/floatingEdge'

export function FloatingEdge({ id, source, target, markerEnd, markerStart, style, label, labelStyle, className }) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)

  // Check if nodes exist and have computed dimensions
  if (!sourceNode || !targetNode || !sourceNode.measured || !targetNode.measured) {
    return null
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode,
  )

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={style}
      label={label}
      labelStyle={labelStyle}
      labelX={labelX}
      labelY={labelY}
      className={className}
    />
  )
}
