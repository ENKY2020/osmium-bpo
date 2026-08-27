import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

import styles from "./page.module.css";

const principles = [
  {
    number: "01",
    title: "People first",
    text: "Strong operations begin with capable people, clear responsibility and a culture of accountability.",
  },
  {
    number: "02",
    title: "Process with purpose",
    text: "We build practical workflows around how a business actually operates, not around a one-size-fits-all outsourcing model.",
  },
  {
    number: "03",
    title: "Capacity that scales",
    text: "The right support should give your internal team room to focus while creating dependable capacity for growth.",
  },
  {
    number: "04",
    title: "Performance that matters",
    text: "The goal is not simply to delegate work. It is to make the work more consistent, visible and effective.",
  },
];

const operatingModel = [
  {
    number: "01",
    title: "Understand",
    text: "We start by understanding the work, the people involved and where operational pressure is building.",
  },
  {
    number: "02",
    title: "Structure",
    text: "We identify what can be delegated, define responsibilities and create a practical operating structure.",
  },
  {
    number: "03",
    title: "Operate",
    text: "Our professionals take ownership of agreed processes while staying aligned with your business.",
  },
  {
    number: "04",
    title: "Improve",
    text: "We look for ways to strengthen workflows, communication and capacity as the operation evolves.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className={styles.aboutPage}>
        {/* =========================================================
            HERO
        ========================================================= */}

        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>OSMIUM BPO</span>
            </div>

            <p className={styles.heroKicker}>
              PROFESSIONAL BPO SOLUTIONS
            </p>

            <h1 id="about-heading" className={styles.heroTitle}>
              Built around the work
              <em>behind your growth.</em>
            </h1>

            <div className={styles.heroBottom}>
              <p className={styles.heroIntro}>
                Osmium BPO helps businesses create dependable operational
                capacity by taking ownership of the work that keeps their
                teams moving.
              </p>

              <Link href="#our-story" className={styles.heroLink}>
                Discover Osmium
                <span aria-hidden="true">↘</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <Image
              src="/images/hero/hero-office.jpg"
              alt="Osmium BPO professionals working together in a modern office"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.heroImage}
            />

            <div className={styles.heroVisualOverlay} />

            <div className={styles.heroVisualLabel}>
              <span>PEOPLE</span>
              <span>PROCESS</span>
              <span>CAPACITY</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            OUR STORY
        ========================================================= */}

        <section
          id="our-story"
          className={styles.storySection}
          aria-labelledby="story-heading"
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>OUR STORY</span>
            </div>

            <span className={styles.sectionIndex}>01 / 04</span>
          </div>

          <div className={styles.storyGrid}>
            <div className={styles.storyTitleColumn}>
              <h2 id="story-heading">
                The work behind
                <em>the work.</em>
              </h2>
            </div>

            <div className={styles.storyContent}>
              <p className={styles.leadParagraph}>
                Every growing business has work that matters but does not
                necessarily need to stay inside the core team.
              </p>

              <p>
                Customer communication. Administrative responsibilities.
                Virtual support. Documentation. Recurring operational
                processes.
              </p>

              <p>
                Osmium exists to take ownership of that work and turn it into
                dependable operational capacity.
              </p>

              <p>
                We believe outsourcing should not mean losing visibility or
                control. Done properly, it gives businesses more room to focus
                on the decisions, relationships and opportunities that move
                them forward.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            IMAGE / PEOPLE MOMENT
        ========================================================= */}

        <section className={styles.peopleSection}>
          <div className={styles.peopleImage}>
            <Image
              src="/images/hero/hero-team.jpg"
              alt="Osmium BPO team representing professional operational support"
              fill
              sizes="(max-width: 900px) 100vw, 60vw"
              className={styles.peopleImageAsset}
            />
          </div>

          <div className={styles.peopleStatement}>
            <span className={styles.statementNumber}>02</span>

            <p className={styles.statementEyebrow}>
              PEOPLE × PROCESS × CAPACITY
            </p>

            <h2>
              We don&apos;t just
              <em>take work away.</em>
            </h2>

            <p>
              We create the structure around it so the work can be handled
              properly, consistently and with accountability.
            </p>
          </div>
        </section>

        {/* =========================================================
            PRINCIPLES
        ========================================================= */}

        <section
          className={styles.principlesSection}
          aria-labelledby="principles-heading"
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>WHAT WE BELIEVE</span>
            </div>

            <span className={styles.sectionIndex}>03 / 04</span>
          </div>

          <div className={styles.principlesIntro}>
            <h2 id="principles-heading">
              Good outsourcing
              <em>feels dependable.</em>
            </h2>

            <p>
              Our approach is built around a simple idea: businesses should
              gain capacity without sacrificing quality, communication or
              control.
            </p>
          </div>

          <div className={styles.principlesGrid}>
            {principles.map((principle) => (
              <article
                key={principle.number}
                className={styles.principleCard}
              >
                <span className={styles.cardNumber}>{principle.number}</span>

                <div className={styles.cardContent}>
                  <h3>{principle.title}</h3>
                  <span className={styles.cardRule} />
                  <p>{principle.text}</p>
                </div>

                <span className={styles.cardArrow} aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================
            OPERATING MODEL
        ========================================================= */}

        <section
          className={styles.modelSection}
          aria-labelledby="model-heading"
        >
          <div className={styles.modelVisual}>
            <div className={styles.modelCircleOuter} aria-hidden="true" />
            <div className={styles.modelCircleMiddle} aria-hidden="true" />

            <div className={styles.modelCore}>
              <span>OS</span>
            </div>

            <span className={styles.modelLabelTop}>OSMIUM BPO</span>
            <span className={styles.modelLabelBottom}>
              PEOPLE. PROCESSES. PERFORMANCE.
            </span>
          </div>

          <div className={styles.modelContent}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>HOW WE WORK</span>
            </div>

            <h2 id="model-heading">
              From overloaded
              <em>to supported.</em>
            </h2>

            <p className={styles.modelIntro}>
              We make delegation easier by turning unclear operational
              pressure into a structured process.
            </p>

            <div className={styles.modelSteps}>
              {operatingModel.map((step) => (
                <article key={step.number} className={styles.modelStep}>
                  <span>{step.number}</span>

                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            CLOSING STATEMENT
        ========================================================= */}

        <section className={styles.closingSection}>
          <div className={styles.closingInner}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>THE OSMIUM DIRECTION</span>
            </div>

            <h2>
              Build the business.
              <em>We&apos;ll help carry the work.</em>
            </h2>

            <p>
              Whether you need customer support, virtual assistance,
              back-office operations or a broader outsourcing structure,
              Osmium is built to help you create the capacity to move forward.
            </p>

            <div className={styles.closingActions}>
              <Link href="/services" className={styles.primaryButton}>
                Explore our services
                <span aria-hidden="true">↗</span>
              </Link>

              <Link href="/contact" className={styles.secondaryLink}>
                Talk to Osmium
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}