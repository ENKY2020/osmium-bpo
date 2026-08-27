"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { createClient } from "@/utils/supabase/client";

import styles from "./page.module.css";

/* =========================================================
   SUPABASE
========================================================= */

const supabase = createClient();

/* =========================================================
   TYPES
========================================================= */

type JobRecord = Record<string, unknown>;

type DisplayJob = {
  id: string;
  number: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  skills: string[];
  slug: string;
};

/* =========================================================
   STATIC CAREERS VALUES
========================================================= */

const values = [
  {
    number: "01",
    title: "Take ownership",
    description:
      "We believe dependable work starts with people who understand what they are responsible for and take that responsibility seriously.",
  },
  {
    number: "02",
    title: "Work with purpose",
    description:
      "The goal is not simply to complete tasks. We care about whether the work actually makes the operation better.",
  },
  {
    number: "03",
    title: "Keep learning",
    description:
      "Processes change, technology changes and businesses change. We expect our people to keep developing with them.",
  },
  {
    number: "04",
    title: "Build trust",
    description:
      "Our clients depend on us with important work. Reliability, communication and accountability are not optional.",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function getString(
  job: JobRecord,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = job[key];

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

/* ---------------------------------------------------------
   Convert database values into a readable string
--------------------------------------------------------- */

function valueToString(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

/* ---------------------------------------------------------
   Convert possible skills/requirements formats into array
--------------------------------------------------------- */

function getSkills(job: JobRecord): string[] {
  const possibleValues = [
    job.skills,
    job.requirements,
    job.qualifications,
  ];

  for (const value of possibleValues) {
    if (Array.isArray(value)) {
      return value
        .map(valueToString)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8);
    }

    if (typeof value === "string") {
      return value
        .split(/\n|,|•/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8);
    }
  }

  return [];
}

/* ---------------------------------------------------------
   Create a safe slug if database doesn't provide one
--------------------------------------------------------- */

function createSlug(
  title: string,
  id: string
): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || id;
}

/* ---------------------------------------------------------
   Determine whether a job should appear publicly.
   
   We support the common publication fields without
   requiring the frontend to know every extra column.
--------------------------------------------------------- */

function isPublished(job: JobRecord): boolean {
  if (
    typeof job.is_published === "boolean"
  ) {
    return job.is_published;
  }

  if (
    typeof job.published === "boolean"
  ) {
    return job.published;
  }

  if (
    typeof job.status === "string"
  ) {
    const status =
      job.status.toLowerCase().trim();

    /*
     * If the database explicitly marks a job as draft,
     * archived, closed or unpublished, keep it off the
     * public Careers page.
     */
    if (
      [
        "draft",
        "archived",
        "closed",
        "unpublished",
        "inactive",
      ].includes(status)
    ) {
      return false;
    }

    if (
      [
        "published",
        "open",
        "active",
      ].includes(status)
    ) {
      return true;
    }
  }

  /*
   * If the existing table doesn't have a publication
   * field, allow the row to appear.
   *
   * RLS should remain the final database-level protection.
   */
  return true;
}

/* ---------------------------------------------------------
   Convert database row to public display model
--------------------------------------------------------- */

function normalizeJob(
  job: JobRecord,
  index: number
): DisplayJob {
  const id = getString(
    job,
    ["id"],
    `job-${index + 1}`
  );

  const title = getString(
    job,
    [
      "title",
      "job_title",
      "position",
      "name",
    ],
    "Open Position"
  );

  const department = getString(
    job,
    [
      "department",
      "category",
      "team",
    ],
    "Osmium BPO"
  );

  const location = getString(
    job,
    [
      "location",
      "job_location",
    ],
    "Kenya"
  );

  const type = getString(
    job,
    [
      "employment_type",
      "job_type",
      "type",
    ],
    "Full-time"
  );

  const description = getString(
    job,
    [
      "description",
      "summary",
      "short_description",
      "overview",
    ],
    "Join Osmium BPO and contribute to dependable business operations."
  );

  const databaseSlug = getString(
    job,
    ["slug"],
    ""
  );

  return {
    id,
    number: String(index + 1).padStart(2, "0"),
    title,
    department,
    location,
    type,
    description,
    skills: getSkills(job),
    slug:
      databaseSlug ||
      createSlug(title, id),
  };
}

/* =========================================================
   CAREERS PAGE
========================================================= */

export default function CareersPage() {
  const [jobs, setJobs] =
    useState<DisplayJob[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD PUBLIC JOBS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadJobs() {
      setLoading(true);
      setError("");

      try {
        const {
          data,
          error: fetchError,
        } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (fetchError) {
          console.error(
            "Osmium Careers jobs error:",
            fetchError
          );

          if (mounted) {
            setError(
              "We couldn't load current opportunities right now."
            );

            setJobs([]);
          }

          return;
        }

        const rows =
          (data as JobRecord[] | null) ??
          [];

        const publicJobs =
          rows.filter(isPublished);

        const normalizedJobs =
          publicJobs.map(
            normalizeJob
          );

        if (mounted) {
          setJobs(normalizedJobs);
        }
      } catch (loadError) {
        console.error(
          "Unexpected Careers loading error:",
          loadError
        );

        if (mounted) {
          setError(
            "We couldn't load current opportunities right now."
          );

          setJobs([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     JOB COUNT
  ======================================================= */

  const jobCountLabel =
    useMemo(() => {
      if (loading) {
        return "Loading opportunities";
      }

      if (jobs.length === 0) {
        return "No current openings";
      }

      return `${jobs.length} ${
        jobs.length === 1
          ? "open opportunity"
          : "open opportunities"
      }`;
    }, [jobs.length, loading]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className={styles.page}>
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroMeta}>
            <span className={styles.metaLine} />

            <span>
              OSMIUM BPO
            </span>
          </div>

          <p className={styles.heroKicker}>
            PEOPLE • OPPORTUNITY • GROWTH
          </p>

          <h1 className={styles.heroTitle}>
            Build the work
            <br />
            <em>
              behind the growth.
            </em>
          </h1>

          <div className={styles.heroBottom}>
            <p>
              Join a team helping businesses
              create dependable operations
              through capable people,
              thoughtful processes and
              technology.
            </p>

            <Link
              href="#open-roles"
              className={styles.heroLink}
            >
              View opportunities

              <span>
                ↘
              </span>
            </Link>
          </div>
        </div>

        <div
          className={styles.heroMark}
          aria-hidden="true"
        >
          <div
            className={styles.heroOrbit}
          >
            <div
              className={styles.heroCore}
            >
              <span>
                OS
              </span>
            </div>
          </div>

          <span
            className={
              styles.heroMarkLabel
            }
          >
            PEOPLE × PROCESS × CAPACITY
          </span>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section
        className={
          styles.introSection
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
          >
            <span
              className={
                styles.eyebrowLine
              }
            />

            Working at Osmium
          </div>

          <span
            className={
              styles.sectionIndex
            }
          >
            01 / 04
          </span>
        </div>

        <div
          className={
            styles.introGrid
          }
        >
          <h2>
            Good work needs
            <br />
            <em>
              good people.
            </em>
          </h2>

          <div
            className={
              styles.introContent
            }
          >
            <p
              className={
                styles.lead
              }
            >
              Osmium exists to take
              important operational
              work and make it
              dependable.
            </p>

            <p>
              That starts with people
              who care about what they
              do, understand the
              responsibility behind
              their role and want to
              become better at their
              craft.
            </p>

            <p>
              Whether you work directly
              with a client, support an
              internal process or help
              improve how we operate,
              your work contributes to
              something bigger than a
              completed task.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section
        className={
          styles.valuesSection
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
          >
            <span
              className={
                styles.eyebrowLine
              }
            />

            What we value
          </div>

          <span
            className={
              styles.sectionIndex
            }
          >
            02 / 04
          </span>
        </div>

        <div
          className={
            styles.valuesIntro
          }
        >
          <h2>
            How we choose
            <br />
            <em>
              to work.
            </em>
          </h2>

          <p>
            We are building an
            organisation where people
            can do meaningful work,
            develop professionally and
            understand the impact of
            what they contribute.
          </p>
        </div>

        <div
          className={
            styles.valuesGrid
          }
        >
          {values.map(
            (value) => (
              <article
                key={
                  value.number
                }
                className={
                  styles.valueCard
                }
              >
                <span
                  className={
                    styles.cardNumber
                  }
                >
                  {value.number}
                </span>

                <div
                  className={
                    styles.valueCardBody
                  }
                >
                  <h3>
                    {value.title}
                  </h3>

                  <span
                    className={
                      styles.cardRule
                    }
                  />

                  <p>
                    {
                      value.description
                    }
                  </p>
                </div>

                <span
                  className={
                    styles.cardArrow
                  }
                  aria-hidden="true"
                >
                  ↗
                </span>
              </article>
            )
          )}
        </div>
      </section>

      {/* =====================================================
          OPEN ROLES
      ===================================================== */}

      <section
        id="open-roles"
        className={
          styles.rolesSection
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
          >
            <span
              className={
                styles.eyebrowLine
              }
            />

            Open opportunities
          </div>

          <span
            className={
              styles.sectionIndex
            }
          >
            03 / 04
          </span>
        </div>

        <div
          className={
            styles.rolesIntro
          }
        >
          <div>
            <h2>
              Find your
              <br />
              <em>
                place here.
              </em>
            </h2>
          </div>

          <p>
            We are interested in
            people who are capable,
            curious and serious about
            doing good work. Explore
            the roles currently
            available.
          </p>
        </div>

        {/* =================================================
            DATABASE ERROR
        ================================================= */}

        {error && (
          <div
            role="alert"
            style={{
              padding: "20px",
              marginBottom: "30px",
              border:
                "1px solid rgba(180, 40, 40, 0.25)",
              background:
                "rgba(180, 40, 40, 0.05)",
              color:
                "#8b2525",
              fontFamily:
                "Arial, Helvetica, sans-serif",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div
            className={
              styles.rolesList
            }
          >
            <div
              className={
                styles.roleCard
              }
            >
              <p
                style={{
                  margin: 0,
                  color:
                    "#536b82",
                  fontFamily:
                    "Arial, Helvetica, sans-serif",
                  fontSize: "14px",
                }}
              >
                Loading current
                opportunities...
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            LIVE JOBS
        ================================================= */}

        {!loading &&
          jobs.length > 0 && (
            <div
              className={
                styles.rolesList
              }
            >
              {jobs.map(
                (job) => (
                  <article
                    key={job.id}
                    className={
                      styles.roleCard
                    }
                  >
                    <div
                      className={
                        styles.roleTop
                      }
                    >
                      <span
                        className={
                          styles.roleNumber
                        }
                      >
                        {job.number}
                      </span>

                      <div
                        className={
                          styles.roleMeta
                        }
                      >
                        <span>
                          {
                            job.department
                          }
                        </span>

                        <span>
                          {
                            job.location
                          }
                        </span>

                        <span>
                          {job.type}
                        </span>
                      </div>
                    </div>

                    <div
                      className={
                        styles.roleMain
                      }
                    >
                      <div
                        className={
                          styles.roleTitleBlock
                        }
                      >
                        <h3>
                          {
                            job.title
                          }
                        </h3>

                        <span
                          className={
                            styles.cardRule
                          }
                        />
                      </div>

                      <p>
                        {
                          job.description
                        }
                      </p>
                    </div>

                    <div
                      className={
                        styles.roleBottom
                      }
                    >
                      <div
                        className={
                          styles.skills
                        }
                      >
                        {job.skills
                          .length >
                        0 ? (
                          job.skills.map(
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
                          )
                        ) : (
                          <span>
                            Apply to learn
                            more
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/careers/${job.slug}`}
                        className={
                          styles.roleLink
                        }
                      >
                        View role

                        <span>
                          ↗
                        </span>
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>
          )}

        {/* =================================================
            NO JOBS
        ================================================= */}

        {!loading &&
          !error &&
          jobs.length === 0 && (
            <div
              className={
                styles.rolesList
              }
            >
              <article
                className={
                  styles.roleCard
                }
              >
                <div
                  className={
                    styles.roleTop
                  }
                >
                  <span
                    className={
                      styles.roleNumber
                    }
                  >
                    —
                  </span>
                </div>

                <div
                  className={
                    styles.roleMain
                  }
                >
                  <div
                    className={
                      styles.roleTitleBlock
                    }
                  >
                    <h3>
                      No open positions
                    </h3>

                    <span
                      className={
                        styles.cardRule
                      }
                    />
                  </div>

                  <p>
                    We don&apos;t currently
                    have a published
                    opportunity. You can
                    still introduce
                    yourself and tell us
                    how you could
                    contribute to Osmium.
                  </p>
                </div>
              </article>
            </div>
          )}

        {/* Small operational indicator */}
        {!loading && (
          <p
            style={{
              marginTop: "22px",
              color:
                "#718196",
              fontFamily:
                "Arial, Helvetica, sans-serif",
              fontSize:
                "10px",
              letterSpacing:
                "0.08em",
              textTransform:
                "uppercase",
            }}
          >
            {jobCountLabel}
          </p>
        )}
      </section>

      {/* =====================================================
          OPEN APPLICATION
      ===================================================== */}

      <section
        className={
          styles.openApplicationSection
        }
      >
        <div
          className={
            styles.openApplicationInner
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
          >
            <span
              className={
                styles.eyebrowLine
              }
            />

            Don&apos;t see your role?
          </div>

          <div
            className={
              styles.openApplicationGrid
            }
          >
            <h2>
              We may still want
              <br />
              <em>
                to meet you.
              </em>
            </h2>

            <div>
              <p>
                Great people do not
                always fit neatly into an
                open vacancy. If you
                believe you can contribute
                to Osmium, tell us what you
                do well and where you think
                you could make a difference.
              </p>

              <Link
                href="/contact"
                className={
                  styles.applicationButton
                }
              >
                Start a conversation

                <span>
                  ↗
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section
        className={
          styles.closingSection
        }
      >
        <div
          className={
            styles.closingInner
          }
        >
          <div
            className={
              styles.sectionEyebrow
            }
          >
            <span
              className={
                styles.eyebrowLine
              }
            />

            Careers at Osmium
          </div>

          <h2>
            Do work that
            <br />
            <em>
              moves something
              forward.
            </em>
          </h2>

          <p>
            The businesses we support
            depend on the work we do.
            That means your contribution
            matters — to the team, to our
            clients and to the people they
            serve.
          </p>

          <div
            className={
              styles.closingActions
            }
          >
            <Link
              href="#open-roles"
              className={
                styles.primaryButton
              }
            >
              Explore open roles

              <span>
                ↗
              </span>
            </Link>

            <Link
              href="/contact"
              className={
                styles.secondaryLink
              }
            >
              Talk to Osmium

              <span>
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}