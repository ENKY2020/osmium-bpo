"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { createClient } from "@/utils/supabase/client";

import styles from "./page.module.css";

const supabase = createClient();

type JobRecord = Record<string, unknown>;

type Job = {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
  isPublished: boolean;
};

function getString(
  job: JobRecord,
  keys: string[],
  fallback = ""
): string {
  for (const key of keys) {
    const value = job[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function getList(
  job: JobRecord,
  keys: string[]
): string[] {
  for (const key of keys) {
    const value = job[key];

    if (Array.isArray(value)) {
      return value
        .filter(
          (item): item is string | number =>
            typeof item === "string" ||
            typeof item === "number"
        )
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(/\n|•/)
        .map((item) =>
          item
            .replace(/^[-*]\s*/, "")
            .trim()
        )
        .filter(Boolean);
    }
  }

  return [];
}

function isPublished(job: JobRecord): boolean {
  if (typeof job.is_published === "boolean") {
    return job.is_published;
  }

  if (typeof job.published === "boolean") {
    return job.published;
  }

  if (typeof job.status === "string") {
    const status = job.status.toLowerCase().trim();

    if (
      [
        "draft",
        "closed",
        "archived",
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

  return true;
}

function normalizeJob(job: JobRecord): Job {
  const title = getString(
    job,
    ["title", "job_title", "position", "name"],
    "Open Position"
  );

  const slug = getString(
    job,
    ["slug"],
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  );

  return {
    id: getString(job, ["id"], slug),

    title,

    slug,

    department: getString(
      job,
      ["department", "category", "team"],
      "Osmium BPO"
    ),

    location: getString(
      job,
      ["location", "job_location"],
      "Kenya"
    ),

    employmentType: getString(
      job,
      [
        "employment_type",
        "job_type",
        "type",
      ],
      "Full-time"
    ),

    salary: getString(
      job,
      [
        "salary",
        "salary_range",
        "compensation",
      ],
      ""
    ),

    description: getString(
      job,
      [
        "description",
        "summary",
        "short_description",
        "overview",
      ],
      "Join Osmium BPO and contribute to dependable business operations."
    ),

    requirements: getList(
      job,
      [
        "requirements",
        "qualifications",
      ]
    ),

    skills: getList(
      job,
      ["skills"]
    ),

    isPublished: isPublished(job),
  };
}

export default function JobDetailsPage() {
  const params = useParams();

  const slug = Array.isArray(params?.slug)
    ? params.slug[0]
    : params?.slug;

  const [job, setJob] =
    useState<Job | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Job not found.");
      return;
    }

    let mounted = true;

    async function loadJob() {
      setLoading(true);
      setError("");

      try {
        /*
         * First try the slug column directly.
         */
        const {
          data: slugData,
          error: slugError,
        } = await supabase
          .from("jobs")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (slugData) {
          const normalized =
            normalizeJob(
              slugData as JobRecord
            );

          if (!normalized.isPublished) {
            if (mounted) {
              setError(
                "This position is no longer available."
              );
            }

            return;
          }

          if (mounted) {
            setJob(normalized);
          }

          return;
        }

        /*
         * Some older rows may not have a slug.
         *
         * As a fallback, load published jobs and generate
         * their slugs in exactly the same way as the main
         * Careers page.
         */
        if (slugError) {
          console.warn(
            "Slug lookup failed:",
            slugError
          );
        }

        const {
          data: jobs,
          error: jobsError,
        } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (jobsError) {
          throw jobsError;
        }

        const matchingJob =
          (jobs as JobRecord[] | null)?.find(
            (item) => {
              const normalized =
                normalizeJob(item);

              return (
                normalized.slug === slug &&
                normalized.isPublished
              );
            }
          );

        if (!matchingJob) {
          if (mounted) {
            setError(
              "We couldn't find this job opening."
            );
          }

          return;
        }

        if (mounted) {
          setJob(
            normalizeJob(
              matchingJob
            )
          );
        }
      } catch (loadError) {
        console.error(
          "Job details error:",
          loadError
        );

        if (mounted) {
          setError(
            "We couldn't load this job opening right now."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadJob();

    return () => {
      mounted = false;
    };
  }, [slug]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className={styles.page}>
        <Navbar />

        <section
          className={styles.rolesSection}
        >
          <div
            className={styles.rolesIntro}
          >
            <div>
              <p
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
              </p>

              <h1>
                Loading
                <br />
                <em>opportunity...</em>
              </h1>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  /* =====================================================
     ERROR / NOT FOUND
  ===================================================== */

  if (!job || error) {
    return (
      <main className={styles.page}>
        <Navbar />

        <section
          className={styles.closingSection}
        >
          <div
            className={styles.closingInner}
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

            <h1>
              This role is
              <br />
              <em>not available.</em>
            </h1>

            <p>
              {error ||
                "We couldn't find the job you're looking for."}
            </p>

            <div
              className={
                styles.closingActions
              }
            >
              <Link
                href="/careers"
                className={
                  styles.primaryButton
                }
              >
                View open roles

                <span>↗</span>
              </Link>

              <Link
                href="/contact"
                className={
                  styles.secondaryLink
                }
              >
                Talk to Osmium

                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  /* =====================================================
     JOB DETAILS
  ===================================================== */

  return (
    <main className={styles.page}>
      <Navbar />

      {/* =================================================
          JOB HERO
      ================================================= */}

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroMeta}>
            <span
              className={styles.metaLine}
            />

            <span>
              OSMIUM BPO
            </span>
          </div>

          <p
            className={styles.heroKicker}
          >
            {job.department} •{" "}
            {job.employmentType}
          </p>

          <h1
            className={styles.heroTitle}
          >
            {job.title}
            <br />

            <em>
              {job.location}
            </em>
          </h1>

          <div
            className={styles.heroBottom}
          >
            <p>
              We are looking for
              someone capable,
              dependable and ready to
              contribute to meaningful
              operational work at
              Osmium BPO.
            </p>

            <a
              href="#apply"
              className={
                styles.heroLink
              }
            >
              Apply for this role

              <span>↘</span>
            </a>
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

      {/* =================================================
          ROLE OVERVIEW
      ================================================= */}

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

            Role overview
          </div>

          <span
            className={
              styles.sectionIndex
            }
          >
            01
          </span>
        </div>

        <div
          className={
            styles.introGrid
          }
        >
          <h2>
            The opportunity
            <br />
            <em>
              in focus.
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
              {job.description}
            </p>

            <div
              style={{
                display: "grid",
                gap: "14px",
                marginTop: "35px",
              }}
            >
              <div>
                <strong>
                  Department
                </strong>

                <p>
                  {job.department}
                </p>
              </div>

              <div>
                <strong>
                  Location
                </strong>

                <p>
                  {job.location}
                </p>
              </div>

              <div>
                <strong>
                  Employment
                </strong>

                <p>
                  {job.employmentType}
                </p>
              </div>

              {job.salary && (
                <div>
                  <strong>
                    Compensation
                  </strong>

                  <p>
                    {job.salary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          REQUIREMENTS
      ================================================= */}

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

            What we&apos;re looking for
          </div>

          <span
            className={
              styles.sectionIndex
            }
          >
            02
          </span>
        </div>

        <div
          className={
            styles.valuesIntro
          }
        >
          <h2>
            The right
            <br />
            <em>
              person.
            </em>
          </h2>

          <p>
            We care about capability,
            communication, reliability
            and the willingness to learn.
            These are the qualities that
            help people succeed at
            Osmium.
          </p>
        </div>

        {job.requirements.length >
        0 ? (
          <div
            className={
              styles.valuesGrid
            }
          >
            {job.requirements.map(
              (requirement, index) => (
                <article
                  key={`${requirement}-${index}`}
                  className={
                    styles.valueCard
                  }
                >
                  <span
                    className={
                      styles.cardNumber
                    }
                  >
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <div
                    className={
                      styles.valueCardBody
                    }
                  >
                    <h3>
                      Requirement
                    </h3>

                    <span
                      className={
                        styles.cardRule
                      }
                    />

                    <p>
                      {requirement}
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        ) : (
          <div
            className={
              styles.introContent
            }
          >
            <p>
              Please review the role
              description and contact us
              to discuss your suitability
              for this opportunity.
            </p>
          </div>
        )}
      </section>

      {/* =================================================
          SKILLS
      ================================================= */}

      {job.skills.length > 0 && (
        <section
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

              Useful skills
            </div>

            <span
              className={
                styles.sectionIndex
              }
            >
              03
            </span>
          </div>

          <div
            className={
              styles.rolesIntro
            }
          >
            <h2>
              What will help
              <br />
              you <em>stand out.</em>
            </h2>

            <p>
              These are some of the
              skills and capabilities
              associated with this
              position.
            </p>
          </div>

          <div
            className={styles.skills}
            style={{
              gap: "18px",
              fontSize: "14px",
            }}
          >
            {job.skills.map(
              (skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  style={{
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    padding:
                      "12px 16px",
                    border:
                      "1px solid var(--line)",
                    color:
                      "var(--muted)",
                  }}
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </section>
      )}

      {/* =================================================
          APPLY
      ================================================= */}

      <section
        id="apply"
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

            Ready to apply?
          </div>

          <div
            className={
              styles.openApplicationGrid
            }
          >
            <h2>
              Let&apos;s talk about
              <br />
              <em>
                what you can do.
              </em>
            </h2>

            <div>
              <p>
                If this role sounds like
                the right opportunity for
                you, get in touch with
                Osmium BPO and tell us
                about yourself.
              </p>

              <Link
                href={`/contact?job=${encodeURIComponent(
                  job.title
                )}`}
                className={
                  styles.applicationButton
                }
              >
                Apply for this role

                <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          BACK TO CAREERS
      ================================================= */}

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

            Osmium BPO Careers
          </div>

          <h2>
            Not quite the
            <br />
            <em>
              right role?
            </em>
          </h2>

          <p>
            Explore our other open
            opportunities or introduce
            yourself to Osmium for
            future opportunities.
          </p>

          <div
            className={
              styles.closingActions
            }
          >
            <Link
              href="/careers"
              className={
                styles.primaryButton
              }
            >
              View all roles

              <span>↗</span>
            </Link>

            <Link
              href="/contact"
              className={
                styles.secondaryLink
              }
            >
              Contact Osmium

              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}