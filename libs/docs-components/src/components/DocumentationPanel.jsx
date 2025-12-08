import React from 'react'
import * as LucideIcons from 'lucide-react'
import { MODEL_CLASSES } from '../data/model-schema'

function EmptyState() {
  return (
    <div className="docs-panel__empty">
      <div className="docs-panel__empty-icon">
        <LucideIcons.Code2 size={48} strokeWidth={1.5} />
      </div>
      <h3 className="docs-panel__empty-title">Select a node or property</h3>
      <p className="docs-panel__empty-description">
        Click on any class or property in the diagram to view its documentation
      </p>

      <div className="docs-panel__suggestions">
        <h4>Try clicking:</h4>
        <ul>
          <li>
            <LucideIcons.Box size={14} />
            <span><code>DocItem</code> class to see the universal abstraction</span>
          </li>
          <li>
            <LucideIcons.Dot size={14} />
            <span><code>DocBlock.tags</code> to understand tag storage</span>
          </li>
          <li>
            <LucideIcons.Box size={14} />
            <span><code>Project</code> to see monorepo support</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

function PropertyDocumentation({ className, propertyName }) {
  const classData = MODEL_CLASSES[className]
  if (!classData) return <EmptyState />

  const property = classData.properties.find(p => p.name === propertyName)
  if (!property) return <EmptyState />

  return (
    <div className="docs-panel__content">
      <div className="docs-panel__header">
        <div className="docs-panel__breadcrumb">
          <span className="docs-panel__breadcrumb-item">{className}</span>
          <LucideIcons.ChevronRight size={14} />
          <span className="docs-panel__breadcrumb-item docs-panel__breadcrumb-item--active">
            {propertyName}
          </span>
        </div>
      </div>

      <div className="docs-panel__signature">
        <span className="docs-panel__keyword">property</span>{' '}
        <span className="docs-panel__property-name">{propertyName}</span>
        <span className="docs-panel__punctuation">:</span>{' '}
        <span className="docs-panel__type">{property.type}</span>
        {!property.required && (
          <span className="docs-panel__optional"> | undefined</span>
        )}
      </div>

      <div className="docs-panel__metadata">
        <div className="docs-panel__metadata-item">
          <span className="docs-panel__metadata-label">Required:</span>
          <span className={`docs-panel__metadata-value ${property.required ? 'docs-panel__metadata-value--yes' : 'docs-panel__metadata-value--no'}`}>
            {property.required ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="docs-panel__metadata-item">
          <span className="docs-panel__metadata-label">Type:</span>
          <span className="docs-panel__metadata-value docs-panel__metadata-value--type">
            {property.type}
          </span>
        </div>
      </div>

      <div className="docs-panel__description">
        <h4>Description</h4>
        <p>{property.description}</p>
      </div>

      {property.usage && (
        <div className="docs-panel__usage">
          <h4>Usage</h4>
          <p>{property.usage}</p>
        </div>
      )}

      {getPropertyExample(className, propertyName) && (
        <div className="docs-panel__example">
          <h4>Example</h4>
          <pre className="docs-panel__code">
            <code>{getPropertyExample(className, propertyName)}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

function ClassDocumentation({ className }) {
  const classData = MODEL_CLASSES[className]
  if (!classData) return <EmptyState />

  return (
    <div className="docs-panel__content">
      <div className="docs-panel__header">
        <div className="docs-panel__breadcrumb">
          <span className="docs-panel__breadcrumb-item docs-panel__breadcrumb-item--active">
            {className}
          </span>
        </div>
      </div>

      <div className="docs-panel__signature">
        <span className="docs-panel__keyword">{classData.kind}</span>{' '}
        <span className="docs-panel__class-name">{className}</span>
      </div>

      <div className="docs-panel__description">
        <h4>Description</h4>
        <p>{classData.description}</p>
      </div>

      {classData.usage && (
        <div className="docs-panel__usage">
          <h4>Usage</h4>
          <p>{classData.usage}</p>
        </div>
      )}

      <div className="docs-panel__properties">
        <h4>Properties ({classData.properties.length})</h4>
        <div className="docs-panel__property-list">
          {classData.properties.map((prop) => (
            <div key={prop.name} className="docs-panel__property-item">
              <div className="docs-panel__property-header">
                <span className="docs-panel__property-name">{prop.name}</span>
                {!prop.required && (
                  <span className="docs-panel__optional-badge">optional</span>
                )}
              </div>
              <div className="docs-panel__property-type">
                <span className="docs-panel__type">{prop.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DocumentationPanel({ selectedClass, selectedProperty }) {
  return (
    <div className="docs-panel">
      {!selectedClass && !selectedProperty && <EmptyState />}

      {selectedProperty && (
        <PropertyDocumentation
          className={selectedProperty.className}
          propertyName={selectedProperty.propertyName}
        />
      )}

      {selectedClass && !selectedProperty && (
        <ClassDocumentation className={selectedClass} />
      )}
    </div>
  )
}

// Helper functions for documentation content

function getPropertyExample(className, propertyName) {
  const examples = {
    'Project.id': `"my-awesome-lib"`,
    'Project.language': `"typescript"`,
    'Project.items': `[
  {
    "id": "my-lib#MyClass",
    "name": "MyClass",
    "kind": "class",
    "language": "typescript"
  }
]`,
    'DocItem.kind': `"class"  // TypeScript
"struct" // Rust
"interface" // Go`,
    'DocItem.id': `"mylib#MyClass"           // TypeScript
"my_crate::MyStruct"      // Rust
"mypackage.MyInterface"   // Go`,
    'DocBlock.tags': `{
  "param": [
    {
      "name": "param",
      "content": "input - The input value",
      "parameters": { "name": "input", "type": "string" }
    }
  ],
  "returns": [
    {
      "name": "returns",
      "content": "The processed result"
    }
  ]
}`
  }

  const key = `${className}.${propertyName}`
  return examples[key] || null
}

export default DocumentationPanel
