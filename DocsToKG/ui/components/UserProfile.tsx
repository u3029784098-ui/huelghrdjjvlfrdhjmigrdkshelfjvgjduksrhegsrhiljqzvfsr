"use client";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Shield,
  Bell,
  Palette,
  Download,
  Trash2,
  Lock,
  Activity,
  HelpCircle,
  FileText,
  MessageSquare,
  ChevronRight,
  Save,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { useTheme } from "./themes";

type ProfileData = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  birth_date: string | null;
  address: string | null;
  avatar_path: string | null;
  bio: string | null;
  website: string | null;
  phone: string | null;
  gender: "Male" | "Female" | null;
  language: string | null;
  timezone: string | null;
  theme: "light" | "dark" | "system" | null;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type ActivityItem = {
  event: "login" | "logout";
  device: string | null;
  event_time: string;
};

const UserProfile: React.FC = () => {
  const { themeClasses, darkMode } = useTheme();
  const [activeSection, setActiveSection] = useState<string>("basic");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    loadProfile();
    loadActivity();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivity = async () => {
    try {
      const res = await fetch("/api/profile/activity");
      if (res.ok) {
        const data = await res.json();
        setActivity(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load activity:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        alert("Profile updated successfully!");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (res.ok) {
        alert("Password changed successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to change password");
      }
    } catch (err) {
      alert("Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    if (!confirm("This will permanently delete all your data. Are you absolutely sure?")) {
      return;
    }

    try {
      const res = await fetch("/api/profile/delete", { method: "DELETE" });
      if (res.ok) {
        alert("Account deleted. You will be logged out.");
        window.location.href = "/";
      } else {
        alert("Failed to delete account");
      }
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <User className="h-5 w-5" />
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>First Name</label>
          <input
            type="text"
            value={profile?.first_name || ""}
            onChange={(e) => setProfile(p => p ? { ...p, first_name: e.target.value } : null)}
            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Last Name</label>
          <input
            type="text"
            value={profile?.last_name || ""}
            onChange={(e) => setProfile(p => p ? { ...p, last_name: e.target.value } : null)}
            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Bio</label>
        <textarea
          value={profile?.bio || ""}
          onChange={(e) => setProfile(p => p ? { ...p, bio: e.target.value } : null)}
          rows={3}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Avatar URL</label>
        <input
          type="text"
          value={profile?.avatar_path || ""}
          onChange={(e) => setProfile(p => p ? { ...p, avatar_path: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Location</label>
        <input
          type="text"
          value={profile?.address || ""}
          onChange={(e) => setProfile(p => p ? { ...p, address: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          placeholder="City, Country"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Website</label>
        <input
          type="url"
          value={profile?.website || ""}
          onChange={(e) => setProfile(p => p ? { ...p, website: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          placeholder="https://yourwebsite.com"
        />
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="px-4 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <Mail className="h-5 w-5" />
        Contact Information
      </h3>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Email</label>
        <input
          type="email"
          value={profile?.email || ""}
          disabled
          className={`w-full px-3 py-2 rounded-lg opacity-60 cursor-not-allowed ${themeClasses.input}`}
        />
        <p className={`text-xs mt-1 ${themeClasses.text.muted}`}>Email cannot be changed</p>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Phone Number</label>
        <input
          type="tel"
          value={profile?.phone || ""}
          onChange={(e) => setProfile(p => p ? { ...p, phone: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          placeholder="+1234567890"
        />
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="px-4 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <Calendar className="h-5 w-5" />
        Personal Details
      </h3>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Date of Birth</label>
        <input
          type="date"
          value={profile?.birth_date || ""}
          onChange={(e) => setProfile(p => p ? { ...p, birth_date: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Gender</label>
        <select
          value={profile?.gender || ""}
          onChange={(e) => setProfile(p => p ? { ...p, gender: e.target.value as any } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Language</label>
        <select
          value={profile?.language || ""}
          onChange={(e) => setProfile(p => p ? { ...p, language: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
        >
          <option value="">Select language</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Arabic">Arabic</option>
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Time Zone</label>
        <select
          value={profile?.timezone || ""}
          onChange={(e) => setProfile(p => p ? { ...p, timezone: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
        >
          <option value="">Select timezone</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Paris">Paris (CET)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="Asia/Dubai">Dubai (GST)</option>
        </select>
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="px-4 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <Shield className="h-5 w-5" />
        Account & Security
      </h3>

      <div className={`p-4 rounded-lg space-y-4 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
        <h4 className={`font-medium ${themeClasses.text.primary}`}>Change Password</h4>
        
        <div className="relative">
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Current Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Confirm New Password</label>
          <input
            type={showPassword ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
            className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
          />
        </div>

        <button
          onClick={() => setShowPassword(!showPassword)}
          className={`text-sm ${themeClasses.text.accent} hover:opacity-80 flex items-center gap-2`}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showPassword ? "Hide" : "Show"} passwords
        </button>

        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2"
        >
          <Lock className="h-4 w-4" />
          Change Password
        </button>
      </div>

      <div className={`p-4 rounded-lg ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
        <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Two-Factor Authentication</h4>
        <p className={`text-sm mb-4 ${themeClasses.text.secondary}`}>
          {profile?.two_factor_enabled ? "2FA is enabled" : "2FA is disabled"}
        </p>
        <button className={`px-4 py-2 rounded-lg text-sm ${themeClasses.button.secondary}`}>
          {profile?.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
      </div>

      <div className={`p-4 rounded-lg ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
        <h4 className={`font-medium mb-2 flex items-center gap-2 ${themeClasses.text.primary}`}>
          <Activity className="h-4 w-4" />
          Login Activity
        </h4>
        <div className={`space-y-2 max-h-64 overflow-y-auto`}>
          {activity.slice(0, 10).map((item, idx) => (
            <div key={idx} className={`text-sm p-2 rounded flex justify-between ${themeClasses.bg.hover}`}>
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.event === "login" ? "bg-green-500" : "bg-gray-500"}`} />
                {item.event} {item.device && `· ${item.device}`}
              </span>
              <span className={themeClasses.text.muted}>{new Date(item.event_time).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <Palette className="h-5 w-5" />
        Preferences & Customization
      </h3>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Theme</label>
        <select
          value={profile?.theme || "system"}
          onChange={(e) => setProfile(p => p ? { ...p, theme: e.target.value as any } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.primary}`}>Language</label>
        <select
          value={profile?.language || ""}
          onChange={(e) => setProfile(p => p ? { ...p, language: e.target.value } : null)}
          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 ${themeClasses.input} focus:ring-[#4fb3d9]`}
        >
          <option value="">Select language</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
        </select>
      </div>

      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className="px-4 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <Download className="h-5 w-5" />
        Data & Account Management
      </h3>

      <div className={`p-4 rounded-lg ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
        <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Download Your Data</h4>
        <p className={`text-sm mb-4 ${themeClasses.text.secondary}`}>
          Get a copy of your account data
        </p>
        <button className="px-4 py-2 bg-[#4fb3d9] hover:bg-[#3da3c9] text-white rounded-lg flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Data
        </button>
      </div>

      <div className={`p-4 rounded-lg ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
        <h4 className={`font-medium mb-2 ${themeClasses.text.primary}`}>Clear History</h4>
        <p className={`text-sm mb-4 ${themeClasses.text.secondary}`}>
          Remove your login and activity history
        </p>
        <button className={`px-4 py-2 rounded-lg ${themeClasses.button.secondary}`}>
          Clear History
        </button>
      </div>

      <div className={`p-4 rounded-lg ${themeClasses.border.danger} border ${darkMode ? "bg-red-900/20" : "bg-red-50"}`}>
        <h4 className={`font-medium mb-2 ${themeClasses.text.danger}`}>Danger Zone</h4>
        <p className={`text-sm mb-4 ${themeClasses.text.secondary}`}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </button>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold flex items-center gap-2 ${themeClasses.text.primary}`}>
        <HelpCircle className="h-5 w-5" />
        Support & Help
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className={`p-4 rounded-lg flex items-center justify-between ${themeClasses.bg.card} ${themeClasses.border.default} border hover:${themeClasses.bg.hover}`}>
          <span className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help Center
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>

        <button className={`p-4 rounded-lg flex items-center justify-between ${themeClasses.bg.card} ${themeClasses.border.default} border hover:${themeClasses.bg.hover}`}>
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Report a Problem
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>

        <button className={`p-4 rounded-lg flex items-center justify-between ${themeClasses.bg.card} ${themeClasses.border.default} border hover:${themeClasses.bg.hover}`}>
          <span className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Support
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>

        <button className={`p-4 rounded-lg flex items-center justify-between ${themeClasses.bg.card} ${themeClasses.border.default} border hover:${themeClasses.bg.hover}`}>
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Terms & Privacy
          </span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "personal", label: "Personal", icon: Calendar },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "data", label: "Data & Account", icon: Download },
    { id: "support", label: "Support", icon: HelpCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4fb3d9]"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg.main}`}>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className={`text-3xl font-bold mb-8 ${themeClasses.text.primary}`}>Your Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg p-4 space-y-2 sticky top-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeSection === section.id
                        ? "bg-[#4fb3d9] text-white"
                        : themeClasses.button.secondary
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className={`rounded-lg p-6 ${themeClasses.bg.card} ${themeClasses.border.default} border`}>
              {activeSection === "basic" && renderBasicInfo()}
              {activeSection === "contact" && renderContactInfo()}
              {activeSection === "personal" && renderPersonalDetails()}
              {activeSection === "security" && renderSecurity()}
              {activeSection === "preferences" && renderPreferences()}
              {activeSection === "data" && renderDataManagement()}
              {activeSection === "support" && renderSupport()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
