import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Upload route placeholder. Wire this to Supabase Storage when authenticated file uploads are implemented."
    },
    { status: 501 }
  );
}

