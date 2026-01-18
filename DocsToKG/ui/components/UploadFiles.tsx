import React from "react";
import UnifiedUpload, { UnifiedUploadResult } from "./building_blocks_ui/UnifiedUpload";
import { useTheme } from "./themes";

const UploadFiles: React.FC = () => {
  const { themeClasses } = useTheme();

  const handleComplete = (result: UnifiedUploadResult) => {
    // Additional side effects for this page can be handled here if needed
    // For now, UnifiedUpload already alerts the success message.
    // Example: refresh a documents list view when available.
  };

  const handleError = (message: string) => {
    // Optional page-level error handling; UnifiedUpload already alerts.
    console.error("UploadFiles error:", message);
  };

  const handleProgress = (p: number) => {
    // Optional: could display page-level progress, but UnifiedUpload already shows it.
  };

  return (
    <div className={`rounded-lg border w-full max-w-3xl mx-auto ${themeClasses.card}`}>
      <div className="p-6">
        <h2 className={`text-lg font-semibold mb-6 ${themeClasses.text.primary}`}>
          Upload Files or Folder
        </h2>
        
        {/* Unified Upload Component */}
        <UnifiedUpload
          initialMode="files"
          onComplete={handleComplete}
          onError={handleError}
          onProgress={handleProgress}
        />
      </div>
    </div>
  );
};

export default UploadFiles;