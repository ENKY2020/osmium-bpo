"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import styles from "./page.module.css";

/* =========================================================
   TYPES
========================================================= */

type AdminUser = {
  id: string;
  email: string | null;
  display_name: string;
  avatar_url: string | null;
  provider: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  is_active: boolean;
};

type UsersResponse = {
  users: AdminUser[];
  total: number;
};

type ErrorResponse = {
  error?: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function UsersPage() {
  const { user, loading, isAdmin } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  /* =======================================================
     LOAD USERS
  ======================================================= */

  const loadUsers = useCallback(async () => {
    if (!user || !isAdmin) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      /*
       * Do not blindly call response.json().
       *
       * If the API route is missing or Next.js returns an
       * HTML error page, response.json() throws:
       *
       * Unexpected token '<', "<!DOCTYPE..."
       *
       * This gives us a much cleaner error instead.
       */

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          `Users API returned an unexpected response (${response.status}).`
        );
      }

      const result = (await response.json()) as
        | UsersResponse
        | ErrorResponse;

      if (!response.ok) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "Unable to load users."
        );
      }

      const data = result as UsersResponse;

      setUsers(Array.isArray(data.users) ? data.users : []);
      setTotalUsers(
        typeof data.total === "number"
          ? data.total
          : data.users?.length || 0
      );
    } catch (loadError) {
      console.error("Admin users loading error:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load users."
      );

      setUsers([]);
      setTotalUsers(0);
    } finally {
      setPageLoading(false);
    }
  }, [user, isAdmin]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    if (!loading) {
      loadUsers();
    }
  }, [loading, loadUsers]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((item) => {
      const name = item.display_name?.toLowerCase() || "";
      const email = item.email?.toLowerCase() || "";

      return (
        name.includes(query) ||
        email.includes(query)
      );
    });
  }, [search, users]);

  /* =======================================================
     NEW USERS
  ======================================================= */

  const newUsers = useMemo(() => {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    );

    return users.filter((item) => {
      const createdAt = new Date(item.created_at);

      return (
        !Number.isNaN(createdAt.getTime()) &&
        createdAt >= thirtyDaysAgo
      );
    }).length;
  }, [users]);

  /* =======================================================
     LOADING AUTH
  ======================================================= */

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingContent}>
          <p className={styles.eyebrow}>
            OSMIUM BPO · OPERATIONS
          </p>

          <h1>Checking access...</h1>

          <p>Securing your workspace.</p>
        </div>
      </main>
    );
  }

  /* =======================================================
     UNAUTHORIZED
  ======================================================= */

  if (!user || !isAdmin) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingContent}>
          <p className={styles.eyebrow}>
            OSMIUM BPO
          </p>

          <h1>Access restricted</h1>

          <p>Redirecting you...</p>
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          href="/admin"
          className={styles.backLink}
        >
          ← Operations Dashboard
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              OSMIUM BPO · USERS
            </p>

            <h1>Users</h1>

            <p className={styles.intro}>
              See who has created an account and keep
              a simple view of the people using the
              Osmium platform.
            </p>
          </div>

          <div className={styles.headerBadge}>
            <span>
              {pageLoading ? "..." : totalUsers}
            </span>

            <small>Total Users</small>
          </div>
        </header>

        {/* =================================================
            STATS
        ================================================= */}

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <span>TOTAL USERS</span>

            <strong>
              {pageLoading ? "..." : totalUsers}
            </strong>

            <small>Registered accounts</small>
          </div>

          <div className={styles.statCard}>
            <span>NEW USERS</span>

            <strong>
              {pageLoading ? "..." : newUsers}
            </strong>

            <small>Joined in the last 30 days</small>
          </div>

          <div className={styles.statCard}>
            <span>SHOWING</span>

            <strong>
              {pageLoading
                ? "..."
                : filteredUsers.length}
            </strong>

            <small>Matching this view</small>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className={styles.alert}>
            <div>
              <strong>
                Users could not be loaded
              </strong>

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={loadUsers}
            >
              Try again
            </button>
          </div>
        )}

        {/* =================================================
            USER DIRECTORY
        ================================================= */}

        <section className={styles.usersSection}>
          <div className={styles.listHeader}>
            <div>
              <p className={styles.eyebrow}>
                ACCOUNT DIRECTORY
              </p>

              <h2>Registered users</h2>
            </div>

            <div className={styles.searchBox}>
              <span>Search</span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Name or email..."
                aria-label="Search users"
              />
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {pageLoading ? (
            <div className={styles.loadingCard}>
              <div
                className={styles.spinner}
                aria-hidden="true"
              />

              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            /* ===============================================
               EMPTY
            =============================================== */

            <div className={styles.emptyState}>
              <div
                className={styles.emptyIcon}
                aria-hidden="true"
              >
                ◎
              </div>

              <h3>
                {search
                  ? "No matching users"
                  : "No users yet"}
              </h3>

              <p>
                {search
                  ? "Try a different name or email."
                  : "Registered accounts will appear here."}
              </p>
            </div>
          ) : (
            /* ===============================================
               USER LIST
            =============================================== */

            <div className={styles.userList}>
              {filteredUsers.map((item) => (
                <article
                  key={item.id}
                  className={styles.userCard}
                >
                  {/* AVATAR */}

                  <div className={styles.avatar}>
                    {item.avatar_url ? (
                      <img
                        src={item.avatar_url}
                        alt=""
                      />
                    ) : (
                      <span>
                        {getInitials(
                          item.display_name,
                          item.email
                        )}
                      </span>
                    )}
                  </div>

                  {/* USER DETAILS */}

                  <div className={styles.userMain}>
                    <h3>
                      {item.display_name ||
                        "Unnamed user"}
                    </h3>

                    <p>
                      {item.email ||
                        "No email available"}
                    </p>

                    <div className={styles.meta}>
                      <span>
                        Joined{" "}
                        {formatDate(
                          item.created_at
                        )}
                      </span>

                      <span>
                        {formatProvider(
                          item.provider
                        )}
                      </span>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div className={styles.userStatus}>
                    <span
                      className={
                        item.is_active
                          ? styles.activeStatus
                          : styles.inactiveStatus
                      }
                    >
                      <i />

                      {item.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <small>
                      {item.last_sign_in_at
                        ? `Last active ${formatDate(
                            item.last_sign_in_at
                          )}`
                        : "No sign-in recorded"}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            PHASE 1 NOTE
        ================================================= */}

        <div className={styles.note}>
          <span>✓</span>

          <div>
            <strong>
              Phase 1 user visibility
            </strong>

            <p>
              This view shows basic authenticated
              account information only. More detailed
              activity and user management can be
              added later as the platform grows.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(
  name: string,
  email: string | null
) {
  const source =
    name?.trim() ||
    email?.trim() ||
    "U";

  const parts = source
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return (
      `${parts[0][0]}${parts[1][0]}`
    ).toUpperCase();
  }

  return source
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatProvider(provider: string) {
  if (!provider) {
    return "Account";
  }

  if (provider.toLowerCase() === "google") {
    return "Google";
  }

  return (
    provider.charAt(0).toUpperCase() +
    provider.slice(1)
  );
}