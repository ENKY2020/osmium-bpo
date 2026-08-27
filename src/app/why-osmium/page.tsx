import Link from "next/link";


import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

import styles from "./page.module.css";

const differentiators = [
  {
    number: "01",
    title: "People who understand the work",
    description:
      "We build teams around the responsibilities being delegated, with clear ownership and the capability to handle the work consistently.",
  },
  {
    number: "02",
    title: "Processes built around your operation",
    description:
      "We do not force every business into the same outsourcing model. The support structure follows how your operation actually works.",
  },
  {
    number: "03",
    title: "Clear accountability",
    description:
      "Delegation works when responsibility is visible. We create clear ownership, communication and expectations around the work we handle.",
  },
  {
    number: "04",
    title: "Capacity you can scale",
    description:
      "As your requirements change, the support around the operation can change with them — without unnecessarily expanding your internal workload.",
  },
];

const trustPoints = [
  {
    number: "01",
    title: "Visibility",
    description:
      "You should know what is happening inside the work you have delegated.",
  },
  {
    number: "02",
    title: "Communication",
    description:
      "Clear communication keeps outsourced work connected to the people and decisions that matter.",
  },
  {
    number: "03",
    title: "Consistency",
    description:
      "Processes should produce dependable outcomes, not require constant intervention from your internal team.",
  },
  {
    number: "04",
    title: "Ownership",
    description:
      "The work we take on should have someone responsible for making sure it moves properly.",
  },
];

const operatingModel = [
  {
    number: "01",
    title: "Understand",
    description:
      "We start by understanding the work, the people involved and where the operational pressure is coming from.",
  },
  {
    number: "02",
    title: "Structure",
    description:
      "We identify what should remain with your internal team and what Osmium can responsibly take over.",
  },
  {
    number: "03",
    title: "Support",
    description:
      "We build the people, process and communication structure needed to handle the delegated work.",
  },
  {
    number: "04",
    title: "Improve",
    description:
      "As the operation develops, we look for opportunities to make the work clearer, more consistent and more efficient.",
  },
];

export default function WhyOsmiumPage() {
  return (
    <main className={styles.page}>
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            Why Osmium
          </div>

          <p className={styles.heroKicker}>
            PROFESSIONAL BPO SOLUTIONS
          </p>

          <h1 className={styles.heroTitle}>
            Built for the work
            <em>behind your growth.</em>
          </h1>

          <div className={styles.heroBottom}>
            <p>
              Outsourcing should give your business more capacity without
              creating another layer of work to manage.
            </p>

            <Link href="#difference" className={styles.heroLink}>
              Discover the difference
              <span>↘</span>
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroVisualFrame}>
            <div className={styles.heroVisualCircle} aria-hidden="true">
              <span>OS</span>
            </div>

            <div className={styles.heroVisualLabel}>
              PEOPLE × PROCESS × CAPACITY
            </div>

            <div className={styles.heroVisualNumber}>01</div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROBLEM
      ===================================================== */}

      <section className={styles.problemSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            The problem
          </div>

          <span className={styles.sectionIndex}>01 / 04</span>
        </div>

        <div className={styles.problemGrid}>
          <div>
            <h2>
              Outsourcing should not create
              <em>another problem.</em>
            </h2>
          </div>

          <div className={styles.problemContent}>
            <p className={styles.lead}>
              Delegating work only helps when the work actually becomes
              easier for your business to manage.
            </p>

            <p>
              Poorly structured outsourcing can create unclear ownership,
              inconsistent execution, communication gaps and more oversight
              than the original work required.
            </p>

            <p>
              Osmium is built around a different idea: take responsibility
              for the work while keeping the operation visible, connected
              and accountable.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          DIFFERENTIATION
      ===================================================== */}

      <section
        id="difference"
        className={styles.differenceSection}
      >
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            What makes Osmium different
          </div>

          <span className={styles.sectionIndex}>02 / 04</span>
        </div>

        <div className={styles.differenceIntro}>
          <h2>
            We do not just
            <em>take tasks away.</em>
          </h2>

          <p>
            We create the structure around the work so it can be handled
            properly, consistently and with accountability.
          </p>
        </div>

        <div className={styles.differenceGrid}>
          {differentiators.map((item) => (
            <article
              key={item.number}
              className={styles.differenceCard}
            >
              <span className={styles.cardNumber}>{item.number}</span>

              <div className={styles.cardContent}>
                <h3>{item.title}</h3>

                <span className={styles.cardRule} />

                <p>{item.description}</p>
              </div>

              <span className={styles.cardArrow} aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

            {/* =====================================================
          PHILOSOPHY
      ===================================================== */}

      <section className={styles.philosophySection}>
        <div className={styles.philosophyVisual}>
          <div
            className={`${styles.philosophyOrbit} ${styles.philosophyOrbitOuter}`}
            aria-hidden="true"
          >
            <span />
          </div>

          <div
            className={`${styles.philosophyOrbit} ${styles.philosophyOrbitMiddle}`}
            aria-hidden="true"
          >
            <span />
          </div>

          <div className={styles.philosophyCore}>
            <span>OS</span>
          </div>

          <div className={styles.philosophyLabel}>
            OSMIUM BPO
          </div>
        </div>

        <div className={styles.philosophyContent}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            Our operating philosophy
          </div>

          <h2>
            People.
            <br />
            Process.
            <br />
            <em>Performance.</em>
          </h2>

          <p className={styles.philosophyLead}>
            Good outsourcing is not simply about moving work somewhere
            else. It is about creating a dependable system around that work.
          </p>

          <div className={styles.philosophyEquation}>
            <span>PEOPLE</span>
            <b>×</b>
            <span>PROCESS</span>
            <b>×</b>
            <span>CAPACITY</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST
      ===================================================== */}

      <section className={styles.trustSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            Built around trust
          </div>

          <span className={styles.sectionIndex}>
            03 / 04
          </span>
        </div>

        <div className={styles.trustIntro}>
          <h2>
            You should never have to wonder
            <em>what is happening.</em>
          </h2>

          <p>
            When work leaves your internal team, visibility should not leave
            with it.
          </p>
        </div>

        <div className={styles.trustGrid}>
          {trustPoints.map((item) => (
            <article
              key={item.number}
              className={styles.trustCard}
            >
              <span className={styles.cardNumber}>
                {item.number}
              </span>

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          OPERATING MODEL
      ===================================================== */}

      <section className={styles.modelSection}>
        <div className={styles.modelVisual}>
          <div className={styles.modelVisualInner}>
            <span>OS</span>
          </div>
        </div>

        <div className={styles.modelContent}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            How we work
          </div>

          <h2>
            From operational pressure
            <em>to supported capacity.</em>
          </h2>

          <p className={styles.modelIntro}>
            We make delegation easier by turning unclear operational
            pressure into a structured process.
          </p>

          <div className={styles.modelSteps}>
            {operatingModel.map((step) => (
              <article
                key={step.number}
                className={styles.modelStep}
              >
                <span className={styles.modelStepNumber}>
                  {step.number}
                </span>

                <div className={styles.modelStepContent}>
                  <h3>{step.title}</h3>

                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          DIFFERENCE SUMMARY
      ===================================================== */}

      <section className={styles.summarySection}>
        <div className={styles.summaryInner}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            Why Osmium
          </div>

          <h2>
            More than outsourced work.
            <em>A better way to handle it.</em>
          </h2>

          <p>
            Osmium helps businesses delegate important operational work
            while maintaining the people, process and visibility needed to
            keep that work moving.
          </p>

          <div className={styles.summaryActions}>
            <Link
              href="/services"
              className={styles.primaryButton}
            >
              Explore our services
              <span aria-hidden="true">↗</span>
            </Link>

            <Link
              href="/contact"
              className={styles.secondaryLink}
            >
              Talk to Osmium
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}