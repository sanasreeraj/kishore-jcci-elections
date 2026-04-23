import styles from "@/app/platform.module.css";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

export default function EventsPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Events</p>
        <h1 className={styles.sectionTitle}>Events and Announcements</h1>
      </div>

      <ComingSoonBanner title="Events Module Coming Soon" description="Event calendar, registrations, and announcement cards will be enabled shortly." />
    </section>
  );
}
