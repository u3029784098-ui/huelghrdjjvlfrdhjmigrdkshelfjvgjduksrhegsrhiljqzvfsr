import { NextResponse } from "next/server";
import { getUserFromToken } from "@/app/lib/auth";

export async function GET() {
  const user = await getUserFromToken();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user });
}
