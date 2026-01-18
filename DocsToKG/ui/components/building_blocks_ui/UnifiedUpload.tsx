import React, { useState } from "react";
import { Upload, Trash2, AlertCircle } from "lucide-react";
import { useTheme } from "../themes";

export type UploadMode = "files" | "folder";

export interface UnifiedUploadResult {
  message: string;
  runId?: number;
  uploaded: Array<{ docId: string; name: string; size: number; type: string }>;
  skipped: Array<{ name: string; reason: string }>;
  projectName?: string;
}

interface UnifiedUploadProps {
  initialMode?: UploadMode;
  onComplete?: (result: UnifiedUploadResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

const UnifiedUpload: React.FC<UnifiedUploadProps> = ({
  initialMode = "files",
  onComplete,
  onError,
  onProgress,
  className,
}) => {
  const { themeClasses } = useTheme();
  const [uploadType, setUploadType] = useState<UploadMode>(initialMode);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  const validateFile = (file: File): boolean => {
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"];
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/svg+xml",
    ];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
    const hasValidMimeType = allowedMimeTypes.includes(file.type);

    return hasValidExtension && (hasValidMimeType || file.type === "");
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(validateFile);
      const invalidFiles = fileArray.filter((f) => !validateFile(f));

      if (invalidFiles.length > 0) {
        setUploadError(
          `${invalidFiles.length} invalid file(s) detected. Only PDF and image files (.pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp, .svg) are allowed.\nInvalid files: ${invalidFiles
            .slice(0, 5)
            .map((f) => f.name)
            .join(", ")}${invalidFiles.length > 5 ? "..." : ""}`
        );
        if (validFiles.length === 0) return;
      }

      setUploadError("");
      setSelectedFiles(validFiles);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(validateFile);
      const invalidFiles = fileArray.filter((f) => !validateFile(f));

      if (validFiles.length === 0) {
        setUploadError(
          `No valid files found in the selected folder. Only PDF and image files (.pdf, .jpg, .jpeg, .png, .gif, .bmp, .webp, .svg) are allowed.`
        );
        setSelectedFolder(null);
        return;
      }

      if (invalidFiles.length > 0) {
        setUploadError(
          `${invalidFiles.length} invalid file(s) will be skipped. Only PDF and image files are allowed.\nValid files found: ${validFiles.length}`
        );
      } else {
        setUploadError("");
      }

      const dataTransfer = new DataTransfer();
      validFiles.forEach((file) => dataTransfer.items.add(file));
      setSelectedFolder(dataTransfer.files);
    }
  };

  const uploadFiles = async () => {
    if ((uploadType === "files" && selectedFiles.length === 0) || (uploadType === "folder" && !selectedFolder)) {
      alert(`Please select ${uploadType === "files" ? "files" : "a folder"} to upload.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError("");

    try {
      const formData = new FormData();
      const filesToUpload = uploadType === "files" ? selectedFiles : Array.from(selectedFolder || []);

      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev >= 90 ? 90 : prev + 10;
          onProgress?.(next);
          return next;
        });
      }, 200);

      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      onProgress?.(100);

      const data = (await response.json()) as UnifiedUploadResult;

      if (response.ok) {
        let message = data.message;
        if (data.skipped && data.skipped.length > 0) {
          message += `\n\nSkipped ${data.skipped.length} file(s):\n${data.skipped
            .map((s: any) => `- ${s.name}: ${s.reason}`)
            .join("\n")}`;
        }
        onComplete?.(data);
        alert(message);

        setSelectedFiles([]);
        setSelectedFolder(null);
        setUploadProgress(0);
      } else {
        const msg = data?.message || "Upload failed";
        setUploadError(msg);
        onError?.(msg);
        alert(msg);
      }
    } catch (err: any) {
      console.error("UnifiedUpload error:", err);
      const msg = "Failed to upload files. Please try again.";
      setUploadError(msg);
      onError?.(msg);
      alert(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFolderSelection = () => {
    setSelectedFolder(null);
  };

  const FileIcon = ({ fileName }: { fileName: string }) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const iconColors = themeClasses.bg.card.replace("bg-", "text-").replace("border-", "bg-");
    return (
      <div className={`w-8 h-8 rounded flex items-center justify-center ${iconColors}`}>
        <span className="text-xs font-medium">
          {ext === "pdf" ? "PDF" : ext === "doc" || ext === "docx" ? "DOC" : ext === "txt" ? "TXT" : "FILE"}
        </span>
      </div>
    );
  };

  return (
    <div className={`rounded-lg border w-full ${className || "max-w-3xl mx-auto"} ${themeClasses.card}`}>
      <div className="p-6">
        <h2 className={`text-lg font-semibold mb-6 ${themeClasses.text.primary}`}>Upload Files or Folder</h2>

        {uploadError && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{uploadError}</p>
          </div>
        )}

        <div className="mb-8">
          <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>Select upload type</label>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="files"
                name="uploadType"
                checked={uploadType === "files"}
                onChange={() => setUploadType("files")}
                className={`w-4 h-4 ${themeClasses.radio}`}
              />
              <label htmlFor="files" className={`text-sm ${themeClasses.text.secondary}`}>Files</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="folder"
                name="uploadType"
                checked={uploadType === "folder"}
                onChange={() => setUploadType("folder")}
                className={`w-4 h-4 ${themeClasses.radio}`}
              />
              <label htmlFor="folder" className={`text-sm ${themeClasses.text.secondary}`}>Folder</label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {uploadType === "files" ? (
            <div>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>Select Files</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${themeClasses.fileUpload}`}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                  onChange={handleFilesChange}
                  className="hidden"
                  id="files-upload"
                />
                <label htmlFor="files-upload" className="cursor-pointer">
                  <div className={`text-sm ${themeClasses.text.muted}`}>
                    <p className="mb-2">Click to select files or drag and drop</p>
                    <p className="text-xs">Supported formats: PDF, JPG, PNG, GIF, BMP, WEBP, SVG</p>
                  </div>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className={`text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>Selected Files ({selectedFiles.length})</h3>
                  <div className={`max-h-40 overflow-y-auto rounded border ${themeClasses.input}`}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 border-b last:border-b-0 ${themeClasses.border.default}`}>
                        <div className="flex items-center gap-3">
                          <FileIcon fileName={file.name} />
                          <div>
                            <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>{file.name}</p>
                            <p className={`text-xs ${themeClasses.text.muted}`}>{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(index)} className={`p-1 rounded transition-colors ${themeClasses.button.danger.replace('bg-', 'text-').replace('hover:bg-', 'hover:bg-')}`}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>Select Folder</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${themeClasses.fileUpload}`}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,image/*,application/pdf"
                  // @ts-ignore - webkitdirectory is not typed
                  webkitdirectory="true"
                  onChange={handleFolderChange}
                  className="hidden"
                  id="folder-upload"
                />
                <label htmlFor="folder-upload" className="cursor-pointer">
                  <div className={`text-sm ${themeClasses.text.muted}`}>
                    <p className="mb-2">Click to select a folder</p>
                    <p className="text-xs">Only PDF and image files from the folder will be uploaded</p>
                    <p className="text-xs mt-1 text-yellow-500">Select the folder and click "Open" to import its files</p>
                  </div>
                </label>
              </div>

              {selectedFolder && selectedFolder.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium ${themeClasses.text.secondary}`}>Selected Folder ({selectedFolder.length} valid file(s))</h3>
                    <button onClick={clearFolderSelection} className={`text-xs px-2 py-1 rounded transition-colors ${themeClasses.button.danger.replace('bg-', 'text-').replace('hover:bg-', 'hover:bg-')}`}>Clear</button>
                  </div>
                  <div className={`max-h-40 overflow-y-auto rounded border ${themeClasses.input}`}>
                    {Array.from(selectedFolder).slice(0, 10).map((file, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 border-b last:border-b-0 ${themeClasses.border.default}`}>
                        <div className="flex items-center gap-2">
                          <FileIcon fileName={file.name} />
                          <div>
                            <p className={`text-xs font-medium ${themeClasses.text.secondary}`}>{file.name}</p>
                            <p className={`text-xs ${themeClasses.text.muted}`}>{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedFolder.length > 10 && (
                      <div className={`p-2 text-center text-xs ${themeClasses.text.muted}`}>... and {selectedFolder.length - 10} more file(s)</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isUploading && (
            <div className="mt-6">
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>Uploading...</span>
                <span className={`text-sm font-medium ${themeClasses.text.secondary}`}>{Math.round(uploadProgress)}%</span>
              </div>
              <div className={`w-full h-2 rounded-full overflow-hidden ${themeClasses.slider}`}>
                <div className="h-full bg-[#4fb3d9] transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className={`text-xs mt-1 ${themeClasses.text.muted}`}>
                {uploadType === "files" ? `Uploading ${selectedFiles.length} file(s)...` : `Uploading folder contents...`}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={uploadFiles}
              disabled={
                isUploading ||
                (uploadType === "files" && selectedFiles.length === 0) ||
                (uploadType === "folder" && !selectedFolder)
              }
              className={`px-6 py-3 rounded font-medium transition-colors flex items-center gap-2 ${
                isUploading ||
                (uploadType === "files" && selectedFiles.length === 0) ||
                (uploadType === "folder" && !selectedFolder)
                  ? themeClasses.button.secondary + " cursor-not-allowed"
                  : themeClasses.button.primary
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {uploadType === "files" ? "Files" : "Folder"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedUpload;
