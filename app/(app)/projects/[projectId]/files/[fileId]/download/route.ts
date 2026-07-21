import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getProjectFile } from "@/lib/db/files";
import { canAccessProject } from "@/lib/db/projects";
import { ensureProjectFilesBucket, getSupabaseAdminClient, projectFilesBucket } from "@/lib/supabase-admin";

export async function GET(_request: Request, { params }: { params: { projectId: string; fileId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await getProjectFile(params.fileId);

  if (!file || file.projectId !== params.projectId || file.project.organizationId !== currentUser.organizationId) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (!(await canAccessProject(params.projectId, currentUser))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureProjectFilesBucket();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(projectFilesBucket).createSignedUrl(file.storagePath, 60, {
    download: file.name
  });

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Download is unavailable" }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl);
}
