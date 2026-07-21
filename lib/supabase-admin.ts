import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const projectFilesBucket = process.env.SUPABASE_PROJECT_FILES_BUCKET ?? "project-files";

export function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase storage environment variables are not configured.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function ensureProjectFilesBucket() {
  const supabase = getSupabaseAdminClient();
  const { error: getBucketError } = await supabase.storage.getBucket(projectFilesBucket);

  if (!getBucketError) {
    return;
  }

  if (!/not found/i.test(getBucketError.message)) {
    throw new Error(getBucketError.message);
  }

  const { error: createBucketError } = await supabase.storage.createBucket(projectFilesBucket, {
    allowedMimeTypes: ["application/pdf"],
    fileSizeLimit: "25MB",
    public: false
  });

  if (createBucketError && !/already exists/i.test(createBucketError.message)) {
    throw new Error(createBucketError.message);
  }
}
