import Link from "next/link";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.css";

type Service = {
  number: string;
  category: string;
  title: string;
  description: string;
  intro: string;
  handles: string[];
  value: string;
};

const services: Service[] = [
  {
    number: "01",
    category: "CUSTOMER EXPERIENCE",
    title: "Call Centre",
    description:
      "Inbound, outbound and customer support operations delivered by professional teams.",
    intro:
      "Give your customers dependable communication without keeping your internal team tied to every interaction.",
    handles: [
      "Inbound customer support",
      "Outbound communication",
      "Customer enquiries",
      "Follow-ups and callbacks",
      "Appointment and support workflows",
    ],
    value:
      "Consistent customer communication while your team gets more room to focus on growth.",
  },

  {
    number: "02",
    category: "REMOTE SUPPORT",
    title: "Virtual Assistance",
    description:
      "Administrative, executive and operational support from dependable remote professionals.",
    intro:
      "Extend your team with capable remote professionals who can take ownership of recurring administrative and operational work.",
    handles: [
      "Administrative support",
      "Executive assistance",
      "Calendar and scheduling",
      "Research and data tasks",
      "Recurring operational support",
    ],
    value:
      "More capacity without immediately carrying the overhead of another full internal function.",
  },

  {
    number: "03",
    category: "OPERATIONS",
    title: "Back-office Outsourcing",
    description:
      "Data processing, administration, documentation and recurring business operations.",
    intro:
      "Move repetitive operational work away from your core team and into a structured support environment.",
    handles: [
      "Data processing",
      "Administrative operations",
      "Documentation",
      "Records and information handling",
      "Recurring business processes",
    ],
    value:
      "Keep important operational work moving while your internal team concentrates on higher-value priorities.",
  },

  {
    number: "04",
    category: "WORKFORCE",
    title: "Remote Workforce",
    description:
      "Flexible workforce solutions that help businesses extend capacity without unnecessary overhead.",
    intro:
      "Add dependable remote capacity around the work your business actually needs done.",
    handles: [
      "Dedicated remote professionals",
      "Flexible team capacity",
      "Operational staffing support",
      "Role-specific workforce solutions",
      "Scalable support structures",
    ],
    value:
      "Increase capacity when you need it without building every capability from scratch internally.",
  },

  {
    number: "05",
    category: "BPO",
    title: "Business Process Outsourcing",
    description:
      "Structured outsourcing solutions for businesses looking to delegate complete processes.",
    intro:
      "When a process needs more than an extra pair of hands, Osmium can help take responsibility for the workflow itself.",
    handles: [
      "Process management",
      "End-to-end operational support",
      "Recurring business workflows",
      "Process documentation",
      "Performance-focused delivery",
    ],
    value:
      "Delegate complete processes with clearer ownership, structure and operational consistency.",
  },

  {
    number: "06",
    category: "DOCUMENT OPERATIONS",
    title: "Document & Contract Operations",
    description:
      "Organised document handling and operational support for information-heavy business processes.",
    intro:
      "Bring structure to document-heavy work that requires consistency, organisation and dependable handling.",
    handles: [
      "Document preparation",
      "Data organisation",
      "Contract administration",
      "File and information handling",
      "Document workflow support",
    ],
    value:
      "Keep document-heavy operations organised, consistent and moving.",
  },
];

/*
 * Keeps service anchors predictable.
 *
 * Example:
 * "Call Centre" → #call-centre
 * "Business Process Outsourcing" → #business-process-outsourcing
 */
function createServiceId(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ServicesPage() {
  return (
    <main className={styles.servicesPage}>
      {/* =========================================================
          01 — SHARED NAVIGATION
      ========================================================= */}

      <Navbar />

      {/* =========================================================
          02 — SERVICES HERO
      ========================================================= */}

      <section
        className={styles.servicesHero}
        id="services-intro"
        aria-labelledby="services-heading"
      >
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>OSMIUM BPO</span>
            </div>

            <p className={styles.heroKicker}>
              Professional BPO Solutions
            </p>

            <h1
              id="services-heading"
              className={styles.heroTitle}
            >
              The work behind
              <br />
              <em>your growth.</em>
            </h1>

            <p className={styles.heroDescription}>
              Delegate the processes that consume your time and let your
              team focus on the work that moves the business forward.
            </p>

            <div className={styles.heroActions}>
              <Link
                href="#service-list"
                className={styles.primaryButton}
              >
                <span>Explore our services</span>
                <span aria-hidden="true">↘</span>
              </Link>

              <Link
                href="/#contact"
                className={styles.textButton}
              >
                <span>Talk to Osmium</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div
            className={styles.heroMeta}
            aria-hidden="true"
          >
            <span>PEOPLE</span>
            <span>PROCESS</span>
            <span>CAPACITY</span>
          </div>
        </div>
      </section>

      {/* =========================================================
          03 — SERVICE INTRO
      ========================================================= */}

      <section
        className={styles.serviceSection}
        id="service-list"
        aria-labelledby="service-list-heading"
      >
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <div className={styles.sectionIntroTop}>
              <span className={styles.eyebrow}>
                What We Do
              </span>

              <span className={styles.sectionCounter}>
                01 / {String(services.length).padStart(2, "0")}
              </span>
            </div>

            <div className={styles.sectionIntroMain}>
              <h2
                id="service-list-heading"
                className={styles.sectionTitle}
              >
                Support where your business
                <br />
                needs <em>capacity.</em>
              </h2>

              <p className={styles.sectionDescription}>
                Osmium helps businesses delegate customer communication,
                administrative work, operational processes and other
                recurring responsibilities so internal teams can operate
                with greater focus.
              </p>
            </div>
          </div>

          {/* =======================================================
              04 — SERVICE GRID
          ======================================================= */}

          <div className={styles.serviceGrid}>
            {services.map((service) => {
              const serviceId = createServiceId(service.title);

              return (
                <article
                  key={service.number}
                  id={serviceId}
                  className={styles.serviceCard}
                >
                  {/* CARD TOP */}

                  <div className={styles.serviceCardTop}>
                    <span className={styles.serviceNumber}>
                      {service.number}
                    </span>

                    <span
                      className={styles.serviceArrow}
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>

                  {/* CARD TITLE */}

                  <div className={styles.serviceCardMain}>
                    <p className={styles.serviceCategory}>
                      {service.category}
                    </p>

                    <h3 className={styles.serviceTitle}>
                      {service.title}
                    </h3>

                    <div className={styles.titleRule} />

                    <p className={styles.serviceDescription}>
                      {service.description}
                    </p>
                  </div>

                  {/* =================================================
                      SERVICE DETAIL PANEL
                  ================================================= */}

                  <div className={styles.serviceDetail}>
                    <p className={styles.detailLabel}>
                      {service.number} / Osmium Service
                    </p>

                    <h4 className={styles.detailTitle}>
                      {service.title}
                    </h4>

                    <p className={styles.detailDescription}>
                      {service.intro}
                    </p>

                    {/* WHAT WE HANDLE */}

                    <div className={styles.handlesSection}>
                      <p className={styles.detailLabel}>
                        What We Can Handle
                      </p>

                      <ul className={styles.handlesGrid}>
                        {service.handles.map((item) => (
                          <li
                            key={item}
                            className={styles.handleItem}
                          >
                            <span
                              className={styles.handlePlus}
                              aria-hidden="true"
                            >
                              +
                            </span>

                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* VALUE */}

                    <div className={styles.valuePanel}>
                      <p className={styles.detailLabel}>
                        The Value
                      </p>

                      <p className={styles.valueText}>
                        {service.value}
                      </p>
                    </div>

                    {/* SERVICE CTA */}

                    <Link
                      href="/#contact"
                      className={styles.serviceLink}
                    >
                      <span>Talk to Osmium</span>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          05 — NOT SURE WHERE TO START
      ========================================================= */}

      <section
        className={styles.guidanceSection}
        id="service-guidance"
        aria-labelledby="guidance-heading"
      >
        <div className={styles.container}>
          <div className={styles.guidanceGrid}>
            <div className={styles.guidanceLabel}>
              <span className={styles.eyebrow}>
                Not Sure Where To Start?
              </span>
            </div>

            <div className={styles.guidanceContent}>
              <h2
                id="guidance-heading"
                className={styles.guidanceTitle}
              >
                You do not need to know exactly
                <br />
                <em>what to outsource.</em>
              </h2>

              <p className={styles.guidanceDescription}>
                Tell us what is slowing your business down. We will help
                identify the processes that make sense to delegate and
                shape the right support around your operation.
              </p>

              <Link
                href="/#contact"
                className={styles.primaryButton}
              >
                <span>Start a conversation</span>
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          06 — THE OSMIUM START
      ========================================================= */}

      <section
        className={styles.startSection}
        id="osmium-start"
        aria-labelledby="start-heading"
      >
        <div className={styles.container}>
          <div className={styles.startGrid}>
            <div className={styles.startIntro}>
              <span className={styles.eyebrow}>
                The Osmium Start
              </span>

              <h2
                id="start-heading"
                className={styles.startTitle}
              >
                From overloaded
                <br />
                to <em>supported.</em>
              </h2>

              <p className={styles.startDescription}>
                A simple process designed to make delegation feel clear
                before it becomes operational.
              </p>
            </div>

            <ol className={styles.processList}>
              <li className={styles.processStep}>
                <span className={styles.processNumber}>
                  01
                </span>

                <div className={styles.processContent}>
                  <h3>
                    Tell us what is slowing you down.
                  </h3>

                  <p>
                    Start with the work that is consuming your team&apos;s
                    time, attention or capacity.
                  </p>
                </div>
              </li>

              <li className={styles.processStep}>
                <span className={styles.processNumber}>
                  02
                </span>

                <div className={styles.processContent}>
                  <h3>
                    We identify what is worth delegating.
                  </h3>

                  <p>
                    Together, we separate the work your team should
                    own from the processes Osmium can take over.
                  </p>
                </div>
              </li>

              <li className={styles.processStep}>
                <span className={styles.processNumber}>
                  03
                </span>

                <div className={styles.processContent}>
                  <h3>
                    We build the support around your operation.
                  </h3>

                  <p>
                    The people, process and support structure are
                    shaped around how your business actually works.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* =========================================================
          07 — FINAL CTA
      ========================================================= */}

      <section
        className={styles.finalCta}
        id="services-cta"
        aria-labelledby="services-cta-heading"
      >
        <div className={styles.container}>
          <div className={styles.finalCtaContent}>
            <span className={styles.eyebrow}>
              Ready To Delegate?
            </span>

            <h2
              id="services-cta-heading"
              className={styles.finalCtaTitle}
            >
              Let&apos;s make your
              <br />
              <em>business lighter.</em>
            </h2>

            <p className={styles.finalCtaDescription}>
              Tell us what is slowing your business down. We&apos;ll explore
              where Osmium can take the weight off your team.
            </p>

            <div className={styles.finalCtaActions}>
              <Link
                href="/#contact"
                className={styles.primaryButton}
              >
                <span>Request a Consultation</span>
                <span aria-hidden="true">↗</span>
              </Link>

              <Link
                href="/#contact"
                className={styles.secondaryButton}
              >
                <span>Start a conversation</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          08 — SHARED FOOTER
      ========================================================= */}

      <Footer />
    </main>
  );
}