"use client";

import { useState } from "react";
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Settings, 
  User, 
  LogOut, 
  FileText,
  Plus,
  Moon,
  Sun,
  CreditCard,
  Database,
  ChevronDown,
  X
} from "lucide-react";
import { useTheme } from "./themes";
import { useAuth } from "./AuthProvider";
import UserProfile from "./UserProfile";

const TopMenuBar = () => {
  const { darkMode, themeClasses, toggleDarkMode } = useTheme();
  const { user: authUser, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Derive user display data from auth
  const user = {
    name: authUser ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim() || authUser.email : "Guest",
    email: authUser?.email || "",
    avatar: authUser ? `${authUser.first_name?.[0] || ''}${authUser.last_name?.[0] || ''}`.toUpperCase() || authUser.email[0].toUpperCase() : "G",
    plan: "Free Plan",
    role: "User"
  };

  const handleLogout = async () => {
    await logout();
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: "Processing Complete", message: "Medical Research project completed", time: "5 min ago", unread: true },
    { id: 2, title: "New Document Uploaded", message: "3 documents added to Legal Analysis", time: "1 hour ago", unread: true },
    { id: 3, title: "System Update", message: "New features available in v2.1", time: "2 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <>
      <div className={`sticky top-0 z-50 border-b ${themeClasses.border.default} ${themeClasses.bg.main}`}>
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* Left Section - Logo and Search */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-[#4fb3d9]" />
            <span className={`text-xl font-bold ${themeClasses.text.primary}`}>DocsToKG</span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, documents, graphs..."
              className={`pl-10 pr-4 py-2 w-64 lg:w-80 rounded-lg ${themeClasses.input}`}
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          
          {/* New Button */}
          <button className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg ${themeClasses.button.primary}`}>
            <Plus className="h-4 w-4" />
            New
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg relative ${themeClasses.button.secondary}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-lg border ${themeClasses.card} ${themeClasses.border.default}`}>
                <div className={`p-4 border-b ${themeClasses.border.default}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`font-semibold ${themeClasses.text.primary}`}>Notifications</h3>
                    <button className={`text-sm ${themeClasses.text.accent}`}>
                      Mark all as read
                    </button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b ${themeClasses.border.default} hover:${themeClasses.bg.hover} ${
                        notification.unread ? themeClasses.bg.active : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${themeClasses.text.primary}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${themeClasses.text.secondary}`}>
                            {notification.message}
                          </p>
                          <p className={`text-xs mt-2 ${themeClasses.text.muted}`}>
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 text-center">
                  <button className={`text-sm ${themeClasses.text.accent}`}>
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <div className="relative">
            <button
              onClick={() => setShowHelpMenu(!showHelpMenu)}
              className={`p-2 rounded-lg ${themeClasses.button.secondary}`}
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            {showHelpMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border ${themeClasses.card} ${themeClasses.border.default}`}>
                <div className="py-2">
                  <a href="/docs" className={`flex items-center px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.secondary}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                  <a href="/tutorials" className={`flex items-center px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.secondary}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Tutorials
                  </a>
                  <a href="/support" className={`flex items-center px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.secondary}`}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                  <div className={`border-t my-2 ${themeClasses.border.default}`}></div>
                  <div className={`px-4 py-2 text-xs ${themeClasses.text.muted}`}>
                    Version 2.1.0
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <a href="/settings" className={`p-2 rounded-lg ${themeClasses.button.secondary}`}>
            <Settings className="h-5 w-5" />
          </a>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-2 p-2 rounded-lg ${themeClasses.button.secondary}`}
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                  {user.avatar}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className={`text-sm font-medium ${themeClasses.text.primary}`}>{user.name}</p>
                <p className={`text-xs ${themeClasses.text.muted}`}>{user.plan}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border ${themeClasses.card} ${themeClasses.border.default}`}>
                <div className={`p-4 border-b ${themeClasses.border.default}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        {user.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${themeClasses.text.primary}`}>{user.name}</h3>
                      <p className={`text-sm ${themeClasses.text.secondary}`}>{user.email}</p>
                      <p className={`text-xs mt-1 ${themeClasses.text.accent}`}>{user.plan}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button 
                    onClick={() => {
                      setShowProfile(true);
                      setShowUserMenu(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.secondary}`}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Your Profile
                  </button>
                  <a href="/account" className={`flex items-center px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.secondary}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </a>
                  <a href="/billing" className={`flex items-center px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.secondary}`}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Billing & Plan
                  </a>
                  <div className={`border-t my-2 ${themeClasses.border.default}`}></div>
                  <button onClick={handleLogout} className={`flex items-center w-full px-4 py-2 text-sm hover:${themeClasses.bg.hover} ${themeClasses.text.danger}`}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Profile Modal */}
    {showProfile && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
        <div className="relative w-full h-full overflow-auto bg-gray-900">
          <button
            onClick={() => setShowProfile(false)}
            className="fixed top-4 right-4 z-[101] p-2 bg-gray-800 hover:bg-gray-700 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
          <UserProfile />
        </div>
      </div>
    )}
    </>
  );
};

export default TopMenuBar;