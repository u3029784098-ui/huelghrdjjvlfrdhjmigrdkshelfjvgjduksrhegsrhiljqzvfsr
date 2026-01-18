import React from "react";
import { 
  BarChart3,
  TrendingUp,
  Database,
  FileText,
  GitBranch,
  Activity,
  Users,
  Clock
} from "lucide-react";
import { getThemeClasses } from "./themes";

const Statistics: React.FC = () => {
  const themeClasses = getThemeClasses(true); // Using dark mode by default
  
  const overviewStats = [
    { label: "Total Documents", value: "1,247", icon: FileText, change: "+12%", trend: "up" },
    { label: "Graphs Generated", value: "189", icon: GitBranch, change: "+8%", trend: "up" },
    { label: "Active Connections", value: "5", icon: Database, change: "0%", trend: "neutral" },
    { label: "Processing Time", value: "2.4s", icon: Clock, change: "-15%", trend: "up" },
  ];

  const recentActivity = [
    { id: 1, action: "Graph generated", project: "Project Alpha", time: "2 hours ago", status: "success" },
    { id: 2, action: "Document processed", project: "Research Paper", time: "5 hours ago", status: "success" },
    { id: 3, action: "Connection tested", project: "Neo4j Production", time: "Yesterday", status: "success" },
    { id: 4, action: "Evaluation completed", project: "Project Beta", time: "2 days ago", status: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${themeClasses.text.primary}`}>
            Statistics
          </h2>
          <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>
            Overview of your DocsToKG workspace performance and activity
          </p>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${themeClasses.bg.input}`}>
                  <IconComponent className="w-5 h-5 text-[#4fb3d9]" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    stat.trend === "up"
                      ? "text-green-500"
                      : stat.trend === "down"
                      ? "text-red-500"
                      : themeClasses.text.secondary
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <div className={`text-3xl font-bold ${themeClasses.text.primary} mb-1`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${themeClasses.text.secondary}`}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Processing Chart */}
        <div className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              Document Processing
            </h3>
            <TrendingUp className="w-5 h-5 text-[#4fb3d9]" />
          </div>
          <div className={`h-64 flex items-center justify-center ${themeClasses.text.secondary}`}>
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Chart visualization will be displayed here</p>
              <p className="text-sm mt-2">Connect your analytics data</p>
            </div>
          </div>
        </div>

        {/* Graph Generation Chart */}
        <div className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              Graph Generation Trends
            </h3>
            <Activity className="w-5 h-5 text-[#4fb3d9]" />
          </div>
          <div className={`h-64 flex items-center justify-center ${themeClasses.text.secondary}`}>
            <div className="text-center">
              <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Graph trends will be displayed here</p>
              <p className="text-sm mt-2">Data visualization coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-lg ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
        <div className="p-6 border-b border-gray-700">
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
            Recent Activity
          </h3>
        </div>
        <div className="divide-y divide-gray-700">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className={`font-medium ${themeClasses.text.primary}`}>
                      {activity.action}
                    </p>
                    <p className={`text-sm ${themeClasses.text.secondary}`}>
                      {activity.project}
                    </p>
                  </div>
                </div>
                <span className={`text-sm ${themeClasses.text.secondary}`}>
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-5 h-5 text-[#4fb3d9]" />
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              Storage Usage
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${themeClasses.text.secondary}`}>Documents</span>
                <span className={`text-sm ${themeClasses.text.primary}`}>2.4 GB</span>
              </div>
              <div className={`w-full bg-gray-700 rounded-full h-2`}>
                <div className="bg-[#4fb3d9] h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${themeClasses.text.secondary}`}>Graphs</span>
                <span className={`text-sm ${themeClasses.text.primary}`}>1.1 GB</span>
              </div>
              <div className={`w-full bg-gray-700 rounded-full h-2`}>
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-5 h-5 text-[#4fb3d9]" />
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              Processing Speed
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${themeClasses.text.secondary}`}>Average</span>
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>2.4s</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${themeClasses.text.secondary}`}>Peak</span>
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>5.2s</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${themeClasses.text.secondary}`}>Best</span>
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>1.1s</span>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-5 h-5 text-[#4fb3d9]" />
            <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>
              Active Projects
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm ${themeClasses.text.secondary}`}>In Progress</span>
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>8</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${themeClasses.text.secondary}`}>Completed</span>
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>16</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${themeClasses.text.secondary}`}>Total</span>
              <span className={`text-sm font-medium ${themeClasses.text.primary}`}>24</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
