import { NextResponse } from "next/server";
import { ensureSchema, getConnection } from "@/app/lib/db";
import { getUserFromToken } from "@/app/lib/auth";
import type { RowDataPacket } from "mysql2";

type BucketType = "day" | "week" | "month" | "year";

type HistoryRow = RowDataPacket & { bucket: string; count: number };
type SessionRow = RowDataPacket & { user_id: number; event: string; event_time: string };
type ProjectsRow = RowDataPacket & { user_id: number; name: string; projects: number };
type TopActiveRow = RowDataPacket & {
  user_id: number;
  name: string;
  logins: number;
  last_seen: string | null;
  projects: number;
};
type StatusRow = RowDataPacket & { status: string | null; count: number };
type CountRow = RowDataPacket & {
  total: number;
  adminCount: number;
  memberCount: number;
  userCount: number;
  blockedCount: number;
};

function percentile(values: number[], p: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  const weight = idx - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export async function GET(request: Request) {
  try {
    const me = await getUserFromToken();
    if (!me || me.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const range = (url.searchParams.get("range") || "day").toLowerCase();
    const allowed = ["day", "week", "month", "year"] as const;
    const bucketType: BucketType = allowed.includes(range as any)
      ? (range as BucketType)
      : "day";

    await ensureSchema();
    const pool = await getConnection();

    // User role & blocked counts
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT 
         COUNT(*) AS total,
         SUM(role = 'admin') AS adminCount,
         SUM(role = 'member') AS memberCount,
         SUM(role = 'user') AS userCount,
         SUM(is_blocked = 1) AS blockedCount
       FROM User`
    );
    const counts = countRows[0] || {
      total: 0,
      adminCount: 0,
      memberCount: 0,
      userCount: 0,
      blockedCount: 0,
    };

    // Online / offline counts
    const online = await (async () => {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT SUM(is_connected = 1) AS online, SUM(is_connected = 0) AS offline FROM User"
      );
      return { online: rows[0]?.online || 0, offline: rows[0]?.offline || 0 };
    })();

    // Projects per user
    const [projectsRows] = await pool.query<ProjectsRow[]>(
      `SELECT u.user_id, COALESCE(NULLIF(CONCAT(TRIM(COALESCE(u.first_name,'')), ' ', TRIM(COALESCE(u.last_name,''))), ' '), u.email) AS name,
              COUNT(p.project_name) AS projects
       FROM User u
       LEFT JOIN Project p ON p.user_id = u.user_id
       GROUP BY u.user_id, name
       ORDER BY projects DESC, name ASC`
    );

    // Connections over time (login events)
    let historyQuery = "";
    switch (bucketType) {
      case "week":
        historyQuery = `SELECT YEARWEEK(event_time, 1) AS bucket, COUNT(*) AS count
                        FROM UsersHistory
                        WHERE event = 'login'
                        GROUP BY YEARWEEK(event_time, 1)
                        ORDER BY bucket DESC
                        LIMIT 26`;
        break;
      case "month":
        historyQuery = `SELECT DATE_FORMAT(event_time, '%Y-%m-01') AS bucket, COUNT(*) AS count
                        FROM UsersHistory
                        WHERE event = 'login'
                        GROUP BY DATE_FORMAT(event_time, '%Y-%m-01')
                        ORDER BY bucket DESC
                        LIMIT 12`;
        break;
      case "year":
        historyQuery = `SELECT YEAR(event_time) AS bucket, COUNT(*) AS count
                        FROM UsersHistory
                        WHERE event = 'login'
                        GROUP BY YEAR(event_time)
                        ORDER BY bucket DESC
                        LIMIT 5`;
        break;
      case "day":
      default:
        historyQuery = `SELECT DATE(event_time) AS bucket, COUNT(*) AS count
                        FROM UsersHistory
                        WHERE event = 'login'
                        GROUP BY DATE(event_time)
                        ORDER BY bucket DESC
                        LIMIT 30`;
        break;
    }

    const [historyRows] = await pool.query<HistoryRow[]>(historyQuery);

    // Logout buckets
    const logoutQuery = historyQuery.replace("event = 'login'", "event = 'logout'");
    const [logoutRows] = await pool.query<HistoryRow[]>(logoutQuery);

    // Session durations
    const [sessionRows] = await pool.query<SessionRow[]>(
      "SELECT user_id, event, event_time FROM UsersHistory WHERE event IN ('login','logout') ORDER BY user_id, event_time"
    );
    const sessions: number[] = [];
    const lastLoginByUser = new Map<number, Date>();
    for (const row of sessionRows) {
      const ts = new Date(row.event_time);
      if (row.event === "login") {
        lastLoginByUser.set(row.user_id, ts);
      } else if (row.event === "logout") {
        const start = lastLoginByUser.get(row.user_id);
        if (start) {
          const mins = (ts.getTime() - start.getTime()) / 60000;
          if (mins >= 0 && Number.isFinite(mins)) {
            sessions.push(mins);
          }
          lastLoginByUser.delete(row.user_id);
        }
      }
    }

    const avgSessionMinutes = sessions.length
      ? sessions.reduce((a, b) => a + b, 0) / sessions.length
      : 0;

    // Activity windows
    const [recent24h] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT user_id) AS count FROM UsersHistory WHERE event='login' AND event_time >= NOW() - INTERVAL 24 HOUR"
    );
    const [active7d] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(DISTINCT user_id) AS count FROM UsersHistory WHERE event='login' AND event_time >= NOW() - INTERVAL 7 DAY"
    );
    const [inactive30d] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count
       FROM User u
       LEFT JOIN (
         SELECT DISTINCT user_id FROM UsersHistory WHERE event='login' AND event_time >= NOW() - INTERVAL 30 DAY
       ) recent ON recent.user_id = u.user_id
       WHERE recent.user_id IS NULL`
    );
    const [avgLoginsLast30d] = await pool.query<RowDataPacket[]>(
      `SELECT COALESCE(AVG(cnt), 0) AS avgLogins
       FROM (
         SELECT COUNT(*) AS cnt
         FROM UsersHistory
         WHERE event='login' AND event_time >= NOW() - INTERVAL 30 DAY
         GROUP BY user_id
       ) t`
    );

    // Project stats
    const [projectCounts] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total, SUM(is_active = 1) AS active FROM Project"
    );
    const [statusRows] = await pool.query<StatusRow[]>(
      "SELECT status, COUNT(*) AS count FROM Project GROUP BY status"
    );

    // Tag frequencies (split by comma)
    const [tagRows] = await pool.query<RowDataPacket[]>(
      "SELECT tags FROM Project WHERE tags IS NOT NULL AND tags <> ''"
    );
    const tagCounts = new Map<string, number>();
    for (const row of tagRows) {
      const tags = String(row.tags || "")
        .split(/[,;]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      for (const tag of tags) {
        const key = tag.toLowerCase();
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
      }
    }
    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Activity trend (last 14 days, fill gaps)
    const [trendRows] = await pool.query<RowDataPacket[]>(
      `SELECT DATE(event_time) AS day, COUNT(*) AS count
       FROM UsersHistory
       WHERE event='login' AND event_time >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(event_time)
       ORDER BY day`
    );
    const trendMap = new Map<string, number>();
    for (const r of trendRows) trendMap.set(r.day, r.count);
    const trend: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      trend.push({ day: iso, count: trendMap.get(iso) || 0 });
    }

    // Top active users
    const [topActive] = await pool.query<TopActiveRow[]>(
      `SELECT 
         u.user_id,
         COALESCE(NULLIF(CONCAT(TRIM(COALESCE(u.first_name,'')), ' ', TRIM(COALESCE(u.last_name,''))), ' '), u.email) AS name,
         COUNT(h.user_id) AS logins,
         MAX(h.event_time) AS last_seen,
         COUNT(DISTINCT p.project_name) AS projects
       FROM User u
       LEFT JOIN UsersHistory h ON h.user_id = u.user_id AND h.event='login'
       LEFT JOIN Project p ON p.user_id = u.user_id
       GROUP BY u.user_id, name
       ORDER BY logins DESC, last_seen DESC
       LIMIT 5`
    );

    // Session distribution stats
    const sessionStats = sessions.length
      ? {
          min: Math.min(...sessions),
          max: Math.max(...sessions),
          p50: percentile(sessions, 50),
          p90: percentile(sessions, 90),
          p99: percentile(sessions, 99),
        }
      : { min: 0, max: 0, p50: 0, p90: 0, p99: 0 };

    return NextResponse.json({
      online: online.online,
      offline: online.offline,
      counts,
      projectsPerUser: projectsRows,
      connectionsLogins: historyRows,
      connectionsLogouts: logoutRows,
      avgSessionMinutes,
      sessionStats,
      range: bucketType,
      recent24h: recent24h[0]?.count || 0,
      active7d: active7d[0]?.count || 0,
      inactive30d: inactive30d[0]?.count || 0,
      avgLoginsPerUser30d: avgLoginsLast30d[0]?.avgLogins || 0,
      projectCounts: {
        total: projectCounts[0]?.total || 0,
        active: projectCounts[0]?.active || 0,
      },
      projectsByStatus: statusRows,
      topTags,
      trend,
      topActive,
    });
  } catch (err) {
    console.error("Admin stats error", err);
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}
