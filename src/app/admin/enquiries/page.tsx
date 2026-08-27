"use client";

import "./enquiries.css";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import ActivityTimeline from "./ActivityTimeline";

const supabase = createClient();

/* =========================================================
   TYPES
========================================================= */

type EnquiryStatus =
  | "new"
  | "contacted"
  | "in_discussion"
  | "converted"
  | "closed";

type Enquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  enquiry_type: string | null;
  message: string;
  status: EnquiryStatus;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
};

/* =========================================================
   STATUS OPTIONS
========================================================= */

const STATUS_OPTIONS: EnquiryStatus[] = [
  "new",
  "contacted",
  "in_discussion",
  "converted",
  "closed",
];

/* =========================================================
   HELPERS
========================================================= */

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusClass(status: EnquiryStatus) {
  switch (status) {
    case "converted":
      return "enquiry-status enquiry-status-success";

    case "closed":
      return "enquiry-status enquiry-status-closed";

    case "contacted":
    case "in_discussion":
      return "enquiry-status enquiry-status-progress";

    case "new":
    default:
      return "enquiry-status enquiry-status-new";
  }
}

function getWhatsAppUrl(phone: string | null) {
  if (!phone) return "#";

  const cleanedPhone = phone.replace(/[^0-9]/g, "");

  return `https://wa.me/${cleanedPhone}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [updatingStatusId, setUpdatingStatusId] =
    useState<string | null>(null);

  const [savingNotesId, setSavingNotesId] =
    useState<string | null>(null);

  const [openDetails, setOpenDetails] =
    useState<string | null>(null);

  const [notesDraft, setNotesDraft] =
    useState<Record<string, string>>({});

  /* =========================================================
     LOAD ENQUIRIES
  ========================================================= */

  async function loadEnquiries(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const { data, error: fetchError } = await supabase
      .from("enquiries")
      .select(
        `
        id,
        name,
        company,
        email,
        phone,
        enquiry_type,
        message,
        status,
        internal_notes,
        created_at,
        updated_at
        `
      )
      .order("created_at", {
        ascending: false,
      });

    if (fetchError) {
      console.error(
        "Osmium enquiries load error:",
        fetchError
      );

      setError(
        `Could not load enquiries: ${fetchError.message}`
      );

      setEnquiries([]);
    } else {
      const rows = (data || []) as Enquiry[];

      setEnquiries(rows);

      const drafts: Record<string, string> = {};

      rows.forEach((enquiry) => {
        drafts[enquiry.id] = enquiry.internal_notes || "";
      });

      setNotesDraft(drafts);
    }

    setLoading(false);
    setRefreshing(false);
  }

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadEnquiries();
  }, []);

  /* =========================================================
     ACTIVITY LOGGER
     
     IMPORTANT:
     Activity history should never prevent the main
     enquiry operation from succeeding.
========================================================= */

  async function recordActivity({
    enquiryId,
    activityType,
    title,
    description,
    fromStatus,
    toStatus,
  }: {
    enquiryId: string;
    activityType: string;
    title: string;
    description: string;
    fromStatus?: EnquiryStatus | null;
    toStatus?: EnquiryStatus | null;
  }) {
    try {
      const {
        data: userData,
      } = await supabase.auth.getUser();

      const createdBy =
        userData.user?.id || null;

      const { error: activityError } =
        await supabase
          .from("enquiry_activities")
          .insert({
            enquiry_id: enquiryId,
            activity_type: activityType,
            title,
            description,
            from_status:
              fromStatus || null,
            to_status:
              toStatus || null,
            created_by: createdBy,
          });

      if (activityError) {
        console.error(
          "Osmium activity logging error:",
          activityError
        );
      }
    } catch (activityException) {
      console.error(
        "Osmium activity logging exception:",
        activityException
      );
    }
  }

  /* =========================================================
     STATUS UPDATE
========================================================= */

  async function updateStatus(
    enquiryId: string,
    newStatus: EnquiryStatus
  ) {
    if (updatingStatusId) return;

    const currentEnquiry = enquiries.find(
      (enquiry) => enquiry.id === enquiryId
    );

    if (!currentEnquiry) return;

    if (currentEnquiry.status === newStatus) {
      return;
    }

    const previousStatus =
      currentEnquiry.status;

    setUpdatingStatusId(enquiryId);
    setError("");
    setSuccess("");

    const now = new Date().toISOString();

    const { error: updateError } =
      await supabase
        .from("enquiries")
        .update({
          status: newStatus,
          updated_at: now,
        })
        .eq("id", enquiryId);

    if (updateError) {
      console.error(
        "Osmium enquiry status update error:",
        updateError
      );

      setError(
        `Could not update status: ${updateError.message}`
      );

      setUpdatingStatusId(null);
      return;
    }

    /* -------------------------------------------------------
       Update local UI immediately
    ------------------------------------------------------- */

    setEnquiries((current) =>
      current.map((enquiry) =>
        enquiry.id === enquiryId
          ? {
              ...enquiry,
              status: newStatus,
              updated_at: now,
            }
          : enquiry
      )
    );

    /* -------------------------------------------------------
       Record activity
    ------------------------------------------------------- */

    await recordActivity({
      enquiryId,
      activityType: "status_change",
      title: "Status changed",
      description: `Enquiry moved from ${formatStatus(
        previousStatus
      )} to ${formatStatus(newStatus)}.`,
      fromStatus: previousStatus,
      toStatus: newStatus,
    });

    setSuccess(
      `Enquiry marked as ${formatStatus(newStatus)}.`
    );

    setUpdatingStatusId(null);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  /* =========================================================
     SAVE INTERNAL NOTES
========================================================= */

  async function saveInternalNotes(
    enquiryId: string
  ) {
    if (savingNotesId) return;

    const currentEnquiry = enquiries.find(
      (enquiry) => enquiry.id === enquiryId
    );

    if (!currentEnquiry) return;

    const notes =
      notesDraft[enquiryId] || "";

    const cleanedNotes = notes.trim();

    /*
      Don't create pointless activity records
      if nothing actually changed.
    */

    const previousNotes =
      currentEnquiry.internal_notes || "";

    if (cleanedNotes === previousNotes.trim()) {
      setSuccess("No note changes to save.");

      window.setTimeout(() => {
        setSuccess("");
      }, 2500);

      return;
    }

    setSavingNotesId(enquiryId);
    setError("");
    setSuccess("");

    const now = new Date().toISOString();

    const { error: updateError } =
      await supabase
        .from("enquiries")
        .update({
          internal_notes:
            cleanedNotes || null,
          updated_at: now,
        })
        .eq("id", enquiryId);

    if (updateError) {
      console.error(
        "Osmium internal notes update error:",
        updateError
      );

      setError(
        `Could not save internal notes: ${updateError.message}`
      );

      setSavingNotesId(null);
      return;
    }

    /* -------------------------------------------------------
       Update local UI
    ------------------------------------------------------- */

    setEnquiries((current) =>
      current.map((enquiry) =>
        enquiry.id === enquiryId
          ? {
              ...enquiry,
              internal_notes:
                cleanedNotes || null,
              updated_at: now,
            }
          : enquiry
      )
    );

    /* -------------------------------------------------------
       Record activity
    ------------------------------------------------------- */

    await recordActivity({
      enquiryId,
      activityType: "note",
      title: "Internal note added",
      description:
        cleanedNotes ||
        "Internal note was cleared.",
    });

    setSuccess("Internal notes saved.");

    setSavingNotesId(null);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }

  /* =========================================================
     SEARCH + FILTER
========================================================= */

  const filteredEnquiries = useMemo(() => {
    const searchTerm =
      search.toLowerCase().trim();

    return enquiries.filter(
      (enquiry) => {
        const matchesSearch =
          !searchTerm ||
          enquiry.name
            .toLowerCase()
            .includes(searchTerm) ||
          enquiry.email
            .toLowerCase()
            .includes(searchTerm) ||
          (enquiry.company || "")
            .toLowerCase()
            .includes(searchTerm) ||
          (enquiry.phone || "")
            .toLowerCase()
            .includes(searchTerm) ||
          (enquiry.enquiry_type || "")
            .toLowerCase()
            .includes(searchTerm) ||
          enquiry.message
            .toLowerCase()
            .includes(searchTerm) ||
          (enquiry.internal_notes || "")
            .toLowerCase()
            .includes(searchTerm);

        const matchesStatus =
          statusFilter === "all" ||
          enquiry.status === statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    enquiries,
    search,
    statusFilter,
  ]);

  /* =========================================================
     COUNTS
========================================================= */

  const totalCount =
    enquiries.length;

  const newCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status === "new"
    ).length;

  const contactedCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status === "contacted"
    ).length;

  const discussionCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status === "in_discussion"
    ).length;

  const convertedCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status === "converted"
    ).length;

  const closedCount =
    enquiries.filter(
      (enquiry) =>
        enquiry.status === "closed"
    ).length;

  /* =========================================================
     PAGE
========================================================= */

  return (
    <main className="enquiries-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="enquiries-header">

        <div>
          <div className="enquiries-eyebrow">
            OSMIUM BPO · OPERATIONS
          </div>

          <h1>Enquiries</h1>

          <p>
            Review, respond to and track
            consultation requests received
            through the Osmium website.
          </p>
        </div>

        <button
          type="button"
          className="enquiries-refresh"
          onClick={() =>
            loadEnquiries(true)
          }
          disabled={
            loading || refreshing
          }
        >
          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </header>

      {/* =====================================================
          FEEDBACK
      ===================================================== */}

      {success && (
        <div
          className="enquiries-success-message"
          role="status"
        >
          ✓ {success}
        </div>
      )}

      {error && (
        <div
          className="enquiries-error"
          role="alert"
        >
          <strong>
            Something went wrong
          </strong>

          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section className="enquiries-summary">

        <div className="enquiries-summary-card">
          <span>Total enquiries</span>
          <strong>{totalCount}</strong>
        </div>

        <div className="enquiries-summary-card">
          <span>New</span>
          <strong>{newCount}</strong>
        </div>

        <div className="enquiries-summary-card">
          <span>Contacted</span>
          <strong>{contactedCount}</strong>
        </div>

        <div className="enquiries-summary-card">
          <span>In discussion</span>
          <strong>{discussionCount}</strong>
        </div>

        <div className="enquiries-summary-card">
          <span>Converted</span>
          <strong>{convertedCount}</strong>
        </div>

        <div className="enquiries-summary-card">
          <span>Closed</span>
          <strong>{closedCount}</strong>
        </div>

      </section>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <section className="enquiries-toolbar">

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search enquiries..."
          aria-label="Search enquiries"
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          aria-label="Filter enquiries by status"
        >
          <option value="all">
            All statuses
          </option>

          {STATUS_OPTIONS.map(
            (status) => (
              <option
                key={status}
                value={status}
              >
                {formatStatus(status)}
              </option>
            )
          )}
        </select>

      </section>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="enquiries-empty">

          <div className="enquiries-loading-dot" />

          <h2>
            Loading enquiries...
          </h2>

          <p>
            Connecting to the
            Osmium operations database.
          </p>

        </div>

      ) : filteredEnquiries.length === 0 ? (

        /* ===================================================
           EMPTY
        =================================================== */

        <div className="enquiries-empty">

          <div className="enquiries-empty-icon">
            ✉
          </div>

          <h2>
            {enquiries.length === 0
              ? "No enquiries yet"
              : "No matching enquiries"}
          </h2>

          <p>
            {enquiries.length === 0
              ? "When someone contacts Osmium through the website, their enquiry will appear here."
              : "Try changing your search or status filter."}
          </p>

        </div>

      ) : (

        /* ===================================================
           ENQUIRY LIST
        =================================================== */

        <section className="enquiries-list">

          {filteredEnquiries.map(
            (enquiry) => {

              const isDetailsOpen =
                openDetails ===
                enquiry.id;

              const isUpdating =
                updatingStatusId ===
                enquiry.id;

              const isSavingNotes =
                savingNotesId ===
                enquiry.id;

              return (
                <article
                  className="enquiry-card"
                  key={enquiry.id}
                >

                  {/* =========================================
                     CARD HEADER
                  ========================================= */}

                  <div className="enquiry-card-top">

                    <div className="enquiry-person">

                      <div className="enquiry-avatar">
                        {enquiry.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <h2>
                          {enquiry.name}
                        </h2>

                        <a
                          href={`mailto:${enquiry.email}`}
                          className="enquiry-email"
                        >
                          {enquiry.email}
                        </a>

                      </div>

                    </div>

                    <span
                      className={getStatusClass(
                        enquiry.status
                      )}
                    >
                      {formatStatus(
                        enquiry.status
                      )}
                    </span>

                  </div>

                  {/* =========================================
                     MESSAGE
                  ========================================= */}

                  <div className="enquiry-message">
                    {enquiry.message}
                  </div>

                  {/* =========================================
                     META
                  ========================================= */}

                  <div className="enquiry-meta">

                    <span>
                      <strong>
                        Received:
                      </strong>{" "}
                      {formatDate(
                        enquiry.created_at
                      )}
                    </span>

                    {enquiry.phone && (
                      <span>
                        <strong>
                          Phone:
                        </strong>{" "}
                        {enquiry.phone}
                      </span>
                    )}

                    {enquiry.company && (
                      <span>
                        <strong>
                          Company:
                        </strong>{" "}
                        {enquiry.company}
                      </span>
                    )}

                    {enquiry.enquiry_type && (
                      <span>
                        <strong>
                          Interest:
                        </strong>{" "}
                        {formatStatus(
                          enquiry.enquiry_type
                        )}
                      </span>
                    )}

                  </div>

                  {/* =========================================
                     ACTIONS
                  ========================================= */}

                  <div className="enquiry-actions">

                    <a
                      href={`mailto:${enquiry.email}?subject=Re: Your enquiry to Osmium BPO`}
                      className="enquiry-action enquiry-action-primary"
                    >
                      ✉ Reply by email
                    </a>

                    {enquiry.phone && (
                      <a
                        href={`tel:${enquiry.phone}`}
                        className="enquiry-action"
                      >
                        ☎ Call
                      </a>
                    )}

                    {enquiry.phone && (
                      <a
                        href={getWhatsAppUrl(
                          enquiry.phone
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="enquiry-action"
                      >
                        WhatsApp ↗
                      </a>
                    )}

                    <div className="enquiry-status-control">

                      <label>
                        Status
                      </label>

                      <select
                        value={
                          enquiry.status
                        }
                        disabled={
                          isUpdating
                        }
                        onChange={(
                          event
                        ) =>
                          updateStatus(
                            enquiry.id,
                            event.target
                              .value as EnquiryStatus
                          )
                        }
                      >
                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {formatStatus(
                                status
                              )}
                            </option>
                          )
                        )}
                      </select>

                    </div>

                  </div>

                  {/* =========================================
                     DETAILS TOGGLE
                  ========================================= */}

                  <button
                    type="button"
                    className="enquiry-details-toggle"
                    onClick={() =>
                      setOpenDetails(
                        isDetailsOpen
                          ? null
                          : enquiry.id
                      )
                    }
                  >
                    {isDetailsOpen
                      ? "▴ Hide full enquiry details"
                      : "▾ View full enquiry details"}
                  </button>

                  {/* =========================================
                     FULL DETAILS
                  ========================================= */}

                  {isDetailsOpen && (
                    <div className="enquiry-details">

                      <div className="enquiry-fields">

                        <div className="enquiry-field">
                          <span>ID</span>
                          <strong>
                            {enquiry.id}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>Name</span>
                          <strong>
                            {enquiry.name}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>Company</span>
                          <strong>
                            {enquiry.company ||
                              "—"}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>Email</span>
                          <strong>
                            {enquiry.email}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>Phone</span>
                          <strong>
                            {enquiry.phone ||
                              "—"}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>
                            Enquiry type
                          </span>
                          <strong>
                            {enquiry.enquiry_type
                              ? formatStatus(
                                  enquiry.enquiry_type
                                )
                              : "—"}
                          </strong>
                        </div>

                        <div className="enquiry-field enquiry-field-full">
                          <span>Message</span>
                          <strong>
                            {enquiry.message}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>Status</span>
                          <strong>
                            {formatStatus(
                              enquiry.status
                            )}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>Created</span>
                          <strong>
                            {formatDate(
                              enquiry.created_at
                            )}
                          </strong>
                        </div>

                        <div className="enquiry-field">
                          <span>
                            Last updated
                          </span>
                          <strong>
                            {formatDate(
                              enquiry.updated_at
                            )}
                          </strong>
                        </div>

                      </div>

                      {/* =====================================
                         INTERNAL NOTES
                      ===================================== */}

                      <div className="enquiry-notes">

                        <div>
                          <span className="enquiry-notes-label">
                            INTERNAL NOTES
                          </span>

                          <p>
                            Private operational
                            notes — not visible
                            to the client.
                          </p>
                        </div>

                        <textarea
                          value={
                            notesDraft[
                              enquiry.id
                            ] || ""
                          }
                          onChange={(
                            event
                          ) =>
                            setNotesDraft(
                              (current) => ({
                                ...current,
                                [enquiry.id]:
                                  event.target
                                    .value,
                              })
                            )
                          }
                          placeholder="Add an internal note..."
                          rows={4}
                        />

                        <button
                          type="button"
                          className="enquiry-save-notes"
                          onClick={() =>
                            saveInternalNotes(
                              enquiry.id
                            )
                          }
                          disabled={
                            isSavingNotes
                          }
                        >
                          {isSavingNotes
                            ? "Saving..."
                            : "Save internal notes"}
                        </button>

                      </div>

                      {/* =====================================
                         ACTIVITY TIMELINE
                      ===================================== */}

                      <div className="enquiry-activity-section">

                        <div className="enquiry-activity-heading">
                          <span className="enquiry-notes-label">
                            OPERATIONAL HISTORY
                          </span>

                          <p>
                            Internal activity recorded
                            against this enquiry.
                          </p>
                        </div>

                        <ActivityTimeline
                          enquiryId={enquiry.id}
                        />

                      </div>

                    </div>
                  )}

                </article>
              );
            }
          )}

        </section>
      )}

    </main>
  );
}