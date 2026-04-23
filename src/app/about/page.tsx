import styles from "@/app/platform.module.css";

export default function AboutPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>About</p>
        <h1 className={styles.sectionTitle}>About JCCI</h1>
      </div>

      <article className={styles.card}>
        <p>
          The Jeypore Chamber of Commerce & Industry (JCCI) is a leading business association representing traders,
          entrepreneurs, and industries in Jeypore and surrounding regions of Koraput district, Odisha.
        </p>
        <p>
          JCCI serves as a collective platform to support, promote, and safeguard the interests of the business
          community while contributing to the economic development of the region.
        </p>
      </article>

      <div className={styles.grid2}>
        <article className={`${styles.card} ${styles.aboutBlue}`}>
          <p className={styles.cardLabel}>Vision</p>
          <p>
            To create a strong, unified, and progressive business ecosystem that supports sustainable growth,
            innovation, and prosperity for all members.
          </p>
        </article>

        <article className={`${styles.card} ${styles.aboutBlue}`}>
          <p className={styles.cardLabel}>Mission</p>
          <ul className={styles.aboutList}>
            <li>To represent and protect the interests of traders and industries</li>
            <li>To act as a bridge between businesses and government authorities</li>
            <li>To promote ethical business practices</li>
            <li>To support economic development and local entrepreneurship</li>
            <li>To encourage collaboration within the business community</li>
          </ul>
        </article>
      </div>

      <article className={`${styles.card} ${styles.aboutBlue}`}>
        <p className={styles.cardLabel}>Objectives</p>
        <ul className={styles.aboutList}>
          <li>Facilitate smooth business operations</li>
          <li>Address issues faced by traders and industries</li>
          <li>Promote industrial growth and investments</li>
          <li>Support policy awareness and compliance</li>
          <li>Strengthen local markets and trade networks</li>
        </ul>
      </article>
    </section>
  );
}
