import { NextRequest, NextResponse } from "next/server";

// Simple endpoint to verify admin password
export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ valid: true });
  }
  return NextResponse.json({ valid: false }, { status: 401 });
}
