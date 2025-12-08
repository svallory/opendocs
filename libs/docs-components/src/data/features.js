/**
 * Feature definitions that map OpenDocs capabilities to model structure
 */

export const FEATURES = {
  'universal-abstraction': {
    id: 'universal-abstraction',
    title: 'Universal Abstraction',
    icon: 'Target',
    color: '#f50e7a',
    description: 'Every documentation element, regardless of programming language, is represented as a DocItem. The entire OpenDocs model provides a universal format that works across all languages.',
    highlights: {
      classes: ['Project', 'DocItem', 'DocBlock', 'DocTag'],
      properties: []
    },
    details: [
      'Rust: struct, trait, impl-method',
      'Go: struct, interface, receiver-method',
      'TypeScript: class, interface, method',
      'Python: class, function, property',
      'All mapped to the same unified model structure'
    ],
    benefit: 'Eliminates the need to understand language-specific documentation models'
  },

  'language-flexibility': {
    id: 'language-flexibility',
    title: 'Language-Specific Flexibility',
    icon: 'Wrench',
    color: '#f50e7a',
    description: 'The kind field allows complete language-specific typing without breaking the universal model.',
    highlights: {
      classes: ['DocItem'],
      properties: [
        { class: 'DocItem', property: 'kind' },
        { class: 'DocItem', property: 'language' }
      ]
    },
    details: [
      'Templates can handle language-specific constructs',
      'Language-specific metadata is preserved',
      'Core model remains simple and consistent'
    ],
    benefit: 'Support any language feature while maintaining compatibility'
  },

  'hierarchical-structure': {
    id: 'hierarchical-structure',
    title: 'Hierarchical Structure',
    icon: 'Network',
    color: '#6b1ee7',
    description: 'DocItems form natural hierarchies through the items array. A DocItem can contain other DocItems, creating nested structures like classes with methods, or modules with nested modules.',
    highlights: {
      classes: ['DocItem'],
      properties: [
        { class: 'DocItem', property: 'items' }
      ]
    },
    details: [
      'DocItems can contain other DocItems recursively',
      'Class contains methods and properties',
      'Module contains nested modules and functions',
      'Intuitive navigation structures',
      'Efficient template rendering'
    ],
    benefit: 'Mirrors natural code organization for better documentation'
  },

  'documentation-standardization': {
    id: 'documentation-standardization',
    title: 'Documentation Standardization',
    icon: 'FileText',
    color: '#0cae7d',
    description: 'All documentation formats (TSDoc, Javadoc, etc.) map to the same DocBlock structure.',
    highlights: {
      classes: ['DocBlock'],
      properties: [
        { class: 'DocItem', property: 'docBlock' }
      ]
    },
    details: [
      'Consistent rendering across languages',
      'Template compatibility regardless of source',
      'Cross-format documentation migration',
      'Unified tooling and processing'
    ],
    benefit: 'One documentation structure for all languages'
  },

  'tag-flexibility': {
    id: 'tag-flexibility',
    title: 'Tag Flexibility',
    icon: 'Tags',
    color: '#e79e40',
    description: 'Support for both simple and complex tags enables rich metadata and structured data.',
    highlights: {
      classes: ['DocTag'],
      properties: [
        { class: 'DocBlock', property: 'tags' },
        { class: 'DocTag', property: 'parameters' }
      ]
    },
    details: [
      'Simple metadata (@since, @author)',
      'Complex structured data (@param with type)',
      'Custom tag extensions',
      'Machine-processable documentation'
    ],
    benefit: 'Flexible metadata for any documentation need'
  },

  'source-linking': {
    id: 'source-linking',
    title: 'Source Linking',
    icon: 'MapPin',
    color: '#f50e7a',
    description: 'Every item includes file path, line number, and column for accurate source linking.',
    highlights: {
      classes: ['DocItem'],
      properties: [
        { class: 'DocItem', property: 'location' }
      ]
    },
    details: [
      'Generate "Go to Definition" links automatically',
      'Navigate from docs to source code',
      'IDE integration support',
      'Accurate change tracking'
    ],
    benefit: 'Seamless navigation between documentation and code'
  },

  'language-native-ids': {
    id: 'language-native-ids',
    title: 'Language-Native IDs',
    icon: 'Brackets',
    color: '#6b1ee7',
    description: 'Uses natural naming conventions for each language.',
    highlights: {
      classes: ['Project', 'DocItem'],
      properties: [
        { class: 'Project', property: 'id' },
        { class: 'DocItem', property: 'id' }
      ]
    },
    details: [
      'TypeScript: package#Symbol',
      'Rust: crate::Type',
      'Go: package.Function',
      'Python: module.Class'
    ],
    benefit: 'Familiar, readable identifiers for each language'
  },

  'monorepo-ready': {
    id: 'monorepo-ready',
    title: 'Monorepo Ready',
    icon: 'Package',
    color: '#6b1ee7',
    description: 'Built-in support for monorepos where a single Documentation Set contains multiple projects.',
    highlights: {
      classes: ['Project'],
      properties: [
        { class: 'Project', property: 'language' },
        { class: 'Project', property: 'version' },
        { class: 'Project', property: 'repository' }
      ]
    },
    details: [
      'Each project has its own language and version',
      'Cross-project references supported',
      'Unified documentation for multiple packages',
      'Repository metadata per project'
    ],
    benefit: 'Perfect for modern multi-language monorepos'
  }
}

/**
 * Get property visibility for a given feature
 * Returns a set of property keys that should be visible
 */
export function getVisibleProperties(featureId) {
  const feature = FEATURES[featureId]
  if (!feature) return null

  const visible = new Map()

  // Add all highlighted classes with all their properties initially hidden
  feature.highlights.classes.forEach(className => {
    visible.set(className, new Set())
  })

  // Add specific highlighted properties
  feature.highlights.properties.forEach(({ class: className, property }) => {
    if (!visible.has(className)) {
      visible.set(className, new Set())
    }
    visible.get(className).add(property)
  })

  return visible
}

/**
 * Get all features that highlight a specific class
 */
export function getFeaturesForClass(className) {
  return Object.values(FEATURES).filter(feature =>
    feature.highlights.classes.includes(className)
  )
}

/**
 * Get all features that highlight a specific property
 */
export function getFeaturesForProperty(className, propertyName) {
  return Object.values(FEATURES).filter(feature =>
    feature.highlights.properties.some(p =>
      p.class === className && p.property === propertyName
    )
  )
}
