"use client";

import styles from "./Approach.module.css";

const approachSteps = [
  {
    number: "01",
    title: "Tell us what is slowing you down.",
    description:
      "We start with the work that is consuming your team&apos;s time, attention or capacity.",
  },
  {
    number: "02",
    title: "We identify what is worth delegating.",
    description:
      "Together, we separate the work your team should own from the processes Osmium can take over.",
  },
  {
    number: "03",
    title: "We build the support around your operation.",
    description:
      "The people, process and support structure are shaped around how your business actually works.",
  },
];

export default function Approach() {
  return (
    <section
      className={styles.introSection}
      id="about"
      aria-labelledby="approach-heading"
    >
      <div className={styles.sectionContainer}>

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className={styles.introTop}>
          <p className={styles.sectionEyebrow}>
            THE OSMIUM APPROACH
          </p>

          <span
            className={styles.sectionIndex}
            aria-hidden="true"
          >
            01 / 04
          </span>
        </div>


        {/* =====================================================
            MAIN INTRO
        ===================================================== */}

        <div className={styles.introGrid}>

          <div className={styles.headingColumn}>
            <h2
              id="approach-heading"
              className={styles.displayHeading}
            >
              Your business should not have to do{" "}
              <em>everything.</em>
            </h2>

            <div
              className={styles.headingMarker}
              aria-hidden="true"
            >
              <span />
              <small>
                PEOPLE × PROCESS × CAPACITY
              </small>
            </div>
          </div>


          <div className={styles.introCopy}>
            <p>
              Growth becomes difficult when your team is buried in
              the processes that keep the business running.
            </p>

            <p>
              Osmium gives businesses the people, support and
              operational capacity to delegate those processes
              with confidence.
            </p>

            <a
              href="#why-osmium"
              className={styles.inlineLink}
            >
              <span>
                Why businesses choose Osmium
              </span>

              <strong aria-hidden="true">
                ↗
              </strong>
            </a>
          </div>
        </div>


        {/* =====================================================
            THE OSMIUM START
        ===================================================== */}

        <div
          className={styles.approachStart}
          aria-labelledby="approach-start-heading"
        >
          <div className={styles.startHeader}>
            <div>
              <p className={styles.startEyebrow}>
                THE OSMIUM START
              </p>

              <h3 id="approach-start-heading">
                From overloaded
                <em>to supported.</em>
              </h3>
            </div>

            <p className={styles.startIntro}>
              A simple process designed to make delegation
              feel clear before it becomes operational.
            </p>
          </div>


          <div className={styles.approachSteps}>
            {approachSteps.map((step) => (
              <article
                key={step.number}
                className={styles.approachStep}
              >
                <div className={styles.stepTop}>
                  <span className={styles.stepNumber}>
                    {step.number}
                  </span>

                  <span
                    className={styles.stepArrow}
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>

                <div className={styles.stepContent}>
                  <h4>
                    {step.title}
                  </h4>

                  <div
                    className={styles.stepRule}
                    aria-hidden="true"
                  />

                  <p>
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>


        {/* =====================================================
            CLOSING STATEMENT
        ===================================================== */}

        <div className={styles.approachClosing}>
          <span
            className={styles.closingLine}
            aria-hidden="true"
          />

          <p>
            You do not need to know exactly what to outsource.
          </p>

          <strong>
            That&apos;s what the conversation is for.
          </strong>
        </div>

      </div>
    </section>
  );
}