import React from "react";
import { Save } from "lucide-react";
import { useTheme } from "../themes";

interface APIsProps {
  llmGraphBuilderUrl: string;
  onLlmGraphBuilderUrlChange: (value: string) => void;
  onSave: () => void;
}

const APIs: React.FC<APIsProps> = ({
  llmGraphBuilderUrl,
  onLlmGraphBuilderUrlChange,
  onSave
}) => {
  const { themeClasses } = useTheme();

  const handleSave = () => {
    onSave();
  };

  return (
    <div>
      <div className="space-y-6">
        {/* LLM Graph Builder */}
        <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
            LLM Graph Builder
          </h3>
          <div>
            <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
              URL (protocol://name)
            </label>
            <input
              type="text"
              value={llmGraphBuilderUrl}
              onChange={(e) => onLlmGraphBuilderUrlChange(e.target.value)}
              placeholder="protocol://name"
              className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
            />
            <p className={`text-xs mt-1 ${themeClasses.text.muted}`}>
              Format: protocol://url (e.g., http://localhost:8000, https://api.example.com)
            </p>
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

export default APIs;