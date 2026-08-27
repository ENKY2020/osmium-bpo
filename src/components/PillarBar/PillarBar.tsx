import styles from "./PillarBar.module.css";

type Pillar = {
  number: string;
  title: string;
  label: string;
  description: string;
  href: string;
};

const pillars: Pillar[] = [
  {
    number: "01",
    title: "CALL",
    label: "Customer Communication",
    description:
      "Professional call centre and customer support.",
    href: "#services",
  },
  {
    number: "02",
    title: "DELEGATE",
    label: "Virtual Support",
    description:
      "Virtual assistants and remote professionals.",
    href: "#services",
  },
  {
    number: "03",
    title: "OUTSOURCE",
    label: "Business Processes",
    description:
      "End-to-end business process outsourcing.",
    href: "#services",
  },
  {
    number: "04",
    title: "AUTOMATE",
    label: "Smarter Operations",
    description:
      "Smart automation and technology solutions.",
    href: "#services",
  },
];

export default function PillarBar() {
  return (
    <section
      className={styles.pillarWrap}
      aria-label="Osmium BPO service pillars"
    >
      <div className={styles.pillarBar}>
        {pillars.map((pillar) => (
          <a
            key={pillar.number}
            href={pillar.href}
            className={styles.pillar}
            aria-label={`${pillar.title}: ${pillar.label}`}
          >
            <span
              className={styles.pillarNumber}
              aria-hidden="true"
            >
              {pillar.number}
            </span>

            <div className={styles.pillarContent}>
              <div className={styles.pillarTitleRow}>
                <h2>{pillar.title}</h2>

                <span
                  className={styles.pillarArrow}
                  aria-hidden="true"
                >
                  ↗
                </span>
              </div>

              <p className={styles.pillarLabel}>
                {pillar.label}
              </p>

              <p className={styles.pillarDescription}>
                {pillar.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}