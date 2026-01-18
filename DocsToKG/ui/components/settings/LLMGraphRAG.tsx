import React from "react";
import { Save } from "lucide-react";
import { useTheme } from "../themes";

interface LLMGraphRAGProps {
  llmProvider: string;
  llmName: string;
  embeddingProvider: string;
  embeddingModel: string;
  embeddingDimensions: string;
  similarityMetric: string;
  onLlmProviderChange: (value: string) => void;
  onLlmNameChange: (value: string) => void;
  onEmbeddingProviderChange: (value: string) => void;
  onEmbeddingModelChange: (value: string) => void;
  onEmbeddingDimensionsChange: (value: string) => void;
  onSimilarityMetricChange: (value: string) => void;
  onSave: () => void;
}

const LLMGraphRAG: React.FC<LLMGraphRAGProps> = ({
  llmProvider,
  llmName,
  embeddingProvider,
  embeddingModel,
  embeddingDimensions,
  similarityMetric,
  onLlmProviderChange,
  onLlmNameChange,
  onEmbeddingProviderChange,
  onEmbeddingModelChange,
  onEmbeddingDimensionsChange,
  onSimilarityMetricChange,
  onSave
}) => {
  const { themeClasses } = useTheme();

  const handleSave = () => {
    onSave();
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Model settings */}
        <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
            Model settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                LLM provider
              </label>
              <input
                type="text"
                value={llmProvider}
                onChange={(e) => onLlmProviderChange(e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                LLM
              </label>
              <input
                type="text"
                value={llmName}
                onChange={(e) => onLlmNameChange(e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
          </div>
        </div>

        {/* Embedding settings */}
        <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
            Embedding settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Embedding provider
              </label>
              <input
                type="text"
                value={embeddingProvider}
                onChange={(e) => onEmbeddingProviderChange(e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Embedding model
              </label>
              <input
                type="text"
                value={embeddingModel}
                onChange={(e) => onEmbeddingModelChange(e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Embedding dimensions
              </label>
              <input
                type="text"
                value={embeddingDimensions}
                onChange={(e) => onEmbeddingDimensionsChange(e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Similarity metric
              </label>
              <input
                type="text"
                value={similarityMetric}
                onChange={(e) => onSimilarityMetricChange(e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          className={`px-6 py-3 rounded font-medium transition-colors flex items-center gap-2 ${themeClasses.button.primary}`}
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>
    </div>
  );
};

export default LLMGraphRAG;