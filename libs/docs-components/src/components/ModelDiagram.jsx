import React, { useState, useEffect, useCallback } from 'react'
import { ReactFlow, Background, Controls, MarkerType, applyNodeChanges, Panel } from '@xyflow/react'
import { ClassNode } from './ClassNode'
import { FloatingEdge } from './FloatingEdge'
import { UMLMarkers } from './UMLMarkers'
import { generateNodes, generateEdges, EDGE_TYPES } from '../data/model-schema'
import { getLayoutedElements } from '../utils/layout'
import { getVisibleProperties } from '../data/features'

// Register custom node types
const nodeTypes = {
  classNode: ClassNode
}

// Register custom edge types
const edgeTypes = {
  floating: FloatingEdge
}

// Custom edge styling with UML markers and highlighting
function enhanceEdgesWithUMLMarkers(edges, nodes) {
  // Create a map of node IDs to their highlighted state
  const nodeHighlightMap = new Map()
  nodes.forEach(node => {
    nodeHighlightMap.set(node.id, node.data.highlighted)
  })

  return edges.map(edge => {
    const enhanced = { ...edge }
    const originalType = edge.type

    // Add UML markers based on original edge type
    switch (originalType) {
      case EDGE_TYPES.COMPOSITION:
        enhanced.markerStart = 'url(#diamond-filled)'
        enhanced.markerEnd = 'url(#arrow-standard)'
        break
      case EDGE_TYPES.AGGREGATION:
        enhanced.markerStart = 'url(#diamond-hollow)'
        enhanced.markerEnd = 'url(#arrow-standard)'
        break
      case EDGE_TYPES.INHERITANCE:
        enhanced.markerEnd = 'url(#triangle-hollow)'
        break
      case EDGE_TYPES.ASSOCIATION:
      default:
        enhanced.markerEnd = 'url(#arrow-standard)'
        break
    }

    // Use floating edge type for dynamic connection points
    enhanced.type = 'floating'

    // Add highlighting class if both source and target are highlighted
    const sourceHighlighted = nodeHighlightMap.get(edge.source)
    const targetHighlighted = nodeHighlightMap.get(edge.target)

    if (sourceHighlighted && targetHighlighted) {
      enhanced.className = 'edge-highlighted'
    }

    return enhanced
  })
}

export function ModelDiagram({
  variant = 'full',
  showKind = false,
  feature = null,
  useAutoLayout = false,
  customLayout = null,
  onNodeClick = null,
  onPropertyClick = null
}) {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [isLocalhost, setIsLocalhost] = useState(false)
  const [rfInstance, setRfInstance] = useState(null)

  // Detect if running on localhost
  useEffect(() => {
    const isLocal = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
       window.location.hostname === '127.0.0.1' ||
       window.location.hostname === '')
    setIsLocalhost(isLocal)
  }, [])

  // Handle node position changes when dragging
  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [])

  useEffect(() => {
    async function layoutNodes() {
      // Get visible properties based on selected feature
      const visibleProps = feature ? getVisibleProperties(feature) : null

      // Generate nodes with feature filtering
      const baseNodes = generateNodes(variant, {
        showKind,
        feature,
        visibleProperties: visibleProps,
        onPropertyClick
      })

      // Generate edges with UML markers and highlighting
      const baseEdges = enhanceEdgesWithUMLMarkers(generateEdges(variant), baseNodes)

      // Try to apply custom or saved layout
      let finalNodes = baseNodes
      let finalEdges = baseEdges

      // 1. Check for custom layout prop
      let layoutToApply = customLayout

      // 2. If no custom layout, try to load from localStorage
      if (!layoutToApply && typeof window !== 'undefined') {
        try {
          const storageKey = `model-diagram-layout-${variant}`
          const savedLayout = localStorage.getItem(storageKey)
          if (savedLayout) {
            layoutToApply = JSON.parse(savedLayout)
          }
        } catch (e) {
          console.warn('Failed to load saved layout:', e)
        }
      }

      // 3. Apply the layout if we have one
      if (layoutToApply && layoutToApply.nodes) {
        // Create a position map from saved layout
        const positionMap = new Map()
        layoutToApply.nodes.forEach(savedNode => {
          positionMap.set(savedNode.id, savedNode.position)
        })

        // Apply saved positions to our generated nodes
        finalNodes = baseNodes.map(node => ({
          ...node,
          position: positionMap.get(node.id) || node.position
        }))

        // Use saved edges if available, otherwise use generated edges
        if (layoutToApply.edges) {
          finalEdges = layoutToApply.edges.map(savedEdge => {
            // Find matching generated edge to preserve current data/markers
            const matchingEdge = baseEdges.find(e => e.id === savedEdge.id)
            if (matchingEdge) {
              return { ...matchingEdge, ...savedEdge }
            }
            return savedEdge
          })
        }
      }

      setNodes(finalNodes)
      setEdges(finalEdges)
    }

    layoutNodes()
  }, [variant, showKind, feature, useAutoLayout, customLayout, onPropertyClick])

  const handleNodeClick = (event, node) => {
    if (onNodeClick) {
      onNodeClick(node)
    }
  }

  const handleSaveLayout = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject()
      console.log('Saved layout:', JSON.stringify(flow, null, 2))
      // Save to localStorage
      const storageKey = `model-diagram-layout-${variant}`
      localStorage.setItem(storageKey, JSON.stringify(flow))
      alert('Layout saved! Check console for details.')
    }
  }, [rfInstance, variant])

  return (
    <div className={`model-diagram model-diagram--${variant} ${feature ? 'model-diagram--feature-mode' : ''}`}>
      <UMLMarkers />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onNodesChange={isLocalhost ? onNodesChange : undefined}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{
          padding: variant === 'full' ? 0.08 : 0.3,
          minZoom: 0.3,
          maxZoom: 1.2
        }}
        nodesDraggable={isLocalhost}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll={false}
        zoomOnScroll={false}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background color="#e5e5e5" gap={20} />
        {isLocalhost && (
          <Panel position="top-right">
            <button
              onClick={handleSaveLayout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Save Layout
            </button>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

export default ModelDiagram
