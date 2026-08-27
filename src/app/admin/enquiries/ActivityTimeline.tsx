"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

/* =========================================================
   TYPES
========================================================= */

export type ActivityType =
  | "received"
  | "status_change"
  | "note"
  | "email"
  | "call"
  | "whatsapp"
  | "updated";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
  metadata?: {
    fromStatus?: string;
    toStatus?: string;
  };
}

interface SupabaseActivity {
  id: string;
  enquiry_id: string;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  from_status: string | null;
  to_status: string | null;
  created_by: string | null;
  created_at: string;
}

interface ActivityTimelineProps {
  enquiryId: string;
  refreshKey?: number;
  emptyMessage?: string;
}

/* =========================================================
   LABELS + ICONS
========================================================= */

const activityIcons: Record<ActivityType, string> = {
  received: "✦",
  status_change: "↗",
  note: "✎",
  email: "✉",
  call: "☎",
  whatsapp: "◉",
  updated: "↻",
};

const activityLabels: Record<ActivityType, string> = {
  received: "Enquiry received",
  status_change: "Status changed",
  note: "Internal note",
  email: "Email",
  call: "Phone call",
  whatsapp: "WhatsApp",
  updated: "Enquiry updated",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function mapActivity(
  activity: SupabaseActivity
): ActivityItem {
  return {
    id: activity.id,

    type: activity.activity_type,

    title: activity.title,

    description:
      activity.description || undefined,

    createdAt:
      activity.created_at,

    createdBy:
      activity.created_by || undefined,

    metadata:
      activity.from_status ||
      activity.to_status
        ? {
            fromStatus:
              activity.from_status
                ? formatStatus(
                    activity.from_status
                  )
                : undefined,

            toStatus:
              activity.to_status
                ? formatStatus(
                    activity.to_status
                  )
                : undefined,
          }
        : undefined,
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ActivityTimeline({
  enquiryId,
  refreshKey = 0,
  emptyMessage = "No activity has been recorded yet.",
}: ActivityTimelineProps) {
  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD ACTIVITY
  ======================================================= */

  async function loadActivities() {
    if (!enquiryId) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const {
      data,
      error: fetchError,
    } = await supabase
      .from("enquiry_activities")
      .select(
        `
        id,
        enquiry_id,
        activity_type,
        title,
        description,
        from_status,
        to_status,
        created_by,
        created_at
        `
      )
      .eq(
        "enquiry_id",
        enquiryId
      )
      .order("created_at", {
        ascending: true,
      });

    if (fetchError) {
      console.error(
        "Osmium activity timeline error:",
        fetchError
      );

      setError(
        `Could not load activity: ${fetchError.message}`
      );

      setActivities([]);
      setLoading(false);

      return;
    }

    const mapped =
      ((data || []) as SupabaseActivity[])
        .map(mapActivity);

    setActivities(mapped);
    setLoading(false);
  }

  /* =======================================================
     LOAD ON OPEN / REFRESH
  ======================================================= */

  useEffect(() => {
    loadActivities();
  }, [enquiryId, refreshKey]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="activity-timeline">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="activity-timeline__header">

        <div>

          <span className="activity-timeline__eyebrow">
            OPERATIONS
          </span>

          <h3 className="activity-timeline__title">
            Activity history
          </h3>

          <p className="activity-timeline__subtitle">
            A record of what has happened
            with this enquiry.
          </p>

        </div>

        <span className="activity-timeline__count">

          {loading
            ? "Loading..."
            : `${activities.length} ${
                activities.length === 1
                  ? "event"
                  : "events"
              }`}

        </span>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div
          className="activity-timeline__error"
          role="alert"
        >
          <strong>
            Activity unavailable
          </strong>

          <span>{error}</span>
        </div>
      )}

      {/* ===================================================
          LOADING
      =================================================== */}

      {loading ? (

        <div className="activity-timeline__empty">

          <div className="activity-timeline__empty-icon">
            ◷
          </div>

          <h4>
            Loading activity...
          </h4>

          <p>
            Retrieving the enquiry
            history.
          </p>

        </div>

      ) : activities.length === 0 ? (

        /* =================================================
           EMPTY
        ================================================= */

        <div className="activity-timeline__empty">

          <div className="activity-timeline__empty-icon">
            ◷
          </div>

          <h4>
            No activity yet
          </h4>

          <p>
            {emptyMessage}
          </p>

        </div>

      ) : (

        /* =================================================
           ACTIVITY LIST
        ================================================= */

        <div className="activity-timeline__list">

          {activities.map(
            (activity, index) => (

              <div
                key={activity.id}
                className="activity-timeline__item"
              >

                {/* =========================================
                   ICON + RAIL
                ========================================= */}

                <div className="activity-timeline__rail">

                  <div
                    className={`activity-timeline__icon activity-timeline__icon--${activity.type}`}
                  >
                    {
                      activityIcons[
                        activity.type
                      ]
                    }
                  </div>

                  {index <
                    activities.length - 1 && (
                    <div className="activity-timeline__line" />
                  )}

                </div>

                {/* =========================================
                   CONTENT
                ========================================= */}

                <div className="activity-timeline__content">

                  <div className="activity-timeline__top">

                    <div>

                      <span className="activity-timeline__type">
                        {
                          activityLabels[
                            activity.type
                          ]
                        }
                      </span>

                      <h4>
                        {activity.title}
                      </h4>

                    </div>

                    <time>
                      {formatDate(
                        activity.createdAt
                      )}
                    </time>

                  </div>

                  {/* DESCRIPTION */}

                  {activity.description && (
                    <p className="activity-timeline__description">
                      {
                        activity.description
                      }
                    </p>
                  )}

                  {/* STATUS CHANGE */}

                  {activity.type ===
                    "status_change" &&
                    activity.metadata
                      ?.fromStatus &&
                    activity.metadata
                      ?.toStatus && (

                      <div className="activity-timeline__status-change">

                        <span>
                          {
                            activity.metadata
                              .fromStatus
                          }
                        </span>

                        <span className="activity-timeline__arrow">
                          →
                        </span>

                        <strong>
                          {
                            activity.metadata
                              .toStatus
                          }
                        </strong>

                      </div>
                    )}

                  {/* CREATED BY */}

                  {activity.createdBy && (
                    <div className="activity-timeline__author">

                      Recorded by{" "}

                      <strong>
                        {activity.createdBy}
                      </strong>

                    </div>
                  )}

                </div>

              </div>
            )
          )}

        </div>
      )}

    </section>
  );
}