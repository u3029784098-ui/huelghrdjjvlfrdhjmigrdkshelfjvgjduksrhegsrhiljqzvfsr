"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Database,
  Settings,
  Upload,
  BarChart3,
  Zap,
  GitBranch,
  User,
  LogOut,
  Bell,
  FileText,
  FolderOpen,
  Activity,
  ChevronRight
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "JD",
  });

  const handleLogout = () => {
    // In a real app, you would:
    // 1. Clear authentication tokens
    // 2. Clear user data
    // 3. Redirect to login page
    router.push("/auth/login");
  };

  const stats = [
    { label: "Total Documents", value: "1,247", icon: FileText, color: "bg-blue-500" },
    { label: "Projects", value: "24", icon: FolderOpen, color: "bg-green-500" },
    { label: "Graphs Generated", value: "189", icon: GitBranch, color: "bg-purple-500" },
    { label: "Active Processes", value: "3", icon: Activity, color: "bg-orange-500" },
  ];

  const recentActivities = [
    { id: 1, action: "Uploaded document", document: "research_paper.pdf", time: "2 hours ago" },
    { id: 2, action: "Generated graph", document: "Project Alpha", time: "Yesterday" },
    { id: 3, action: "Connected to Neo4j", document: "Production DB", time: "2 days ago" },
    { id: 4, action: "Updated settings", document: "API Configuration", time: "1 week ago" },
  ];

  const quickActions = [
    { title: "Upload Files", icon: Upload, href: "/DocsToKG", color: "bg-blue-100 text-blue-600" },
    { title: "Build graph", icon: GitBranch, href: "/DocsToKG", color: "bg-green-100 text-green-600" },
    { title: "Manage Connections", icon: Database, href: "/DocsToKG", color: "bg-purple-100 text-purple-600" },
    { title: "View Analytics", icon: BarChart3, href: "/DocsToKG", color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">DocsToKG Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{user.avatar}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:rotate-90 transition-transform" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Your Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
          <p className="opacity-90">Ready to transform your documents into knowledge graphs?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className={`p-3 rounded-lg ${action.color} mr-4`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">Click to start</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  );
                })}
              </div>

              {/* Main App Link */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <Link
                  href="/DocsToKG"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:border-blue-300 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-600 rounded-lg mr-4">
                      <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Open DocsToKG Application</h3>
                      <p className="text-sm text-gray-600">Access all features and tools</p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-blue-600 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Link
                  href="/activity"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span>
                        {" "}on{" "}
                        <span className="font-medium">{activity.document}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check out our documentation or contact support for assistance.
              </p>
              <div className="space-y-2">
                <Link
                  href="/docs"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  📚 View Documentation
                </Link>
                <Link
                  href="/support"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  💬 Contact Support
                </Link>
                <Link
                  href="/tutorials"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  🎥 Watch Tutorials
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
