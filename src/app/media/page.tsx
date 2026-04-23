import styles from "@/app/platform.module.css";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

export default function MediaPage() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Media</p>
        <h1 className={styles.sectionTitle}>Media and Gallery</h1>
      </div>

      <ComingSoonBanner title="Gallery Content Coming Soon" description="Image collections and media archive views are being prepared for release." />
    </section>
  );
}
