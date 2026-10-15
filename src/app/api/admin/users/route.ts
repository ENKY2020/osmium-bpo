import { NextResponse } from "next/server";

import { createClient as createServerClient } from "@/utils/supabase/server";

/* =========================================================
   ADMIN CONFIGURATION
========================================================= */

const ADMIN_EMAILS = [
  "devosmiumbpo@gmail.com",
];

/* =========================================================
   GET USERS
========================================================= */

export async function GET() {
  try {
    /*
     * -------------------------------------------------------
     * 1. Read the current authenticated session
     * -------------------------------------------------------
     *
     * This uses the same Supabase SSR setup used by the
     * rest of the application.
     */

    const supabase = createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Admin users authentication error:",
        userError
      );

      return NextResponse.json(
        {
          error: "Unable to verify your session.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 2. Make sure somebody is actually signed in
     * -------------------------------------------------------
     */

    if (!user) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 3. Verify administrator access
     * -------------------------------------------------------
     *
     * Keep this aligned with AuthContext.tsx.
     */

    const currentEmail =
      user.email?.trim().toLowerCase() ?? "";

 
const isAdmin = ADMIN_EMAILS.some(
  (adminEmail) =>
    adminEmail.trim().toLowerCase() === currentEmail
);

    if (!isAdmin) {
      console.warn(
        "Unauthorized users API request:",
        currentEmail
      );

      return NextResponse.json(
        {
          error: "Administrator access required.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 4. Check for the server-only Supabase admin key
     * -------------------------------------------------------
     *
     * NEVER expose this key to the browser.
     */

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error(
        "SUPABASE_SERVICE_ROLE_KEY is missing."
      );

      return NextResponse.json(
        {
          error:
            "Server configuration is missing the Supabase admin key.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 5. Create a privileged Supabase client
     * -------------------------------------------------------
     *
     * This client is ONLY created after the current request
     * has been verified as an approved administrator.
     */

    const { createClient } =
      await import("@supabase/supabase-js");

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * -------------------------------------------------------
     * 6. Retrieve authenticated users
     * -------------------------------------------------------
     */

    const {
      data,
      error,
    } =
      await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 100,
      });

    if (error) {
      console.error(
        "Supabase admin users error:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Unable to load registered users.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * -------------------------------------------------------
     * 7. Return only the information the dashboard needs
     * -------------------------------------------------------
     *
     * We deliberately do NOT send the entire Supabase user
     * object to the browser.
     */

    const users = (data.users ?? []).map((registeredUser) => {
      const metadata =
        registeredUser.user_metadata ?? {};

      return {
        id: registeredUser.id,

        email:
          registeredUser.email ?? null,

        display_name:
          metadata.full_name ||
          metadata.name ||
          metadata.preferred_username ||
          metadata.user_name ||
          registeredUser.email?.split("@")[0] ||
          "User",

        avatar_url:
          metadata.avatar_url ||
          metadata.picture ||
          null,

        provider:
          registeredUser.app_metadata
            ?.provider ?? null,

        created_at:
          registeredUser.created_at,

        last_sign_in_at:
          registeredUser.last_sign_in_at ??
          null,

        email_confirmed_at:
          registeredUser.email_confirmed_at ??
          null,
      };
    });

    /*
     * -------------------------------------------------------
     * 8. Sort newest accounts first
     * -------------------------------------------------------
     */

    users.sort((a, b) => {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });

    /*
     * -------------------------------------------------------
     * 9. Return dashboard response
     * -------------------------------------------------------
     */

    return NextResponse.json({
      users,
      total: users.length,
    });
  } catch (error) {
    console.error(
      "Unexpected admin users API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading users.",
      },
      {
        status: 500,
      }
    );
  }
}