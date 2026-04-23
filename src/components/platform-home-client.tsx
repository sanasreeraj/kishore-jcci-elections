import Link from "next/link";

import styles from "@/app/platform.module.css";
import { platformMeta } from "@/lib/platform-data";

export function PlatformHomeClient() {
  return (
    <>
      <section className={`${styles.hero} ${styles.heroSingle}`}>
        <div>
          <p className={styles.heroKicker}>Home</p>
          <h1>{platformMeta.siteName}</h1>
          <p className={styles.heroLead}>
            Welcome users to Jeypore Chamber of Commerce & Industry webapp. This platform is being expanded to provide leadership updates, member services, elections information, and chamber-wide communication in one place.
          </p>

          <div className={styles.heroActions}>
            <Link href="/leadership" className={styles.button}>
              Explore Leadership
            </Link>
            <Link href="/membership" className={styles.buttonSecondary}>
              Membership Services
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionKicker}>Platform Introduction</p>
          <h2 className={styles.sectionTitle}>A structured digital foundation for JCCI operations</h2>
        </div>

        <div className={styles.cardGrid}>
          <article className={styles.card}>
            <p className={styles.cardLabel}>Leadership</p>
            <h3>Core Team and Directors</h3>
            <p>Access leadership information, director profiles, and structured updates from the current executive team.</p>
          </article>
          <article className={styles.card}>
            <p className={styles.cardLabel}>Members</p>
            <h3>Search and Directory Experience</h3>
            <p>Member records and business discovery modules are being organized into dedicated route pages.</p>
          </article>
          <article className={styles.card}>
            <p className={styles.cardLabel}>Governance</p>
            <h3>Elections and Membership Services</h3>
            <p>Election guidance, eligibility checks, slot planning, and membership workflows are moving into specialized sections.</p>
          </article>
        </div>
      </section>
    </>
  );
}
