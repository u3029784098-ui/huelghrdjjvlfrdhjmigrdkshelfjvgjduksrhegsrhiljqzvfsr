import React from "react";
import { 
  Moon, 
  Sun, 
  Settings, 
  BarChart3, 
  Zap,
  GitBranch,
  FolderKanban,
  TrendingUp
} from "lucide-react";
import { useTheme } from "./themes";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentProjectName?: string;
  tabs?: { name: string; icon: React.ComponentType<any> }[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  currentProjectName = "Custom Browser",
  tabs: customTabs
}) => {
  const { darkMode, themeClasses, toggleDarkMode } = useTheme();

  const tabs = customTabs ?? [
    { name: "Projects", icon: FolderKanban },
    { name: "Build graph", icon: GitBranch },
    { name: "Statistics", icon: TrendingUp },
    { name: "Evaluation", icon: BarChart3 },
    { name: "Operations", icon: Zap },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className={`w-64 flex flex-col ${themeClasses.border.sidebar} ${themeClasses.bg.sidebar}`}>
      <div className={`p-4 border-b ${themeClasses.border.sidebar}`}>
        <div className="flex items-center gap-2">
          <div className="text-xl font-semibold text-[#4fb3d9]">
            {currentProjectName}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center gap-3 ${
                themeClasses.sidebarTab(activeTab === tab.name)
              }`}
            >
              <IconComponent className={`w-4 h-4 flex-shrink-0 ${
                activeTab === tab.name
                  ? darkMode
                    ? "text-[#4fb3d9]"
                    : "text-blue-600"
                  : darkMode
                    ? "text-gray-500"
                    : "text-gray-500"
              }`} />
              <span className="truncate">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Theme Toggle */}
      <div className={`p-4 border-t ${themeClasses.border.sidebar}`}>
        <button
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            darkMode
              ? 'bg-[#2a2a2a] hover:bg-[#333333] text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;