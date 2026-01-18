"use client";
import React, { useState } from "react";
import { 
  ChevronLeft, 
  FolderPlus, 
  Upload, 
  Database, 
  Settings,
  Check,
  FileText,
  Folder,
  Copy
} from "lucide-react";
import { useTheme } from "../themes";
import { Project } from "./ProjectManagement";
import UnifiedUpload, { UnifiedUploadResult } from "../building_blocks_ui/UnifiedUpload";

interface NewProjectWizardProps {
  onBack: () => void;
  onCreateProject: (projectData: { 
    name: string; 
    description: string;
    tags: string[];
    initializationType: "files" | "folder" | "existing";
    selectedFiles?: File[];
    selectedFolder?: FileList | null;
    selectedProjects?: string[];
  }) => void;
  existingProjects: Project[];
}

const NewProjectWizard: React.FC<NewProjectWizardProps> = ({
  onBack,
  onCreateProject,
  existingProjects
}) => {
  const { themeClasses } = useTheme();
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    initializationType: "files" as "files" | "folder" | "existing",
    selectedFiles: [] as File[],
    selectedFolder: null as FileList | null,
    selectedProjects: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      onCreateProject(projectData);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: FolderPlus },
    { number: 2, title: "Initialize Project", icon: Database },
    { number: 3, title: "Configuration", icon: Settings },
  ];

  const handleUploadComplete = (result: UnifiedUploadResult) => {
    // Optionally store a summary in projectData for later steps
    // Here we simply log; project creation can proceed after files are uploaded
    console.log("NewProjectWizard upload complete:", result);
  };

  const handleUploadError = (msg: string) => {
    console.error("NewProjectWizard upload error:", msg);
  };

  const handleProjectSelection = (projectId: string) => {
    setProjectData(prev => {
      const isSelected = prev.selectedProjects.includes(projectId);
      return {
        ...prev,
        selectedProjects: isSelected
          ? prev.selectedProjects.filter(id => id !== projectId)
          : [...prev.selectedProjects, projectId]
      };
    });
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (trimmedTag && !projectData.tags.includes(trimmedTag)) {
      setProjectData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProjectData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const StepIcon = steps[step - 1].icon;

  const FileIcon = ({ fileName }: { fileName: string }) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    return (
      <div className={`w-8 h-8 rounded flex items-center justify-center ${themeClasses.bg.card}`}>
        <span className="text-xs font-medium">
          {ext === 'pdf' ? 'PDF' : 
           ext === 'doc' || ext === 'docx' ? 'DOC' : 
           ext === 'txt' ? 'TXT' : 
           'FILE'}
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-[#4fb3d9]" />
            Create New Project
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          Step {step} of 3
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2"></div>
          {steps.map((stepItem, index) => {
            const Icon = stepItem.icon;
            const isCompleted = step > stepItem.number;
            const isCurrent = step === stepItem.number;
            
            return (
              <div key={stepItem.number} className="relative z-10 flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isCurrent ? 'bg-[#4fb3d9] text-white' : 
                    isCompleted ? 'bg-green-100 text-green-600' : 
                    'bg-gray-100 text-gray-400'}
                `}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-sm ${isCurrent ? 'font-medium' : 'text-gray-500'}`}>
                  {stepItem.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={`p-6 rounded-lg border ${themeClasses.border.default}`}>
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                placeholder="e.g., Medical Research Papers Analysis"
                className={`w-full px-3 py-2 rounded-lg ${themeClasses.input}`}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                placeholder="Describe what this project is about..."
                rows={4}
                className={`w-full px-3 py-2 rounded-lg ${themeClasses.input}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add a tag..."
                  className={`flex-1 px-3 py-2 rounded-lg ${themeClasses.input}`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className={`px-4 py-2 rounded-lg ${themeClasses.button.primary}`}
                >
                  Add
                </button>
              </div>
              {projectData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {projectData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${themeClasses.bg.active} ${themeClasses.text.primary}`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Initialize Project</h3>
              <p className="text-gray-500 mb-6">
                Choose how you want to initialize your project
              </p>
            </div>

            {/* Initialization Type Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">
                Initialization Method
              </label>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Upload Files */}
                <button
                  type="button"
                  onClick={() => setProjectData({ ...projectData, initializationType: "files" })}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    projectData.initializationType === "files"
                      ? `${themeClasses.border.accent} ${themeClasses.bg.active}`
                      : themeClasses.border.default
                  }`}
                >
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium">Upload Files</span>
                  <p className="text-xs text-gray-500 mt-1">Upload individual files</p>
                </button>

                {/* Upload Folder */}
                <button
                  type="button"
                  onClick={() => setProjectData({ ...projectData, initializationType: "folder" })}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    projectData.initializationType === "folder"
                      ? `${themeClasses.border.accent} ${themeClasses.bg.active}`
                      : themeClasses.border.default
                  }`}
                >
                  <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium">Upload Folder</span>
                  <p className="text-xs text-gray-500 mt-1">Upload entire folder</p>
                </button>

                {/* From Existing Projects */}
                <button
                  type="button"
                  onClick={() => setProjectData({ ...projectData, initializationType: "existing" })}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    projectData.initializationType === "existing"
                      ? `${themeClasses.border.accent} ${themeClasses.bg.active}`
                      : themeClasses.border.default
                  }`}
                >
                  <Copy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm font-medium">From Existing</span>
                  <p className="text-xs text-gray-500 mt-1">Use existing projects</p>
                </button>
              </div>
            </div>

            {/* Initialization Content based on selection */}
            <div className="mt-6">
              {/* Files Upload via Unified Component */}
              {projectData.initializationType === "files" && (
                <UnifiedUpload initialMode="files" onComplete={handleUploadComplete} onError={handleUploadError} />
              )}

              {/* Folder Upload via Unified Component */}
              {projectData.initializationType === "folder" && (
                <UnifiedUpload initialMode="folder" onComplete={handleUploadComplete} onError={handleUploadError} />
              )}

              {/* Existing Projects */}
              {projectData.initializationType === "existing" && (
                <div>
                  <label className={`block text-sm font-medium mb-3 ${themeClasses.text.secondary}`}>
                    Select Existing Projects
                  </label>
                  <div className={`p-4 rounded border ${themeClasses.input}`}>
                    {existingProjects.length === 0 ? (
                      <p className={`text-sm text-center ${themeClasses.text.muted}`}>
                        No existing projects found
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {existingProjects.map((project) => (
                          <div
                            key={project.id}
                            className={`flex items-center justify-between p-3 rounded cursor-pointer ${
                              projectData.selectedProjects.includes(project.id)
                                ? themeClasses.bg.active
                                : themeClasses.bg.hover
                            }`}
                            onClick={() => handleProjectSelection(project.id)}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  projectData.selectedProjects.includes(project.id)
                                    ? themeClasses.button.primary.replace('bg-', 'border-').replace('hover:bg-', '')
                                    : themeClasses.border.default
                                }`}
                              >
                                {projectData.selectedProjects.includes(project.id) && (
                                  <Check className={`w-3 h-3 ${themeClasses.text.primary}`} />
                                )}
                              </button>
                              <div>
                                <p className={`text-sm font-medium ${themeClasses.text.secondary}`}>
                                  {project.name}
                                </p>
                                <p className={`text-xs ${themeClasses.text.muted}`}>
                                  {project.documentCount} documents • Created {project.createdAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {projectData.selectedProjects.length > 0 && (
                    <p className={`text-sm mt-2 ${themeClasses.text.muted}`}>
                      Selected {projectData.selectedProjects.length} project(s)
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Project Configuration</h3>
              <p className="text-gray-500 mb-6">
                Review your project settings before creation.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
              <h4 className="font-medium mb-4">Project Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Name:</span>
                  <span className="font-medium">{projectData.name || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-right">{projectData.description || "No description"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Initialization Method:</span>
                  <span className="font-medium">
                    {projectData.initializationType === "files" && "Upload Files"}
                    {projectData.initializationType === "folder" && "Upload Folder"}
                    {projectData.initializationType === "existing" && "From Existing Projects"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content:</span>
                  <span className="font-medium">
                    {projectData.initializationType === "files" && `${projectData.selectedFiles.length} files selected`}
                    {projectData.initializationType === "folder" && 
                      `${projectData.selectedFolder ? projectData.selectedFolder.length : 0} files from folder`}
                    {projectData.initializationType === "existing" && 
                      `${projectData.selectedProjects.length} project(s) selected`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Mode:</span>
                  <span className="font-medium">Standard</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Database className="h-4 w-4" />
              <span>Default settings will be applied. You can customize them later.</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className={`px-6 py-2 rounded-lg ${themeClasses.button.secondary}`}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className={`px-6 py-2 rounded-lg ${themeClasses.button.primary}`}
          >
            {step === 3 ? "Create Project" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectWizard;