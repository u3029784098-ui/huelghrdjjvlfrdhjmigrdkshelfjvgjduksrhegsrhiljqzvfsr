"use client";

import React, { useEffect, useState } from "react";

type User = {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  email: string;
  address: string | null;
  role: 'admin' | 'member' | 'user';
  is_connected: number;
  is_blocked: number;
  created_at: string;
  updated_at: string;
};

type Project = {
  user_id: number;
  project_name: string;
  description: string | null;
  is_favorite: number;
  is_active: number;
  status: string;
  tags: string | null;
  percentage: number;
  created_at: string;
  updated_at: string;
};

type History = {
  user_id: number;
  event: 'login' | 'logout';
  event_time: string;
};

type AdminUserItem = {
  user: User;
  projects: Project[];
  history: History[];
};

const UsersAdmin: React.FC = () => {
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [expandedView, setExpandedView] = useState<"projects" | "history" | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilter, setSearchFilter] = useState<"all" | "user" | "email" | "role" | "birth_date" | "address" | "project" | "history">("all");
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  
  // Time-based filters
  const [loginStartDate, setLoginStartDate] = useState("");
  const [loginEndDate, setLoginEndDate] = useState("");
  const [logoutStartDate, setLogoutStartDate] = useState("");
  const [logoutEndDate, setLogoutEndDate] = useState("");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.users || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (user_id: number, block: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_blocked: block }),
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (err) {
      console.error("Block/unblock failed", err);
    }
  };

  const deleteUser = async (user_id: number) => {
    if (!confirm("Delete this user and all related data?")) return;
    try {
      const res = await fetch(`/api/admin/users/${user_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const updateRole = async (userId: number, newRole: "user" | "member") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }
      setItems((prev) =>
        prev.map((item) =>
          item.user.user_id === userId
            ? { ...item, user: { ...item.user, role: newRole } }
            : item
        )
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleDetail = (user_id: number, view: "projects" | "history") => {
    if (expandedUserId === user_id && expandedView === view) {
      setExpandedUserId(null);
      setExpandedView(null);
      return;
    }
    setExpandedUserId(user_id);
    setExpandedView(view);
  };

  const matchesSearch = (item: AdminUserItem): boolean => {
    if (!searchQuery.trim() && !loginStartDate && !loginEndDate && !logoutStartDate && !logoutEndDate && !minDuration && !maxDuration) return true;
    
    // Text-based search
    if (searchQuery.trim()) {
      const getValue = (filter: string): string => {
        switch (filter) {
          case "user":
            return ((item.user.first_name || "") + " " + (item.user.last_name || "")).trim() || "";
          case "email":
            return item.user.email;
          case "role":
            return item.user.role;
          case "birth_date":
            return item.user.birth_date || "";
          case "address":
            return item.user.address || "";
          case "project":
            return item.projects.map(p => 
              [p.project_name, p.description, p.tags, p.status].filter(Boolean).join(" ")
            ).join(" ");
          case "history":
            return item.history.map(h => 
              `${h.event} ${new Date(h.event_time).toLocaleString()}`
            ).join(" ");
          case "all":
          default:
            return [
              item.user.first_name,
              item.user.last_name,
              item.user.email,
              item.user.role,
              item.user.birth_date,
              item.user.address,
              ...item.projects.map(p => [p.project_name, p.description, p.tags].filter(Boolean).join(" ")),
              ...item.history.map(h => h.event)
            ].filter(Boolean).join(" ");
        }
      };
      
      let searchText = getValue(searchFilter);
      let query = searchQuery;
      
      if (!matchCase) {
        searchText = searchText.toLowerCase();
        query = query.toLowerCase();
      }
      
      if (useRegex) {
        try {
          const flags = matchCase ? "" : "i";
          const regex = new RegExp(query, flags);
          if (!regex.test(searchText)) return false;
        } catch {
          return false;
        }
      } else if (matchWholeWord) {
        const pattern = `\\b${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`;
        const regex = new RegExp(pattern, matchCase ? "" : "i");
        if (!regex.test(searchText)) return false;
      } else {
        if (!searchText.includes(query)) return false;
      }
    }
    
    // Time-based filters
    const logins = item.history.filter(h => h.event === "login");
    const logouts = item.history.filter(h => h.event === "logout");
    
    // Login time range filter
    if (loginStartDate || loginEndDate) {
      const hasMatchingLogin = logins.some(login => {
        const loginTime = new Date(login.event_time);
        if (loginStartDate && loginTime < new Date(loginStartDate)) return false;
        if (loginEndDate && loginTime > new Date(loginEndDate)) return false;
        return true;
      });
      if (!hasMatchingLogin) return false;
    }
    
    // Logout time range filter
    if (logoutStartDate || logoutEndDate) {
      const hasMatchingLogout = logouts.some(logout => {
        const logoutTime = new Date(logout.event_time);
        if (logoutStartDate && logoutTime < new Date(logoutStartDate)) return false;
        if (logoutEndDate && logoutTime > new Date(logoutEndDate)) return false;
        return true;
      });
      if (!hasMatchingLogout) return false;
    }
    
    // Session duration filter
    if (minDuration || maxDuration) {
      // Calculate session durations by pairing logins with subsequent logouts
      const sortedHistory = [...item.history].sort((a, b) => 
        new Date(a.event_time).getTime() - new Date(b.event_time).getTime()
      );
      
      const sessions: number[] = [];
      let lastLogin: Date | null = null;
      
      for (const event of sortedHistory) {
        const eventTime = new Date(event.event_time);
        if (event.event === "login") {
          lastLogin = eventTime;
        } else if (event.event === "logout" && lastLogin) {
          const durationMinutes = (eventTime.getTime() - lastLogin.getTime()) / 60000;
          if (durationMinutes >= 0) sessions.push(durationMinutes);
          lastLogin = null;
        }
      }
      
      if (sessions.length === 0) return false;
      
      const hasMatchingDuration = sessions.some(duration => {
        const minDur = minDuration ? parseFloat(minDuration) : 0;
        const maxDur = maxDuration ? parseFloat(maxDuration) : Infinity;
        return duration >= minDur && duration <= maxDur;
      });
      
      if (!hasMatchingDuration) return false;
    }
    
    return true;
  };
  
  const filteredItems = items.filter(matchesSearch);

  const renderProjects = (projects: Project[]) => {
    if (projects.length === 0) {
      return <div className="text-gray-400">No projects.</div>;
    }
    return (
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-[#2a2a2a]">
            <th className="py-2 pr-4">Project</th>
            <th className="py-2 pr-4">Description</th>
            <th className="py-2 pr-4">Tags</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Active</th>
            <th className="py-2 pr-4">Created</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.project_name} className="border-b border-gray-100 dark:border-[#1f1f1f]">
              <td className="py-2 pr-4 font-medium">{p.project_name}</td>
              <td className="py-2 pr-4 text-xs text-gray-400 max-w-xs truncate">{p.description || "—"}</td>
              <td className="py-2 pr-4 text-xs text-gray-400">{p.tags || "—"}</td>
              <td className="py-2 pr-4 text-xs text-gray-500">{p.status}</td>
              <td className="py-2 pr-4 text-xs">{p.is_active ? "Yes" : "No"}</td>
              <td className="py-2 pr-4 text-xs">{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderHistory = (history: History[]) => {
    if (history.length === 0) {
      return <div className="text-gray-400">No history.</div>;
    }
    return (
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-[#2a2a2a]">
            <th className="py-2 pr-4">Event</th>
            <th className="py-2 pr-4">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, idx) => (
            <tr key={`${h.event}-${idx}`} className="border-b border-gray-100 dark:border-[#1f1f1f]">
              <td className="py-2 pr-4 text-xs">{h.event}</td>
              <td className="py-2 pr-4 text-xs">{new Date(h.event_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm"
          >
            <option value="all">All fields</option>
            <option value="user">User name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="birth_date">Birth date</option>
            <option value="address">Address</option>
            <option value="project">Projects</option>
            <option value="history">History</option>
          </select>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAdvancedFilters
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 dark:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#2a2a2a]"
            }`}
          >
            {showAdvancedFilters ? "Hide" : "Show"} Advanced
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRegex}
              onChange={(e) => setUseRegex(e.target.checked)}
              className="rounded border-gray-300 dark:border-[#2a2a2a]"
            />
            <span className="text-gray-600 dark:text-gray-400">Use Regular Expression</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={matchCase}
              onChange={(e) => setMatchCase(e.target.checked)}
              className="rounded border-gray-300 dark:border-[#2a2a2a]"
            />
            <span className="text-gray-600 dark:text-gray-400">Match Case</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={matchWholeWord}
              onChange={(e) => setMatchWholeWord(e.target.checked)}
              className="rounded border-gray-300 dark:border-[#2a2a2a]"
            />
            <span className="text-gray-600 dark:text-gray-400">Match Whole Word</span>
          </label>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-4 bg-gray-50 dark:bg-[#0a0a0a] space-y-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Advanced Time & Duration Filters
            </div>
            
            {/* Login Time Range */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                Login Time Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">From</label>
                  <input
                    type="datetime-local"
                    value={loginStartDate}
                    onChange={(e) => setLoginStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">To</label>
                  <input
                    type="datetime-local"
                    value={loginEndDate}
                    onChange={(e) => setLoginEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Logout Time Range */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                Logout Time Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">From</label>
                  <input
                    type="datetime-local"
                    value={logoutStartDate}
                    onChange={(e) => setLogoutStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">To</label>
                  <input
                    type="datetime-local"
                    value={logoutEndDate}
                    onChange={(e) => setLogoutEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Session Duration */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                Session Duration (minutes)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Minimum</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g., 30"
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-500 mb-1">Maximum</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g., 120"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => {
                setLoginStartDate("");
                setLoginEndDate("");
                setLogoutStartDate("");
                setLogoutEndDate("");
                setMinDuration("");
                setMaxDuration("");
              }}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-[#1f1f1f] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#2a2a2a] text-sm transition-colors"
            >
              Clear Advanced Filters
            </button>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredItems.length} of {items.length} users
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-[#2a2a2a]">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Birth Date</th>
              <th className="py-2 pr-4">Address</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Connected</th>
              <th className="py-2 pr-4">Blocked</th>
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(({ user, projects, history }) => (
              <React.Fragment key={user.user_id}>
                <tr className="border-b border-gray-100 dark:border-[#1f1f1f]">
                  <td className="py-2 pr-4">
                    {(user.first_name || "") + " " + (user.last_name || "").trim() || "—"}
                  </td>
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4 text-sm">{user.birth_date ? new Date(user.birth_date).toLocaleDateString() : "—"}</td>
                  <td className="py-2 pr-4 text-sm max-w-xs truncate">{user.address || "—"}</td>
                  <td className="py-2 pr-4">
                    {user.role === "admin" ? (
                      <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
                        admin
                      </span>
                    ) : (
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.user_id, e.target.value as "user" | "member")}
                        className="px-2 py-1 rounded-full bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 text-xs border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="user">user</option>
                        <option value="member">member</option>
                      </select>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${user.is_connected ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-700 dark:bg-[#2a2a2a] dark:text-gray-300'}`}>
                      <span className={`h-2 w-2 rounded-full ${user.is_connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {user.is_connected ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{user.is_blocked ? 'Yes' : 'No'}</td>
                  <td className="py-2 pr-4">{new Date(user.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleDetail(user.user_id, "projects")}
                        className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      >
                        Projects
                      </button>
                      <button
                        onClick={() => toggleDetail(user.user_id, "history")}
                        className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                      >
                        History
                      </button>
                      <button
                        onClick={() => toggleBlock(user.user_id, user.is_blocked ? false : true)}
                        className={`px-2 py-1 rounded text-xs ${user.is_blocked ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}
                      >
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.user_id)}
                        className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 dark:bg-[#2a2a2a] dark:text-gray-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedUserId === user.user_id && expandedView === "projects" && (
                  <tr className="bg-gray-50 dark:bg-[#0f0f0f]">
                    <td colSpan={9} className="p-4">
                      {renderProjects(projects)}
                    </td>
                  </tr>
                )}
                {expandedUserId === user.user_id && expandedView === "history" && (
                  <tr className="bg-gray-50 dark:bg-[#0f0f0f]">
                    <td colSpan={9} className="p-4">
                      {renderHistory(history)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersAdmin;
