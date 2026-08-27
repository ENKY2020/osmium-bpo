"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { createClient } from "@/utils/supabase/client";

import styles from "./page.module.css";

/* =========================================================
   CONTACT REASONS
========================================================= */

const contactReasons = [
  {
    number: "01",
    title: "Outsource a process",
    description:
      "You have recurring work consuming internal capacity and want a dependable team to take ownership of it.",
  },
  {
    number: "02",
    title: "Build operational support",
    description:
      "You need people, process and structure around customer service, administration or day-to-day operations.",
  },
  {
    number: "03",
    title: "Explore a partnership",
    description:
      "You want to understand whether Osmium can support a new opportunity, project or longer-term operation.",
  },
];

/* =========================================================
   NEXT STEPS
========================================================= */

const nextSteps = [
  {
    number: "01",
    title: "Tell us what is happening",
    description:
      "Give us a picture of the work, pressure or process you want to improve.",
  },
  {
    number: "02",
    title: "We understand the operation",
    description:
      "We look at what needs to be delegated, what should remain internal and where support creates the most value.",
  },
  {
    number: "03",
    title: "We shape the right support",
    description:
      "Together we define the people, process and capacity needed to move the work forward.",
  },
];

/* =========================================================
   FORM TYPE
========================================================= */

interface ContactFormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
}

/* =========================================================
   CONTACT PAGE
========================================================= */

export default function ContactPage() {
  const supabase = useMemo(() => createClient(), []);

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    company: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     HANDLE INPUT CHANGES
  ======================================================= */

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    /* Clear previous messages while user continues typing */
    if (successMessage) {
      setSuccessMessage("");
    }

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /* =======================================================
     SUBMIT ENQUIRY
  ======================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    /* -------------------------------------------------------
       Basic validation
    ------------------------------------------------------- */

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setErrorMessage(
        "Please provide your name, email address and message."
      );

      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      /* -----------------------------------------------------
         Insert into Supabase
         
         Database columns:
         name
         company
         email
         phone
         enquiry_type
         message
         
         status is intentionally NOT supplied because the
         database already defaults it to "new".
      ----------------------------------------------------- */

      const { error } = await supabase
        .from("enquiries")
        .insert({
          name,
          company: formData.company.trim() || null,
          email,
          phone: formData.phone.trim() || null,
          enquiry_type: formData.reason || null,
          message,
        });

      if (error) {
        console.error(
          "Osmium enquiry submission error:",
          error
        );

        throw new Error(
          "We couldn't send your enquiry right now."
        );
      }

      /* -----------------------------------------------------
         Success
      ----------------------------------------------------- */

      setSuccessMessage(
        "Thank you. Your enquiry has been received. The Osmium team will get back to you."
      );

      /* -----------------------------------------------------
         Reset form
      ----------------------------------------------------- */

      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        reason: "",
        message: "",
      });
    } catch (error) {
      console.error(
        "Contact form submission failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your enquiry. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            OSMIUM BPO
          </div>

          <span className={styles.heroIndex}>
            01 / 04
          </span>
        </div>

        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>
              LET&apos;S TALK OPERATIONS
            </p>

            <h1>
              Tell us what
              <em>needs to move.</em>
            </h1>

            <p className={styles.heroLead}>
              Whether you need to delegate a process, extend
              your team or simply understand where outsourcing
              could help, start with a conversation.
            </p>

            <div className={styles.heroActions}>
              <a
                href="https://wa.me/254724355230"
                target="_blank"
                rel="noreferrer"
                className={styles.primaryButton}
              >
                WhatsApp Osmium
                <span>↗</span>
              </a>

              <a
                href="tel:+254724355230"
                className={styles.secondaryButton}
              >
                Call +254 724 355230
                <span>→</span>
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualFrame}>
              <div
                className={styles.visualOrbitOuter}
              />

              <div
                className={styles.visualOrbitMiddle}
              />

              <div className={styles.visualCore}>
                <span>OS</span>
              </div>

              <div className={styles.visualLabel}>
                PEOPLE × PROCESS × CAPACITY
              </div>

              <div className={styles.visualCorner}>
                01
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT REASONS
      ===================================================== */}

      <section className={styles.reasonsSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            Start where you are
          </div>

          <span className={styles.sectionIndex}>
            02 / 04
          </span>
        </div>

        <div className={styles.reasonsIntro}>
          <h2>
            You don&apos;t need
            <em>the perfect brief.</em>
          </h2>

          <p>
            Tell us what is consuming your team&apos;s time,
            attention or capacity. We can work from there.
          </p>
        </div>

        <div className={styles.reasonsGrid}>
          {contactReasons.map((reason) => (
            <article
              key={reason.number}
              className={styles.reasonCard}
            >
              <span className={styles.cardNumber}>
                {reason.number}
              </span>

              <div className={styles.cardBody}>
                <h3>{reason.title}</h3>

                <span className={styles.cardRule} />

                <p>{reason.description}</p>
              </div>

              <span className={styles.cardArrow}>
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          CONTACT PANEL
      ===================================================== */}

      <section className={styles.contactSection}>
        <div className={styles.contactPanel}>
          <div className={styles.contactIntro}>
            <div className={styles.sectionEyebrow}>
              <span className={styles.eyebrowLine} />
              Talk to Osmium
            </div>

            <h2>
              Let&apos;s understand
              <em>the work.</em>
            </h2>

            <p>
              A short conversation is often enough to
              determine whether there is something worth
              delegating.
            </p>

            <div className={styles.directContact}>
              <span>DIRECT CONTACT</span>

              <a href="tel:+254724355230">
                +254 724 355230
              </a>

              <a
                href="https://wa.me/254724355230"
                target="_blank"
                rel="noreferrer"
              >
                Continue on WhatsApp ↗
              </a>
            </div>
          </div>

          {/* =================================================
              LIVE CONTACT FORM
          ================================================= */}

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >
            <div className={styles.formRow}>
              <label>
                <span>Your name</span>

                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Company</span>

                <input
                  type="text"
                  name="company"
                  placeholder="Company name"
                  autoComplete="organization"
                  value={formData.company}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className={styles.formRow}>
              <label>
                <span>Email</span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                <span>Phone</span>

                <input
                  type="tel"
                  name="phone"
                  placeholder="+254..."
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              <span>What can Osmium help with?</span>

              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
              >
                <option value="">
                  Select an area
                </option>

                <option value="customer-support">
                  Customer support / Call Centre
                </option>

                <option value="virtual-assistance">
                  Virtual Assistance
                </option>

                <option value="back-office">
                  Back-office Outsourcing
                </option>

                <option value="remote-workforce">
                  Remote Workforce
                </option>

                <option value="bpo">
                  Business Process Outsourcing
                </option>

                <option value="document-operations">
                  Document & Contract Operations
                </option>

                <option value="other">
                  Something else
                </option>
              </select>
            </label>

            <label>
              <span>Tell us a little more</span>

              <textarea
                name="message"
                rows={6}
                placeholder="What work is consuming your team's time or capacity?"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </label>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {successMessage && (
              <p
                className={styles.formNote}
                role="status"
                aria-live="polite"
                style={{
                  color: "#2f7d32",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                {successMessage}
              </p>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {errorMessage && (
              <p
                className={styles.formNote}
                role="alert"
                aria-live="assertive"
                style={{
                  color: "#b42318",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                {errorMessage}
              </p>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? "Sending enquiry..."
                : successMessage
                  ? "Enquiry received"
                  : "Start the conversation"}

              <span>
                {isSubmitting ? "…" : "↗"}
              </span>
            </button>

            <p className={styles.formNote}>
              We&apos;ll use the information you provide to
              understand your enquiry and respond
              appropriately.
            </p>
          </form>
        </div>
      </section>

      {/* =====================================================
          WHAT HAPPENS NEXT
      ===================================================== */}

      <section className={styles.nextSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            What happens next
          </div>

          <span className={styles.sectionIndex}>
            03 / 04
          </span>
        </div>

        <div className={styles.nextIntro}>
          <h2>
            From conversation
            <em>to clarity.</em>
          </h2>

          <p>
            No unnecessary sales maze. We first understand
            the operation, then determine whether and how
            Osmium can help.
          </p>
        </div>

        <div className={styles.nextGrid}>
          {nextSteps.map((step) => (
            <article
              key={step.number}
              className={styles.nextCard}
            >
              <span>{step.number}</span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className={styles.finalSection}>
        <div className={styles.finalInner}>
          <div className={styles.sectionEyebrow}>
            <span className={styles.eyebrowLine} />
            OSMIUM BPO
          </div>

          <h2>
            The right work.
            <em>The right support.</em>
          </h2>

          <p>
            You don&apos;t have to know exactly what to
            outsource before starting the conversation.
          </p>

          <div className={styles.finalActions}>
            <a
              href="https://wa.me/254724355230"
              target="_blank"
              rel="noreferrer"
              className={styles.finalButton}
            >
              Talk to Osmium
              <span>↗</span>
            </a>

            <Link
              href="/services"
              className={styles.finalLink}
            >
              Explore our services
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />
    </main>
  );
}