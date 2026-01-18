import React, { useState, useEffect } from "react";
import { 
  Folder,
  Cpu,
  Network,
  Server,
  Database,
  Save
} from "lucide-react";
import Storage from "./settings/Storage";
import LLMGraphRAG from "./settings/LLMGraphRAG";
import GraphProperties from "./settings/GraphProperties";
import APIs from "./settings/APIs";
import ManageConnections from "./settings/ManageConnections";
import { getThemeClasses } from "./themes";

const Settings: React.FC = () => {
  const [activeConfigTab, setActiveConfigTab] = useState("Storage");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Storage state
  const [storagePaths, setStoragePaths] = useState({
    rawDocuments: { path: "", prefix: "raw" },
    metadata: { path: "", prefix: "metadata" },
    text: { path: "", prefix: "text" },
    figures: { path: "", prefix: "figures" },
    formulas: { path: "", prefix: "formulas" },
    tables: { path: "", prefix: "table" },
    hierarchy: { path: "", prefix: "hierarchy" },
    shrinks: { path: "", prefix: "shrink" }
  });
  
  // LLM & GraphRAG state
  const [llmProvider, setLlmProvider] = useState("");
  const [llmName, setLlmName] = useState("");
  const [embeddingProvider, setEmbeddingProvider] = useState("");
  const [embeddingModel, setEmbeddingModel] = useState("");
  const [embeddingDimensions, setEmbeddingDimensions] = useState("");
  const [similarityMetric, setSimilarityMetric] = useState("");
  
  // Graph properties state
  const [metaLabels, setMetaLabels] = useState({
    lexicalGraph: "",
    domainGraph: "",
    formulasGraph: "",
    tablesGraph: "",
    figuresGraph: ""
  });
  const [hierarchyLevels, setHierarchyLevels] = useState<string[]>([]);
  const [newHierarchyLevel, setNewHierarchyLevel] = useState("");
  
  // APIs state
  const [llmGraphBuilderUrl, setLlmGraphBuilderUrl] = useState("");

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          // Load storage paths
          setStoragePaths({
            rawDocuments: { 
              path: data.settings.raw_doc_path || "", 
              prefix: data.settings.raw_doc_prefix || "raw" 
            },
            metadata: { 
              path: data.settings.metadata_doc_path || "", 
              prefix: data.settings.metadata_doc_prefix || "metadata" 
            },
            text: { 
              path: data.settings.text_doc_path || "", 
              prefix: data.settings.text_doc_prefix || "text" 
            },
            figures: { 
              path: data.settings.figures_doc_path || "", 
              prefix: data.settings.figures_doc_prefix || "figures" 
            },
            formulas: { 
              path: data.settings.formulas_doc_path || "", 
              prefix: data.settings.formulas_doc_prefix || "formulas" 
            },
            tables: { 
              path: data.settings.tables_doc_path || "", 
              prefix: data.settings.tables_doc_prefix || "table" 
            },
            hierarchy: { 
              path: data.settings.hierarchy_doc_path || "", 
              prefix: data.settings.hierarchy_doc_prefix || "hierarchy" 
            },
            shrinks: { 
              path: data.settings.shrinks_doc_path || "", 
              prefix: data.settings.shrinks_doc_prefix || "shrink" 
            }
          });

          // Load LLM & GraphRAG settings
          setLlmProvider(data.settings.llm_provider || "");
          setLlmName(data.settings.llm || "");
          setEmbeddingProvider(data.settings.embedding_provider || "");
          setEmbeddingModel(data.settings.embedding_model || "");
          setEmbeddingDimensions(data.settings.dimensions?.toString() || "");
          setSimilarityMetric(data.settings.similarity_metric || "");

          // Load graph properties
          setMetaLabels({
            lexicalGraph: data.settings.lexical_graph_meta_label || "",
            domainGraph: data.settings.domain_graph_meta_label || "",
            formulasGraph: data.settings.formulas_graph_meta_label || "",
            tablesGraph: data.settings.tables_graph_meta_label || "",
            figuresGraph: data.settings.figures_graph_meta_label || ""
          });

          if (data.settings.hierarchy_level) {
            try {
              setHierarchyLevels(JSON.parse(data.settings.hierarchy_level));
            } catch {
              setHierarchyLevels([]);
            }
          }

          // Load API settings
          setLlmGraphBuilderUrl(data.settings.llm_graph_builder_url || "");
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storagePaths,
          llmProvider,
          llmName,
          embeddingProvider,
          embeddingModel,
          embeddingDimensions,
          similarityMetric,
          metaLabels,
          hierarchyLevels,
          llmGraphBuilderUrl
        })
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Updated config tabs to include Manage Connections
  const configTabs = [
    { name: "Storage", icon: Folder },
    { name: "LLM & GraphRAG", icon: Cpu },
    { name: "Graph properties", icon: Network },
    { name: "APIs", icon: Server },
    { name: "Manage Connections", icon: Database }, // Added
  ];

  const themeClasses = getThemeClasses(true); // Get theme classes

  // Storage path handlers
  const handleStoragePathChange = (key: keyof typeof storagePaths, field: 'path' | 'prefix', value: string) => {
    setStoragePaths(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Meta labels handlers
  const handleMetaLabelChange = (key: keyof typeof metaLabels, value: string) => {
    setMetaLabels(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Hierarchy levels handlers
  const handleAddHierarchyLevel = () => {
    if (newHierarchyLevel.trim()) {
      setHierarchyLevels(prev => [...prev, newHierarchyLevel.trim()]);
      setNewHierarchyLevel("");
    }
  };

  const handleDeleteHierarchyLevel = (index: number) => {
    setHierarchyLevels(prev => prev.filter((_, i) => i !== index));
  };

  // Render Configurations content
  const renderConfigurations = () => {
    switch (activeConfigTab) {
      case "Storage":
        return (
          <Storage
            storagePaths={storagePaths}
            onStoragePathChange={handleStoragePathChange}
            onSave={handleSaveSettings}
          />
        );

      case "LLM & GraphRAG":
        return (
          <LLMGraphRAG
            llmProvider={llmProvider}
            llmName={llmName}
            embeddingProvider={embeddingProvider}
            embeddingModel={embeddingModel}
            embeddingDimensions={embeddingDimensions}
            similarityMetric={similarityMetric}
            onLlmProviderChange={setLlmProvider}
            onLlmNameChange={setLlmName}
            onEmbeddingProviderChange={setEmbeddingProvider}
            onEmbeddingModelChange={setEmbeddingModel}
            onEmbeddingDimensionsChange={setEmbeddingDimensions}
            onSimilarityMetricChange={setSimilarityMetric}
            onSave={handleSaveSettings}
          />
        );

      case "Graph properties":
        return (
          <GraphProperties
            metaLabels={metaLabels}
            hierarchyLevels={hierarchyLevels}
            newHierarchyLevel={newHierarchyLevel}
            onMetaLabelChange={handleMetaLabelChange}
            onHierarchyLevelsChange={setHierarchyLevels}
            onNewHierarchyLevelChange={setNewHierarchyLevel}
            onAddHierarchyLevel={handleAddHierarchyLevel}
            onDeleteHierarchyLevel={handleDeleteHierarchyLevel}
            onSave={handleSaveSettings}
          />
        );

      case "APIs":
        return (
          <APIs
            llmGraphBuilderUrl={llmGraphBuilderUrl}
            onLlmGraphBuilderUrlChange={setLlmGraphBuilderUrl}
            onSave={handleSaveSettings}
          />
        );

      case "Manage Connections":
        return <ManageConnections onSettingsSaved={loadSettings} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4fb3d9]"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border w-full max-w-5xl mx-auto ${themeClasses.card}`}>
      {/* Configurations Tabs */}
      <div className={`border-b ${themeClasses.border.default}`}>
        <div className="flex overflow-x-auto">
          {configTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveConfigTab(tab.name)}
                className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${themeClasses.tab(activeConfigTab === tab.name)}`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configurations Content */}
      <div className="p-6">
        {renderConfigurations()}
        
        {/* Save Button - Only show for settings tabs, not for Manage Connections */}
        {activeConfigTab !== "Manage Connections" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;