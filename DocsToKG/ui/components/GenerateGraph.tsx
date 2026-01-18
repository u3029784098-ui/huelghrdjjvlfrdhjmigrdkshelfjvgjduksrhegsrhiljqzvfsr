import React, { useState } from "react";
import { 
  Plus, 
  Trash2,
  CheckSquare,
  Zap,
  Upload,
  FileText,
  Folder
} from "lucide-react";
import UnifiedUpload, { UnifiedUploadResult } from "./building_blocks_ui/UnifiedUpload";
import { useTheme } from "./themes";

const GenerateGraph: React.FC = () => {
  const { themeClasses } = useTheme();
  
  // Tab state for Generate Graph section
  const [activeTab, setActiveTab] = useState<"upload" | "data" | "graphs">("upload");
  
  // Run ID from upload
  const [runId, setRunId] = useState<number | null>(null);
  
  // Data extraction state
  const [extractTasks, setExtractTasks] = useState({
    metadata: false,
    text: false,
    figures: false,
    tables: false,
    formulas: false
  });
  
  // Figure extraction configuration
  const [scoreThreshold, setScoreThreshold] = useState(0.5);
  const [classificationThreshold, setClassificationThreshold] = useState(0.5);
  const [figureLabels, setFigureLabels] = useState<string[]>([]);
  const [newFigureLabel, setNewFigureLabel] = useState("");
  const [acceptedLabels, setAcceptedLabels] = useState<string[]>([]);
  
  // Graph generation state
  // Lexical graph
  const [separator, setSeparator] = useState("");
  const [chunkSize, setChunkSize] = useState("");
  const [chunkOverlap, setChunkOverlap] = useState("");
  
  // Domain graph
  const [allowedNodes, setAllowedNodes] = useState<string[]>([]);
  const [newNode, setNewNode] = useState("");
  const [allowedRelationships, setAllowedRelationships] = useState<string[]>([]);
  const [newRelationship, setNewRelationship] = useState("");
  const [retryCondition, setRetryCondition] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // Unified upload callbacks
  const handleUploadComplete = (result: UnifiedUploadResult) => {
    // Store the run ID from upload
    if (result.runId) {
      setRunId(result.runId);
      console.log("GenerateGraph: Stored run ID:", result.runId);
    }
  };

  const handleUploadError = (msg: string) => {
    console.error("GenerateGraph upload error:", msg);
  };

  // Generate graph handlers
  const handleTaskChange = (task: keyof typeof extractTasks) => {
    setExtractTasks(prev => ({
      ...prev,
      [task]: !prev[task]
    }));
  };

  const handleAddFigureLabel = () => {
    if (newFigureLabel.trim()) {
      setFigureLabels(prev => [...prev, newFigureLabel.trim()]);
      setNewFigureLabel("");
    }
  };

  const handleDeleteFigureLabel = (index: number) => {
    const labelToDelete = figureLabels[index];
    setFigureLabels(prev => prev.filter((_, i) => i !== index));
    // Also remove from accepted labels if it was selected
    setAcceptedLabels(prev => prev.filter(label => label !== labelToDelete));
  };

  const handleAcceptedLabelToggle = (label: string) => {
    if (acceptedLabels.includes(label)) {
      setAcceptedLabels(prev => prev.filter(l => l !== label));
    } else {
      setAcceptedLabels(prev => [...prev, label]);
    }
  };

  const handleAddNode = () => {
    if (newNode.trim()) {
      setAllowedNodes(prev => [...prev, newNode.trim()]);
      setNewNode("");
    }
  };

  const handleDeleteNode = (index: number) => {
    setAllowedNodes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddRelationship = () => {
    if (newRelationship.trim()) {
      setAllowedRelationships(prev => [...prev, newRelationship.trim()]);
      setNewRelationship("");
    }
  };

  const handleDeleteRelationship = (index: number) => {
    setAllowedRelationships(prev => prev.filter((_, i) => i !== index));
  };

  const handleRun = async () => {
    // If no runId from upload, try to find latest pending run for the active project
    let currentRunId = runId;
    if (!currentRunId) {
      try {
        const latestRes = await fetch('/api/runs/latest', { credentials: 'include' });
        if (latestRes.ok) {
          const data = await latestRes.json();
          currentRunId = data.id;
          setRunId(currentRunId);
          console.log('Found existing pending run:', currentRunId);
        }
      } catch (e) {
        console.warn('No existing pending run found:', e);
      }
    }

    if (!currentRunId) {
      alert("Please upload files first to create a run configuration.");
      return;
    }

    try {
      // Prepare run configuration
      const runConfig = {
        extract_metadata: extractTasks.metadata,
        extract_text: extractTasks.text,
        extract_figures: extractTasks.figures,
        extract_tables: extractTasks.tables,
        extract_formulas: extractTasks.formulas,
        conf_fig_score_threshold: extractTasks.figures ? parseFloat(scoreThreshold.toString()) : null,
        conf_fig_classif_threshold: extractTasks.figures ? parseFloat(classificationThreshold.toString()) : null,
        conf_fig_labels: extractTasks.figures && figureLabels.length > 0 ? figureLabels.join(',') : null,
        conf_fig_accepted_labels: extractTasks.figures && acceptedLabels.length > 0 ? acceptedLabels.join(',') : null,
        graph_gen_conf_separator: separator || null,
        graph_gen_conf_chunk_size: chunkSize ? parseInt(chunkSize, 10) : null,
        graph_gen_conf_chunk_overlap: chunkOverlap ? parseInt(chunkOverlap, 10) : null,
        graph_gen_conf_allowed_nodes: allowedNodes.length > 0 ? allowedNodes.join(',') : null,
        graph_gen_conf_allowed_relationships: allowedRelationships.length > 0 ? allowedRelationships.join(',') : null,
        graph_gen_conf_retry_condition: retryCondition || null,
        graph_gen_conf_additional_instruction: additionalInstructions || null
      };

      console.log("Updating run configuration:", runConfig);

      const response = await fetch(`/api/runs/${currentRunId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(runConfig)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update run configuration");
      }

      const result = await response.json();
      console.log("Run configuration updated:", result);
        // After updating run configuration, trigger backend extraction
        try {
          const tasks: string[] = [];
          if (extractTasks.metadata) tasks.push('metadata');
          if (extractTasks.text) tasks.push('text');
          if (extractTasks.figures) tasks.push('figures');
          if (extractTasks.tables) tasks.push('tables');
          if (extractTasks.formulas) tasks.push('formulas');

          const execRes = await fetch(`/api/runs/${currentRunId}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ validTasks: tasks, noPipeline: false })
          });

          if (!execRes.ok) {
            const data = await execRes.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to start extraction');
          }

          const execData = await execRes.json();
          console.log('Extraction started:', execData);
          alert(`Graph generation started! Run ID: ${runId} (pid: ${execData.pid || 'n/a'})`);
        } catch (execErr: any) {
          console.error('Failed to start extraction:', execErr);
          alert(`Run updated but failed to start extraction: ${execErr.message}`);
        }
      
    } catch (error: any) {
      console.error("Error updating run configuration:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Tab Navigation */}
      <div className={`mb-6 border-b ${themeClasses.border.default}`}>
        <div className="flex">
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${themeClasses.tab(activeTab === "upload")}`}
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${themeClasses.tab(activeTab === "data")}`}
          >
            <FileText className="w-4 h-4" />
            Data Extraction
          </button>
          <button
            onClick={() => setActiveTab("graphs")}
            className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${themeClasses.tab(activeTab === "graphs")}`}
          >
            <Zap className="w-4 h-4" />
            Graph Generation
          </button>
        </div>
      </div>

      {/* Upload Files Tab */}
      {activeTab === "upload" && (
        <div className={`rounded-lg border mb-6 ${themeClasses.card}`}>
          <div className="p-6">
            <h2 className={`text-lg font-semibold mb-6 ${themeClasses.text.primary}`}>
              Upload Files or Folder
            </h2>
            {/* Unified Upload Component */}
            <UnifiedUpload
              initialMode="files"
              onComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          </div>
        </div>
      )}

      {/* Data Extraction Tab */}
      {activeTab === "data" && (
        <div className={`rounded-lg border mb-6 ${themeClasses.card}`}>
          <div className={`p-4 border-b ${themeClasses.border.default}`}>
            <h2 className={`text-lg font-semibold ${themeClasses.text.secondary}`}>
              Data extraction
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Select tasks layout */}
            <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
              <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
                Select tasks
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskChange('metadata')}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        extractTasks.metadata
                          ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                          : themeClasses.border.default
                      }`}
                    >
                      {extractTasks.metadata && (
                        <CheckSquare className={`w-3 h-3 ${themeClasses.text.primary}`} />
                      )}
                    </button>
                    <label className={`text-sm ${themeClasses.text.secondary}`}>
                      Extract metadata
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskChange('text')}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        extractTasks.text
                          ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                          : themeClasses.border.default
                      }`}
                    >
                      {extractTasks.text && (
                        <CheckSquare className={`w-3 h-3 ${themeClasses.text.primary}`} />
                      )}
                    </button>
                    <label className={`text-sm ${themeClasses.text.secondary}`}>
                      Extract text
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskChange('figures')}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        extractTasks.figures
                          ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                          : themeClasses.border.default
                      }`}
                    >
                      {extractTasks.figures && (
                        <CheckSquare className={`w-3 h-3 ${themeClasses.text.primary}`} />
                      )}
                    </button>
                    <label className={`text-sm ${themeClasses.text.secondary}`}>
                      Extract figures
                    </label>
                  </div>
                </div>
                
                {/* Right column */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskChange('tables')}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        extractTasks.tables
                          ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                          : themeClasses.border.default
                      }`}
                    >
                      {extractTasks.tables && (
                        <CheckSquare className={`w-3 h-3 ${themeClasses.text.primary}`} />
                      )}
                    </button>
                    <label className={`text-sm ${themeClasses.text.secondary}`}>
                      Extract tables
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTaskChange('formulas')}
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        extractTasks.formulas
                          ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                          : themeClasses.border.default
                      }`}
                    >
                      {extractTasks.formulas && (
                        <CheckSquare className={`w-3 h-3 ${themeClasses.text.primary}`} />
                      )}
                    </button>
                    <label className={`text-sm ${themeClasses.text.secondary}`}>
                      Extract formulas
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Configure figure extraction - only shown if Extract figures is checked */}
            {extractTasks.figures && (
              <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
                <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
                  Configure figure extraction
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                        Score threshold: {scoreThreshold.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={scoreThreshold}
                        onChange={(e) => setScoreThreshold(parseFloat(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${themeClasses.slider}`}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={themeClasses.text.muted}>0</span>
                        <span className={themeClasses.text.muted}>1</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                        Classification threshold: {classificationThreshold.toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={classificationThreshold}
                        onChange={(e) => setClassificationThreshold(parseFloat(e.target.value))}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${themeClasses.slider}`}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className={themeClasses.text.muted}>0</span>
                        <span className={themeClasses.text.muted}>1</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                        Labels
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFigureLabel}
                          onChange={(e) => setNewFigureLabel(e.target.value)}
                          placeholder="Enter label"
                          className={`flex-1 px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                        />
                        <button
                          onClick={handleAddFigureLabel}
                          className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${themeClasses.button.primary}`}
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                      
                      {/* Display labels */}
                      <div className="mt-2 space-y-1">
                        {figureLabels.map((label, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded ${themeClasses.bg.hover}`}
                          >
                            <span className={`text-sm ${themeClasses.text.secondary}`}>
                              {label}
                            </span>
                            <button
                              onClick={() => handleDeleteFigureLabel(index)}
                              className={`p-1 rounded transition-colors ${
                                themeClasses.button.danger.replace('bg-', 'text-').replace('hover:bg-', 'hover:bg-')
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                      Accepted labels
                    </label>
                    <div className={`p-3 rounded border min-h-[200px] ${themeClasses.input}`}>
                      {figureLabels.length === 0 ? (
                        <p className={`text-sm text-center ${themeClasses.text.muted}`}>
                          Add labels first to select accepted ones
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {figureLabels.map((label, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptedLabelToggle(label)}
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  acceptedLabels.includes(label)
                                    ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                                    : themeClasses.border.default
                                }`}
                              >
                                {acceptedLabels.includes(label) && (
                                  <CheckSquare className={`w-3 h-3 ${themeClasses.text.primary}`} />
                                )}
                              </button>
                              <span className={`text-sm ${themeClasses.text.secondary}`}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Graph Generation Tab */}
      {activeTab === "graphs" && (
        <div className={`rounded-lg border mb-6 ${themeClasses.card}`}>
          <div className={`p-4 border-b ${themeClasses.border.default}`}>
            <h2 className={`text-lg font-semibold ${themeClasses.text.secondary}`}>
              Graph generation
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Create lexical graph */}
            <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
              <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
                Create lexical graph
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Separator
                  </label>
                  <input
                    type="text"
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    placeholder="e.g., \n\n"
                    className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Chunk size
                  </label>
                  <input
                    type="number"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(e.target.value)}
                    placeholder="e.g., 1000"
                    className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Chunk overlap
                  </label>
                  <input
                    type="number"
                    value={chunkOverlap}
                    onChange={(e) => setChunkOverlap(e.target.value)}
                    placeholder="e.g., 200"
                    className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                  />
                </div>
              </div>
            </div>
            
            {/* Create domain graph */}
            <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
              <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
                Create domain graph
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Allowed nodes */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                      Allowed nodes
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newNode}
                        onChange={(e) => setNewNode(e.target.value)}
                        placeholder="Enter node type"
                        className={`flex-1 px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                      />
                      <button
                        onClick={handleAddNode}
                        className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${themeClasses.button.primary}`}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    
                    {/* Display nodes */}
                    <div className={`p-3 rounded border min-h-[100px] ${themeClasses.input}`}>
                      {allowedNodes.length === 0 ? (
                        <p className={`text-sm text-center ${themeClasses.text.muted}`}>
                          No nodes added yet
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {allowedNodes.map((node, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-2 rounded ${themeClasses.bg.hover}`}
                            >
                              <span className={`text-sm ${themeClasses.text.secondary}`}>
                                {node}
                              </span>
                              <button
                                onClick={() => handleDeleteNode(index)}
                                className={`p-1 rounded transition-colors ${
                                  themeClasses.button.danger.replace('bg-', 'text-').replace('hover:bg-', 'hover:bg-')
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Allowed relationships */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                      Allowed relationships
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newRelationship}
                        onChange={(e) => setNewRelationship(e.target.value)}
                        placeholder="Enter relationship type"
                        className={`flex-1 px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                      />
                      <button
                        onClick={handleAddRelationship}
                        className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${themeClasses.button.primary}`}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    
                    {/* Display relationships */}
                    <div className={`p-3 rounded border min-h-[100px] ${themeClasses.input}`}>
                      {allowedRelationships.length === 0 ? (
                        <p className={`text-sm text-center ${themeClasses.text.muted}`}>
                          No relationships added yet
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {allowedRelationships.map((relationship, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-2 rounded ${themeClasses.bg.hover}`}
                            >
                              <span className={`text-sm ${themeClasses.text.secondary}`}>
                                {relationship}
                              </span>
                              <button
                                onClick={() => handleDeleteRelationship(index)}
                                className={`p-1 rounded transition-colors ${
                                  themeClasses.button.danger.replace('bg-', 'text-').replace('hover:bg-', 'hover:bg-')
                                }`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Retry condition */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Retry condition
                  </label>
                  <input
                    type="text"
                    value={retryCondition}
                    onChange={(e) => setRetryCondition(e.target.value)}
                    placeholder="e.g., if extraction fails, retry with different parameters"
                    className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                  />
                </div>
                
                {/* Additional instructions */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                    Additional instructions
                  </label>
                  <textarea
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="Enter any additional instructions for graph generation..."
                    rows={4}
                    className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Run button - only shown in data and graphs tabs */}
      {(activeTab === "data" || activeTab === "graphs") && (
        <div className="flex justify-end">
          <button
            onClick={handleRun}
            className={`px-6 py-3 rounded font-medium transition-colors flex items-center gap-2 ${themeClasses.button.primary}`}
          >
            <Zap className="w-4 h-4" />
            Run
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerateGraph;