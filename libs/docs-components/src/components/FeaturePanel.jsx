import React, { useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { FEATURES, getFeaturesForClass, getFeaturesForProperty } from '../data/features'

function FeatureAccordionItem({ feature, isActive, isExpanded, onToggle, onClear }) {
  const IconComponent = LucideIcons[feature.icon] || LucideIcons.Circle

  return (
    <div className={`feature-accordion-item ${isActive ? 'feature-accordion-item--active' : ''}`}>
      <button
        className="feature-accordion-header"
        onClick={onToggle}
        style={{ '--feature-color': feature.color }}
      >
        <div className="feature-accordion-header__left">
          <IconComponent size={20} strokeWidth={2} />
          <span className="feature-accordion-title">{feature.title}</span>
        </div>
        <div className="feature-accordion-header__right">
          {isActive && (
            <button
              className="feature-accordion-clear"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              aria-label="Clear selection"
            >
              <LucideIcons.X size={16} />
            </button>
          )}
          <LucideIcons.ChevronDown
            size={18}
            className={`feature-accordion-chevron ${isExpanded ? 'feature-accordion-chevron--expanded' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="feature-accordion-content" style={{ '--feature-color': feature.color }}>
          <p className="feature-accordion-description">{feature.description}</p>

          <div className="feature-accordion-benefit">
            <LucideIcons.Lightbulb size={16} strokeWidth={2} />
            <span>{feature.benefit}</span>
          </div>

          {feature.details && feature.details.length > 0 && (
            <div className="feature-accordion-list">
              <h4>Key Points</h4>
              <ul>
                {feature.details.map((detail, idx) => (
                  <li key={idx}>
                    <LucideIcons.Check size={14} strokeWidth={2.5} />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="feature-accordion-highlights">
            <h4>Implemented In</h4>
            <div className="feature-accordion-tags">
              {feature.highlights.classes.map(className => (
                <span key={className} className="feature-tag feature-tag--class">
                  <LucideIcons.Box size={12} />
                  {className}
                </span>
              ))}
              {feature.highlights.properties.map(({ class: className, property }) => (
                <span key={`${className}.${property}`} className="feature-tag feature-tag--property">
                  <LucideIcons.Dot size={12} />
                  {className}.{property}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClassDetails({ className, onClear }) {
  const features = getFeaturesForClass(className)

  return (
    <div className="selection-details">
      <div className="selection-details__header">
        <div className="selection-details__icon-wrapper">
          <LucideIcons.Box size={24} strokeWidth={2} />
        </div>
        <div className="selection-details__header-text">
          <h3 className="selection-details__title">{className}</h3>
          <button
            className="selection-details__clear"
            onClick={onClear}
            aria-label="Clear selection"
          >
            <LucideIcons.X size={16} />
          </button>
        </div>
      </div>

      <p className="selection-details__description">
        This class is used by {features.length} {features.length === 1 ? 'feature' : 'features'}
      </p>

      <div className="selection-details__features">
        {features.map((feature) => {
          const IconComponent = LucideIcons[feature.icon] || LucideIcons.Circle
          return (
            <div
              key={feature.id}
              className="selection-details__feature-item"
              style={{ '--feature-color': feature.color }}
            >
              <div className="selection-details__feature-icon">
                <IconComponent size={18} strokeWidth={2} />
              </div>
              <div className="selection-details__feature-content">
                <h5>{feature.title}</h5>
                <p>{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PropertyDetails({ className, propertyName, onClear }) {
  const features = getFeaturesForProperty(className, propertyName)

  return (
    <div className="selection-details">
      <div className="selection-details__header">
        <div className="selection-details__icon-wrapper">
          <LucideIcons.Dot size={24} strokeWidth={2} />
        </div>
        <div className="selection-details__header-text">
          <h3 className="selection-details__title">
            {className}.{propertyName}
          </h3>
          <button
            className="selection-details__clear"
            onClick={onClear}
            aria-label="Clear selection"
          >
            <LucideIcons.X size={16} />
          </button>
        </div>
      </div>

      {features.length > 0 ? (
        <>
          <p className="selection-details__description">
            This property is used by {features.length} {features.length === 1 ? 'feature' : 'features'}
          </p>

          <div className="selection-details__features">
            {features.map((feature) => {
              const IconComponent = LucideIcons[feature.icon] || LucideIcons.Circle
              return (
                <div
                  key={feature.id}
                  className="selection-details__feature-item"
                  style={{ '--feature-color': feature.color }}
                >
                  <div className="selection-details__feature-icon">
                    <IconComponent size={18} strokeWidth={2} />
                  </div>
                  <div className="selection-details__feature-content">
                    <h5>{feature.title}</h5>
                    <p>{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p className="selection-details__description">
          This property is part of the core model structure.
        </p>
      )}
    </div>
  )
}

export function FeaturePanel({
  currentFeature,
  selectedClass,
  selectedProperty,
  onFeatureChange,
  onClear
}) {
  const featureList = Object.values(FEATURES)
  const [expandedFeature, setExpandedFeature] = useState(currentFeature || 'universal-abstraction')

  const handleFeatureToggle = (featureId) => {
    if (expandedFeature === featureId && !currentFeature) {
      // If clicking the already expanded feature and it's not active, collapse it
      setExpandedFeature(null)
    } else {
      // Expand the feature and make it active
      setExpandedFeature(featureId)
      if (onFeatureChange) {
        onFeatureChange(featureId)
      }
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    }
  }

  // Update expanded feature when currentFeature changes
  React.useEffect(() => {
    if (currentFeature) {
      setExpandedFeature(currentFeature)
    }
  }, [currentFeature])

  return (
    <div className="feature-panel">
      {/* Selection details - shown when class or property is selected */}
      {(selectedClass || selectedProperty) && (
        <div className="feature-panel__selection">
          {selectedProperty ? (
            <PropertyDetails
              className={selectedProperty.className}
              propertyName={selectedProperty.propertyName}
              onClear={handleClear}
            />
          ) : (
            <ClassDetails className={selectedClass} onClear={handleClear} />
          )}
        </div>
      )}

      {/* Feature accordion */}
      <div className="feature-accordion">
        <h3 className="feature-accordion__title">
          <LucideIcons.Layers size={18} />
          Features
        </h3>
        <div className="feature-accordion__list">
          {featureList.map((feature) => (
            <FeatureAccordionItem
              key={feature.id}
              feature={feature}
              isActive={currentFeature === feature.id}
              isExpanded={expandedFeature === feature.id}
              onToggle={() => handleFeatureToggle(feature.id)}
              onClear={handleClear}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturePanel
