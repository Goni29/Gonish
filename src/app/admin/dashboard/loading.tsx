import styles from "./page.module.css";

export default function AdminDashboardLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.skeletonHeader} />
        <div className={styles.metricGrid}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard} />
          ))}
        </div>
        <div className={styles.skeletonSection} />
        <div className={styles.skeletonSection} />
      </div>
    </div>
  );
}
