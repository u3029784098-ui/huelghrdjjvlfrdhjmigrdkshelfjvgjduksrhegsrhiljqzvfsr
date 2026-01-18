import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ChevronLeft,
  Plus,
  Star,
  Folder,
  Calendar,
  ArrowUpDown
} from "lucide-react";
import { useTheme } from "../themes";
import { Project } from "./ProjectManagement";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onBack: () => void;
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
  onStarProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onExportProject: (projectId: string, format: "csv" | "sql") => void;
  onResumeProject: (projectId: string) => void;
  activeProjectId: string | null;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onBack,
  onNewProject,
  onSelectProject,
  onStarProject,
  onDeleteProject,
  onExportProject,
  onResumeProject,
  activeProjectId
}) => {
  const { themeClasses } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("date");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(project => {
      if (statusFilter === "all") return true;
      return project.status === statusFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "draft", label: "Draft" },
    { value: "processing", label: "Processing" },
    { value: "analyzing", label: "Analyzing" },
    { value: "completed", label: "Completed" },
    { value: "error", label: "Error" },
  ];

  const sortOptions = [
    { value: "date", label: "Last Updated", icon: Calendar },
    { value: "name", label: "Name", icon: ArrowUpDown },
    { value: "status", label: "Status", icon: Filter },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold">All Projects ({filteredProjects.length})</h1>
        </div>
        <button
          onClick={onNewProject}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${themeClasses.button.primary}`}
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${themeClasses.input}`}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${themeClasses.button.secondary}`}
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {/* View Mode */}
          <div className={`flex rounded-lg overflow-hidden ${themeClasses.bg.hover}`}>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? themeClasses.bg.active : ""}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? themeClasses.bg.active : ""}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`p-4 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.default}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        statusFilter === option.value
                          ? themeClasses.button.primary
                          : themeClasses.button.secondary
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as any)}
                        className={`px-3 py-1 text-sm rounded-lg flex items-center gap-2 ${
                          sortBy === option.value
                            ? themeClasses.button.primary
                            : themeClasses.button.secondary
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium mb-2">Quick Filters</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setSearchQuery("");
                    }}
                    className={`px-3 py-1 text-sm rounded-lg ${themeClasses.button.secondary}`}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      const starredProjects = projects.filter(p => p.isStarred);
                      if (starredProjects.length > 0) {
                        setSearchQuery("");
                        setStatusFilter("all");
                        // In a real app, you would filter by starred
                      }
                    }}
                    className={`px-3 py-1 text-sm rounded-lg flex items-center gap-2 ${themeClasses.button.secondary}`}
                  >
                    <Star className="h-3 w-3" />
                    Starred Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className={`text-center py-12 rounded-lg ${themeClasses.bg.card} border ${themeClasses.border.default}`}>
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"}
          </p>
          <button
            onClick={onNewProject}
            className={`px-4 py-2 rounded-lg ${themeClasses.button.primary}`}
          >
            Create New Project
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={activeProjectId === project.id}
              onSelect={() => onSelectProject(project)}
              onStar={() => onStarProject(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-[#4fb3d9] ${themeClasses.bg.card} ${themeClasses.border.default}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                        activeProjectId === project.id ? "bg-green-500" : "bg-red-400"
                      }`}
                    ></span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStarProject(project.id);
                      }}
                    >
                      <Star 
                        className={`h-4 w-4 ${project.isStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`} 
                      />
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{project.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === "completed" ? "bg-green-100 text-green-800" :
                      project.status === "processing" ? "bg-blue-100 text-blue-800" :
                      project.status === "error" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {project.updatedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;