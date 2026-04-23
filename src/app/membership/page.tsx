import styles from "@/app/platform.module.css";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

export default function MembershipPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Membership</p>
        <h1 className={styles.sectionTitle}>Membership Application and Payment Mock</h1>
      </div>

      <ComingSoonBanner title="Membership Backend Coming Soon" description="Application submission workflow and payment gateway integration are currently in mock mode." />
    </section>
  );
}
