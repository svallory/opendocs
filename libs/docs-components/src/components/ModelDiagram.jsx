import React, { useMemo } from 'react'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import { ClassNode } from './ClassNode'
import { generateNodes, generateEdges } from '../data/model-schema'

// Register custom node types
const nodeTypes = {
  classNode: ClassNode
}

export function ModelDiagram({ variant = 'full', showKind = false }) {
  const nodes = useMemo(() => generateNodes(variant, { showKind }), [variant, showKind])
  const edges = useMemo(() => generateEdges(), [])

  return (
    <div className={`model-diagram model-diagram--${variant}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background color="#e5e5e5" gap={20} />
      </ReactFlow>
    </div>
  )
}

export default ModelDiagram
