import ELK from 'elkjs/lib/elk.bundled.js'

const elk = new ELK()

/**
 * Apply ELK layout to nodes and edges for compact arrangement
 * @param {Array} nodes - ReactFlow nodes
 * @param {Array} edges - ReactFlow edges
 * @param {Object} options - Layout options
 * @returns {Promise<Array>} Nodes with updated positions
 */
export async function getLayoutedElements(nodes, edges, options = {}) {
  const {
    direction = 'DOWN', // DOWN, UP, RIGHT, LEFT
    nodeWidth = 280,
    nodeSpacing = 80,
    layerSpacing = 100
  } = options

  // Build ELK graph
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': nodeSpacing.toString(),
      'elk.layered.spacing.nodeNodeBetweenLayers': layerSpacing.toString(),
      'elk.spacing.edgeNode': '40',
      'elk.spacing.edgeEdge': '30',
      'elk.layered.nodePlacement.strategy': 'SIMPLE'
    },
    children: nodes.map((node) => {
      const height = calculateNodeHeight(node.data.properties?.length || 0)
      return {
        id: node.id,
        width: nodeWidth,
        height: height
      }
    }),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }

  // Run layout
  const layoutedGraph = await elk.layout(graph)

  // Apply positions to nodes
  const layoutedNodes = nodes.map((node) => {
    const layoutedNode = layoutedGraph.children.find((n) => n.id === node.id)
    return {
      ...node,
      position: {
        x: layoutedNode.x,
        y: layoutedNode.y
      }
    }
  })

  return layoutedNodes
}

/**
 * Calculate dynamic node height based on number of properties
 * @param {number} propertyCount - Number of properties in the node
 * @returns {number} Estimated height in pixels
 */
export function calculateNodeHeight(propertyCount) {
  const headerHeight = 60
  const propertyHeight = 24
  const padding = 20
  const minHeight = 100

  const calculatedHeight = headerHeight + (propertyCount * propertyHeight) + padding
  return Math.max(minHeight, calculatedHeight)
}
