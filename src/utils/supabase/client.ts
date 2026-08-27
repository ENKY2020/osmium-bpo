import { createBrowserClient } from "@supabase/ssr";

/* =========================================================
   SUPABASE BROWSER CONFIG
   ========================================================= */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/* =========================================================
   ENVIRONMENT VALIDATION
   ========================================================= */

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
  );
}

if (!supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable."
  );
}

/* =========================================================
   BROWSER CLIENT
   ========================================================= */

export function createClient() {
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}

/* =========================================================
   SHARED CLIENT
   ========================================================= */

/**
 * Shared browser Supabase client.
 *
 * Existing pages can continue using:
 *
 * import { supabase } from "@/utils/supabase/client";
 */
export const supabase = createClient();