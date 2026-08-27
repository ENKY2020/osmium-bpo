"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CTA.module.css";

const steps = [
  {
    number: "01",
    label: "Tell us what is slowing you down.",
  },
  {
    number: "02",
    label: "We identify the processes worth delegating.",
  },
  {
    number: "03",
    label: "Osmium builds the support around your operation.",
  },
];

const needs = [
  "Customer communication",
  "Virtual assistance",
  "Back-office operations",
  "Business process outsourcing",
  "Document & contract operations",
  "Not sure yet",
];

export default function CTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState("");

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const consultationHref = selectedNeed
    ? `mailto:hello@osmiumbpo.com?subject=Osmium%20BPO%20Consultation&body=I%27m%20interested%20in%3A%20${encodeURIComponent(
        selectedNeed
      )}`
    : "mailto:hello@osmiumbpo.com?subject=Osmium%20BPO%20Consultation";

  return (
    <section
      ref={sectionRef}
      className={`${styles.ctaSection} ${
        isVisible ? styles.isVisible : ""
      }`}
      id="contact"
    >
      <div className={styles.ctaPattern} />

      <div className={styles.sectionContainer}>
        {/* =====================================================
            INTRO
        ===================================================== */}

        <div className={styles.ctaIntro}>
          <p className={styles.eyebrow}>
            READY TO DELEGATE?
          </p>

          <p className={styles.sectionIndex}>
            03 / 04
          </p>
        </div>

        {/* =====================================================
            MAIN CTA
        ===================================================== */}

        <div className={styles.ctaGrid}>
          <div className={styles.ctaCopy}>
            <h2>
              Let&apos;s make your
              <em>business lighter.</em>
            </h2>

            <p>
              Tell us what is slowing your business down. We&apos;ll
              explore where Osmium can take the weight off your team.
            </p>

            <div className={styles.ctaActions}>
              <a
                href={consultationHref}
                className={styles.primaryAction}
              >
                <span>Request a Consultation</span>
                <strong>↗</strong>
              </a>

              <a
                href="mailto:hello@osmiumbpo.com"
                className={styles.secondaryAction}
              >
                Start a conversation
                <span>→</span>
              </a>
            </div>
          </div>

          {/* ===================================================
              INTERACTIVE PROCESS
          =================================================== */}

          <div className={styles.processPanel}>
            <p className={styles.processEyebrow}>
              THE OSMIUM START
            </p>

            <div className={styles.steps}>
              {steps.map((step) => (
                <div
                  className={styles.step}
                  key={step.number}
                >
                  <span className={styles.stepNumber}>
                    {isVisible ? step.number : "00"}
                  </span>

                  <p>{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================
            NEED SELECTOR
        ===================================================== */}

        <div className={styles.needArea}>
          <div className={styles.needHeader}>
            <p>WHAT WOULD YOU LIKE TO DELEGATE?</p>

            <span>
              {selectedNeed
                ? "READY"
                : "SELECT ONE"}
            </span>
          </div>

          <div className={styles.needOptions}>
            {needs.map((need) => {
              const isSelected = selectedNeed === need;

              return (
                <button
                  key={need}
                  type="button"
                  className={`${styles.needOption} ${
                    isSelected ? styles.selected : ""
                  }`}
                  onClick={() =>
                    setSelectedNeed(
                      isSelected ? "" : need
                    )
                  }
                  aria-pressed={isSelected}
                >
                  <span>{need}</span>
                  <strong>
                    {isSelected ? "✓" : "↗"}
                  </strong>
                </button>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            FINAL PROMISE
        ===================================================== */}

        <div className={styles.ctaBottom}>
          <p>
            You don&apos;t need to know exactly what to outsource.
          </p>

          <strong>
            That&apos;s what the conversation is for.
          </strong>
        </div>
      </div>
    </section>
  );
}