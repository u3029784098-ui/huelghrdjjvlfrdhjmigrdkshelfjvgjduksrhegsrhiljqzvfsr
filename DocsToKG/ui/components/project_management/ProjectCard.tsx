import React, { useEffect, useState } from "react";
import { 
  Star, 
  Folder, 
  FileText, 
  GitBranch, 
  MoreVertical,
  Calendar,
  Clock
} from "lucide-react";
import { useTheme } from "../themes";
import { Project } from "./ProjectManagement";

interface RunProgress {
  runId: number;
  isExecuted: boolean;
  tasks: {
    metadata: { enabled: boolean; progress: number };
    text: { enabled: boolean; progress: number };
    figures: { enabled: boolean; progress: number };
    tables: { enabled: boolean; progress: number };
    formulas: { enabled: boolean; progress: number };
  };
}

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onStar: () => void;
  compact?: boolean;
  isActive?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onStar,
  compact = false,
  isActive = false
}) => {
  const { themeClasses } = useTheme();
  const [runProgress, setRunProgress] = useState<RunProgress | null>(null);

  useEffect(() => {
    const fetchRunProgress = async () => {
      try {
        const res = await fetch(`/api/projects/${encodeURIComponent(project.name)}/run-progress`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            setRunProgress(data.progress);
          }
        }
      } catch (err) {
        console.error('Failed to fetch run progress:', err);
      }
    };

    // Fetch initially and set up polling if project is processing
    if (project.status === 'processing' || project.status === 'analyzing') {
      fetchRunProgress();
      const interval = setInterval(fetchRunProgress, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [project.name, project.status]);

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "analyzing":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-[#4fb3d9] hover:shadow-md ${themeClasses.bg.card} ${themeClasses.border.default}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                isActive ? "bg-green-500" : "bg-red-400"
              }`}
              aria-label={isActive ? "Active project" : "Inactive project"}
            ></span>
            <h3 className="font-semibold truncate">{project.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar();
              }}
              className="flex-shrink-0"
            >
              <Star 
                className={`h-4 w-4 ${project.isStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} 
              />
            </button>
          </div>
          {!compact && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Status and Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <span className="text-xs text-gray-500">
            {project.progress}%
          </span>
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

        {/* Extraction Progress Bars - Only show if tasks are running */}
        {runProgress && !runProgress.isExecuted && (
          <div className="mt-3 space-y-2">
            {runProgress.tasks.metadata.enabled && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Metadata</span>
                  <span className="text-xs text-gray-500">{Math.round(runProgress.tasks.metadata.progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${runProgress.tasks.metadata.progress}%` }}
                  />
                </div>
              </div>
            )}
            {runProgress.tasks.text.enabled && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Text</span>
                  <span className="text-xs text-gray-500">{Math.round(runProgress.tasks.text.progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${runProgress.tasks.text.progress}%` }}
                  />
                </div>
              </div>
            )}
            {runProgress.tasks.figures.enabled && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Figures</span>
                  <span className="text-xs text-gray-500">{Math.round(runProgress.tasks.figures.progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="h-full bg-purple-500 transition-all"
                    style={{ width: `${runProgress.tasks.figures.progress}%` }}
                  />
                </div>
              </div>
            )}
            {runProgress.tasks.tables.enabled && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Tables</span>
                  <span className="text-xs text-gray-500">{Math.round(runProgress.tasks.tables.progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${runProgress.tasks.tables.progress}%` }}
                  />
                </div>
              </div>
            )}
            {runProgress.tasks.formulas.enabled && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Formulas</span>
                  <span className="text-xs text-gray-500">{Math.round(runProgress.tasks.formulas.progress)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="h-full bg-pink-500 transition-all"
                    style={{ width: `${runProgress.tasks.formulas.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <FileText className="h-3 w-3" />
            <span>{project.documentCount}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <GitBranch className="h-3 w-3" />
            <span>{project.graphCount}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(project.updatedAt)}</span>
        </div>
      </div>

      {/* Folder and Tags */}
      {!compact && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {project.folder && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Folder className="h-3 w-3" />
              <span>{project.folder}</span>
            </div>
          )}
          
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-400">
                  +{project.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;