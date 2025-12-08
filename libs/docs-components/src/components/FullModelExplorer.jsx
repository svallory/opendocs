import React, { useState } from 'react'
import { ModelDiagram } from './ModelDiagram'
import { DocumentationPanel } from './DocumentationPanel'
import '../styles/full-model-explorer.css'

export function FullModelExplorer({
  variant = 'full',
  showKind = true
}) {
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)

  const handleNodeClick = (node) => {
    setSelectedClass(node.data.name)
    setSelectedProperty(null)
  }

  const handlePropertyClick = (className, propertyName) => {
    setSelectedProperty({ className, propertyName })
    setSelectedClass(null)
  }

  return (
    <div className="full-model-explorer">
      <div className="full-model-explorer__diagram">
        <ModelDiagram
          variant={variant}
          showKind={showKind}
          feature={null}
          useAutoLayout={false}
          onNodeClick={handleNodeClick}
          onPropertyClick={handlePropertyClick}
        />
      </div>
      <div className="full-model-explorer__docs">
        <DocumentationPanel
          selectedClass={selectedClass}
          selectedProperty={selectedProperty}
        />
      </div>
    </div>
  )
}

export default FullModelExplorer
