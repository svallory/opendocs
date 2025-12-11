import React, { useState } from 'react'
import { ModelDiagram } from './ModelDiagram'
import { FeaturePanel } from './FeaturePanel'
import '../styles/feature-explorer.css'

export function FeatureExplorer({
  variant = 'simple',
  defaultFeature = 'universal-abstraction',
  showKind = false,
  useAutoLayout = false
}) {
  const [currentFeature, setCurrentFeature] = useState(defaultFeature)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)

  const handleFeatureChange = (featureId) => {
    setCurrentFeature(featureId)
    setSelectedClass(null)
    setSelectedProperty(null)
  }

  const handleNodeClick = (node) => {
    // When clicking a node, show class details and clear others
    setSelectedClass(node.data.name)
    setSelectedProperty(null)
    setCurrentFeature(null)
  }

  const handlePropertyClick = (className, propertyName) => {
    // When clicking a property, show property details and clear others
    setSelectedProperty({ className, propertyName })
    setSelectedClass(null)
    setCurrentFeature(null)
  }

  const handleClear = () => {
    setCurrentFeature('universal-abstraction')
    setSelectedClass(null)
    setSelectedProperty(null)
  }

  return (
    <div className="feature-explorer">
      <div className="feature-explorer__panel">
        <FeaturePanel
          currentFeature={currentFeature}
          selectedClass={selectedClass}
          selectedProperty={selectedProperty}
          onFeatureChange={handleFeatureChange}
          onClear={handleClear}
        />
      </div>
      <div className="feature-explorer__diagram">
        <ModelDiagram
          variant={variant}
          showKind={showKind}
          feature={currentFeature}
          useAutoLayout={useAutoLayout}
          onNodeClick={handleNodeClick}
          onPropertyClick={handlePropertyClick}
        />
      </div>
    </div>
  )
}

export default FeatureExplorer
