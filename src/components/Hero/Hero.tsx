"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Hero.module.css";
import { createClient } from "@/utils/supabase/client";

/* =========================================================
   FALLBACK HERO IMAGES

   These remain as a safety net.
   If Supabase has no active Hero slides or the request fails,
   the website will still have a working Hero.
========================================================= */

const fallbackHeroImages = [
  {
    src: "/images/hero/hero-team.jpg",
    alt: "Osmium BPO team supporting business operations",
    number: "01",
    label: "Business support, built around you.",
  },
  {
    src: "/images/hero/hero-office.jpg",
    alt: "Osmium BPO professionals working in a modern office",
    number: "02",
    label: "People and processes working together.",
  },
  {
    src: "/images/hero/hero-callcentre.jpg",
    alt: "Osmium BPO customer support professionals at work",
    number: "03",
    label: "Professional customer communication.",
  },
  {
    src: "/images/hero/hero-primary.jpg",
    alt: "Osmium BPO leadership team representing professional business support",
    number: "04",
    label: "Built for businesses ready to grow.",
  },
];

/* =========================================================
   DATABASE HERO SLIDE
========================================================= */

type DatabaseHeroSlide = {
  id: string;
  image_url: string;
  alt_text: string | null;
  label: string | null;
  slide_number: number;
  is_active: boolean;
};

/* =========================================================
   NORMALIZED HERO IMAGE
========================================================= */

type HeroImage = {
  src: string;
  alt: string;
  number: string;
  label: string;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Hero() {
  /* =======================================================
     HERO STATE

     Fallback images are available immediately so the Hero
     never depends on Supabase before rendering.
  ======================================================= */

  const [heroImages, setHeroImages] =
    useState<HeroImage[]>(fallbackHeroImages);

  const [activeImage, setActiveImage] = useState(0);

  /* =======================================================
     SUPABASE CLIENT

     Keep one stable browser client for this component.
     This prevents the client reference from changing on
     every render and keeps the loading effect predictable.
  ======================================================= */

  const supabase = useMemo(() => createClient(), []);

  /* =======================================================
     LOAD PUBLIC HERO SLIDES

     Only active slides are displayed publicly.

     The order is controlled by slide_number from the
     admin Hero management system.
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadHeroSlides = async () => {
      try {
        const { data, error } = await supabase
          .from("hero_slides")
          .select(
            "id, image_url, alt_text, label, slide_number, is_active"
          )
          .eq("is_active", true)
          .order("slide_number", {
            ascending: true,
          });

        if (error) {
          console.error(
            "[Hero] Failed to load database slides:",
            error
          );

          return;
        }

        if (!mounted) {
          return;
        }

        /*
         * If the admin has active slides, those become the
         * public Hero.
         */
        if (data && data.length > 0) {
          const databaseImages: HeroImage[] = (
            data as DatabaseHeroSlide[]
          ).map((slide) => ({
            src: slide.image_url,
            alt:
              slide.alt_text ||
              "Osmium BPO business operations support",
            number: String(slide.slide_number).padStart(2, "0"),
            label:
              slide.label ||
              "Business support, built around you.",
          }));

          setHeroImages(databaseImages);
          setActiveImage(0);
        }
      } catch (error) {
        console.error(
          "[Hero] Unexpected Hero loading error:",
          error
        );
      }
    };

    void loadHeroSlides();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* =======================================================
     ACTIVE INDEX SAFETY

     Prevent the active index from ever pointing beyond
     the available slides.
  ======================================================= */

  useEffect(() => {
    if (heroImages.length === 0) {
      return;
    }

    if (activeImage >= heroImages.length) {
      setActiveImage(0);
    }
  }, [activeImage, heroImages.length]);

  /* =======================================================
     AUTOMATIC IMAGE ROTATION

     Rotate every 6 seconds when there is more than one
     available Hero image.
  ======================================================= */

  useEffect(() => {
    if (heroImages.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveImage((current) => {
        return (current + 1) % heroImages.length;
      });
    }, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, [heroImages.length]);

  /* =======================================================
     CURRENT IMAGE

     The fallback prevents an invalid render even if the
     image array somehow becomes empty.
  ======================================================= */

  const currentImage =
    heroImages[activeImage] || fallbackHeroImages[0];

  /* =======================================================
     HERO RENDER
  ======================================================= */

  return (
    <section
      className={styles.hero}
      id="home"
      aria-labelledby="hero-heading"
    >
      {/* ===================================================
          BACKGROUND SYSTEM
      =================================================== */}

      <div
        className={styles.heroGrid}
        aria-hidden="true"
      />

      <div
        className={styles.heroGlow}
        aria-hidden="true"
      />

      <div className={styles.heroInner}>

        {/* =================================================
            HERO CONTENT
        ================================================= */}

        <div className={styles.heroContent}>

          <div className={styles.heroEyebrow}>
            <span aria-hidden="true" />

            <p>
              Professional BPO Solutions
            </p>
          </div>

          <h1 id="hero-heading">
            We Handle
            <br />
            the <span>Processes.</span>
          </h1>

          <div className={styles.heroStatement}>
            <span
              className={styles.statementLine}
              aria-hidden="true"
            />

            <p>
              You Grow the Business.
            </p>
          </div>

          <p className={styles.heroDescription}>
            Osmium BPO helps businesses delegate the work behind
            the work — from customer communication and virtual
            support to business processes and operational services.
          </p>

          {/* =================================================
              HERO ACTIONS
          ================================================= */}

          <div className={styles.heroActions}>

            <a
              href="#services"
              className={styles.primaryButton}
            >
              <span>
                Explore Our Services
              </span>

              <strong aria-hidden="true">
                ↗
              </strong>
            </a>

            <a
              href="#contact"
              className={styles.textButton}
            >
              <span>
                Talk to Osmium
              </span>

              <strong aria-hidden="true">
                →
              </strong>
            </a>

          </div>

          {/* =================================================
              TRUST LINE
          ================================================= */}

          <div className={styles.heroTrust}>
            <span
              className={styles.trustLine}
              aria-hidden="true"
            />

            <p>
              Built for businesses ready to operate smarter.
            </p>
          </div>

        </div>

        {/* ===================================================
            HERO VISUAL
        =================================================== */}

        <div className={styles.heroVisual}>

          <div className={styles.heroImage}>

            {/* ===============================================
                DATABASE / FALLBACK IMAGE SLIDES
            =============================================== */}

            <div className={styles.heroSlides}>

              {heroImages.map((image, index) => (
                <div
                  key={`${image.src}-${index}`}
                  className={`${styles.heroSlide} ${
                    index === activeImage
                      ? styles.heroSlideActive
                      : ""
                  }`}
                  aria-hidden={index !== activeImage}
                >
                  <img
                    src={image.src}
                    alt={
                      index === activeImage
                        ? image.alt
                        : ""
                    }
                    className={styles.heroImageAsset}
                  />
                </div>
              ))}

            </div>

            {/* ===============================================
                IMAGE SHADE
            =============================================== */}

            <div
              className={styles.heroImageShade}
              aria-hidden="true"
            />

            {/* ===============================================
                IMAGE TYPOGRAPHIC OVERLAY
            =============================================== */}

            <div className={styles.heroImageContent}>

              <span>
                OSMIUM BPO
              </span>

              <strong>
                People.
              </strong>

              <strong>
                Processes.
              </strong>

              <strong>
                Performance.
              </strong>

            </div>

            {/* ===============================================
                IMAGE LABEL
            =============================================== */}

            <div className={styles.heroImageLabel}>

              <span>
                {currentImage.number}
              </span>

              <p>
                {currentImage.label}
              </p>

            </div>

          </div>

          {/* =================================================
              OSMIUM ACCENT
          ================================================= */}

          <div
            className={styles.heroAccent}
            aria-hidden="true"
          >
            <span>
              OS
            </span>
          </div>

          {/* =================================================
              VISUAL INDEX
          ================================================= */}

          <div
            className={styles.heroVisualIndex}
            aria-hidden="true"
          >
            <span>
              {currentImage.number}
            </span>

            <span />

            <span>
              OSMIUM / 2026
            </span>

          </div>

        </div>

      </div>
    </section>
  );
}