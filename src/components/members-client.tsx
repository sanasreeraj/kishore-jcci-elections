"use client";

import { useMemo, useState } from "react";

import styles from "@/app/platform.module.css";
import { searchMembers } from "@/lib/search";
import type { MemberRecord } from "@/lib/site-data";

type Props = {
  records: MemberRecord[];
};

export function MembersClient({ records }: Props) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) {
      return records.slice(0, 30);
    }

    return searchMembers(records, query, "all").slice(0, 40);
  }, [query, records]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Members</p>
        <h2 className={styles.sectionTitle}>Member List and Search</h2>
      </div>

      <article className={styles.formPanel}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Search members</span>
          <input
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by sl no, phone, establishment, or address"
          />
        </label>
        <p className={styles.smallMuted}>Showing {results.length} record(s).</p>
      </article>

      <div className={styles.directorGrid}>
        {results.map((record) => (
          <article key={`${record.slNo}-${record.phone}-${record.address}`} className={styles.card}>
            <p className={styles.cardLabel}>Sl No: {record.slNo || "-"}</p>
            <h3>{record.business || "Unnamed Establishment"}</h3>
            <p>{record.address || "Address unavailable"}</p>
            <p className={styles.smallMuted}>{record.phone || "Phone unavailable"}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
