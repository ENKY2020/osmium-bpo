"use client";

import { useState } from "react";
import styles from "./Services.module.css";

type Service = {
  number: string;
  title: string;
  description: string;
  tag: string;
  capabilities: string[];
  value: string;
};

const services: Service[] = [
  {
    number: "01",
    title: "Call Centre",
    tag: "CUSTOMER EXPERIENCE",
    description:
      "Inbound, outbound and customer support operations delivered by professional teams.",
    capabilities: [
      "Inbound customer support",
      "Outbound calls and follow-ups",
      "Appointment scheduling",
      "Customer enquiries",
    ],
    value:
      "Keep customer communication responsive without keeping every call inside your core team.",
  },

  {
    number: "02",
    title: "Virtual Assistance",
    tag: "REMOTE SUPPORT",
    description:
      "Administrative, executive and operational support from dependable remote professionals.",
    capabilities: [
      "Administrative support",
      "Calendar and scheduling",
      "Email and follow-up support",
      "Executive and routine assistance",
    ],
    value:
      "Give your team dependable operational support without adding unnecessary internal overhead.",
  },

  {
    number: "03",
    title: "Back-office Outsourcing",
    tag: "OPERATIONS",
    description:
      "Data processing, administration, documentation and recurring business operations.",
    capabilities: [
      "Data processing",
      "Documentation and records",
      "Administrative workflows",
      "Recurring operational tasks",
    ],
    value:
      "Move repetitive operational work away from the people who need to focus on growth.",
  },

  {
    number: "04",
    title: "Remote Workforce",
    tag: "WORKFORCE",
    description:
      "Flexible workforce solutions that help businesses extend capacity without unnecessary overhead.",
    capabilities: [
      "Dedicated remote personnel",
      "Flexible team capacity",
      "Operational support roles",
      "Workforce scaling",
    ],
    value:
      "Add capable people when workload grows without immediately expanding your internal structure.",
  },

  {
    number: "05",
    title: "Business Process Outsourcing",
    tag: "BPO",
    description:
      "Structured outsourcing solutions for businesses looking to delegate complete processes.",
    capabilities: [
      "End-to-end processes",
      "Recurring workflows",
      "Operational coordination",
      "Support functions",
    ],
    value:
      "Delegate an entire process rather than simply outsourcing individual tasks.",
  },

  {
    number: "06",
    title: "Document & Contract Operations",
    tag: "DOCUMENT OPERATIONS",
    description:
      "Organised document handling and operational support for information-heavy business processes.",
    capabilities: [
      "Document preparation",
      "Data organisation",
      "Contract administration",
      "File and information handling",
    ],
    value:
      "Keep document-heavy operations organised, consistent and moving.",
  },
];

export default function Services() {
  const [activeService, setActiveService] = useState<string | null>(null);

  const toggleService = (number: string) => {
    setActiveService((current) =>
      current === number ? null : number
    );
  };

  return (
    <section
      className={styles.servicesSection}
      id="services"
      aria-labelledby="services-heading"
    >
      <div className={styles.sectionContainer}>

        {/* =====================================================
            SECTION HEADER
        ===================================================== */}

        <div className={styles.sectionTop}>
          <p className={styles.sectionEyebrow}>
            WHAT WE DO
          </p>

          <span
            className={styles.sectionIndex}
            aria-hidden="true"
          >
            03 / 04
          </span>
        </div>


        {/* =====================================================
            INTRO
        ===================================================== */}

        <div className={styles.servicesHeading}>
          <div>
            <h2
              id="services-heading"
              className={styles.displayHeading}
            >
              The work behind
              <em>your growth.</em>
            </h2>
          </div>

          <p>
            Delegate the processes that consume your time and let
            your team focus on the work that moves the business
            forward.
          </p>
        </div>


        {/* =====================================================
            SERVICE GRID
        ===================================================== */}

        <div
          className={styles.serviceGrid}
          aria-label="Osmium BPO services"
        >
          {services.map((service) => {
            const isActive =
              activeService === service.number;

            return (
              <article
                key={service.number}
                className={`${styles.serviceCard} ${
                  isActive
                    ? styles.serviceCardActive
                    : ""
                }`}
              >

                {/* =================================================
                    SERVICE CARD / TRIGGER
                ================================================= */}

                <button
                  type="button"
                  className={styles.serviceCardButton}
                  onClick={() =>
                    toggleService(service.number)
                  }
                  aria-expanded={isActive}
                  aria-controls={`service-detail-${service.number}`}
                >
                  <div className={styles.serviceCardTop}>
                    <span>
                      {service.number}
                    </span>

                    <strong
                      aria-hidden="true"
                      className={
                        isActive
                          ? styles.serviceCardArrowActive
                          : ""
                      }
                    >
                      ↗
                    </strong>
                  </div>

                  <div className={styles.serviceCardBottom}>
                    <p>
                      {service.tag}
                    </p>

                    <h3>
                      {service.title}
                    </h3>

                    <div
                      className={
                        styles.serviceCardRule
                      }
                      aria-hidden="true"
                    />

                    <span>
                      {service.description}
                    </span>
                  </div>
                </button>


                {/* =================================================
                    EXPANDED SERVICE DETAIL
                ================================================= */}

                <div
                  id={`service-detail-${service.number}`}
                  className={styles.serviceDetail}
                  hidden={!isActive}
                >
                  <div
                    className={
                      styles.serviceDetailInner
                    }
                  >

                    <span
                      className={
                        styles.serviceDetailEyebrow
                      }
                    >
                      {service.number} / OSMIUM SERVICE
                    </span>


                    <h4>
                      What we can handle
                    </h4>


                    <ul
                      className={
                        styles.serviceCapabilities
                      }
                    >
                      {service.capabilities.map(
                        (capability) => (
                          <li key={capability}>
                            <span
                              aria-hidden="true"
                            >
                              +
                            </span>

                            {capability}
                          </li>
                        )
                      )}
                    </ul>


                    <div
                      className={
                        styles.serviceValue
                      }
                    >
                      <span
                        className={
                          styles.serviceValueLabel
                        }
                      >
                        THE VALUE
                      </span>

                      <p>
                        {service.value}
                      </p>
                    </div>


                    <a
                      href="#contact"
                      className={
                        styles.serviceDetailLink
                      }
                    >
                      Discuss {service.title}
                      <span aria-hidden="true">
                        ↗
                      </span>
                    </a>

                  </div>
                </div>

              </article>
            );
          })}
        </div>


        {/* =====================================================
            SUPPORTING NOTE
        ===================================================== */}

        <div className={styles.servicesNote}>
          <span
            className={styles.servicesNoteLine}
            aria-hidden="true"
          />

          <p>
            Not sure which process to delegate?
          </p>

          <a href="#contact">
            That&apos;s what the conversation is for.
            <span aria-hidden="true">
              ↗
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}