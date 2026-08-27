import styles from "./page.module.css";

import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import PillarBar from "@/components/PillarBar/PillarBar";
import Approach from "@/components/Approach/Approach";
import WhyOsmium from "@/components/WhyOsmium/WhyOsmium";
import Services from "@/components/Services/Services";
import CTA from "@/components/CTA/CTA";
import Footer from "@/components/Footer/Footer";

export default function Home() {
  return (
    <main className={styles.site}>

      {/* =========================================================
          01 — NAVIGATION
      ========================================================= */}

      <Navbar />

      {/* =========================================================
          02 — HERO
      ========================================================= */}

      <Hero />

      {/* =========================================================
          03 — CORE PILLARS
      ========================================================= */}

      <PillarBar />

      {/* =========================================================
          04 — THE OSMIUM APPROACH
      ========================================================= */}

      <Approach />

      {/* =========================================================
          05 — WHY OSMIUM
      ========================================================= */}

      <WhyOsmium />

      {/* =========================================================
          06 — SERVICES
      ========================================================= */}

      <Services />

      {/* =========================================================
          07 — CONSULTATION CTA
      ========================================================= */}

      <CTA />

      {/* =========================================================
          08 — CAREERS ANCHOR
      ========================================================= */}

      <div
        id="careers"
        className={styles.hiddenAnchor}
      />

      {/* =========================================================
          09 — FOOTER
      ========================================================= */}

      <Footer />

      {/* =========================================================
          10 — FLOATING CONTACT ACTION
      ========================================================= */}

      <a
        href="#contact"
        className={styles.whatsapp}
        aria-label="Contact Osmium BPO"
      >
        <span>↗</span>
      </a>

    </main>
  );
}