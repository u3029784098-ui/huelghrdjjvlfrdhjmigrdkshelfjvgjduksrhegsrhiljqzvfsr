"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "../themes";
import ProjectDashboard from "./ProjectDashboard";
import ProjectList from "./ProjectList";
import NewProjectWizard from "./NewProjectWizard";
import ProjectDetail from "./ProjectDetail";

export type ProjectStatus = "draft" | "processing" | "analyzing" | "completed" | "error" | "uploading";

export interface Project {
  id: string;
  userId: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: ProjectStatus;
  progress: number;
  documentCount: number;
  graphCount: number;
  isStarred: boolean;
  isActive: boolean;
  folder?: string;
  tags: string[];
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  error: number;
}

interface ProjectManagementProps {
  activeProjectId: string | null;
  onProjectActivated: (project: Project) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  activeProjectId,
  onProjectActivated,
}) => {
  const { themeClasses } = useTheme();
  const [activeCount, setActiveCount] = useState<number>(0);
    const mapApiProject = (p: any): Project => ({
      id: `${p.project_name}-${p.user_id}`,
      userId: p.user_id,
      name: p.project_name,
      description: p.description || "",
      createdAt: new Date(p.created_at),
      updatedAt: new Date(p.updated_at),
      status: p.status as ProjectStatus,
      progress: p.percentage || 0,
      documentCount: 0,
      graphCount: 0,
      isStarred: p.is_favorite || false,
      isActive: !!p.is_active,
      tags: p.tags ? p.tags.split(",") : [],
    });

  const [view, setView] = useState<"dashboard" | "list" | "detail" | "new">("dashboard");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        const mappedProjects: Project[] = data.projects.map(mapApiProject);
        setProjects(mappedProjects);
        setActiveCount(typeof data.activeCount === "number" ? data.activeCount : mappedProjects.filter(p => p.isActive).length);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: { 
    name: string; 
    description: string;
    tags: string[];
    initializationType: "files" | "folder" | "existing";
    selectedFiles?: File[];
    selectedFolder?: FileList | null;
    selectedProjects?: string[];
  }) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          tags: projectData.tags.join(",")
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to create project");
        return;
      }

      const data = await res.json();
      const newProject: Project = mapApiProject(data.project);
      
      setProjects(prev => [newProject, ...prev]);
      setActiveCount(prev => newProject.isActive ? prev + 1 : prev);
      setSelectedProject(newProject);
      onProjectActivated(newProject);
      setView("detail");
      
      console.log("Project created with data:", projectData);
      alert(`Project "${newProject.name}" created successfully!`);
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project");
    }
  };

  const handleUpdateProject = async (updatedProject: Project, originalName?: string) => {
    try {
      const targetName = originalName || updatedProject.name;
      const res = await fetch(`/api/projects/${encodeURIComponent(targetName)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updatedProject.name,
          description: updatedProject.description,
          is_favorite: updatedProject.isStarred,
          status: updatedProject.status,
          percentage: updatedProject.progress,
          tags: updatedProject.tags.join(",")
        })
      });

      if (res.ok) {
        const data = await res.json();
        const refreshed = mapApiProject(data.project);
        setProjects(prev => prev.map(p =>
          p.id === updatedProject.id ? refreshed : p
        ));
        setActiveCount(prev => {
          const wasActive = projects.find(p => p.id === updatedProject.id)?.isActive;
          if (wasActive === refreshed.isActive) return prev;
          return refreshed.isActive ? prev + 1 : Math.max(0, prev - 1);
        });
        setSelectedProject(refreshed);
        onProjectActivated(refreshed);
      } else {
        alert("Failed to update project");
      }
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(project.name)}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) {
          setSelectedProject(null);
          setView("dashboard");
        }
      } else {
        alert("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  const handleStarProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(project.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_favorite: !project.isStarred
        })
      });

      if (res.ok) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, isStarred: !p.isStarred } : p
        ));
        if (selectedProject?.id === projectId) {
          setSelectedProject(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
        }
      }
    } catch (err) {
      console.error("Error starring project:", err);
    }
  };

  const handleExportProject = (projectId: string, format: "csv" | "sql") => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      console.log(`Exporting project ${project.name} as ${format}`);
      alert(`Project "${project.name}" exported as ${format.toUpperCase()}`);
    }
  };

  const handleResumeProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject: Project = { 
      ...project, 
      status: "processing" as ProjectStatus, 
      progress: Math.max(project.progress, 50) 
    };

    setProjects(prev => prev.map(p => 
      p.id === projectId ? updatedProject : p
    ));
    setSelectedProject(updatedProject);
    onProjectActivated(updatedProject);
    setView("detail");
    alert("Project resumed and set as active.");
  };

  return (
    <div className={`rounded-lg p-6 ${themeClasses.card}`}>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className={themeClasses.text.secondary}>Loading projects...</p>
          </div>
        </div>
      ) : (
        <>
          {view === "dashboard" && (
        <ProjectDashboard
          projects={projects}
              activeCount={activeCount}
              activeProjectId={activeProjectId}
          onViewAll={() => setView("list")}
          onNewProject={() => setView("new")}
          onSelectProject={(project) => {
            setSelectedProject(project);
                onProjectActivated(project);
            setView("detail");
          }}
          onStarProject={handleStarProject}
        />
      )}

      {view === "list" && (
        <ProjectList
          projects={projects}
          onBack={() => setView("dashboard")}
          onNewProject={() => setView("new")}
          onSelectProject={(project) => {
            setSelectedProject(project);
            onProjectActivated(project);
            setView("detail");
          }}
          onStarProject={handleStarProject}
          onDeleteProject={handleDeleteProject}
          onExportProject={handleExportProject}
          onResumeProject={handleResumeProject}
          activeProjectId={activeProjectId}
        />
      )}

      {view === "new" && (
        <NewProjectWizard
          onBack={() => setView("dashboard")}
          onCreateProject={handleCreateProject}
          existingProjects={projects}
        />
      )}

      {view === "detail" && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onBack={() => {
            setView("dashboard");
          }}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onExportProject={handleExportProject}
          onResumeProject={handleResumeProject}
          onStarProject={handleStarProject}
        />
      )}
        </>
      )}
    </div>
  );
};

export default ProjectManagement;