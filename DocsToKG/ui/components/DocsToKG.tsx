"use client";
import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./themes";
import Sidebar from "./Sidebar";
import Settings from "./Settings";
import GenerateGraph from "./GenerateGraph";
import Evaluation from "./Evaluation";
import Operations from "./Operations";
import Statistics from "./Statistics";
import ProjectManagement from "./project_management/ProjectManagement";
import TopMenuBar from "./TopMenuBar";
import type { Project } from "./project_management/ProjectManagement";
import { useAuth } from "./AuthProvider";
import UsersAdmin from "./admin/UsersAdmin";
import AdminStatistics from "./admin/AdminStatistics";
import { Users, BarChart3 } from "lucide-react";

export default function DocsToKG() {
  const [activeTab, setActiveTab] = useState("Projects");
  const [activeProject, setActiveProject] = useState<Pick<Project, "id" | "name"> | null>(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(true);
  const { user } = useAuth();

  // Load active project on mount
  useEffect(() => {
    loadActiveProject();
  }, []);

  // For admins, ensure active tab is one of the allowed admin tabs; default to Users
  useEffect(() => {
    if (user?.role === 'admin') {
      const allowed = ["Users", "Statistics"];
      if (!allowed.includes(activeTab)) {
        setActiveTab("Users");
      }
    }
  }, [user?.role, activeTab]);

  const loadActiveProject = async () => {
    try {
      const res = await fetch("/api/projects/active");
      if (res.ok) {
        const data = await res.json();
        if (data.activeProject) {
          setActiveProject({
            id: `${data.activeProject.project_name}-${data.activeProject.user_id}`,
            name: data.activeProject.project_name
          });
        }
      }
    } catch (err) {
      console.error("Error loading active project:", err);
    } finally {
      setLoadingActiveProject(false);
    }
  };

  const handleProjectActivated = async (project: Project) => {
    setActiveProject({ id: project.id, name: project.name });
    
    // Persist active project to backend
    try {
      await fetch("/api/projects/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: project.name })
      });
    } catch (err) {
      console.error("Error saving active project:", err);
    }
  };

  const renderContent = () => {
    if (user?.role === 'admin') {
      if (activeTab === "Statistics") return <AdminStatistics />;
      return <UsersAdmin />;
    }
    switch (activeTab) {
      case "Users":
        return <UsersAdmin />;
      case "Settings":
        return <Settings />;
      case "Build graph":
        return <GenerateGraph />;
      case "Statistics":
        return <Statistics />;
      case "Evaluation":
        return <Evaluation />;
      case "Operations":
        return <Operations />;
      case "Projects":
        return (
          <ProjectManagement
            activeProjectId={activeProject?.id || null}
            onProjectActivated={handleProjectActivated}
          />
        );
      default:
        return (
          <ProjectManagement
            activeProjectId={activeProject?.id || null}
            onProjectActivated={handleProjectActivated}
          />
        );
    }
  };

  if (loadingActiveProject) {
    return (
      <ThemeProvider defaultDarkMode={true}>
        <div className="h-screen w-full flex flex-col font-sans items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultDarkMode={true}>
      <div className="h-screen w-full flex flex-col font-sans">
        {/* Top Menu Bar */}
        <TopMenuBar />

        {/* Main App Layout */}
        <div className="flex-1 flex">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentProjectName={activeProject?.name || "Custom Browser"}
          tabs={user?.role === 'admin' ? [
            { name: "Users", icon: Users },
            { name: "Statistics", icon: BarChart3 },
          ] : undefined}
        />
        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="border-b px-6 py-4">
            <div className="text-xl font-semibold">{activeTab}</div>
          </div>

          {/* Content Area */}
          <div className="p-6 min-h-full">
            {renderContent()}
          </div>
        </div>
        </div>
      </div>
    </ThemeProvider>
  );
}