import React from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useTheme } from "../themes";

interface GraphPropertiesProps {
  metaLabels: {
    lexicalGraph: string;
    domainGraph: string;
    formulasGraph: string;
    tablesGraph: string;
    figuresGraph: string;
  };
  hierarchyLevels: string[];
  newHierarchyLevel: string;
  onMetaLabelChange: (key: keyof GraphPropertiesProps['metaLabels'], value: string) => void;
  onHierarchyLevelsChange: (levels: string[]) => void;
  onNewHierarchyLevelChange: (value: string) => void;
  onAddHierarchyLevel: () => void;
  onDeleteHierarchyLevel: (index: number) => void;
  onSave: () => void;
}

const GraphProperties: React.FC<GraphPropertiesProps> = ({
  metaLabels,
  hierarchyLevels,
  newHierarchyLevel,
  onMetaLabelChange,
  onHierarchyLevelsChange,
  onNewHierarchyLevelChange,
  onAddHierarchyLevel,
  onDeleteHierarchyLevel,
  onSave
}) => {
  const { themeClasses } = useTheme();

  const handleSave = () => {
    onSave();
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Meta labels */}
        <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
            Meta labels
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Lexical graph
              </label>
              <input
                type="text"
                value={metaLabels.lexicalGraph}
                onChange={(e) => onMetaLabelChange('lexicalGraph', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Domain graph
              </label>
              <input
                type="text"
                value={metaLabels.domainGraph}
                onChange={(e) => onMetaLabelChange('domainGraph', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Formulas graph
              </label>
              <input
                type="text"
                value={metaLabels.formulasGraph}
                onChange={(e) => onMetaLabelChange('formulasGraph', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Tables graph
              </label>
              <input
                type="text"
                value={metaLabels.tablesGraph}
                onChange={(e) => onMetaLabelChange('tablesGraph', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Figures graph
              </label>
              <input
                type="text"
                value={metaLabels.figuresGraph}
                onChange={(e) => onMetaLabelChange('figuresGraph', e.target.value)}
                className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
              />
            </div>
          </div>
        </div>

        {/* Lexical graph - Hierarchy levels */}
        <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
            Lexical graph
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                Hierarchy level
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHierarchyLevel}
                  onChange={(e) => onNewHierarchyLevelChange(e.target.value)}
                  placeholder="e.g., Chapter"
                  className={`flex-1 px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
                <button
                  onClick={onAddHierarchyLevel}
                  className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${themeClasses.button.primary}`}
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Display hierarchy levels */}
            <div className="space-y-2">
              {hierarchyLevels.map((level, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded ${themeClasses.bg.hover}`}
                >
                  <span className={`text-sm ${themeClasses.text.secondary}`}>
                    Level {index}: {level}
                  </span>
                  <button
                    onClick={() => onDeleteHierarchyLevel(index)}
                    className={`p-1 rounded transition-colors ${
                      themeClasses.button.danger.replace('bg-', 'text-').replace('hover:bg-', 'hover:bg-')
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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

export default GraphProperties;