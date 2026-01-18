import { NextResponse } from "next/server";
import { clearAuthCookie, getUserFromToken } from "@/app/lib/auth";
import { getConnection } from "@/app/lib/db";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  try {
    const user = await getUserFromToken();
    if (user?.user_id) {
      const pool = await getConnection();
      
      // Parse user-agent for device tracking
      const userAgent = request.headers.get("user-agent") || "";
      let device = "Unknown";
      
      if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
        device = "Mobile";
      } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
        device = "Tablet";
      } else {
        device = "Desktop";
      }
      
      let browser = "Unknown";
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edge")) browser = "Edge";
      
      let os = "Unknown";
      if (userAgent.includes("Windows")) os = "Windows";
      else if (userAgent.includes("Mac OS")) os = "macOS";
      else if (userAgent.includes("Linux")) os = "Linux";
      else if (userAgent.includes("Android")) os = "Android";
      else if (userAgent.includes("iOS")) os = "iOS";
      
      const deviceString = `${device} · ${browser} · ${os}`;
      
      await pool.query("UPDATE User SET is_connected = 0 WHERE user_id = ?", [user.user_id]);
      await pool.query("INSERT INTO UsersHistory (user_id, event, device) VALUES (?, 'logout', ?)", [user.user_id, deviceString]);
    }
  } catch (err) {
    console.error("Logout tracking failed", err);
  }
  clearAuthCookie(response);
  return response;
}
