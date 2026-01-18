import React from "react";
import { 
  FolderKanban, 
  Plus, 
  Eye, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  TrendingUp
} from "lucide-react";
import { useTheme } from "../themes";
import { Project, ProjectStats } from "./ProjectManagement";
import ProjectCard from "./ProjectCard";

interface ProjectDashboardProps {
  projects: Project[];
  activeCount?: number;
  activeProjectId: string | null;
  onViewAll: () => void;
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
  onStarProject: (projectId: string) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  activeCount,
  activeProjectId,
  onViewAll,
  onNewProject,
  onSelectProject,
  onStarProject
}) => {
  const { themeClasses } = useTheme();

  // Calculate stats
  const stats: ProjectStats = {
    total: projects.length,
    active: typeof activeCount === "number" ? activeCount : projects.filter(p => p.isActive).length,
    completed: projects.filter(p => p.status === "completed").length,
    error: projects.filter(p => p.status === "error").length,
  };

  // Get recent projects (last 3)
  const recentProjects = [...projects]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  // Get starred projects
  const starredProjects = projects.filter(p => p.isStarred);

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "processing":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "analyzing":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-[#4fb3d9]" />
            Projects
          </h1>
          <p className="text-gray-500 mt-1">Manage and monitor your document processing projects</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onViewAll}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${themeClasses.button.secondary}`}
          >
            <Eye className="h-4 w-4" />
            View All Projects
          </button>
          <button
            onClick={onNewProject}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${themeClasses.button.primary}`}
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.default}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <FolderKanban className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.default}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold mt-1">{stats.active}</p>
            </div>
            <PlayCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.default}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold mt-1">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.default}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Errors</p>
              <p className="text-2xl font-bold mt-1">{stats.error}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Projects
          </h2>
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={activeProjectId === project.id}
              onSelect={() => onSelectProject(project)}
              onStar={() => onStarProject(project.id)}
              compact={true}
            />
          ))}
        </div>
      </div>

      {/* Starred Projects */}
      {starredProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Starred Projects
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={activeProjectId === project.id}
                onSelect={() => onSelectProject(project)}
                onStar={() => onStarProject(project.id)}
                compact={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;