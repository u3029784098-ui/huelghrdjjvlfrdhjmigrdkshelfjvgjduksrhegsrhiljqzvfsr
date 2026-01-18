"use client";
import React, { useState } from "react";
import { 
  ChevronLeft, 
  Star, 
  Edit, 
  Trash2, 
  Download, 
  Play, 
  Folder, 
  FileText, 
  GitBranch, 
  Calendar, 
  Clock,
  Tag,
  Settings,
  BarChart3,
  Eye,
  Share2,
  Copy,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../themes";
import { Project } from "./ProjectManagement";
import { Database } from "lucide-react";
import RunsTable from "./RunsTable";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project, originalName?: string) => void;
  onDeleteProject: (projectId: string) => void;
  onExportProject: (projectId: string, format: "csv" | "sql") => void;
  onResumeProject: (projectId: string) => void;
  onStarProject: (projectId: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onUpdateProject,
  onDeleteProject,
  onExportProject,
  onResumeProject,
  onStarProject
}) => {
  const { themeClasses } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({ ...project });

  const handleSave = () => {
    onUpdateProject(editedProject, project.name);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      onDeleteProject(project.id);
    }
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "analyzing":
        return "text-purple-600 bg-purple-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const actions = [
    {
      label: project.status === "completed" ? "View Results" : "Resume",
      icon: project.status === "completed" ? Eye : Play,
      onClick: () => {
        if (project.status !== "completed") {
          onResumeProject(project.id);
        } else {
          alert("Opening project results...");
        }
      },
      variant: "primary" as const
    },
    {
      label: "Export Data",
      icon: Download,
      onClick: () => {
        const format = confirm("Export as CSV? (Cancel for SQL)") ? "csv" : "sql";
        onExportProject(project.id, format);
      },
      variant: "secondary" as const
    },
    {
      label: "Duplicate",
      icon: Copy,
      onClick: () => {
        const newProject = {
          ...project,
          userId: project.userId,
          id: Date.now().toString(),
          name: `${project.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          isStarred: false
        };
        onUpdateProject(newProject);
        alert("Project duplicated successfully!");
      },
      variant: "secondary" as const
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      variant: "danger" as const
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold">Project Details</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStarProject(project.id)}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <Star className={`h-4 w-4 ${project.isStarred ? "text-yellow-500 fill-yellow-500" : ""}`} />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => alert("Share project dialog")}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Left Column - Project Info */}
        <div className="space-y-6">
          {/* Project Header */}
          <div className={`p-6 rounded-lg border ${themeClasses.border.default}`}>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    value={editedProject.name}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg ${themeClasses.input}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={editedProject.description}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg ${themeClasses.input}`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className={`px-4 py-2 rounded-lg ${themeClasses.button.primary}`}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProject({ ...project });
                    }}
                    className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                
                {project.status === "error" && (
                  <div className={`p-3 rounded-lg bg-red-50 border border-red-200 mb-4`}>
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Processing Error</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Document extraction failed at step 3. Click Resume to retry.
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${themeClasses.bg.hover}`}>
                    <div 
                      className={`h-full transition-all ${
                        project.status === "completed" ? "bg-green-500" :
                        project.status === "error" ? "bg-red-500" :
                        project.status === "analyzing" ? "bg-purple-500" :
                        "bg-blue-500"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className={`p-6 rounded-lg border ${themeClasses.border.default}`}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-2 ${
                      action.variant === "primary" ? themeClasses.button.primary :
                      action.variant === "danger" ? themeClasses.button.danger :
                      themeClasses.button.secondary
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${themeClasses.border.default} text-center`}>
              <FileText className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{project.documentCount}</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
            <div className={`p-4 rounded-lg border ${themeClasses.border.default} text-center`}>
              <GitBranch className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{project.graphCount}</p>
              <p className="text-sm text-gray-500">Graphs</p>
            </div>
            <div className={`p-4 rounded-lg border ${themeClasses.border.default} text-center`}>
              <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
            <div className={`p-4 rounded-lg border ${themeClasses.border.default} text-center`}>
              <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium">{formatDate(project.updatedAt)}</p>
              <p className="text-xs text-gray-500">Last Updated</p>
            </div>
          </div>

          {/* Runs Table */}
          <div className={`p-6 rounded-lg border ${themeClasses.border.default}`}>
            <h3 className="font-semibold mb-4">Extraction Runs</h3>
            <RunsTable projectName={project.name} />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Project Metadata */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.default}`}>
            <h3 className="font-semibold mb-3">Project Details</h3>
            <div className="space-y-3">
              {project.folder && (
                <div className="flex items-center gap-2 text-sm">
                  <Folder className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Folder:</span>
                  <span className="font-medium">{project.folder}</span>
                </div>
              )}
              
              <div className="flex items-start gap-2 text-sm">
                <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                <div>
                  <span className="text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length === 0 && (
                      <span className="text-gray-400">No tags</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.default}`}>
            <h3 className="font-semibold mb-3">Export Options</h3>
            <div className="space-y-2">
              <button
                onClick={() => onExportProject(project.id, "csv")}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${themeClasses.button.secondary}`}
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export as CSV</span>
                </div>
                <span className="text-xs text-gray-500">Tables</span>
              </button>
              <button
                onClick={() => onExportProject(project.id, "sql")}
                className={`w-full flex items-center justify-between p-3 rounded-lg ${themeClasses.button.secondary}`}
              >
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>Export as SQL</span>
                </div>
                <span className="text-xs text-gray-500">Database</span>
              </button>
            </div>
          </div>

          {/* Advanced Actions */}
          <div className={`p-4 rounded-lg border ${themeClasses.border.default}`}>
            <h3 className="font-semibold mb-3">Advanced</h3>
            <div className="space-y-2">
              <button
                onClick={() => alert("Opening settings...")}
                className={`w-full flex items-center gap-2 p-3 rounded-lg ${themeClasses.button.secondary}`}
              >
                <Settings className="h-4 w-4" />
                <span>Project Settings</span>
              </button>
              <button
                onClick={() => alert("Opening analytics...")}
                className={`w-full flex items-center gap-2 p-3 rounded-lg ${themeClasses.button.secondary}`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;