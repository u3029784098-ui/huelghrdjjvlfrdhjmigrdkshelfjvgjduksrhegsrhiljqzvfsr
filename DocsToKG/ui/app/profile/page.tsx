"use client";

import { useState, useEffect } from "react";
import { 
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Key,
  Globe,
  Moon,
  Download,
  Trash2,
  Upload,
  Save,
  Database,
  Settings,
  ChevronRight,
  BarChart3,
  Calendar
} from "lucide-react";
import { useTheme } from "../../components/themes";

// Fallback theme classes in case ThemeProvider is not available
const fallbackThemeClasses = {
  container: "bg-white text-gray-800",
  card: "bg-white border-gray-200 text-gray-700",
  input: "bg-white border-gray-300 text-gray-800 focus:border-blue-500 placeholder-gray-400",
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white",
  },
  text: {
    primary: "text-gray-800",
    secondary: "text-gray-700",
    muted: "text-gray-600",
    accent: "text-blue-600",
    danger: "text-red-600",
    success: "text-green-600",
  },
  border: {
    default: "border-gray-200",
    accent: "border-blue-500",
    danger: "border-red-600",
    success: "border-green-600",
    sidebar: "border-gray-200",
  },
  bg: {
    main: "bg-gray-50",
    sidebar: "bg-gray-50",
    card: "bg-white",
    input: "bg-white",
    hover: "hover:bg-gray-100",
    active: "bg-blue-50",
  },
  sidebarTab: (isActive: boolean) => 
    isActive
      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
      : "text-gray-600 hover:bg-gray-100 border-l-2 border-transparent hover:text-gray-900",
  tab: (isActive: boolean) =>
    isActive
      ? "text-blue-600 border-b-2 border-blue-600"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
  checkbox: "rounded border-gray-300 text-blue-600 focus:ring-blue-500",
  radio: "text-blue-600 focus:ring-blue-500",
  slider: "bg-gray-200 [&::-webkit-slider-thumb]:bg-blue-600 [&::-moz-range-thumb]:bg-blue-600",
  fileUpload: "border-gray-300 hover:border-blue-400",
};

export default function ProfilePage() {
  // Try to get theme from context, fallback to default if not available
  let themeClasses;
  try {
    const theme = useTheme();
    themeClasses = theme.themeClasses;
  } catch (error) {
    // If ThemeProvider is not available, use fallback theme
    console.warn("ThemeProvider not found, using fallback theme");
    themeClasses = fallbackThemeClasses;
  }
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    // Personal Info
    firstName: "John",
    lastName: "Doe",
    displayName: "john.doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    title: "Data Scientist",
    company: "Tech Corp Inc.",
    bio: "Passionate about knowledge graphs and document intelligence.",
    avatar: "JD",
    
    // Preferences
    theme: "dark",
    language: "en",
    timezone: "America/New_York",
    notifications: {
      email: true,
      push: true,
      projectUpdates: true,
      systemAlerts: true,
      marketing: false
    },
    
    // Subscription
    plan: "Pro",
    planExpiry: "2024-12-31",
    storageUsed: "45.2",
    storageTotal: "100",
    documentsProcessed: 1247,
    
    // Security
    twoFactorEnabled: true,
    lastLogin: "2024-01-20T14:30:00Z"
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "api", label: "API & Integrations", icon: Key },
    { id: "preferences", label: "Preferences", icon: Globe }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would make an API call here
    alert("Profile updated successfully!");
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file
      alert(`Avatar image selected: ${file.name}`);
    }
  };

  const handleDownloadData = () => {
    alert("Preparing your data download...");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deletion requested. A confirmation email has been sent.");
    }
  };

  // Helper function to safely get theme classes
  const getThemeClass = (className: string) => {
    if (!themeClasses) return "";
    
    // Handle nested properties like themeClasses.button.primary
    const parts = className.split('.');
    let result: any = themeClasses;
    
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return "";
      }
    }
    
    return result || "";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your profile, preferences, and account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {/* User Summary */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                        {userData.avatar}
                      </span>
                    </div>
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Upload className="h-3 w-3 text-white" />
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {userData.firstName} {userData.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userData.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full">
                        {userData.plan} Plan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Personal Information
                    </h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-4 py-2 rounded-lg ${
                        isEditing
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={userData.firstName}
                          onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={userData.lastName}
                          onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={userData.displayName}
                        onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{userData.email}</span>
                        <button
                          type="button"
                          className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                          Change Email
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{userData.phone}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={userData.bio}
                        onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                      />
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </form>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {userData.storageUsed} GB
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          of {userData.storageTotal} GB
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(parseFloat(userData.storageUsed) / parseFloat(userData.storageTotal)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Documents Processed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{userData.documentsProcessed}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Plan Expires</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                          {formatDate(userData.planExpiry)}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Account Settings
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Login Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Email Address</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{userData.email}</p>
                            </div>
                          </div>
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700">
                            Change
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Password</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
                            </div>
                          </div>
                          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700">
                            Change
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Connected Accounts
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 font-medium">G</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Google</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Connected for login</p>
                            </div>
                          </div>
                          <button className="text-sm text-red-600 hover:text-red-700">
                            Disconnect
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                              <span className="text-green-600 dark:text-green-300 font-medium">M</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Microsoft</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Connected for login</p>
                            </div>
                          </div>
                          <button className="text-sm text-red-600 hover:text-red-700">
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Security Settings
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className={`px-4 py-2 rounded-lg ${
                        userData.twoFactorEnabled
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}>
                        {userData.twoFactorEnabled ? "Enabled" : "Enable"}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last login: {formatDateTime(userData.lastLogin)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Chrome on Windows • New York, USA
                              </p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded">
                              Current
                            </span>
                          </div>
                        </div>

                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Mobile Session</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                iPhone • Safari • 2 days ago
                              </p>
                            </div>
                            <button className="text-sm text-red-600 hover:text-red-700">
                              Revoke
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Notification Preferences
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(userData.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive notifications about {key.toLowerCase().replace('updates', '')}
                            </p>
                          </div>
                          <button
                            onClick={() => setUserData({
                              ...userData,
                              notifications: {
                                ...userData.notifications,
                                [key]: !value
                              }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                              value ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === "profile" && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900 p-6">
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
                  Danger Zone
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  These actions are irreversible. Please proceed with caution.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Download className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Download Your Data</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get a copy of all your data in a readable format
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadData}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Download
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Trash2 className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400">Delete Account</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
