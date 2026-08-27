"use client";

import Link from "next/link";
import styles from "./page.module.css";

export default function WebsiteManagementPage() {
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div>
          <p className={styles.eyebrow}>OSMIUM BPO · WEBSITE</p>

          <h1>Website Management</h1>

          <p className={styles.intro}>
            Manage the visual content that appears across the Osmium BPO
            website.
          </p>
        </div>

        <Link href="/admin" className={styles.backLink}>
          ← Back to dashboard
        </Link>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>WEBSITE CONTENT</p>
            <h2>What would you like to manage?</h2>
          </div>

          <span className={styles.phaseBadge}>Website Controls</span>
        </div>

        <div className={styles.grid}>
          {/* HERO */}
          <Link href="/admin/website/hero" className={styles.card}>
            <div className={styles.icon}>✦</div>

            <div className={styles.cardBody}>
              <span className={styles.cardLabel}>HERO SECTION</span>

              <h3>Hero Images</h3>

              <p>
                Manage the images displayed in the main website hero
                carousel.
              </p>
            </div>

            <span className={styles.arrow}>↗</span>
          </Link>

          {/* ABOUT */}
          <div className={`${styles.card} ${styles.comingSoon}`}>
            <div className={styles.icon}>◎</div>

            <div className={styles.cardBody}>
              <span className={styles.cardLabel}>ABOUT OSMIUM</span>

              <h3>About Us</h3>

              <p>
                Website imagery and visual content for the About Us section.
              </p>
            </div>

            <span className={styles.status}>Later</span>
          </div>

          {/* SERVICES */}
          <div className={`${styles.card} ${styles.comingSoon}`}>
            <div className={styles.icon}>◇</div>

            <div className={styles.cardBody}>
              <span className={styles.cardLabel}>SERVICES</span>

              <h3>Service Images</h3>

              <p>
                Manage visual assets used alongside Osmium BPO services.
              </p>
            </div>

            <span className={styles.status}>Later</span>
          </div>
        </div>
      </section>

      <section className={styles.note}>
        <div className={styles.noteMark}>✓</div>

        <div>
          <strong>Simple website control</strong>

          <p>
            This area is intentionally lightweight. More website controls
            can be added as Osmium BPO grows.
          </p>
        </div>
      </section>
    </main>
  );
}