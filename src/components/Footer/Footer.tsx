import styles from "./Footer.module.css";

const footerLinks = [
  {
    label: "Services",
    href: "#services",
  },
  {
    label: "About Us",
    href: "#about",
  },
  {
    label: "Why Osmium",
    href: "#why-osmium",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* =====================================================
            FOOTER TOP
        ===================================================== */}

        <div className={styles.footerTop}>

          {/* Brand */}

          <a
            href="/"
            className={styles.footerBrand}
            aria-label="Osmium BPO home"
          >
            <span>OSMIUM</span>
            <em>BPO</em>
          </a>

          {/* Brand statement */}

          <p className={styles.footerStatement}>
            Call. Delegate.
            <br />
            Outsource. Automate.
          </p>

          {/* Conversation CTA */}

          <a
            href="#contact"
            className={styles.conversationLink}
          >
            <span>Start a conversation</span>
            <strong>↗</strong>
          </a>

        </div>

        {/* =====================================================
            FOOTER MIDDLE
        ===================================================== */}

        <div className={styles.footerMiddle}>

          <div className={styles.footerMessage}>
            <span>OSMIUM BPO</span>

            <p>
              The operational support behind
              businesses ready to grow.
            </p>
          </div>

          <nav
            className={styles.footerNav}
            aria-label="Footer navigation"
          >
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>

        </div>

        {/* =====================================================
            FOOTER BOTTOM
        ===================================================== */}

        <div className={styles.footerBottom}>

          <p>
            © {new Date().getFullYear()} Osmium BPO.
            All rights reserved.
          </p>

          <div className={styles.footerMeta}>
            <span>
              People × Process × Performance
            </span>

            <span>
              Kenya
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}