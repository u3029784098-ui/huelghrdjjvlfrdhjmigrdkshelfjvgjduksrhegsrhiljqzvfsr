"use client";

import React, { useEffect, useState } from "react";

const ranges = ["day", "week", "month", "year"] as const;
type Range = typeof ranges[number];

type StatsResponse = {
  online: number;
  offline: number;
  counts: {
    total: number;
    adminCount: number;
    memberCount: number;
    userCount: number;
    blockedCount: number;
  };
  projectsPerUser: { user_id: number; name: string; projects: number }[];
  connectionsLogins: { bucket: string; count: number }[];
  connectionsLogouts: { bucket: string; count: number }[];
  avgSessionMinutes: number;
  sessionStats: { min: number; max: number; p50: number; p90: number; p99: number };
  range: Range;
  recent24h: number;
  active7d: number;
  inactive30d: number;
  avgLoginsPerUser30d: number;
  projectCounts: { total: number; active: number };
  projectsByStatus: { status: string | null; count: number }[];
  topTags: { tag: string; count: number }[];
  trend: { day: string; count: number }[];
  topActive: { user_id: number; name: string; logins: number; last_seen: string | null; projects: number }[];
};

const AdminStatistics: React.FC = () => {
  const [range, setRange] = useState<Range>("day");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (selectedRange: Range) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?range=${selectedRange}`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(range);
  }, [range]);

  const counts = data?.counts || {
    total: 0,
    adminCount: 0,
    memberCount: 0,
    userCount: 0,
    blockedCount: 0,
  };

  const totalUsers = (data?.online || 0) + (data?.offline || 0);
  const avgLoginsPerUser30d = Number(data?.avgLoginsPerUser30d ?? 0);

  const maxConnections = Math.max(
    ...(data?.connectionsLogins?.map((c) => c.count) || [0]),
    ...(data?.connectionsLogouts?.map((c) => c.count) || [0])
  );
  const maxProjects = Math.max(...(data?.projectsPerUser?.map((u) => u.projects) || [0]));
  const maxTrend = Math.max(...(data?.trend?.map((t) => t.count) || [0]));
  const maxStatus = Math.max(...(data?.projectsByStatus?.map((s) => s.count || 0) || [0]));

  const bar = (value: number, max: number, colorClass: string) => {
    const width = max > 0 ? Math.max(5, (value / max) * 100) : 0;
    return (
      <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-[#1d1d1d] overflow-hidden">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${Math.min(width, 100)}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Admin Statistics</h2>
        <select
          className="rounded border border-gray-200 dark:border-[#2a2a2a] bg-transparent px-3 py-1 text-sm"
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
        >
          {ranges.map((r) => (
            <option key={r} value={r} className="bg-gray-900 text-white">
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
          Loading stats...
        </div>
      )}
      {error && <div className="text-sm text-red-500">{error}</div>}

      {data && !loading && !error && (
        <div className="space-y-6">
          {/* Overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-2">
              <div className="text-sm text-gray-500">Total users</div>
              <div className="text-2xl font-semibold">{counts.total}</div>
              <div className="text-xs text-gray-500">Admins {counts.adminCount} · Members {counts.memberCount} · Users {counts.userCount}</div>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-2">
              <div className="text-sm text-gray-500">Online</div>
              <div className="text-2xl font-semibold">{data.online}</div>
              {bar(data.online, totalUsers, "bg-emerald-500")}
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-2">
              <div className="text-sm text-gray-500">Blocked</div>
              <div className="text-2xl font-semibold">{data.counts.blockedCount}</div>
              {bar(data.counts.blockedCount, data.counts.total || 1, "bg-red-500")}
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-2">
              <div className="text-sm text-gray-500">Avg session (min)</div>
              <div className="text-2xl font-semibold">{data.avgSessionMinutes.toFixed(1)}</div>
              <div className="text-xs text-gray-500">p50 {data.sessionStats.p50.toFixed(1)} · p90 {data.sessionStats.p90.toFixed(1)} · p99 {data.sessionStats.p99.toFixed(1)}</div>
            </div>
          </div>

          {/* Activity & retention */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-3">
              <div className="font-medium">Activity (last 24h / 7d)</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Logins last 24h</span>
                <span className="font-semibold">{data.recent24h}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active users 7d</span>
                <span className="font-semibold">{data.active7d}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Inactive 30d</span>
                <span className="font-semibold">{data.inactive30d}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Avg logins/user (30d)</span>
                <span className="font-semibold">{avgLoginsPerUser30d.toFixed(1)}</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-3">
              <div className="font-medium">Session distribution</div>
              <div className="text-xs text-gray-500">min {data.sessionStats.min.toFixed(1)} · p50 {data.sessionStats.p50.toFixed(1)} · p90 {data.sessionStats.p90.toFixed(1)} · max {data.sessionStats.max.toFixed(1)}</div>
              <div className="flex items-center gap-2">
                {bar(data.sessionStats.p50, data.sessionStats.max || 1, "bg-blue-500")}
                <span className="text-xs text-gray-400">p50</span>
              </div>
              <div className="flex items-center gap-2">
                {bar(data.sessionStats.p90, data.sessionStats.max || 1, "bg-indigo-500")}
                <span className="text-xs text-gray-400">p90</span>
              </div>
              <div className="flex items-center gap-2">
                {bar(data.sessionStats.p99, data.sessionStats.max || 1, "bg-purple-500")}
                <span className="text-xs text-gray-400">p99</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-3">
              <div className="font-medium">14-day login trend</div>
              {data.trend.length === 0 ? (
                <div className="text-sm text-gray-500">No data.</div>
              ) : (
                <div className="space-y-1">
                  {data.trend.map((t) => (
                    <div key={t.day} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-16 truncate">{t.day.slice(5)}</span>
                      {bar(t.count, maxTrend, "bg-emerald-500")}
                      <span className="w-6 text-right text-gray-300">{t.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Connections over time with bars (logins vs logouts) */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Connections by {data.range}</div>
              <div className="text-xs text-gray-500">Logins & logouts (latest buckets)</div>
            </div>
            {(data.connectionsLogins.length === 0 && data.connectionsLogouts.length === 0) ? (
              <div className="text-sm text-gray-500">No data.</div>
            ) : (
              <div className="space-y-3">
                {data.connectionsLogins.map((c) => {
                  const logout = data.connectionsLogouts.find((l) => l.bucket === c.bucket)?.count || 0;
                  return (
                    <div key={c.bucket} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{c.bucket}</span>
                        <span className="flex items-center gap-3">
                          <span className="text-emerald-400">Login {c.count}</span>
                          <span className="text-orange-300">Logout {logout}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {bar(c.count, maxConnections, "bg-emerald-500")}
                        {bar(logout, maxConnections, "bg-orange-400")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Projects snapshot</div>
                <div className="text-xs text-gray-500">Total {data.projectCounts.total} · Active {data.projectCounts.active}</div>
              </div>
              {data.projectsByStatus.length === 0 ? (
                <div className="text-sm text-gray-500">No projects.</div>
              ) : (
                <div className="space-y-2">
                  {data.projectsByStatus.map((s) => (
                    <div key={s.status || "unknown"} className="space-y-1 text-sm">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{s.status || "unknown"}</span>
                        <span className="text-gray-200">{s.count}</span>
                      </div>
                      {bar(s.count || 0, maxStatus || 1, "bg-blue-500")}
                    </div>
                  ))}
                </div>
              )}
              {data.topTags.length > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-[#2a2a2a]">
                  <div className="text-xs text-gray-500 mb-2">Top tags</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {data.topTags.map((t) => (
                      <span key={t.tag} className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200">
                        {t.tag} ({t.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f] space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium">Projects per user</div>
                <div className="text-xs text-gray-500">Sorted desc</div>
              </div>
              {data.projectsPerUser.length === 0 ? (
                <div className="text-sm text-gray-500">No data.</div>
              ) : (
                <div className="space-y-2">
                  {data.projectsPerUser.map((u) => (
                    <div key={u.user_id} className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-200">{u.name}</span>
                        <span className="font-medium">{u.projects}</span>
                      </div>
                      {bar(u.projects, maxProjects, "bg-blue-500")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top active users */}
          <div className="p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Top active users</div>
              <div className="text-xs text-gray-500">By login count</div>
            </div>
            {data.topActive.length === 0 ? (
              <div className="text-sm text-gray-500">No data.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {data.topActive.map((u) => (
                  <div key={u.user_id} className="p-3 rounded-lg border border-gray-100 dark:border-[#1f1f1f] bg-gray-50 dark:bg-[#0a0a0a] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{u.name}</span>
                      <span className="text-xs text-gray-500">{u.logins} logins</span>
                    </div>
                    <div className="text-xs text-gray-500">Projects: {u.projects}</div>
                    <div className="text-xs text-gray-500">Last seen: {u.last_seen ? new Date(u.last_seen).toLocaleString() : "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStatistics;
