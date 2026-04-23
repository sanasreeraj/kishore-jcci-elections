import styles from "@/app/platform.module.css";
import { platformContact } from "@/lib/platform-data";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export default function ContactPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Contact</p>
        <h1 className={styles.sectionTitle}>Contact JCCI</h1>
      </div>

      <div className={styles.grid2}>
        <article className={styles.card}>
          <p className={styles.cardLabel}>Phone</p>
          <h3>{platformContact.primaryPhone}</h3>
          <p>
            <a href={`tel:${normalizePhone(platformContact.primaryPhone)}`}>Tap to call</a>
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Email</p>
          <h3>{platformContact.email}</h3>
          <p>
            <a href={`mailto:${platformContact.email}`}>Send email</a>
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>WhatsApp</p>
          <h3>{platformContact.whatsappNumber}</h3>
          <p>
            <a href={`https://wa.me/${normalizePhone(platformContact.whatsappNumber)}`} target="_blank" rel="noreferrer">Open WhatsApp</a>
          </p>
        </article>

        <article className={styles.card}>
          <p className={styles.cardLabel}>Office Address</p>
          <h3>JCCI Office</h3>
          <p>{platformContact.officeAddress}</p>
          <p>
            <a href={platformContact.facebookUrl} target="_blank" rel="noreferrer">Facebook Page</a>
          </p>
        </article>
      </div>
    </section>
  );
}
