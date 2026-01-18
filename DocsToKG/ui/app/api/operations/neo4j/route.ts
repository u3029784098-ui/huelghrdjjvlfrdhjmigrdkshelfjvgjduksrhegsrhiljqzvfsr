import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Path to the Neo4j script
    const scriptPath = path.join(
      process.cwd(),
      "..",
      "ui",
      "backend",
      "core",
      "scripts",
      "run_neo4j.sh"
    );

    // Make script executable and run it
    try {
      await execAsync(`chmod +x "${scriptPath}"`);
      
      // Execute the script in the background
      exec(`bash "${scriptPath}" > /dev/null 2>&1 &`, (error) => {
        if (error) {
          console.error("Error starting Neo4j:", error);
        }
      });

      return NextResponse.json({
        message: "Neo4j is starting...",
        success: true
      });
    } catch (err: any) {
      console.error("Failed to execute Neo4j script:", err);
      return NextResponse.json({
        message: `Failed to start Neo4j: ${err.message}`,
        success: false
      }, { status: 500 });
    }
  } catch (err) {
    console.error("Neo4j operation error:", err);
    return NextResponse.json({ message: "Failed to start Neo4j" }, { status: 500 });
  }
}
