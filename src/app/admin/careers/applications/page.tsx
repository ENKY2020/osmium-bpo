"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import styles from "./page.module.css";

type Application = {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  cover_message: string | null;
  cv_file_path: string | null;
  cv_file_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
};

type Job = {
  id: string;
  title: string;
  slug: string;
};

const supabase = createClient();

const STATUS_OPTIONS = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "selected",
  "rejected",
  "hired",
];

function formatStatus(status: string | null) {
  if (!status) return "New";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [cvLoadingId, setCvLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      setError("");

      const [applicationsResult, jobsResult] = await Promise.all([
        supabase
          .from("job_applications")
          .select(
            `
              id,
              job_id,
              name,
              email,
              phone,
              cover_message,
              cv_file_path,
              cv_file_name,
              status,
              created_at,
              updated_at
            `
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("jobs")
          .select("id, title, slug"),
      ]);

      if (applicationsResult.error) {
        console.error("Applications loading error:", applicationsResult.error);
        throw new Error("Could not load applications.");
      }

      if (jobsResult.error) {
        console.error("Jobs loading error:", jobsResult.error);
        throw new Error("Could not load job information.");
      }

      setApplications(applicationsResult.data || []);
      setJobs(jobsResult.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading applications."
      );
    } finally {
      setLoading(false);
    }
  }

  const jobMap = useMemo(() => {
    const map = new Map<string, Job>();

    jobs.forEach((job) => {
      map.set(job.id, job);
    });

    return map;
  }, [jobs]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applications.filter((application) => {
      const job = jobMap.get(application.job_id);

      const matchesSearch =
        !query ||
        application.name.toLowerCase().includes(query) ||
        application.email.toLowerCase().includes(query) ||
        application.phone.toLowerCase().includes(query) ||
        job?.title?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (application.status || "new").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, jobMap, search, statusFilter]);

  const newCount = applications.filter(
    (application) => !application.status || application.status === "new"
  ).length;

  const reviewingCount = applications.filter(
    (application) => application.status === "reviewing"
  ).length;

  const shortlistedCount = applications.filter(
    (application) => application.status === "shortlisted"
  ).length;

  /*
   * Generate a temporary signed URL for the private CV bucket.
   *
   * The bucket remains private.
   * The URL only works temporarily.
   */
  async function getCvUrl(application: Application) {
    if (!application.cv_file_path) {
      alert("This application does not have a CV attached.");
      return null;
    }

    try {
      setCvLoadingId(application.id);

      const { data, error } = await supabase.storage
        .from("job-applications")
        .createSignedUrl(application.cv_file_path, 300);

      if (error || !data?.signedUrl) {
        console.error("CV URL error:", error);
        throw new Error("Could not create a secure CV link.");
      }

      return data.signedUrl;
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not open the applicant CV."
      );

      return null;
    } finally {
      setCvLoadingId(null);
    }
  }

  async function viewCv(application: Application) {
    const url = await getCvUrl(application);

    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function downloadCv(application: Application) {
    const url = await getCvUrl(application);

    if (!url) return;

    const link = document.createElement("a");

    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = application.cv_file_name || "candidate-cv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function updateStatus(
    application: Application,
    newStatus: string
  ) {
    try {
      setBusyId(application.id);
      setError("");

      const { error } = await supabase
        .from("job_applications")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) {
        console.error("Status update error:", error);
        throw new Error("Could not update application status.");
      }

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not update application status."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteApplication(application: Application) {
    const confirmed = window.confirm(
      `Delete the application from ${application.name}?\n\nThis will remove the application record.`
    );

    if (!confirmed) return;

    try {
      setBusyId(application.id);
      setError("");

      /*
       * Delete the CV first when a path exists.
       * The storage bucket is private, so the admin needs
       * the authenticated DELETE policy to perform this.
       */
      if (application.cv_file_path) {
        const { error: storageError } = await supabase.storage
          .from("job-applications")
          .remove([application.cv_file_path]);

        if (storageError) {
          console.warn(
            "CV deletion warning:",
            storageError
          );
        }
      }

      const { error: applicationError } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", application.id);

      if (applicationError) {
        console.error(
          "Application deletion error:",
          applicationError
        );

        throw new Error("Could not delete the application.");
      }

      setApplications((current) =>
        current.filter((item) => item.id !== application.id)
      );
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Could not delete the application."
      );
    } finally {
      setBusyId(null);
    }
  }

  function emailApplicant(application: Application) {
    const subject = encodeURIComponent(
      "Your Osmium BPO Job Application"
    );

    const body = encodeURIComponent(
      `Hello ${application.name},\n\nThank you for your interest in joining Osmium BPO.\n\nRegards,\nOsmium BPO`
    );

    window.location.href = `mailto:${application.email}?subject=${subject}&body=${body}`;
  }

  function callApplicant(application: Application) {
    window.location.href = `tel:${application.phone}`;
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <div className={styles.eyebrow}>
              <span />
              OSMIUM BPO · RECRUITMENT
            </div>

            <h1>Applications.</h1>

            <p>
              Manage candidates, review CVs, contact applicants and move
              people through the recruitment pipeline.
            </p>
          </div>

          <Link href="/admin/careers" className={styles.backLink}>
            ← Back to careers
          </Link>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span>Total applications</span>
            <strong>{applications.length}</strong>
            <small>All received applications</small>
          </div>

          <div className={`${styles.summaryCard} ${styles.newCard}`}>
            <span>New</span>
            <strong>{newCount}</strong>
            <small>Awaiting review</small>
          </div>

          <div className={styles.summaryCard}>
            <span>Reviewing</span>
            <strong>{reviewingCount}</strong>
            <small>Currently being assessed</small>
          </div>

          <div className={styles.summaryCard}>
            <span>Shortlisted</span>
            <strong>{shortlistedCount}</strong>
            <small>Moving forward</small>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarTitle}>
            <span className={styles.sectionLabel}>
              CANDIDATE PIPELINE
            </span>

            <h2>Applications received</h2>
          </div>

          <button
            type="button"
            onClick={loadApplications}
            className={styles.refreshButton}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search name, email or position..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={styles.statusFilter}
          >
            <option value="all">All statuses</option>

            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className={styles.errorBox}>
            <strong>Could not load applications</strong>
            <p>{error}</p>

            <button type="button" onClick={loadApplications}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.loader} />

            <h3>Loading applications...</h3>

            <p>Fetching the latest candidates.</p>
          </div>
        ) : !error && filteredApplications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>✓</div>

            <span className={styles.sectionLabel}>
              NO APPLICATIONS FOUND
            </span>

            <h3>
              {applications.length === 0
                ? "Your candidate inbox is empty."
                : "No applications match your filters."}
            </h3>

            <p>
              {applications.length === 0
                ? "When someone applies for an Osmium BPO role, their application will appear here."
                : "Try clearing the search or selecting a different status."}
            </p>
          </div>
        ) : (
          <div className={styles.applicationList}>
            {filteredApplications.map((application) => {
              const job = jobMap.get(application.job_id);
              const status = application.status || "new";
              const isBusy = busyId === application.id;
              const isCvLoading = cvLoadingId === application.id;

              return (
                <article
                  key={application.id}
                  className={styles.applicationCard}
                >
                  {/* APPLICANT */}
                  <div className={styles.applicantIdentity}>
                    <div className={styles.avatar}>
                      {application.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{application.name}</h3>

                      <p>{application.email}</p>

                      <span>{application.phone}</span>
                    </div>
                  </div>

                  {/* POSITION */}
                  <div className={styles.applicationRole}>
                    <span className={styles.label}>
                      APPLIED FOR
                    </span>

                    <strong>
                      {job?.title || "Position unavailable"}
                    </strong>

                    <span className={styles.date}>
                      Applied {formatDate(application.created_at)}
                    </span>
                  </div>

                  {/* CV */}
                  <div className={styles.applicationCv}>
                    <span className={styles.label}>
                      CV / RESUME
                    </span>

                    <div className={styles.cvFile}>
                      <span className={styles.fileIcon}>
                        PDF
                      </span>

                      <div>
                        <strong>
                          {application.cv_file_name ||
                            "CV attached"}
                        </strong>

                        <small>
                          {application.cv_file_path
                            ? "Secure CV available"
                            : "No file recorded"}
                        </small>
                      </div>
                    </div>

                    {application.cv_file_path && (
                      <div className={styles.cvActions}>
                        <button
                          type="button"
                          onClick={() => viewCv(application)}
                          disabled={isCvLoading}
                          className={styles.smallAction}
                        >
                          {isCvLoading ? "Opening..." : "View CV"}
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadCv(application)}
                          disabled={isCvLoading}
                          className={`${styles.smallAction} ${styles.downloadAction}`}
                        >
                          Download
                        </button>
                      </div>
                    )}
                  </div>

                  {/* STATUS */}
                  <div className={styles.applicationStatus}>
                    <span className={styles.label}>
                      STATUS
                    </span>

                    <span
                      className={`${styles.statusBadge} ${
                        styles[`status_${status}`] || ""
                      }`}
                    >
                      <span />
                      {formatStatus(status)}
                    </span>

                    <select
                      value={status}
                      disabled={isBusy}
                      onChange={(event) =>
                        updateStatus(
                          application,
                          event.target.value
                        )
                      }
                      className={styles.statusSelect}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {formatStatus(option)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ACTIONS */}
                  <div className={styles.applicationAction}>
                    <div className={styles.contactActions}>
                      <button
                        type="button"
                        onClick={() =>
                          emailApplicant(application)
                        }
                        className={styles.contactButton}
                        title="Email applicant"
                      >
                        ✉ Email
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          callApplicant(application)
                        }
                        className={styles.contactButton}
                        title="Call applicant"
                      >
                        ☎ Call
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteApplication(application)
                      }
                      disabled={isBusy}
                      className={styles.deleteButton}
                    >
                      {isBusy ? "Working..." : "Delete"}
                    </button>
                  </div>

                  {/* COVER MESSAGE */}
                  {application.cover_message && (
                    <div className={styles.coverMessage}>
                      <span className={styles.label}>
                        COVER MESSAGE
                      </span>

                      <p>{application.cover_message}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {!loading &&
          !error &&
          filteredApplications.length > 0 && (
            <div className={styles.resultCount}>
              Showing{" "}
              <strong>{filteredApplications.length}</strong>{" "}
              {filteredApplications.length === 1
                ? "application"
                : "applications"}
            </div>
          )}
      </section>
    </main>
  );
}