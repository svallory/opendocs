import React from 'react'

/**
 * UML-style edge markers for ReactFlow diagrams
 * These are rendered as SVG defs that can be referenced by edges
 */
export function UMLMarkers() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        {/* Filled diamond for composition */}
        <marker
          id="diamond-filled"
          viewBox="0 0 20 20"
          refX="10"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M 0,10 L 10,5 L 20,10 L 10,15 Z"
            fill="#999"
            stroke="#999"
            strokeWidth="1"
          />
        </marker>

        {/* Hollow diamond for aggregation */}
        <marker
          id="diamond-hollow"
          viewBox="0 0 20 20"
          refX="10"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M 0,10 L 10,5 L 20,10 L 10,15 Z"
            fill="white"
            stroke="#999"
            strokeWidth="1.5"
          />
        </marker>

        {/* Hollow triangle for inheritance */}
        <marker
          id="triangle-hollow"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="12"
          markerHeight="12"
          orient="auto"
        >
          <path
            d="M 2,5 L 18,10 L 2,15 Z"
            fill="white"
            stroke="#999"
            strokeWidth="1.5"
          />
        </marker>

        {/* Standard arrow */}
        <marker
          id="arrow-standard"
          viewBox="0 0 20 20"
          refX="18"
          refY="10"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            d="M 2,5 L 18,10 L 2,15"
            fill="none"
            stroke="#999"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
    </svg>
  )
}

export default UMLMarkers
