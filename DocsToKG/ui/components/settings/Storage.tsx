import React from "react";
import { Save } from "lucide-react";
import { useTheme } from "../themes";

interface StorageProps {
  storagePaths: {
    rawDocuments: { path: string; prefix: string };
    metadata: { path: string; prefix: string };
    text: { path: string; prefix: string };
    figures: { path: string; prefix: string };
    formulas: { path: string; prefix: string };
    tables: { path: string; prefix: string };
    hierarchy: { path: string; prefix: string };
    shrinks: { path: string; prefix: string };
  };
  onStoragePathChange: (key: keyof StorageProps['storagePaths'], field: 'path' | 'prefix', value: string) => void;
  onSave: () => void;
}

const Storage: React.FC<StorageProps> = ({ storagePaths, onStoragePathChange, onSave }) => {
  const { themeClasses } = useTheme();

  const handleSave = () => {
    onSave();
  };

  return (
    <div>
      <div className="space-y-6">
        <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
          <h3 className={`text-sm font-semibold mb-4 ${themeClasses.text.secondary}`}>
            Local results
          </h3>
          <div className="space-y-4">
            {/* Raw documents */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Raw documents path
                </label>
                <input
                  type="text"
                  value={storagePaths.rawDocuments.path}
                  onChange={(e) => onStoragePathChange('rawDocuments', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.rawDocuments.prefix}
                  onChange={(e) => onStoragePathChange('rawDocuments', 'prefix', e.target.value)}
                  placeholder="raw"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Metadata path
                </label>
                <input
                  type="text"
                  value={storagePaths.metadata.path}
                  onChange={(e) => onStoragePathChange('metadata', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.metadata.prefix}
                  onChange={(e) => onStoragePathChange('metadata', 'prefix', e.target.value)}
                  placeholder="metadata"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Text */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Text path
                </label>
                <input
                  type="text"
                  value={storagePaths.text.path}
                  onChange={(e) => onStoragePathChange('text', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.text.prefix}
                  onChange={(e) => onStoragePathChange('text', 'prefix', e.target.value)}
                  placeholder="text"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Figures */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Figures path
                </label>
                <input
                  type="text"
                  value={storagePaths.figures.path}
                  onChange={(e) => onStoragePathChange('figures', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.figures.prefix}
                  onChange={(e) => onStoragePathChange('figures', 'prefix', e.target.value)}
                  placeholder="figures"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Formulas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Formulas path
                </label>
                <input
                  type="text"
                  value={storagePaths.formulas.path}
                  onChange={(e) => onStoragePathChange('formulas', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.formulas.prefix}
                  onChange={(e) => onStoragePathChange('formulas', 'prefix', e.target.value)}
                  placeholder="formulas"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Tables path
                </label>
                <input
                  type="text"
                  value={storagePaths.tables.path}
                  onChange={(e) => onStoragePathChange('tables', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.tables.prefix}
                  onChange={(e) => onStoragePathChange('tables', 'prefix', e.target.value)}
                  placeholder="table"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Hierarchy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Hierarchy path
                </label>
                <input
                  type="text"
                  value={storagePaths.hierarchy.path}
                  onChange={(e) => onStoragePathChange('hierarchy', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.hierarchy.prefix}
                  onChange={(e) => onStoragePathChange('hierarchy', 'prefix', e.target.value)}
                  placeholder="hierarchy"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
            </div>

            {/* Shrinks */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  Shrinks path
                </label>
                <input
                  type="text"
                  value={storagePaths.shrinks.path}
                  onChange={(e) => onStoragePathChange('shrinks', 'path', e.target.value)}
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
                  File prefix
                </label>
                <input
                  type="text"
                  value={storagePaths.shrinks.prefix}
                  onChange={(e) => onStoragePathChange('shrinks', 'prefix', e.target.value)}
                  placeholder="shrink"
                  className={`w-full px-3 py-2 rounded border outline-none transition-colors ${themeClasses.input}`}
                />
              </div>
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

export default Storage;