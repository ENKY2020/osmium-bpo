"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";

import styles from "./page.module.css";

type HeroSlide = {
  id: string;
  image_url: string;
  image_path: string;
  alt_text: string | null;
  label: string | null;
  slide_number: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type FormState = {
  file: File | null;
  label: string;
  altText: string;
  slideNumber: string;
};

const EMPTY_FORM: FormState = {
  file: null,
  label: "",
  altText: "",
  slideNumber: "1",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function HeroManagementPage() {
  const { user, loading, isAdmin } = useAuth();

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const supabase = createClient();

  const loadSlides = useCallback(async () => {
    if (!user || !isAdmin) return;

    setPageLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("hero_slides")
      .select(
        "id, image_url, image_path, alt_text, label, slide_number, is_active, created_at, updated_at"
      )
      .order("slide_number", { ascending: true });

    if (fetchError) {
      console.error("Hero slides load error:", fetchError);
      setError(fetchError.message || "Unable to load Hero slides.");
      setSlides([]);
    } else {
      setSlides((data ?? []) as HeroSlide[]);
    }

    setPageLoading(false);
  }, [isAdmin, user, supabase]);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      loadSlides();
    }
  }, [loading, user, isAdmin, loadSlides]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setForm((current) => ({ ...current, file: null }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setForm((current) => ({ ...current, file }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !isAdmin) {
      setError("You do not have permission to manage website content.");
      return;
    }

    if (!form.file) {
      setError("Please select a Hero image.");
      return;
    }

    const slideNumber = Number(form.slideNumber);

    if (!Number.isInteger(slideNumber) || slideNumber < 1) {
      setError("Slide number must be a whole number starting from 1.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const extension =
        form.file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeBaseName =
        form.file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .toLowerCase()
          .slice(0, 60) || "hero-image";

      const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const path = `hero/${slideNumber}-${safeBaseName}-${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from("website-media")
        .upload(path, form.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: form.file.type,
        });

      if (uploadError) {
        throw new Error(
          uploadError.message || "The image could not be uploaded."
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("website-media")
        .getPublicUrl(path);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase
        .from("hero_slides")
        .insert({
          image_url: imageUrl,
          image_path: path,
          alt_text: form.altText.trim() || null,
          label: form.label.trim() || null,
          slide_number: slideNumber,
          is_active: true,
        });

      if (insertError) {
        await supabase.storage.from("website-media").remove([path]);
        throw new Error(
          insertError.message || "The Hero slide could not be saved."
        );
      }

      setForm(EMPTY_FORM);
      setMessage("Hero image added successfully.");
      await loadSlides();
    } catch (submitError) {
      console.error("Hero image save error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong while saving the Hero image."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSlide = async (slide: HeroSlide) => {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("hero_slides")
      .update({
        is_active: !slide.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slide.id);

    if (updateError) {
      console.error("Hero slide status error:", updateError);
      setError(updateError.message || "Unable to update this Hero slide.");
      return;
    }

    setMessage(
      slide.is_active
        ? "Hero slide hidden from the public website."
        : "Hero slide is now active."
    );

    await loadSlides();
  };

  const deleteSlide = async (slide: HeroSlide) => {
    const confirmed = window.confirm(
      `Delete Hero slide ${String(slide.slide_number).padStart(2, "0")}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("hero_slides")
      .delete()
      .eq("id", slide.id);

    if (deleteError) {
      console.error("Hero slide delete error:", deleteError);
      setError(deleteError.message || "Unable to delete this Hero slide.");
      return;
    }

    if (slide.image_path) {
      const { error: storageError } = await supabase.storage
        .from("website-media")
        .remove([slide.image_path]);

      if (storageError) {
        console.warn(
          "Hero database row deleted but storage cleanup failed:",
          storageError
        );
      }
    }

    setMessage("Hero slide deleted.");
    await loadSlides();
  };

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <p className={styles.eyebrow}>OSMIUM BPO</p>
        <h1>Checking access...</h1>
        <p>Securing your website workspace.</p>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className={styles.loadingPage}>
        <p className={styles.eyebrow}>OSMIUM BPO</p>
        <h1>Access restricted</h1>
        <p>Redirecting you...</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <Link href="/admin/website" className={styles.backLink}>
              ← Website Management
            </Link>

            <p className={styles.eyebrow}>WEBSITE · HERO</p>

            <h1>Hero Images</h1>

            <p className={styles.intro}>
              Add and manage the images displayed in the homepage Hero
              carousel.
            </p>
          </div>

          <div className={styles.headerBadge}>
            <span>{slides.filter((slide) => slide.is_active).length}</span>
            <small>active slides</small>
          </div>
        </header>

        {(message || error) && (
          <div
            className={`${styles.alert} ${
              error ? styles.alertError : styles.alertSuccess
            }`}
            role="status"
          >
            <strong>{error ? "Something needs attention" : "Done"}</strong>
            <span>{error || message}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
              }}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className={styles.workspace}>
          <div className={styles.formColumn}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>ADD IMAGE</p>
              <h2>Add a Hero slide.</h2>
              <p>
                Upload a website image and give it a short label. The public
                Hero will use the order you assign here.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>IMAGE *</span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleFileChange}
                />

                <small>
                  JPG, PNG, WebP or AVIF · Maximum 5MB
                </small>

                {form.file && (
                  <strong className={styles.fileName}>
                    {form.file.name}
                  </strong>
                )}
              </label>

              <div className={styles.twoFields}>
                <label className={styles.field}>
                  <span>SLIDE NUMBER *</span>

                  <input
                    type="number"
                    min="1"
                    value={form.slideNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slideNumber: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className={styles.field}>
                  <span>LABEL</span>

                  <input
                    type="text"
                    maxLength={100}
                    value={form.label}
                    placeholder="Business support, built around you."
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        label: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>ALT TEXT</span>

                <input
                  type="text"
                  maxLength={180}
                  value={form.altText}
                  placeholder="Osmium BPO team supporting business operations"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      altText: event.target.value,
                    }))
                  }
                />

                <small>
                  Describe the image for accessibility.
                </small>
              </label>

              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving}
              >
                {saving ? "Uploading..." : "Add Hero image ↗"}
              </button>
            </form>

            <div className={styles.infoBox}>
              <span>✓</span>
              <div>
                <strong>Safe website media</strong>
                <p>
                  Hero images are stored separately from private applicant
                  CVs in the public website-media bucket.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.slidesColumn}>
            <div className={styles.listHeader}>
              <div>
                <p className={styles.eyebrow}>CURRENT SLIDES</p>
                <h2>Your Hero</h2>
              </div>

              <span>{slides.length} total</span>
            </div>

            {pageLoading ? (
              <div className={styles.emptyState}>
                <strong>Loading Hero slides...</strong>
                <p>Getting your website images.</p>
              </div>
            ) : slides.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✦</div>
                <strong>No Hero slides yet.</strong>
                <p>
                  Add your first image using the form on the left.
                </p>
              </div>
            ) : (
              <div className={styles.slideList}>
                {slides.map((slide) => (
                  <article
                    key={slide.id}
                    className={`${styles.slideCard} ${
                      !slide.is_active ? styles.slideInactive : ""
                    }`}
                  >
                    <div className={styles.preview}>
                      <img
                        src={slide.image_url}
                        alt={slide.alt_text || ""}
                      />

                      <span className={styles.number}>
                        {String(slide.slide_number).padStart(2, "0")}
                      </span>

                      <span
                        className={`${styles.status} ${
                          slide.is_active
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {slide.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <div className={styles.slideDetails}>
                      <div>
                        <p className={styles.slideLabel}>
                          {slide.label || "Untitled Hero slide"}
                        </p>

                        <p className={styles.slideAlt}>
                          {slide.alt_text || "No alt text added."}
                        </p>
                      </div>

                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => toggleSlide(slide)}
                        >
                          {slide.is_active ? "Hide" : "Activate"}
                        </button>

                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => deleteSlide(slide)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className={styles.footer}>
          <Link href="/admin/website">← Back to Website Management</Link>
          <Link href="/admin">Admin Dashboard →</Link>
        </footer>
      </div>
    </main>
  );
}