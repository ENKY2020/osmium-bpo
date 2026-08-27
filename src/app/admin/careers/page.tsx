"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase/client";
import  "./career.css";

/* ============================================================
   TYPES
============================================================ */

type JobStatus = "draft" | "published" | "closed";

type Job = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string | null;
  employment_type: string | null;
  requirements: string[] | null;
  skills: string[] | null;
  status: JobStatus | string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type JobForm = {
  title: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  skills: string;
  status: JobStatus;
};

const EMPTY_FORM: JobForm = {
  title: "",
  location: "",
  employment_type: "Full-time",
  description: "",
  requirements: "",
  skills: "",
  status: "published",
};

const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Internship",
  "Remote",
];

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normaliseStatus(value?: string | null): JobStatus {
  const status = String(value || "").toLowerCase();

  if (status === "published") return "published";
  if (status === "closed") return "closed";

  return "draft";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function textToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToText(value?: string[] | null) {
  if (!value || !Array.isArray(value)) return "";

  return value.join("\n");
}

/* ============================================================
   PAGE
============================================================ */

export default function AdminCareersPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

  const [jobs, setJobs] = useState<Job[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] =
    useState<Job | null>(null);

  const [form, setForm] =
    useState<JobForm>(EMPTY_FORM);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "closed"
  >("all");

  /* ============================================================
     ADMIN VERIFICATION
  ============================================================ */

  const verifyAdmin = useCallback(async () => {
    const { data, error: rpcError } =
      await supabase.rpc("is_osmium_admin");

    if (rpcError) {
      console.error(
        "Admin verification failed:",
        rpcError
      );

      throw new Error(
        "Unable to verify administrator access."
      );
    }

    return data === true;
  }, []);

   /* ============================================================
     LOAD JOBS
  ============================================================ */

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) {
        router.replace("/admin");
        return;
      }

      const {
        data,
        error: jobsError,
      } = await supabase
        .from("jobs")
        .select(
          `
            id,
            title,
            slug,
            description,
            location,
            employment_type,
            requirements,
            skills,
            status,
            published_at,
            created_at,
            updated_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (jobsError) {
        console.error(
          "Jobs loading error:",
          jobsError
        );

        throw new Error(jobsError.message);
      }

      setJobs((data || []) as Job[]);
    } catch (err: unknown) {
      console.error(
        "Careers admin loading error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't load the jobs right now."
      );
    } finally {
      setLoading(false);
    }
  }, [router, verifyAdmin]);

  useEffect(() => {
    if (!authLoading && user) {
      loadJobs();
    }
  }, [
    authLoading,
    user,
    loadJobs,
  ]);

  /* ============================================================
     FORM
  ============================================================ */

  function openCreateForm() {
    setEditingJob(null);
    setForm(EMPTY_FORM);

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(job: Job) {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      location: job.location || "",
      employment_type:
        job.employment_type || "Full-time",
      description: job.description || "",
      requirements: arrayToText(
        job.requirements
      ),
      skills: arrayToText(
        job.skills
      ),
      status: normaliseStatus(
        job.status
      ),
    });

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingJob(null);
    setForm(EMPTY_FORM);
  }

  function updateField<K extends keyof JobForm>(
    field: K,
    value: JobForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* ============================================================
     CREATE / UPDATE JOB
  ============================================================ */

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) {
        throw new Error(
          "You are not authorised to manage jobs."
        );
      }

      if (!form.title.trim()) {
        throw new Error(
          "Please enter a job title."
        );
      }

      if (!form.description.trim()) {
        throw new Error(
          "Please enter a job description."
        );
      }

      const slug = slugify(
        form.title
      );

      if (!slug) {
        throw new Error(
          "A valid job title is required to create the job URL."
        );
      }

      const requirements =
        textToArray(
          form.requirements
        );

      const skills =
        textToArray(
          form.skills
        );

      const publishedAt =
        form.status === "published"
          ? editingJob?.published_at ||
            new Date().toISOString()
          : null;

      const payload = {
        title: form.title.trim(),

        slug,

        description:
          form.description.trim(),

        location:
          form.location.trim() || null,

        employment_type:
          form.employment_type ||
          null,

        requirements,

        skills,

        status: form.status,

        published_at:
          publishedAt,
      };

      /* --------------------------------------------------------
         UPDATE
      -------------------------------------------------------- */

      if (editingJob) {
        const {
          error: updateError,
        } = await supabase
          .from("jobs")
          .update(payload)
          .eq(
            "id",
            editingJob.id
          );

        if (updateError) {
          console.error(
            "Job update error:",
            updateError
          );

          throw new Error(
            updateError.message
          );
        }

        setSuccess(
          form.status === "published"
            ? "Job updated and published successfully."
            : form.status === "closed"
              ? "Job closed successfully."
              : "Job saved as a draft."
        );
      }

      /* --------------------------------------------------------
         CREATE
      -------------------------------------------------------- */

      else {
        const {
          error: insertError,
        } = await supabase
          .from("jobs")
          .insert(payload);

        if (insertError) {
          console.error(
            "Job creation error:",
            insertError
          );

          throw new Error(
            insertError.message
          );
        }

        setSuccess(
          form.status === "published"
            ? "Job created and published successfully."
            : form.status === "closed"
              ? "Job created as closed."
              : "Job created as a draft."
        );
      }

      setShowForm(false);
      setEditingJob(null);
      setForm(EMPTY_FORM);

      await loadJobs();
    } catch (err: unknown) {
      console.error(
        "Job save failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save this job."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function handleDelete(
    job: Job
  ) {
    const confirmed =
      window.confirm(
        `Delete "${job.title || "this job"}"?\n\nThis cannot be undone.`
      );

    if (!confirmed) return;

    setDeletingId(job.id);
    setError("");
    setSuccess("");

    try {
      const isAdmin =
        await verifyAdmin();

      if (!isAdmin) {
        throw new Error(
          "You are not authorised to delete jobs."
        );
      }

      const {
        error: deleteError,
      } = await supabase
        .from("jobs")
        .delete()
        .eq(
          "id",
          job.id
        );

      if (deleteError) {
        console.error(
          "Job deletion error:",
          deleteError
        );

        throw new Error(
          deleteError.message
        );
      }

      setJobs((current) =>
        current.filter(
          (item) =>
            item.id !== job.id
        )
      );

      setSuccess(
        "Job deleted successfully."
      );
    } catch (err: unknown) {
      console.error(
        "Job deletion failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't delete this job."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ============================================================
     QUICK STATUS CHANGE
  ============================================================ */

  async function changeStatus(
    job: Job,
    status: JobStatus
  ) {
    if (
      normaliseStatus(job.status) ===
      status
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const isAdmin =
        await verifyAdmin();

      if (!isAdmin) {
        throw new Error(
          "You are not authorised to update jobs."
        );
      }

      const publishedAt =
        status === "published"
          ? job.published_at ||
            new Date().toISOString()
          : null;

      const {
        error: updateError,
      } = await supabase
        .from("jobs")
        .update({
          status,
          published_at:
            publishedAt,
        })
        .eq(
          "id",
          job.id
        );

      if (updateError) {
        console.error(
          "Status update error:",
          updateError
        );

        throw new Error(
          updateError.message
        );
      }

      setJobs((current) =>
        current.map(
          (item) =>
            item.id === job.id
              ? {
                  ...item,
                  status,
                  published_at:
                    publishedAt,
                }
              : item
        )
      );

      if (status === "published") {
        setSuccess(
          "Job published successfully."
        );
      } else if (status === "closed") {
        setSuccess(
          "Job closed successfully."
        );
      } else {
        setSuccess(
          "Job moved to draft."
        );
      }
    } catch (err: unknown) {
      console.error(
        "Status change failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "We couldn't update the job status."
      );
    }
  }
  /* ============================================================
     FILTERED JOBS
  ============================================================ */

  const filteredJobs =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return jobs.filter(
        (job) => {
          const status =
            normaliseStatus(
              job.status
            );

          const matchesStatus =
            filter === "all" ||
            status === filter;

          if (!matchesStatus) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable = [
            job.title,
            job.slug,
            job.location,
            job.employment_type,
            job.description,
            ...(job.skills || []),
            ...(job.requirements || []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      jobs,
      search,
      filter,
    ]);

  /* ============================================================
     STATS
  ============================================================ */

  const stats =
    useMemo(() => {
      return {
        total: jobs.length,

        published:
          jobs.filter(
            (job) =>
              normaliseStatus(
                job.status
              ) === "published"
          ).length,

        drafts:
          jobs.filter(
            (job) =>
              normaliseStatus(
                job.status
              ) === "draft"
          ).length,

        closed:
          jobs.filter(
            (job) =>
              normaliseStatus(
                job.status
              ) === "closed"
          ).length,
      };
    }, [jobs]);

  /* ============================================================
     AUTH / INITIAL LOADING
  ============================================================ */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="admin-page careers-admin-page">
        <header className="admin-page-header">
          <div>
            <span className="admin-eyebrow">
              OSMIUM BPO · OPERATIONS
            </span>

            <h1>Careers</h1>

            <p>
              Loading the careers
              operations room...
            </p>
          </div>
        </header>

        <div className="admin-loading-card">
          <div className="admin-spinner" />

          <p>
            Loading jobs...
          </p>
        </div>
      </main>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <main className="admin-page careers-admin-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="admin-page-header careers-header">
        <div>
          <span className="admin-eyebrow">
            OSMIUM BPO · OPERATIONS
          </span>

          <h1>Careers</h1>

          <p>
            Create, publish and manage
            the jobs appearing on the
            Osmium BPO careers page.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-secondary-button"
            onClick={loadJobs}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={
              openCreateForm
            }
          >
            + Add new job
          </button>
        </div>
      </header>

      {/* ======================================================
          FEEDBACK
      ====================================================== */}

      {error && (
        <div className="admin-alert admin-alert-error">
          <strong>
            Something went wrong
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success">
          <strong>
            Done
          </strong>

          <span>
            {success}
          </span>
        </div>
      )}

      {/* ======================================================
          STATS
      ====================================================== */}

      <section className="admin-stats-grid careers-stats">

        <article className="admin-stat-card">
          <span>
            Total jobs
          </span>

          <strong>
            {stats.total}
          </strong>

          <small>
            All jobs in the system
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Published
          </span>

          <strong>
            {stats.published}
          </strong>

          <small>
            Visible on careers
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Drafts
          </span>

          <strong>
            {stats.drafts}
          </strong>

          <small>
            Not currently public
          </small>
        </article>

        <article className="admin-stat-card">
          <span>
            Closed
          </span>

          <strong>
            {stats.closed}
          </strong>

          <small>
            No further action
          </small>
        </article>

      </section>

      {/* ======================================================
          CREATE / EDIT
      ====================================================== */}

      {showForm && (
        <section className="admin-panel careers-form-panel">

          <div className="admin-panel-header">

            <div>
              <span className="admin-eyebrow">
                {editingJob
                  ? "EDIT JOB"
                  : "NEW JOB"}
              </span>

              <h2>
                {editingJob
                  ? "Edit job listing"
                  : "Create a new job"}
              </h2>

              <p>
                Add the essentials now.
                We can expand recruitment
                features later.
              </p>
            </div>

            <button
              type="button"
              className="admin-icon-button"
              onClick={
                closeForm
              }
              aria-label="Close form"
            >
              ×
            </button>

          </div>

          <form
            className="careers-job-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="careers-form-grid">

              {/* TITLE */}

              <label className="admin-field careers-field-wide">
                <span>
                  Job title *
                </span>

                <input
                  type="text"
                  value={
                    form.title
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Customer Support Representative"
                  required
                />
              </label>

              {/* LOCATION */}

              <label className="admin-field">
                <span>
                  Location
                </span>

                <input
                  type="text"
                  value={
                    form.location
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "location",
                      event.target.value
                    )
                  }
                  placeholder="Nairobi / Remote"
                />
              </label>

              {/* EMPLOYMENT TYPE */}

              <label className="admin-field">
                <span>
                  Employment type
                </span>

                <select
                  value={
                    form.employment_type
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "employment_type",
                      event.target.value
                    )
                  }
                >
                  {EMPLOYMENT_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>
              </label>

              {/* STATUS */}

              <label className="admin-field">
                <span>
                  Job status
                </span>

                <select
                  value={
                    form.status
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "status",
                      event.target.value as JobStatus
                    )
                  }
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="closed">
                    Closed
                  </option>
                </select>
              </label>

              {/* SLUG PREVIEW */}

              <div className="admin-field careers-slug-preview">
                <span>
                  Public URL slug
                </span>

                <div className="careers-slug-box">
                  {slugify(
                    form.title
                  ) || "job-title"}
                </div>
              </div>

              {/* DESCRIPTION */}

              <label className="admin-field careers-field-wide">
                <span>
                  Description *
                </span>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe the role, responsibilities and what the successful candidate will do."
                  rows={7}
                  required
                />
              </label>

              {/* REQUIREMENTS */}

              <label className="admin-field">
                <span>
                  Requirements
                </span>

                <small>
                  Put each requirement
                  on a new line.
                </small>

                <textarea
                  value={
                    form.requirements
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "requirements",
                      event.target.value
                    )
                  }
                  placeholder={`Good communication skills
Sales experience
Customer service experience`}
                  rows={7}
                />
              </label>

              {/* SKILLS */}

              <label className="admin-field">
                <span>
                  Skills
                </span>

                <small>
                  Put each skill on a
                  new line.
                </small>

                <textarea
                  value={
                    form.skills
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "skills",
                      event.target.value
                    )
                  }
                  placeholder={`Cold calling
Customer support
CRM
Communication`}
                  rows={7}
                />
              </label>

            </div>

            {/* PUBLISH STATUS */}

            <div className="careers-publish-box">

              <div>
                <strong>
                  {form.status ===
                  "published"
                    ? "Publish this job"
                    : form.status ===
                        "closed"
                      ? "Close this job"
                      : "Save as draft"}
                </strong>

                <p>
                  {form.status ===
                  "published"
                    ? "The job will be available on the public Careers page."
                    : form.status ===
                        "closed"
                      ? "The job will no longer be treated as an active vacancy."
                      : "The job will remain private until you publish it."}
                </p>
              </div>

              <div className="careers-status-indicator">
                <span
                  className={`career-status career-status-${form.status}`}
                >
                  {form.status}
                </span>
              </div>

            </div>

            {/* FORM ACTIONS */}

            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={
                  saving
                }
              >
                {saving
                  ? "Saving..."
                  : editingJob
                    ? "Save changes"
                    : form.status ===
                        "published"
                      ? "Create & publish"
                      : form.status ===
                          "closed"
                        ? "Create closed job"
                        : "Create draft"}
              </button>

            </div>

          </form>
        </section>
      )}

      {/* ======================================================
          JOB LISTINGS
      ====================================================== */}

      <section className="admin-panel careers-management-panel">

        <div className="admin-panel-header">

          <div>
            <span className="admin-eyebrow">
              PHASE 1 OPERATIONS
            </span>

            <h2>
              Job listings
            </h2>

            <p>
              Manage what candidates
              see and keep your
              recruitment pipeline
              organised.
            </p>
          </div>

          <span className="admin-result-count">
            {filteredJobs.length}{" "}
            {filteredJobs.length ===
            1
              ? "job"
              : "jobs"}
          </span>

        </div>

        {/* FILTERS */}

        <div className="admin-filter-bar careers-filter-bar">

          <div className="admin-search">
            <span>
              ⌕
            </span>

            <input
              type="search"
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search jobs..."
            />
          </div>

          <select
            value={
              filter
            }
            onChange={(
              event
            ) =>
              setFilter(
                event.target.value as
                  | "all"
                  | "published"
                  | "draft"
                  | "closed"
              )
            }
            className="admin-filter-select"
          >
            <option value="all">
              All jobs
            </option>

            <option value="published">
              Published
            </option>

            <option value="draft">
              Drafts
            </option>

            <option value="closed">
              Closed
            </option>
          </select>

        </div>

        {/* EMPTY */}

        {!filteredJobs.length && (
          <div className="admin-empty-state careers-empty-state">

            <div className="admin-empty-icon">
              ▣
            </div>

            <h3>
              {jobs.length
                ? "No matching jobs"
                : "No jobs yet"}
            </h3>

            <p>
              {jobs.length
                ? "Try changing your search or filter."
                : "Create your first job listing to start the Careers workflow."}
            </p>

            {!jobs.length && (
              <button
                type="button"
                className="admin-primary-button"
                onClick={
                  openCreateForm
                }
              >
                + Create first job
              </button>
            )}

          </div>
        )}

        {/* JOB LIST */}

        {filteredJobs.length >
          0 && (
            <div className="careers-job-list">

              {filteredJobs.map(
                (job) => {
                  const status =
                    normaliseStatus(
                      job.status
                    );

                  return (
                    <article
                      key={
                        job.id
                      }
                      className="career-job-row"
                    >

                      <div className="career-job-main">

                        <div className="career-job-title-row">

                          <div>
                            <h3>
                              {job.title ||
                                "Untitled job"}
                            </h3>

                            <span className="career-job-slug">
                              /careers/
                              {job.slug}
                            </span>
                          </div>

                          <span
                            className={`career-status career-status-${status}`}
                          >
                            {status}
                          </span>

                        </div>

                        <div className="career-job-meta">

                          {job.location && (
                            <span>
                              📍{" "}
                              {
                                job.location
                              }
                            </span>
                          )}

                          {job.employment_type && (
                            <span>
                              {
                                job.employment_type
                              }
                            </span>
                          )}

                          <span>
                            Created{" "}
                            {formatDate(
                              job.created_at
                            )}
                          </span>

                          {job.published_at && (
                            <span>
                              Published{" "}
                              {formatDate(
                                job.published_at
                              )}
                            </span>
                          )}

                        </div>

                        {job.description && (
                          <p className="career-job-description">
                            {job.description.length >
                            240
                              ? `${job.description.slice(
                                  0,
                                  240
                                )}...`
                              : job.description}
                          </p>
                        )}

                        {job.skills &&
                          job.skills.length >
                            0 && (
                            <div className="career-job-tags">
                              {job.skills
                                .slice(
                                  0,
                                  5
                                )
                                .map(
                                  (
                                    skill
                                  ) => (
                                    <span
                                      key={
                                        skill
                                      }
                                    >
                                      {
                                        skill
                                      }
                                    </span>
                                  )
                                )}
                            </div>
                          )}

                      </div>

                      <div className="career-job-actions">

                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() =>
                            changeStatus(
                              job,
                              status ===
                                "published"
                                ? "draft"
                                : "published"
                            )
                          }
                        >
                          {status ===
                          "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        {status !==
                          "closed" && (
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() =>
                              changeStatus(
                                job,
                                "closed"
                              )
                            }
                          >
                            Close
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() =>
                            openEditForm(
                              job
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-danger-button"
                          onClick={() =>
                            handleDelete(
                              job
                            )
                          }
                          disabled={
                            deletingId ===
                            job.id
                          }
                        >
                          {deletingId ===
                          job.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

      </section>

      {/* ======================================================
          PHASE 1 NOTE
      ====================================================== */}

      <section className="admin-operation-note">

        <div className="admin-operation-note-icon">
          ✓
        </div>

        <div>
          <strong>
            Phase 1 recruitment workflow
          </strong>

          <p>
            Create the vacancy →
            publish it → receive
            applications → review
            candidates → follow up.
            We are deliberately keeping
            this operational rather than
            turning it into a full ATS yet.
          </p>
        </div>

      </section>

    </main>
  );
}