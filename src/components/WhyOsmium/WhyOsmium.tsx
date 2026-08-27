"use client";

import { useState } from "react";
import styles from "./WhyOsmium.module.css";

/* =========================================================
   WHY OSMIUM — CORE REASONS
========================================================= */

const reasons = [
  {
    number: "01",
    title: "Cost-effective outsourcing",
    description:
      "Delegate recurring operational work without carrying the full overhead of building and maintaining an internal team for every process.",
  },
  {
    number: "02",
    title: "Scalable teams and solutions",
    description:
      "Start with the support you need today and expand the people, processes or operational capacity as your business grows.",
  },
  {
    number: "03",
    title: "Professional service delivery",
    description:
      "Clear responsibilities, dependable communication and structured workflows help keep delegated work consistent and accountable.",
  },
  {
    number: "04",
    title: "Global standards with local understanding",
    description:
      "Osmium combines professional operating standards with an understanding of the businesses, people and markets we serve.",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function WhyOsmium() {
  const [activeReason, setActiveReason] = useState(0);

  const selectedReason = reasons[activeReason];

  return (
    <section
      className={styles.whySection}
      id="why-osmium"
      aria-labelledby="why-osmium-heading"
    >
      <div className={styles.sectionContainer}>

        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div className={styles.sectionTop}>
          <p className={styles.sectionEyebrow}>
            WHY BUSINESSES CHOOSE OSMIUM
          </p>

          <span
            className={styles.sectionIndex}
            aria-hidden="true"
          >
            02 / 04
          </span>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className={styles.whyGrid}>

          {/* =================================================
              LEFT — POSITIONING
          ================================================= */}

          <div className={styles.whyHeading}>
            <p className={styles.headingLabel}>
              THE OSMIUM DIFFERENCE
            </p>

            <h2
              id="why-osmium-heading"
              className={styles.displayHeading}
            >
              Built for
              <em>Performance.</em>
            </h2>

            <div
              className={styles.goldRule}
              aria-hidden="true"
            />

            <p className={styles.headingCopy}>
              We combine capable people, structured processes and
              modern technology to help businesses operate with
              greater clarity, capacity and consistency.
            </p>
          </div>

          {/* =================================================
              RIGHT — INTERACTIVE REASONS
          ================================================= */}

          <div className={styles.reasonArea}>

            <div
              className={styles.reasonList}
              role="tablist"
              aria-label="Why businesses choose Osmium"
            >
              {reasons.map((reason, index) => {
                const isActive =
                  activeReason === index;

                return (
                  <button
                    key={reason.title}
                    type="button"
                    className={`${styles.reason} ${
                      isActive
                        ? styles.reasonActive
                        : ""
                    }`}
                    onClick={() =>
                      setActiveReason(index)
                    }
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`reason-panel-${index}`}
                    id={`reason-tab-${index}`}
                  >
                    <span
                      className={
                        styles.reasonNumber
                      }
                    >
                      {reason.number}
                    </span>

                    <span
                      className={
                        styles.reasonTitle
                      }
                    >
                      {reason.title}
                    </span>

                    <strong
                      className={
                        styles.reasonArrow
                      }
                      aria-hidden="true"
                    >
                      ↗
                    </strong>
                  </button>
                );
              })}
            </div>

            {/* =================================================
                ACTIVE REASON DETAIL
            ================================================= */}

            <div
              className={styles.reasonDetail}
              id={`reason-panel-${activeReason}`}
              role="tabpanel"
              aria-labelledby={`reason-tab-${activeReason}`}
            >
              <p
                className={styles.detailEyebrow}
              >
                {selectedReason.number} /
                {" "}
                OSMIUM PRINCIPLE
              </p>

              <h3>
                {selectedReason.title}
              </h3>

              <div
                className={styles.detailRule}
                aria-hidden="true"
              />

              <p
                className={styles.detailCopy}
              >
                {selectedReason.description}
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            PERFORMANCE PANEL
        ================================================= */}

        <div className={styles.performancePanel}>

          {/* =================================================
              PERFORMANCE VISUAL
          ================================================= */}

          <div
            className={
              styles.performanceVisual
            }
          >
            <div
              className={`${styles.performanceRing} ${styles.performanceRingOuter}`}
              aria-hidden="true"
            />

            <div
              className={`${styles.performanceRing} ${styles.performanceRingMiddle}`}
              aria-hidden="true"
            />

            <div
              className={
                styles.performanceCircle
              }
            >
              <span>OS</span>
            </div>

            <div
              className={
                styles.performanceSmallLabel
              }
            >
              OSMIUM BPO
            </div>

            <div
              className={
                styles.performanceCorner
              }
              aria-hidden="true"
            >
              03
            </div>
          </div>

          {/* =================================================
              PERFORMANCE COPY
          ================================================= */}

          <div
            className={
              styles.performanceCopy
            }
          >
            <p
              className={
                styles.performanceEyebrow
              }
            >
              PEOPLE × PROCESS × TECHNOLOGY
            </p>

            <h3>
              Outsourcing should feel like an
              extension of your business.
            </h3>

            <p
              className={
                styles.performanceDescription
              }
            >
              We focus on dependable service,
              clear communication and solutions
              that can grow alongside your
              operation.
            </p>

            <a
              href="#contact"
              className={
                styles.performanceLink
              }
            >
              <span>
                Talk to Osmium
              </span>

              <strong aria-hidden="true">
                ↗
              </strong>
            </a>
          </div>

        </div>

        {/* =================================================
            CLOSING STATEMENT
        ================================================= */}

        <div
          className={styles.whyClosing}
        >
          <span
            className={styles.closingLine}
            aria-hidden="true"
          />

          <div>
            <p>
              The goal is not simply to
              outsource work.
            </p>

            <strong>
              The goal is to create more room
              for your business to grow.
            </strong>
          </div>
        </div>

      </div>
    </section>
  );
}