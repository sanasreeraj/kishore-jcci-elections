import styles from "@/app/platform.module.css";

type Props = {
  title?: string;
  description?: string;
};

export function ComingSoonBanner({
  title = "Coming Soon",
  description = "This section is being prepared for the JCCI Digital Platform rollout.",
}: Props) {
  return (
    <div className={styles.comingSoon}>
      <p className={styles.sectionKicker}>Coming Soon</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
