// Color definitions for each class
export const CLASS_COLORS = {
  // Core model types
  DocSet: '#3b82f6',
  Project: '#6b1ee7',
  Repository: '#8b5cf6',
  DocItem: '#f50e7a',
  Location: '#ec4899',
  DocBlock: '#0cae7d',
  DocTag: '#e79e40',
  Relation: '#10b981'
}

// Lighter background colors (for the body area)
export const CLASS_BG_COLORS = {
  DocSet: '#dbeafe',
  Project: '#ede5f9',
  Repository: '#ede9fe',
  DocItem: '#fde5ef',
  Location: '#fce7f3',
  DocBlock: '#e5f5ef',
  DocTag: '#fef3e5',
  Relation: '#d1fae5'
}

// Class definitions with their properties and documentation
export const MODEL_CLASSES = {
  DocSet: {
    name: 'DocSet',
    kind: 'interface',
    color: CLASS_COLORS.DocSet,
    bgColor: CLASS_BG_COLORS.DocSet,
    description: 'Root object in opendocs.json file - the entry point for your Documentation Set',
    usage: 'Represents the entire documentation for a monorepo or single project. Contains metadata and references all projects.',
    properties: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Documentation set identifier',
        usage: 'Unique identifier, typically matching repository name. Used for referencing and organizing documentation sets.'
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Human-readable documentation name',
        usage: 'Display name shown in documentation UIs. Example: "My Monorepo Documentation"'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Optional description of the documentation',
        usage: 'Extended description of what this documentation covers. Supports Markdown.'
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: 'OpenDocs specification version',
        usage: 'Version of OpenDocs spec used (e.g., "1.0.0"). Helps consumers understand format compatibility.'
      },
      {
        name: 'projects',
        type: 'Project[]',
        required: true,
        description: 'Array of projects in this documentation set',
        usage: 'In monorepos, each package/library/app is a separate Project. Single-project repos have one Project.'
      },
      {
        name: 'metadata',
        type: 'Record<string, unknown>',
        required: false,
        description: 'Additional metadata (created, modified, generator info)',
        usage: 'Store timestamps (created, modified), generator tool info ({ name, version }), and custom metadata.'
      }
    ]
  },

  Project: {
    name: 'Project',
    kind: 'interface',
    color: CLASS_COLORS.Project,
    bgColor: CLASS_BG_COLORS.Project,
    description: 'Represents an individual project within a Documentation Set',
    usage: 'Each package, library, or app in a monorepo is a Project. Has its own language, version, and DocItems.',
    properties: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Unique project identifier',
        usage: 'Descriptive name like "auth-service" or "web-sdk". Used for cross-project references.'
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Human-readable project name',
        usage: 'Display name shown in docs. Example: "Auth Service" or "Web SDK"'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Project description',
        usage: 'From package.json, README, or module docstring. Supports Markdown.'
      },
      {
        name: 'language',
        type: 'string',
        required: true,
        description: 'Programming language (typescript, rust, go, python, etc.)',
        usage: 'Enables language-specific rendering and syntax highlighting. Common values: "typescript", "go", "rust", "python"'
      },
      {
        name: 'version',
        type: 'string',
        required: false,
        description: 'Project version',
        usage: 'From package.json, Cargo.toml, go.mod, etc. Helps track documentation versions.'
      },
      {
        name: 'repository',
        type: 'Repository',
        required: false,
        description: 'Source repository information for linking to source code',
        usage: 'Enables "Go to Definition" and source code links in documentation.'
      },
      {
        name: 'items',
        type: 'DocItem[]',
        required: true,
        description: 'Top-level documentation items',
        usage: 'Array of root-level modules, namespaces, packages. Child items are nested recursively.'
      },
      {
        name: 'metadata',
        type: 'Record<string, unknown>',
        required: false,
        description: 'Project-specific metadata',
        usage: 'Store license, package manager, keywords, dependencies, and custom project metadata.'
      }
    ]
  },

  Repository: {
    name: 'Repository',
    kind: 'interface',
    color: CLASS_COLORS.Repository,
    bgColor: CLASS_BG_COLORS.Repository,
    description: 'Source repository information for linking documentation to source code',
    usage: 'Enables automatic generation of "View Source" links in rendered documentation.',
    properties: [
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Repository type',
        usage: 'Repository system type. Common values: "git", "svn", "mercurial"'
      },
      {
        name: 'url',
        type: 'string',
        required: true,
        description: 'Repository URL',
        usage: 'Base repository URL. Example: "https://github.com/user/repo"'
      },
      {
        name: 'fileUrlTemplate',
        type: 'string',
        required: false,
        description: 'Template for generating file URLs',
        usage: 'URL template with {repo}, {hash}, {path}, {line} variables. Example: "{repo}/blob/{hash}/{path}#L{line}"'
      }
    ]
  },

  DocItem: {
    name: 'DocItem',
    kind: 'interface',
    color: CLASS_COLORS.DocItem,
    bgColor: CLASS_BG_COLORS.DocItem,
    description: 'Universal documentation element - the fundamental unit of OpenDocs',
    usage: 'Everything is a DocItem: modules, classes, functions, methods, properties. Works across all languages.',
    properties: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Language-native fully qualified name',
        usage: 'Uses each language\'s naming convention: TypeScript "pkg#Symbol", Rust "crate::Type", Go "package.Function"'
      },
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Human-readable name',
        usage: 'Simple name without package/module prefix. For "mylib.Calculator.add", name is "add"'
      },
      {
        name: 'kind',
        type: 'string',
        required: true,
        description: 'Language-specific item type',
        usage: 'Describes what this item is: "class", "function", "rust-trait", "go-receiver-method", etc.'
      },
      {
        name: 'language',
        type: 'string',
        required: true,
        description: 'Source language',
        usage: 'Programming language of this item. Usually matches Project language.'
      },
      {
        name: 'location',
        type: 'Location',
        required: false,
        description: 'Source code location',
        usage: 'File path, line number, and column for "Go to Definition" links. Highly recommended to include.'
      },
      {
        name: 'docBlock',
        type: 'DocBlock',
        required: false,
        description: 'Documentation content',
        usage: 'Normalized documentation from JSDoc, rustdoc, docstrings, etc. Contains description and tags.'
      },
      {
        name: 'relations',
        type: 'Relations',
        required: false,
        description: 'Code relationships (container, extends, implements, etc.)',
        usage: 'Maps relationship types to target IDs. Example: { "container": "pkg#Module", "extends": "pkg#BaseClass" }'
      },
      {
        name: 'items',
        type: 'DocItem[]',
        required: false,
        description: 'Child items (methods, properties, nested types)',
        usage: 'Recursive nesting: classes contain methods, modules contain classes. Enables hierarchical navigation.'
      },
      {
        name: 'metadata',
        type: 'Record<string, unknown>',
        required: false,
        description: 'Language-specific metadata',
        usage: 'Store visibility, signature, type info, isStatic, isReadonly, and language-specific features.'
      }
    ]
  },

  Location: {
    name: 'Location',
    kind: 'interface',
    color: CLASS_COLORS.Location,
    bgColor: CLASS_BG_COLORS.Location,
    description: 'Source code location for linking documentation to source files',
    usage: 'Combined with Repository.fileUrlTemplate, enables precise "View Source" links to exact lines.',
    properties: [
      {
        name: 'path',
        type: 'string',
        required: true,
        description: 'File path relative to project root',
        usage: 'Path from project root to source file. Example: "src/calculator.ts"'
      },
      {
        name: 'number',
        type: 'number',
        required: true,
        description: 'Line number (1-indexed)',
        usage: 'Line where item is defined. Used in source links: file.ts#L42'
      },
      {
        name: 'column',
        type: 'number',
        required: false,
        description: 'Column number (1-indexed)',
        usage: 'Column position on line. Optional but enables more precise IDE navigation.'
      }
    ]
  },

  DocBlock: {
    name: 'DocBlock',
    kind: 'interface',
    color: CLASS_COLORS.DocBlock,
    bgColor: CLASS_BG_COLORS.DocBlock,
    description: 'Documentation content structure - normalized from all doc formats',
    usage: 'Unified format for TSDoc, Javadoc, rustdoc, docstrings. Enables cross-language documentation tools.',
    properties: [
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Main description text',
        usage: 'Primary documentation content. Supports Markdown for rich formatting.'
      },
      {
        name: 'tags',
        type: 'Record<string, (string | DocTag)[]>',
        required: false,
        description: 'Documentation tags (@param, @returns, @deprecated, etc.)',
        usage: 'Map of tag names to arrays. Simple tags are strings, complex tags are DocTag objects. Example: { "param": [DocTag, DocTag], "returns": ["Description"], "deprecated": [DocTag] }'
      }
    ]
  },

  DocTag: {
    name: 'DocTag',
    kind: 'interface',
    color: CLASS_COLORS.DocTag,
    bgColor: CLASS_BG_COLORS.DocTag,
    description: 'Complex documentation tag with structured parameters',
    usage: 'For tags like @param, @returns, @deprecated that need more than just text. Simple tags use strings.',
    properties: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Tag name without @ symbol',
        usage: 'Tag identifier: "param", "returns", "throws", "deprecated", etc.'
      },
      {
        name: 'content',
        type: 'string',
        required: true,
        description: 'Tag content/description',
        usage: 'Main text for this tag. For @param: parameter description. For @returns: return value description.'
      },
      {
        name: 'parameters',
        type: 'Record<string, string>',
        required: false,
        description: 'Tag-specific parameters',
        usage: 'Additional data: @param uses { "name": "paramName", "type": "string" }. @deprecated uses { "since": "2.0.0" }.'
      }
    ]
  },

  Relation: {
    name: 'Relation',
    kind: 'interface',
    color: CLASS_COLORS.Relation,
    bgColor: CLASS_BG_COLORS.Relation,
    description: 'Typed relationship between DocItems',
    usage: 'Represents code relationships: inheritance, implementation, containment. Supports simple strings or complex metadata.',
    properties: [
      {
        name: 'kind',
        type: 'string',
        required: true,
        description: 'Relationship type',
        usage: 'Type of relationship: "container", "extends", "implements", "rust-trait-impl", etc.'
      },
      {
        name: 'target',
        type: 'string',
        required: true,
        description: 'Target DocItem ID',
        usage: 'Fully qualified ID of the related item. Must be a valid language-native FQN.'
      },
      {
        name: 'metadata',
        type: 'Record<string, unknown>',
        required: false,
        description: 'Relationship-specific metadata',
        usage: 'Additional context: { "derived": true } for Rust #[derive], { "explicit": false } for implicit implementations.'
      }
    ]
  }
}

// Simplified properties for the simple variant (4 core types only)
export const SIMPLE_PROPERTIES = {
  Project: ['id', 'name', 'language', 'items'],
  DocItem: ['id', 'name', 'kind', 'docBlock'],
  DocBlock: ['description', 'tags'],
  DocTag: ['name', 'content']
}

// Node positions for layout
const NODE_WIDTH = 280
const HORIZONTAL_GAP = 200
const VERTICAL_GAP_FULL = 350
const VERTICAL_GAP_SIMPLE = 320
const PADDING = 60

export const NODE_POSITIONS = {
  full: {
    // Row 0 - Root
    DocSet: { x: PADDING + NODE_WIDTH + HORIZONTAL_GAP, y: PADDING },

    // Row 1 - Project level
    Project: { x: PADDING, y: PADDING + VERTICAL_GAP_FULL },
    Repository: { x: PADDING + (NODE_WIDTH + HORIZONTAL_GAP) * 2, y: PADDING + VERTICAL_GAP_FULL },

    // Row 2 - Item level
    DocItem: { x: PADDING, y: PADDING + VERTICAL_GAP_FULL * 2 },
    DocBlock: { x: PADDING + (NODE_WIDTH + HORIZONTAL_GAP), y: PADDING + VERTICAL_GAP_FULL * 2 },
    Location: { x: PADDING + (NODE_WIDTH + HORIZONTAL_GAP) * 2, y: PADDING + VERTICAL_GAP_FULL * 2 },

    // Row 3 - Details
    Relation: { x: PADDING, y: PADDING + VERTICAL_GAP_FULL * 3 },
    DocTag: { x: PADDING + (NODE_WIDTH + HORIZONTAL_GAP), y: PADDING + VERTICAL_GAP_FULL * 3 }
  },
  simple: {
    Project: { x: PADDING, y: PADDING },
    DocItem: { x: PADDING + NODE_WIDTH + HORIZONTAL_GAP, y: PADDING },
    DocBlock: { x: PADDING, y: PADDING + VERTICAL_GAP_SIMPLE },
    DocTag: { x: PADDING + NODE_WIDTH + HORIZONTAL_GAP, y: PADDING + VERTICAL_GAP_SIMPLE }
  }
}

// Edge relationship types for UML-style markers
export const EDGE_TYPES = {
  COMPOSITION: 'composition',      // Filled diamond - strong "has-a" relationship
  AGGREGATION: 'aggregation',      // Hollow diamond - weak "has-a" relationship
  ASSOCIATION: 'association',      // Simple arrow - uses/references
  INHERITANCE: 'inheritance'       // Hollow triangle - is-a relationship
}

// Edge definitions showing relationships between classes
export const MODEL_EDGES = [
  // Core model edges (shown in both simple and full variants)
  {
    id: 'project-docitem',
    source: 'Project',
    target: 'DocItem',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'items',
    animated: false,
    type: EDGE_TYPES.COMPOSITION,
    description: 'A Project contains multiple DocItems',
    variantFilter: ['simple', 'full']
  },
  {
    id: 'docitem-docitem',
    source: 'DocItem',
    target: 'DocItem',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'items',
    animated: false,
    type: EDGE_TYPES.COMPOSITION,
    description: 'A DocItem can contain nested DocItems (methods, properties, etc.)',
    variantFilter: ['simple', 'full']
  },
  {
    id: 'docitem-docblock',
    source: 'DocItem',
    target: 'DocBlock',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'docBlock',
    animated: false,
    type: EDGE_TYPES.AGGREGATION,
    description: 'A DocItem has an optional DocBlock for documentation',
    variantFilter: ['simple', 'full']
  },
  {
    id: 'docblock-doctag',
    source: 'DocBlock',
    target: 'DocTag',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'tags',
    animated: false,
    type: EDGE_TYPES.COMPOSITION,
    description: 'A DocBlock contains multiple DocTags',
    variantFilter: ['simple', 'full']
  },

  // Full model edges (additional relationships)
  {
    id: 'docset-project',
    source: 'DocSet',
    target: 'Project',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'projects',
    animated: false,
    type: EDGE_TYPES.COMPOSITION,
    description: 'A DocSet contains multiple Projects',
    variantFilter: ['full']
  },
  {
    id: 'project-repository',
    source: 'Project',
    target: 'Repository',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'repository',
    animated: false,
    type: EDGE_TYPES.AGGREGATION,
    description: 'A Project has optional Repository information',
    variantFilter: ['full']
  },
  {
    id: 'docitem-location',
    source: 'DocItem',
    target: 'Location',
    sourceHandle: 'right',
    targetHandle: 'left',
    label: 'location',
    animated: false,
    type: EDGE_TYPES.AGGREGATION,
    description: 'A DocItem has an optional Location for source code linking',
    variantFilter: ['full']
  },
  {
    id: 'docitem-relation',
    source: 'DocItem',
    target: 'Relation',
    sourceHandle: 'bottom',
    targetHandle: 'top',
    label: 'relations',
    animated: false,
    type: EDGE_TYPES.AGGREGATION,
    description: 'A DocItem has optional Relations to other items',
    variantFilter: ['full']
  }
]

/**
 * Generate ReactFlow nodes from model schema
 * @param {string} variant - 'full' or 'simple'
 * @param {Object} options - Additional options
 * @param {boolean} options.showKind - Whether to show the kind label (default: false)
 * @param {string} options.feature - Feature ID for highlighting
 * @param {Map} options.visibleProperties - Map of class -> Set of visible property names
 * @param {Function} options.onPropertyClick - Callback for property clicks
 * @returns {Array} ReactFlow nodes
 */
export function generateNodes(variant = 'full', options = {}) {
  const { showKind = false, feature = null, visibleProperties = null, onPropertyClick = null } = options
  const positions = NODE_POSITIONS[variant]
  const propertyFilter = variant === 'simple' ? SIMPLE_PROPERTIES : null

  return Object.entries(MODEL_CLASSES)
    .filter(([className]) => positions[className] !== undefined)
    .map(([className, classData]) => {
    let properties = propertyFilter
      ? classData.properties.filter(p => propertyFilter[className].includes(p.name))
      : classData.properties

    // Apply feature-based filtering if a feature is selected
    if (feature && visibleProperties) {
      const visibleSet = visibleProperties.get(className)
      if (visibleSet) {
        // If this class is highlighted but no specific properties, show all
        if (visibleSet.size === 0) {
          // Keep all properties for this class
        } else {
          // Filter to only visible properties
          properties = properties.filter(p => visibleSet.has(p.name))
        }
      } else {
        // Class not highlighted - hide all properties but keep the class
        properties = []
      }
    }

    return {
      id: className,
      type: 'classNode',
      position: positions[className],
      data: {
        ...classData,
        properties,
        variant,
        showKind,
        feature,
        highlighted: feature && visibleProperties ? visibleProperties.has(className) : false,
        onPropertyClick
      }
    }
  })
}

/**
 * Get marker configuration for edge relationship type
 */
function getMarkerForType(edgeType) {
  switch (edgeType) {
    case EDGE_TYPES.COMPOSITION:
      return {
        markerEnd: {
          type: 'arrow',
          width: 20,
          height: 20,
          color: '#999'
        },
        markerStart: {
          type: 'diamond',
          width: 20,
          height: 20,
          color: '#999'
        }
      }
    case EDGE_TYPES.AGGREGATION:
      return {
        markerEnd: {
          type: 'arrow',
          width: 20,
          height: 20,
          color: '#999'
        },
        markerStart: {
          type: 'diamondOpen',
          width: 20,
          height: 20,
          color: '#999'
        }
      }
    case EDGE_TYPES.ASSOCIATION:
      return {
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#999'
        }
      }
    case EDGE_TYPES.INHERITANCE:
      return {
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#999',
          strokeWidth: 2
        }
      }
    default:
      return {}
  }
}

/**
 * Generate ReactFlow edges from model schema
 * @param {string} variant - 'full' or 'simple'
 * @returns {Array} ReactFlow edges
 */
export function generateEdges(variant = 'full') {
  return MODEL_EDGES
    .filter(edge => !edge.variantFilter || edge.variantFilter.includes(variant))
    .map(edge => {
      const markers = getMarkerForType(edge.type)
      return {
        ...edge,
        type: 'smoothstep',
        style: { stroke: '#999', strokeWidth: 2 },
        labelStyle: { fill: '#666', fontSize: 12 },
        ...markers
      }
    })
}
