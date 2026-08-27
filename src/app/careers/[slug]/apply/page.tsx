"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import styles from "./apply.module.css";

type Job = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  employment_type: string | null;
};

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params?.slug as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverMessage, setCoverMessage] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadJob() {
      if (!slug) return;

      setLoadingJob(true);
      setError("");

      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, slug, location, employment_type"
        )
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !data) {
        console.error("Failed to load job:", error);
        setError("We couldn't find this job.");
        setLoadingJob(false);
        return;
      }

      setJob(data);
      setLoadingJob(false);
    }

    loadJob();
  }, [slug]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      setCvFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload your CV as a PDF or Word document.");
      event.target.value = "";
      setCvFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your CV must be 5MB or smaller.");
      event.target.value = "";
      setCvFile(null);
      return;
    }

    setError("");
    setCvFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!job) {
      setError("This job is unavailable.");
      return;
    }

    if (!cvFile) {
      setError("Please upload your CV before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      /*
       * Create a safe unique file path.
       *
       * We don't use the candidate's original filename as
       * the storage path because filenames can contain spaces
       * and other problematic characters.
       */
      const fileExtension =
        cvFile.name.split(".").pop()?.toLowerCase() || "pdf";

      const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;

      const filePath = `${job.id}/${uniqueFileName}`;

      /*
       * Upload CV
       */
      const { error: uploadError } = await supabase.storage
        .from("job-applications")
        .upload(filePath, cvFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("CV upload error:", uploadError);
        throw new Error(
          "We couldn't upload your CV. Please try again."
        );
      }

      /*
       * Save application
       */
      const { error: applicationError } = await supabase
        .from("job_applications")
        .insert({
          job_id: job.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          cover_message: coverMessage.trim(),
          cv_file_path: filePath,
          cv_file_name: cvFile.name,
          status: "new",
        });

      if (applicationError) {
        console.error(
          "Application insert error:",
          applicationError
        );

        /*
         * If database insertion fails after the CV uploaded,
         * remove the orphaned CV.
         */
        await supabase.storage
          .from("job-applications")
          .remove([filePath]);

        throw new Error(
          "We couldn't submit your application. Please try again."
        );
      }

      setSuccess(true);

      /*
       * Give the user a moment to see the success state.
       */
      setTimeout(() => {
        router.push(`/careers/${job.slug}`);
      }, 2500);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingJob) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>
          <span className={styles.loadingDot} />
          Loading application...
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className={styles.page}>
        <div className={styles.errorPage}>
          <p className={styles.eyebrow}>OSMIUM BPO · CAREERS</p>
          <h1>Job not found.</h1>
          <p>
            This opportunity may have been closed or is no longer
            available.
          </p>

          <Link href="/careers" className={styles.backLink}>
            ← Back to careers
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className={styles.page}>
        <section className={styles.successPage}>
          <div className={styles.successIcon}>✓</div>

          <p className={styles.eyebrow}>
            APPLICATION RECEIVED
          </p>

          <h1>Thank you, {name.split(" ")[0]}.</h1>

          <p className={styles.successText}>
            Your application for{" "}
            <strong>{job.title}</strong> has been received.
          </p>

          <p className={styles.successSubtext}>
            The Osmium BPO team will review your application and
            contact you if you are shortlisted.
          </p>

          <Link href="/careers" className={styles.primaryButton}>
            Back to careers
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href={`/careers/${job.slug}`} className={styles.back}>
            ← Back to role
          </Link>

          <p className={styles.eyebrow}>
            OSMIUM BPO · APPLICATION
          </p>

          <h1>Apply for this role.</h1>

          <p className={styles.heroText}>
            We&apos;d like to learn a little about you. Complete
            the form below and attach your CV.
          </p>

          <div className={styles.jobMeta}>
            <span>{job.title}</span>

            {job.location && (
              <span>📍 {job.location}</span>
            )}

            {job.employment_type && (
              <span>{job.employment_type}</span>
            )}
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.formColumn}>
          <div className={styles.formHeader}>
            <p className={styles.eyebrow}>YOUR DETAILS</p>
            <h2>Tell us about yourself.</h2>
            <p>
              Please provide accurate contact information so our
              team can reach you.
            </p>
          </div>

          {error && (
            <div className={styles.errorBox} role="alert">
              <strong>Something went wrong</strong>
              <span>{error}</span>
            </div>
          )}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="name">
                  Full name <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">
                  Email address <span>*</span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone">
                  Phone number <span>*</span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="coverMessage">
                Why should we consider you?
              </label>

              <textarea
                id="coverMessage"
                name="coverMessage"
                rows={7}
                placeholder="Tell us briefly about your experience, strengths and why you're interested in this role."
                value={coverMessage}
                onChange={(e) =>
                  setCoverMessage(e.target.value)
                }
              />

              <small>
                Keep it clear and relevant. A short, thoughtful
                message is enough.
              </small>
            </div>

            <div className={styles.field}>
              <label htmlFor="cv">
                CV / Resume <span>*</span>
              </label>

              <label
                htmlFor="cv"
                className={`${styles.uploadBox} ${
                  cvFile ? styles.uploadSelected : ""
                }`}
              >
                <input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />

                <span className={styles.uploadIcon}>
                  {cvFile ? "✓" : "↑"}
                </span>

                <span className={styles.uploadTitle}>
                  {cvFile
                    ? cvFile.name
                    : "Upload your CV"}
                </span>

                <span className={styles.uploadText}>
                  {cvFile
                    ? `${(
                        cvFile.size /
                        1024 /
                        1024
                      ).toFixed(2)} MB`
                    : "PDF, DOC or DOCX · Maximum 5MB"}
                </span>
              </label>
            </div>

            <div className={styles.notice}>
              <span>🔒</span>
              <p>
                Your information will only be used to assess
                your application for this role.
              </p>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting
                ? "Submitting application..."
                : "Submit application ↗"}
            </button>

            <p className={styles.requiredNote}>
              * Required fields
            </p>
          </form>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <p className={styles.eyebrow}>APPLYING FOR</p>

            <h3>{job.title}</h3>

            <div className={styles.sidebarDetails}>
              {job.location && (
                <div>
                  <span>Location</span>
                  <strong>{job.location}</strong>
                </div>
              )}

              {job.employment_type && (
                <div>
                  <span>Employment</span>
                  <strong>{job.employment_type}</strong>
                </div>
              )}
            </div>

            <div className={styles.sidebarDivider} />

            <p className={styles.sidebarText}>
              Make sure your CV is up to date and your contact
              details are correct before submitting.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}