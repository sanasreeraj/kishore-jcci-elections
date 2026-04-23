"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/app/page.module.css";
import { searchMembers } from "@/lib/search";
import type { ElectionInfo, MemberRecord } from "@/lib/site-data";

type Props = {
  election: ElectionInfo;
  members: MemberRecord[];
};

type SlotItem = { key: string; label: string };
type SearchMode = "all" | "phone" | "name" | "business" | "address";

const searchModes: SearchMode[] = ["all", "phone", "name", "business", "address"];
const searchModeLabels: Record<SearchMode, string> = {
  all: "All",
  phone: "Phone",
  name: "Sl No",
  business: "Establishment",
  address: "Address",
};

function formatSlotPart(hour24: number, minute: number) {
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 < 12 ? "AM" : "PM";
  return `${hour12.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`;
}

function buildElectionSlots() {
  const slots: SlotItem[] = [];
  const startMinutes = 9 * 60;
  const endMinutes = 15 * 60;

  for (let current = startMinutes; current < endMinutes; current += 15) {
    const next = current + 15;
    const startHour = Math.floor(current / 60);
    const startMinute = current % 60;
    const endHour = Math.floor(next / 60);
    const endMinute = next % 60;
    const key = `${startHour.toString().padStart(2, "0")}:${startMinute
      .toString()
      .padStart(2, "0")}-${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    slots.push({
      key,
      label: `${formatSlotPart(startHour, startMinute)} - ${formatSlotPart(endHour, endMinute)}`,
    });
  }

  return slots;
}

export function ElectionsClient({ election, members }: Props) {
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const slotOptions = useMemo(() => buildElectionSlots(), []);

  useEffect(() => {
    async function loadSlots() {
      try {
        const response = await fetch("/api/slots", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { counts?: Record<string, number> };
        if (payload.counts && typeof payload.counts === "object") {
          setSlotCounts(payload.counts);
        }
      } catch {
        // Ignore transient errors.
      }
    }

    void loadSlots();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    return searchMembers(members, query, searchMode).slice(0, 12);
  }, [members, query, searchMode]);

  const hasResults = query.trim().length > 0;

  function getTimelineStatus(index: number) {
    return "done";
  }

  async function updateSlotSelection(clickedSlot: string) {
    if (slotLoading) {
      return;
    }

    if (selectedSlot && selectedSlot !== clickedSlot) {
      return;
    }

    const nextSlot = selectedSlot === clickedSlot ? null : clickedSlot;
    setSlotLoading(true);

    try {
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          previousSlot: selectedSlot,
          nextSlot,
        }),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { counts?: Record<string, number> };
      if (payload.counts && typeof payload.counts === "object") {
        setSlotCounts(payload.counts);
      }

      setSelectedSlot(nextSlot);
    } finally {
      setSlotLoading(false);
    }
  }

  return (
    <section className={`${styles.section} ${styles.electionSectionSpacing}`}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Elections</p>
        <h2 className={styles.sectionTitle}>Election Information and Services</h2>
      </div>

      <article className={styles.infoCard}>
        <p className={styles.cardLabel}>Online Voting</p>
        <h3>Online Voting Coming Soon</h3>
        <p>
          The digital voting module is under preparation. Until then, use the tools below for election guidance
          and planning.
        </p>
      </article>

      <div className={styles.electionGrid}>
        <article className={styles.infoCard}>
          <p className={styles.cardLabel}>Election Information</p>
          <h3>Rules & Regulations</h3>
          <ul className={styles.ruleList}>
            {election.rules.map((rule) => (
              <li key={rule.text}>{rule.text}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoCard}>
          <p className={styles.cardLabel}>Election Calendar</p>
          <ul className={styles.timelineCalendar}>
            {election.timeline.map((step, index) => {
              const status = getTimelineStatus(index);
              const statusClassName =
                status === "done"
                  ? styles.timelineDoneCapsule
                  : status === "ongoing"
                    ? styles.timelineOngoingCapsule
                    : styles.timelineUpcomingCapsule;
              const statusLabel = status === "done" ? "Done" : status === "ongoing" ? "Ongoing" : "Upcoming";

              return (
                <li key={`${step.label}-${step.date}`} className={styles.timelineItem}>
                  <div className={styles.timelineDateBadge}>{step.date}</div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeadingRow}>
                      <strong>{step.label}</strong>
                      <span className={statusClassName}>{statusLabel}</span>
                    </div>
                    <span>{step.detail}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </div>

      <article className={styles.searchPanel}>
        <p className={styles.cardLabel}>Check Eligibility</p>
        <h3>Search your name in Voter list</h3>
        <div className={styles.modeRow} role="tablist" aria-label="Eligibility search modes">
          {searchModes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={searchMode === mode ? styles.modeActive : styles.modeButton}
              onClick={() => setSearchMode(mode)}
            >
              {searchModeLabels[mode]}
            </button>
          ))}
        </div>

        <label className={styles.searchInputWrap}>
          <span>Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Enter sl no, address, establishment, or phone"
          />
        </label>

        <div className={styles.resultBanner}>
          <div>
            <p className={styles.cardLabel}>{hasResults ? "Eligibility search" : "Search ready"}</p>
            <h3>{hasResults ? `${results.length} matching record(s)` : "Start typing to check eligibility."}</h3>
            <p>
              {hasResults
                ? "Review the matching local member records below."
                : "The search runs instantly on the local member dataset."}
            </p>
          </div>
          <span className={hasResults && results.length ? styles.successPill : styles.warningPill}>
            {hasResults && results.length ? "Match found" : "No match"}
          </span>
        </div>

        {hasResults && results.length > 0 ? (
          <div className={styles.resultsList}>
            {results.map((record) => (
              <article key={`${record.slNo}-${record.phone}-${record.address}`} className={styles.resultCard}>
                <div className={styles.resultSerial}>{record.slNo || "-"}</div>
                <div className={styles.resultCardBody}>
                  <h4>{record.business || "Member"}</h4>
                  <p>{record.address || "Address unavailable"}</p>
                  <span>{record.phone || "Phone unavailable"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </article>

      <article className={styles.slotPlanner}>
        <p className={styles.cardLabel}>Arrival Slot Planner</p>
        <h3>Election timing is 9:00 AM to 3:00 PM. Pick one arrival slot.</h3>
        <div className={styles.slotGrid}>
          {slotOptions.map((slot) => {
            const isActive = selectedSlot === slot.key;
            const isBlocked = Boolean(selectedSlot) && !isActive;
            const slotCount = slotCounts[slot.key] ?? 0;
            return (
              <button
                key={slot.key}
                type="button"
                className={isActive ? styles.slotButtonActive : styles.slotButton}
                disabled={slotLoading || isBlocked}
                onClick={() => updateSlotSelection(slot.key)}
              >
                <span>{slot.label}</span>
                <strong>{slotCount} people</strong>
              </button>
            );
          })}
        </div>
        <p className={styles.slotHint}>
          {selectedSlot ? `Selected slot: ${slotOptions.find((slot) => slot.key === selectedSlot)?.label ?? selectedSlot}` : "Select one slot. Tap the same selected slot to unlock and choose a different one."}
        </p>
      </article>
    </section>
  );
}
