"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

import "./admin.css";

/* =========================================================
   TYPES
========================================================= */

type EnquiryStatus =
  | "new"
  | "contacted"
  | "in-discussion"
  | "converted"
  | "closed";

type EnquiryStats = {
  total: number;
  new: number;
  contacted: number;
  inDiscussion: number;
  converted: number;
  closed: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_STATS: EnquiryStats = {
  total: 0,
  new: 0,
  contacted: 0,
  inDiscussion: 0,
  converted: 0,
  closed: 0,
};

const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  "in-discussion": "In Discussion",
  converted: "Converted",
  closed: "Closed",
};

/* =========================================================
   ADMIN PAGE
========================================================= */

export default function AdminPage() {
  const router = useRouter();

  const {
    user,
    loading,
    isAdmin,
    displayName,
    email,
    signOut,
  } = useAuth();

  const [enquiryStats, setEnquiryStats] =
    useState<EnquiryStats>(EMPTY_STATS);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [statsError, setStatsError] =
    useState("");

  /* =======================================================
     LOAD ENQUIRY STATISTICS
  ======================================================= */

  const loadEnquiryStats = useCallback(async () => {
    if (!user || !isAdmin) {
      return;
    }

    setStatsLoading(true);
    setStatsError("");

    try {
      /*
       * IMPORTANT:
       * Use the project's existing Supabase browser client.
       * Do not create a second /lib/supabase architecture.
       */

      const supabase = createClient();

      const { data, error } = await supabase
        .from("enquiries")
        .select("id, status");

      if (error) {
        console.error(
          "Osmium admin enquiry statistics error:",
          error
        );

        setStatsError(
          error.message ||
            "Unable to load enquiry statistics."
        );

        return;
      }

      const rows = data ?? [];

      const stats: EnquiryStats = {
        total: rows.length,

        new: rows.filter(
          (item) => item.status === "new"
        ).length,

        contacted: rows.filter(
          (item) => item.status === "contacted"
        ).length,

        inDiscussion: rows.filter(
          (item) =>
            item.status === "in-discussion"
        ).length,

        converted: rows.filter(
          (item) =>
            item.status === "converted"
        ).length,

        closed: rows.filter(
          (item) =>
            item.status === "closed"
        ).length,
      };

      setEnquiryStats(stats);
    } catch (error) {
      console.error(
        "Unexpected enquiry statistics error:",
        error
      );

      setStatsError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading enquiries."
      );
    } finally {
      setStatsLoading(false);
    }
  }, [user, isAdmin]);

  /* =======================================================
     ACCESS CONTROL
  ======================================================= */

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [
    loading,
    user,
    isAdmin,
    router,
  ]);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    if (!loading && user && isAdmin) {
      loadEnquiryStats();
    }
  }, [
    loading,
    user,
    isAdmin,
    loadEnquiryStats,
  ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="admin-loading">
        <div className="admin-loading-content">
          <p className="admin-eyebrow">
            OSMIUM BPO
          </p>

          <h1 className="admin-loading-title">
            Checking access...
          </h1>

          <p className="admin-loading-text">
            Securing your workspace.
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     UNAUTHORIZED
  ======================================================= */

  if (!user || !isAdmin) {
    return (
      <main className="admin-loading">
        <div className="admin-loading-content">
          <p className="admin-eyebrow">
            OSMIUM BPO
          </p>

          <h1 className="admin-loading-title">
            Access restricted
          </h1>

          <p className="admin-loading-text">
            Redirecting you...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="admin-page">
      <div className="admin-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="admin-header">
          <div className="admin-brand">

            <p className="admin-eyebrow">
              OSMIUM BPO · OPERATIONS
            </p>

            <h1 className="admin-title">
              Welcome back,{" "}
              {displayName || "Administrator"}
            </h1>

            <p className="admin-subtitle">
              Here&apos;s what&apos;s happening with
              your business today.
            </p>

          </div>

          <button
            type="button"
            className="admin-signout"
            onClick={signOut}
          >
            Sign out
          </button>
        </header>

        {/* =================================================
            ADMIN ACCOUNT
        ================================================= */}

        <section className="admin-account">

          <div>
            <p className="admin-account-label">
              ADMINISTRATOR
            </p>

            <h2 className="admin-account-name">
              {displayName ||
                "Osmium Administrator"}
            </h2>

            <p className="admin-account-email">
              {email || user.email}
            </p>
          </div>

          <div className="admin-account-check">
            ✓
          </div>

        </section>

        {/* =================================================
            MAIN STATISTICS
        ================================================= */}

        <section className="admin-stats">

          <StatCard
            label="Total Enquiries"
            value={enquiryStats.total}
            description="All website enquiries"
            loading={statsLoading}
          />

          <StatCard
            label="New Enquiries"
            value={enquiryStats.new}
            description="Need attention"
            loading={statsLoading}
          />

          <StatCard
            label="In Discussion"
            value={enquiryStats.inDiscussion}
            description="Active conversations"
            loading={statsLoading}
          />

          <StatCard
            label="Converted"
            value={enquiryStats.converted}
            description="Business opportunities"
            loading={statsLoading}
          />

        </section>

        {/* =================================================
            ENQUIRY PIPELINE
        ================================================= */}

        <section className="admin-pipeline">

          <div className="admin-section-heading">

            <div>
              <p className="admin-eyebrow">
                PHASE 1 OPERATIONS
              </p>

              <h2 className="admin-section-title">
                Enquiry Pipeline
              </h2>

              <p className="admin-section-description">
                Track website enquiries from first
                contact through conversion or closure.
              </p>
            </div>

            <button
              type="button"
              className="admin-outline-button"
              onClick={() =>
                router.push("/admin/enquiries")
              }
            >
              Open Enquiries
            </button>

          </div>

          {statsError && (
            <div className="admin-error">

              <div>
                <strong>
                  Enquiry data unavailable
                </strong>

                <span>
                  {statsError}
                </span>
              </div>

              <button
                type="button"
                onClick={loadEnquiryStats}
              >
                Try again
              </button>

            </div>
          )}

          <div className="admin-pipeline-grid">

            <PipelineItem
              status="new"
              value={enquiryStats.new}
              description="Awaiting first response"
            />

            <PipelineItem
              status="contacted"
              value={enquiryStats.contacted}
              description="Initial contact made"
            />

            <PipelineItem
              status="in-discussion"
              value={enquiryStats.inDiscussion}
              description="Active conversation"
            />

            <PipelineItem
              status="converted"
              value={enquiryStats.converted}
              description="Opportunity converted"
            />

            <PipelineItem
              status="closed"
              value={enquiryStats.closed}
              description="No further action"
            />

          </div>

        </section>

        {/* =================================================
            MANAGEMENT MODULES
        ================================================= */}

        <section className="admin-modules">

          <AdminModule
            icon="◈"
            title="Website"
            description="Manage homepage content, services, company information and website sections."
            onClick={() =>
              router.push("/admin/website")
            }
          />

          <AdminModule
            icon="▣"
            title="Careers"
            description="Create jobs, review applications and manage applicant progress."
            onClick={() =>
              router.push("/admin/careers")
            }
          />

          <AdminModule
            icon="✉"
            title="Enquiries"
            description="Review consultation requests, respond to prospects and track enquiry progress."
            badge={
              statsLoading
                ? undefined
                : `${enquiryStats.total} ${
                    enquiryStats.total === 1
                      ? "enquiry"
                      : "enquiries"
                  }`
            }
            onClick={() =>
              router.push("/admin/enquiries")
            }
          />

          <AdminModule
            icon="◎"
            title="Users"
            description="View authenticated users and manage access as the system grows."
            onClick={() =>
              router.push("/admin/users")
            }
          />

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="admin-quick-actions">

          <button
            type="button"
            className="admin-action"
            onClick={() =>
              router.push("/admin/careers")
            }
          >
            + Add New Job
          </button>

          <button
            type="button"
            className="admin-action"
            onClick={() =>
              router.push("/admin/enquiries")
            }
          >
            View Enquiries
          </button>

          <button
            type="button"
            className="admin-action"
            onClick={() =>
              router.push(
                "/admin/careers/applications"
              )
            }
          >
            View Applications
          </button>

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  loading,
}: {
  label: string;
  value: number;
  description: string;
  loading: boolean;
}) {
  return (
    <div className="admin-stat">

      <p className="admin-stat-label">
        {label}
      </p>

      <p className="admin-stat-number">
        {loading ? "..." : value}
      </p>

      <p className="admin-stat-meta">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   PIPELINE ITEM
========================================================= */

function PipelineItem({
  status,
  value,
  description,
}: {
  status: EnquiryStatus;
  value: number;
  description: string;
}) {
  return (
    <button
      type="button"
      className={`admin-pipeline-item admin-status-${status}`}
      onClick={() =>
        window.location.href =
          `/admin/enquiries?status=${encodeURIComponent(
            status
          )}`
      }
    >

      <div className="admin-pipeline-top">

        <span className="admin-pipeline-label">
          {STATUS_LABELS[status]}
        </span>

        <span className="admin-pipeline-number">
          {value}
        </span>

      </div>

      <p className="admin-pipeline-description">
        {description}
      </p>

      <span className="admin-pipeline-link">
        View →
      </span>

    </button>
  );
}

/* =========================================================
   ADMIN MODULE
========================================================= */

function AdminModule({
  icon,
  title,
  description,
  badge,
  onClick,
}: {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="admin-card"
      onClick={onClick}
    >

      <div className="admin-card-icon">
        {icon}
      </div>

      <h3 className="admin-card-title">
        {title}
      </h3>

      <p className="admin-card-description">
        {description}
      </p>

      {badge && (
        <span className="admin-card-badge">
          {badge}
        </span>
      )}

    </button>
  );
}