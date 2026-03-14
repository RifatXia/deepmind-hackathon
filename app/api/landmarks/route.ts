import { NextResponse } from "next/server";
import { CURATED_SPOTS } from "@/lib/spots";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    spots: CURATED_SPOTS,
    fetchedAt: new Date().toISOString(),
  });
}
