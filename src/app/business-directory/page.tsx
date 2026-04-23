import styles from "@/app/platform.module.css";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

export default function BusinessDirectoryPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Business Directory</p>
        <h1 className={styles.sectionTitle}>Business Directory</h1>
      </div>

      <ComingSoonBanner title="Directory Experience Coming Soon" description="Advanced business listing filters and category navigation will be launched in the next update." />
    </section>
  );
}
