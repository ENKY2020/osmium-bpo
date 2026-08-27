import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import styles from "./job.module.css";

type Job = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string | null;
  employment_type: string | null;
  requirements: string[] | null;
  skills: string[] | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  params: {
    slug: string;
  };
};

export default async function JobDetailPage({
  params,
}: PageProps) {
  const { slug } = params;

  const { data: job, error } = await supabase
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
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to load public job:", error);

    throw new Error(
      `Unable to load this job: ${error.message}`
    );
  }

  if (!job) {
    notFound();
  }

  const typedJob = job as Job;

  return (
    <main className={styles.careersPage}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <span className={styles.eyebrow}>
              OSMIUM BPO · CAREERS
            </span>

            <h1 className={styles.heroTitle}>
              {typedJob.title}
            </h1>

            <p className={styles.heroText}>
              Explore this opportunity and discover whether your
              experience, skills and ambitions are a good fit for
              Osmium BPO.
            </p>
          </div>

          <Link
            href="/careers"
            className={styles.backLink}
          >
            ← Back to careers
          </Link>
        </div>
      </section>

      <section className={styles.jobDetail}>
        <div className={styles.jobMeta}>
          {typedJob.location && (
            <span>{typedJob.location}</span>
          )}

          {typedJob.employment_type && (
            <span>{typedJob.employment_type}</span>
          )}
        </div>

        <div className={styles.jobGrid}>
          <article className={styles.jobContent}>
            <section>
              <span className={styles.sectionEyebrow}>
                THE ROLE
              </span>

              <h2>What you&apos;ll do</h2>

              <div className={styles.richText}>
                {typedJob.description
                  .split("\n")
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </section>

            {typedJob.requirements &&
              typedJob.requirements.length > 0 && (
                <section>
                  <span className={styles.sectionEyebrow}>
                    REQUIREMENTS
                  </span>

                  <h2>What we&apos;re looking for</h2>

                  <ul className={styles.requirementsList}>
                    {typedJob.requirements.map(
                      (requirement, index) => (
                        <li key={index}>
                          {requirement}
                        </li>
                      )
                    )}
                  </ul>
                </section>
              )}

            {typedJob.skills &&
              typedJob.skills.length > 0 && (
                <section>
                  <span className={styles.sectionEyebrow}>
                    SKILLS
                  </span>

                  <h2>Useful skills</h2>

                  <div className={styles.skillsList}>
                    {typedJob.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={styles.skill}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}
          </article>

          <aside className={styles.jobSidebar}>
            <div className={styles.applyCard}>
              <span className={styles.sectionEyebrow}>
                INTERESTED?
              </span>

              <h2>Ready to apply?</h2>

              <p>
                If this role sounds like a good fit, send your
                application to the Osmium BPO team.
              </p>

              <a
                href={`mailto:devosmiumbpo@gmail.com?subject=${encodeURIComponent(
                  `Application: ${typedJob.title}`
                )}`}
                className={styles.applyButton}
              >
                Apply for this role ↗
              </a>

              <p className={styles.applyNote}>
                Please include your CV and mention the position
                you&apos;re applying for.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}