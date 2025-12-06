// Color definitions for each class
export const CLASS_COLORS = {
  Project: '#6b1ee7',
  DocItem: '#f50e7a',
  DocBlock: '#0cae7d',
  DocTag: '#e79e40'
}

// Lighter background colors (for the body area)
export const CLASS_BG_COLORS = {
  Project: '#ede5f9',
  DocItem: '#fde5ef',
  DocBlock: '#e5f5ef',
  DocTag: '#fdf3e5'
}

// Class definitions with their properties
export const MODEL_CLASSES = {
  Project: {
    name: 'Project',
    color: CLASS_COLORS.Project,
    bgColor: CLASS_BG_COLORS.Project,
    properties: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'language', type: 'string', required: true },
      { name: 'version', type: 'string', required: false },
      { name: 'repository', type: 'Repository', required: false },
      { name: 'items', type: 'DocItem[]', required: true }
    ]
  },
  DocItem: {
    name: 'DocItem',
    color: CLASS_COLORS.DocItem,
    bgColor: CLASS_BG_COLORS.DocItem,
    properties: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'kind', type: 'string', required: true },
      { name: 'language', type: 'string', required: true },
      { name: 'location', type: 'Location', required: false },
      { name: 'docBlock', type: 'DocBlock', required: false },
      { name: 'relations', type: 'Relations', required: false },
      { name: 'items', type: 'DocItem[]', required: false }
    ]
  },
  DocBlock: {
    name: 'DocBlock',
    color: CLASS_COLORS.DocBlock,
    bgColor: CLASS_BG_COLORS.DocBlock,
    properties: [
      { name: 'description', type: 'string', required: false },
      { name: 'tags', type: 'Record<string, DocTag[]>', required: false },
      { name: 'deprecated', type: 'DeprecatedInfo', required: false }
    ]
  },
  DocTag: {
    name: 'DocTag',
    color: CLASS_COLORS.DocTag,
    bgColor: CLASS_BG_COLORS.DocTag,
    properties: [
      { name: 'name', type: 'string', required: true },
      { name: 'content', type: 'string', required: true },
      { name: 'parameters', type: 'Record<string, string>', required: false }
    ]
  }
}

// Simplified properties for the home page variant
export const SIMPLE_PROPERTIES = {
  Project: ['id', 'name', 'language', 'items'],
  DocItem: ['id', 'name', 'kind', 'docBlock'],
  DocBlock: ['description', 'tags'],
  DocTag: ['name', 'content']
}

// Node positions for 2x2 grid layout
const NODE_WIDTH = 280
const NODE_GAP = 120

export const NODE_POSITIONS = {
  full: {
    Project: { x: 0, y: 0 },
    DocItem: { x: NODE_WIDTH + NODE_GAP, y: 0 },
    DocBlock: { x: 0, y: 320 },
    DocTag: { x: NODE_WIDTH + NODE_GAP, y: 320 }
  },
  simple: {
    Project: { x: 0, y: 0 },
    DocItem: { x: NODE_WIDTH + NODE_GAP, y: 0 },
    DocBlock: { x: 0, y: 260 },
    DocTag: { x: NODE_WIDTH + NODE_GAP, y: 260 }
  }
}

// Edge definitions showing relationships between classes
export const MODEL_EDGES = [
  {
    id: 'project-docitem',
    source: 'Project',
    target: 'DocItem',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'items',
    animated: false
  },
  {
    id: 'docitem-docblock',
    source: 'DocItem',
    target: 'DocBlock',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'docBlock',
    animated: false
  },
  {
    id: 'docblock-doctag',
    source: 'DocBlock',
    target: 'DocTag',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'tags',
    animated: false
  }
]

/**
 * Generate ReactFlow nodes from model schema
 * @param {string} variant - 'full' or 'simple'
 * @param {Object} options - Additional options
 * @param {boolean} options.showKind - Whether to show the kind label (default: false)
 * @returns {Array} ReactFlow nodes
 */
export function generateNodes(variant = 'full', options = {}) {
  const { showKind = false } = options
  const positions = NODE_POSITIONS[variant]
  const propertyFilter = variant === 'simple' ? SIMPLE_PROPERTIES : null

  return Object.entries(MODEL_CLASSES).map(([className, classData]) => {
    const properties = propertyFilter
      ? classData.properties.filter(p => propertyFilter[className].includes(p.name))
      : classData.properties

    return {
      id: className,
      type: 'classNode',
      position: positions[className],
      data: {
        ...classData,
        properties,
        variant,
        kind: 'Class',
        showKind
      }
    }
  })
}

/**
 * Generate ReactFlow edges from model schema
 * @returns {Array} ReactFlow edges
 */
export function generateEdges() {
  return MODEL_EDGES.map(edge => ({
    ...edge,
    type: 'smoothstep',
    style: { stroke: '#999', strokeWidth: 2 },
    labelStyle: { fill: '#666', fontSize: 12 }
  }))
}
