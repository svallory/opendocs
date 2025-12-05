// OpenDocs Model Data - inlined to avoid import issues
const modelNodes = [
  {
    id: 'docset',
    type: 'modelNode',
    position: { x: 400, y: 0 },
    data: {
      label: 'DocSet',
      borderColor: 'border-indigo-600',
      description: 'Root object representing the opendocs.json file. Entry point for the entire documentation set, containing metadata and all projects.',
      properties: [
        { name: 'id', type: 'string', description: 'Unique identifier for this documentation set. Typically matches the repository name or project name.', required: true },
        { name: 'name', type: 'string', description: 'Human-readable name displayed in documentation UIs.', required: true },
        { name: 'projects', type: 'Project[]', description: 'Array of projects in this documentation set. In monorepos, each package/library/app is a separate Project.', required: true },
        { name: 'version', type: 'string', description: 'Version of the OpenDocs specification being used (e.g., "1.0.0").', required: false },
        { name: 'metadata', type: 'object', description: 'Additional metadata such as created timestamp, modified timestamp, and generator tool information.', required: false },
      ],
      isSelected: false,
    },
  },
  {
    id: 'project',
    type: 'modelNode',
    position: { x: 350, y: 200 },
    data: {
      label: 'Project',
      borderColor: 'border-purple-600',
      description: 'Individual project within a documentation set. In monorepos, each package is a separate Project. Each has its own language, version, and documentation items.',
      properties: [
        { name: 'id', type: 'string', description: 'Unique project identifier within the DocSet. Use descriptive names like "auth-service" or "web-sdk".', required: true },
        { name: 'name', type: 'string', description: 'Display name for the project shown in documentation UIs.', required: true },
        { name: 'language', type: 'string', description: 'Programming language: typescript, javascript, python, go, rust, java, csharp, etc.', required: true },
        { name: 'items', type: 'DocItem[]', description: 'Top-level documentation items (modules, namespaces, packages) for this project.', required: true },
        { name: 'repository', type: 'Repository', description: 'Repository information for generating source code links with customizable URL templates.', required: false },
      ],
      isSelected: false,
    },
  },
  {
    id: 'docitem',
    type: 'modelNode',
    position: { x: 300, y: 450 },
    data: {
      label: 'DocItem',
      borderColor: 'border-pink-500',
      description: 'Universal documentation element - the core abstraction. Everything is a DocItem: modules, classes, methods, parameters, everything. This unified approach works across all programming languages.',
      properties: [
        { name: 'id', type: 'string', description: 'Language-native fully qualified name. TypeScript uses "pkg#Symbol", Rust uses "crate::Type", Go uses "package.Function", Python uses "module.Class.method".', required: true },
        { name: 'name', type: 'string', description: 'Simple name without package/module prefix. For "mylib.Calculator.add", the name is "add".', required: true },
        { name: 'kind', type: 'string', description: 'Language-specific item type: class, function, method, property, interface, struct, trait, etc.', required: true },
        { name: 'location', type: 'Location', description: 'Source code location with file path, line number, and column for "Go to Definition" features.', required: false },
        { name: 'docBlock', type: 'DocBlock', description: 'Structured documentation content extracted from code comments (JSDoc, docstrings, rustdoc, etc.).', required: false },
        { name: 'relations', type: 'Relations', description: 'Relationships to other DocItems: container, extends, implements, and language-specific relations.', required: false },
        { name: 'items', type: 'DocItem[]', description: 'Child items creating hierarchical structure. Classes contain methods, modules contain classes, etc.', required: false },
      ],
      isSelected: false,
    },
  },
  {
    id: 'docblock',
    type: 'modelNode',
    position: { x: 100, y: 700 },
    data: {
      label: 'DocBlock',
      borderColor: 'border-orange-500',
      description: 'Structured documentation content from code comments. Normalizes TSDoc, Javadoc, rustdoc, and Python docstrings to a unified format for consistent rendering.',
      properties: [
        { name: 'description', type: 'string', description: 'Main documentation text. Supports Markdown formatting for rich content.', required: false },
        { name: 'tags', type: 'Record<string, (string | DocTag)[]>', description: 'Documentation tags organized by name: @param, @returns, @since, @author, etc. Each tag name maps to an array of values.', required: false },
        { name: 'deprecated', type: 'DeprecatedInfo', description: 'Structured deprecation information with message and version when item was deprecated.', required: false },
      ],
      isSelected: false,
    },
  },
  {
    id: 'doctag',
    type: 'modelNode',
    position: { x: 450, y: 850 },
    data: {
      label: 'DocTag',
      borderColor: 'border-green-500',
      description: 'Individual documentation tag normalized across all languages. Represents @param, @returns, @throws, @deprecated, and other structured metadata.',
      properties: [
        { name: 'name', type: 'string', description: 'Tag name without @ symbol: param, returns, throws, deprecated, since, author, etc.', required: true },
        { name: 'content', type: 'string', description: 'Tag description or main content. For @param tags, this is the parameter description.', required: true },
        { name: 'parameters', type: 'Record<string, string>', description: 'Additional structured parameters. For @param tags: {name: "paramName", type: "string"}. For @throws: {type: "ErrorType"}.', required: false },
      ],
      isSelected: false,
    },
  },
  {
    id: 'relation',
    type: 'modelNode',
    position: { x: 600, y: 650 },
    data: {
      label: 'Relation',
      borderColor: 'border-blue-500',
      description: 'Typed relationship between DocItems. Describes how items connect: containment, inheritance, implementation, and language-specific relationships with optional metadata.',
      properties: [
        { name: 'kind', type: 'string', description: 'Relationship type: container, extends, implements, rust-trait-impl, go-receiver-method, python-decorator, etc.', required: true },
        { name: 'target', type: 'string', description: 'Target DocItem ID (must be a valid language-native fully qualified name).', required: true },
        { name: 'metadata', type: 'object', description: 'Additional relationship context. For Rust: {derived: true} for #[derive(Trait)]. For generics: {constraint: "where T: Clone"}.', required: false },
      ],
      isSelected: false,
    },
  },
];

const modelEdges = [
  { id: 'docset-project', source: 'docset', target: 'project', label: 'contains', type: 'smoothstep', animated: true, style: { stroke: '#8B5CF6', strokeWidth: 3 }, labelStyle: { fill: '#8B5CF6', fontWeight: 600, fontSize: 14 }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 } },
  { id: 'project-docitem', source: 'project', target: 'docitem', label: 'contains', type: 'smoothstep', animated: true, style: { stroke: '#EC4899', strokeWidth: 3 }, labelStyle: { fill: '#EC4899', fontWeight: 600, fontSize: 14 }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 } },
  { id: 'docitem-docblock', source: 'docitem', target: 'docblock', label: 'has', type: 'smoothstep', style: { stroke: '#F97316', strokeWidth: 2 }, labelStyle: { fill: '#F97316', fontWeight: 600, fontSize: 12 }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 } },
  { id: 'docitem-relation', source: 'docitem', target: 'relation', label: 'has', type: 'smoothstep', style: { stroke: '#3B82F6', strokeWidth: 2 }, labelStyle: { fill: '#3B82F6', fontWeight: 600, fontSize: 12 }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 } },
  { id: 'docblock-doctag', source: 'docblock', target: 'doctag', label: 'contains', type: 'smoothstep', style: { stroke: '#22C55E', strokeWidth: 2 }, labelStyle: { fill: '#22C55E', fontWeight: 600, fontSize: 12 }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 } },
  { id: 'docitem-docitem', source: 'docitem', target: 'docitem', label: 'contains (recursive)', type: 'smoothstep', sourceHandle: 'bottom', targetHandle: 'left', style: { stroke: '#EC4899', strokeWidth: 2, strokeDasharray: '5,5' }, labelStyle: { fill: '#EC4899', fontWeight: 600, fontSize: 11 }, labelBgStyle: { fill: 'white', fillOpacity: 0.9 } },
];

// CustomModelNode component - renders individual model nodes with properties
function CustomModelNode({ data }) {
  // Access Position and Handle from window.ReactFlowModule
  const { Position, Handle } = window.ReactFlowModule || {};

  if (!Position || !Handle) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div
        className={`
          px-6 py-4 shadow-lg rounded-lg border-4 bg-white
          transition-all duration-200
          hover:shadow-2xl hover:scale-105
          ${data.borderColor}
          ${data.isSelected ? 'ring-4 ring-blue-400 shadow-2xl' : ''}
        `}
      >
        <div className="text-xl font-bold text-gray-800 mb-3">
          {data.label}
        </div>

        {data.properties && (
          <div className="text-sm text-gray-600 space-y-1 min-w-[220px]">
            {data.properties.slice(0, 4).map((prop, idx) => (
              <div
                key={idx}
                className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (data.onPropertyClick) {
                    data.onPropertyClick(prop);
                  }
                }}
              >
                <span className="font-mono text-xs font-semibold">
                  {prop.name}
                </span>
                {prop.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
                <span className="text-gray-400 ml-2 text-xs">
                  {prop.type}
                </span>
              </div>
            ))}
            {data.properties.length > 4 && (
              <div className="text-xs text-gray-400 italic px-2 py-1">
                +{data.properties.length - 4} more...
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

// SidePanel component - shows details of selected model or property
function SidePanel({ selectedItem }) {
  if (!selectedItem) {
    return (
      <div className="w-full lg:w-80 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 p-6">
        <div className="text-center text-gray-400 mt-20">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-lg mb-2 font-semibold">Click any model to explore</p>
          <p className="text-sm">See properties and relationships</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white border-b lg:border-r lg:border-b-0 border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {selectedItem.label || selectedItem.name}
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {selectedItem.description}
      </p>

      {selectedItem.properties && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-lg mb-3">
            Properties:
          </h4>
          {selectedItem.properties.map((prop, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-purple-700">
                  {prop.name}
                </span>
                {prop.required && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                    required
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mb-2 font-mono">
                {prop.type}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {prop.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main OpenDocsModelDiagram component
export function OpenDocsModelDiagram() {
  // Check if running in browser
  if (typeof window === 'undefined') {
    return <div className="h-[700px] bg-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading diagram...</p>
    </div>;
  }

  const React = window.React;
  const ReactFlowModule = window.ReactFlowModule;

  // Wait for ReactFlow to load
  if (!React || !ReactFlowModule) {
    return (
      <div className="h-[700px] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading interactive diagram...</p>
        </div>
      </div>
    );
  }

  const { useState, useCallback, useMemo } = React;
  const {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType
  } = ReactFlowModule;

  const nodeTypes = useMemo(() => ({
    modelNode: CustomModelNode,
  }), []);

  // Component implementation
  const DiagramComponent = () => {
    const [selectedItem, setSelectedItem] = useState(null);

    // Add onPropertyClick handler to each node's data
    const initialNodes = useMemo(() =>
      modelNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onPropertyClick: (prop) => {
            setSelectedItem({
              ...prop,
              label: `${node.data.label}.${prop.name}`,
              description: prop.description,
              properties: null,
            });
          },
        },
      })),
      []
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(modelEdges);

    const onNodeClick = useCallback((event, node) => {
      // Update selected item
      setSelectedItem(node.data);

      // Update visual selection state
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            isSelected: n.id === node.id,
          },
        }))
      );
    }, [setNodes]);

    return (
      <div className="flex flex-col lg:flex-row h-[500px] lg:h-[700px] bg-gray-50">
        {/* Side Panel */}
        <SidePanel selectedItem={selectedItem} />

        {/* Diagram */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.3}
            maxZoom={1.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            attributionPosition="bottom-right"
          >
            <Controls className="bg-white shadow-lg rounded-lg border border-gray-200" />
            <MiniMap
              nodeColor={(node) => {
                const colors = {
                  docset: '#4F46E5',
                  project: '#9333EA',
                  docitem: '#EC4899',
                  docblock: '#F97316',
                  doctag: '#22C55E',
                  relation: '#3B82F6',
                };
                return colors[node.id] || '#gray';
              }}
              className="bg-white shadow-lg rounded-lg border border-gray-200"
            />
            <Background variant="dots" gap={16} size={1} color="#d1d5db" />
          </ReactFlow>
        </div>
      </div>
    );
  };

  return <DiagramComponent />;
}
