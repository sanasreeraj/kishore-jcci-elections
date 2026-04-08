"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BiEnvelope, BiNavigation, BiPhoneCall } from "react-icons/bi";
import { FaWhatsapp } from "react-icons/fa6";

import type { CandidateProfile, ElectionInfo, MemberRecord, Supporter } from "@/lib/site-data";
import { searchMembers } from "@/lib/search";
import styles from "../app/page.module.css";

type LanguageKey = "en" | "or" | "te";
type SearchMode = "all" | "phone" | "name" | "business" | "address";

type Props = {
  candidate: CandidateProfile;
  election: ElectionInfo;
  supporters: Supporter[];
  memberRecords: MemberRecord[];
};

const copy = {
  en: {
    nav: ["Home", "Profile", "Eligibility", "Support", "Contact"],
    heroEyebrow: "JCCI Election 2026-27",
    heroTitle: "Vote for Director",
    heroLead:
      "I bring veteran discipline, business understanding, and chamber leadership to the director role.",
    primary: "Support Me",
    secondary: "Check Eligibility",
    tertiary: "View Details",
    searchTitle: "Check Eligibility",
    searchLead: "Check whether you are eligible.",
    supportTitle: "Support Signal",
    supportLead: "Show some support.",
    submissionTitle: "Add Missing Member Data",
    submissionLead:
      "If your record is missing, send it instantly through WhatsApp or email using the same details below.",
    submissionCta: "Missing? Add here.",
    close: "Close",
    contactTitle: "Contact",
    resultFound: "Found in the local member list",
    resultNotFound: "Not found in the local member list",
    eligible: "Likely eligible based on this record",
    notEligible: "No match found yet",
    supportCount: "Support taps",
    supportButton: "I Support Kishore Kumar",
    supportButtonThanks: "Thank you for your support",
    submit: "Send via WhatsApp",
    email: "Send by Email",
  },
  or: {
    nav: ["ମୁଖ୍ୟ", "ପ୍ରୋଫାଇଲ୍", "ଯୋଗ୍ୟତା", "ସମର୍ଥନ", "ଯୋଗାଯୋଗ"],
    heroEyebrow: "JCCI ନିର୍ବାଚନ 2026-27",
    heroTitle: "Director ପାଇଁ ଭୋଟ ଦିଅନ୍ତୁ",
    heroLead:
      "ଚି. କିଶୋର କୁମାର ସେନା ଶୃଙ୍ଖଳା, ବ୍ୟବସାୟ ବୁଝାମଣା ଏବଂ ଚେମ୍ବର ନେତୃତ୍ୱକୁ ଏକାତ୍ମ କରନ୍ତି।",
    primary: "ମୋତେ ସମର୍ଥନ କରନ୍ତୁ",
    secondary: "ଯୋଗ୍ୟତା ଯାଞ୍ଚ",
    tertiary: "ବିବରଣୀ ଦେଖନ୍ତୁ",
    searchTitle: "ଯୋଗ୍ୟତା ଯାଞ୍ଚ",
    searchLead: "ଫୋନ୍, ନାମ, ବ୍ୟବସାୟ ନାମ କିମ୍ବା ଠିକଣାରେ ଖୋଜନ୍ତୁ।",
    supportTitle: "ସମର୍ଥନ ସଙ୍କେତ",
    supportLead:
      "ଏହି ଡିଭାଇସରେ ଆପଣଙ୍କ ସମର୍ଥନ ସଂଗ୍ରହ କରନ୍ତୁ। ଏହା ଏକ ଅଭିଯାନ ସଙ୍କେତ, ଆଧିକାରିକ ଭୋଟ ନୁହେଁ।",
    submissionTitle: "ଅନୁପସ୍ଥିତ ତଥ୍ୟ ଯୋଡନ୍ତୁ",
    submissionLead:
      "ରେକର୍ଡ ନଥିଲେ, ସେହି ସୂଚନା WhatsApp କିମ୍ବା Email ମାଧ୍ୟମରେ ପଠାନ୍ତୁ।",
    submissionCta: "ମିସିଂ? ଏଠାରେ ଯୋଡନ୍ତୁ।",
    close: "ବନ୍ଦ କରନ୍ତୁ",
    contactTitle: "ଯୋଗାଯୋଗ",
    resultFound: "ସ୍ଥାନୀୟ ମେମ୍ବର ତାଲିକାରେ ମିଳିଲା",
    resultNotFound: "ସ୍ଥାନୀୟ ତାଲିକାରେ ମିଳିଲା ନାହିଁ",
    eligible: "ଏହି ରେକର୍ଡ ଅନୁଯାୟୀ ଯୋଗ୍ୟ",
    notEligible: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ",
    supportCount: "ଏହି ଡିଭାଇସର ସମର୍ଥନ ସଂଖ୍ୟା",
    supportButton: "ମୁଁ କିଶୋର କୁମାରଙ୍କୁ ସମର୍ଥନ କରେ",
    supportButtonThanks: "ଆପଣଙ୍କ ସମର୍ଥନ ପାଇଁ ଧନ୍ୟବାଦ",
    submit: "WhatsApp ରେ ପଠାନ୍ତୁ",
    email: "Email ରେ ପଠାନ୍ତୁ",
  },
  te: {
    nav: ["హోమ్", "ప్రొఫైల్", "అర్హత", "సపోర్ట్", "కాంటాక్ట్"],
    heroEyebrow: "JCCI ఎన్నికలు 2026-27",
    heroTitle: "Director కి ఓటు వేయండి",
    heroLead:
      "చి. కిశోర్ కుమార్ సైనిక క్రమశిక్షణ, వ్యాపార అవగాహన, మరియు చాంబర్ నాయకత్వాన్ని తీసుకొస్తారు.",
    primary: "నన్ను సపోర్ట్ చేయండి",
    secondary: "అర్హత తనిఖీ",
    tertiary: "వివరాలు చూడండి",
    searchTitle: "అర్హత తనిఖీ",
    searchLead: "ఫోన్, పేరు, వ్యాపారం, లేదా చిరునామా ద్వారా వెతకండి.",
    supportTitle: "సపోర్ట్ సిగ్నల్",
    supportLead:
      "ఈ పరికరంలో మీ సపోర్ట్‌ను నమోదు చేయండి. ఇది స్థానిక సంకేతం మాత్రమే, అధికారిక ఓట్ల లెక్క కాదు.",
    submissionTitle: "మిస్సింగ్ డేటా జోడించండి",
    submissionLead:
      "రికార్డు లేనప్పుడు, అదే వివరాలతో WhatsApp లేదా Email ద్వారా పంపండి.",
    submissionCta: "మిస్సింగ్? ఇక్కడ జోడించండి.",
    close: "మూసివేయండి",
    contactTitle: "కాంటాక్ట్",
    resultFound: "స్థానిక సభ్యుల జాబితాలో దొరికింది",
    resultNotFound: "స్థానిక జాబితాలో దొరకలేదు",
    eligible: "ఈ రికార్డు ఆధారంగా అర్హత ఉంది",
    notEligible: "ఇంకా మ్యాచ్ లేదు",
    supportCount: "ఈ పరికరంలో సపోర్ట్ ట్యాప్స్",
    supportButton: "నేను కిశోర్ కుమార్‌కు మద్దతు ఇస్తున్నాను",
    supportButtonThanks: "మీ మద్దతుకు ధన్యవాదాలు",
    submit: "WhatsApp ద్వారా పంపండి",
    email: "Email ద్వారా పంపండి",
  },
} satisfies Record<LanguageKey, Record<string, string | string[]>>;

const languageOptions: Array<{ key: LanguageKey; label: string }> = [
  { key: "en", label: "EN" },
  { key: "or", label: "ଓଡିଆ" },
  { key: "te", label: "తెలుగు" },
];

const modes: Array<{ key: SearchMode; label: string }> = [
  { key: "all", label: "All" },
  { key: "phone", label: "Phone" },
  { key: "name", label: "Name" },
  { key: "business", label: "Business" },
  { key: "address", label: "Address" },
];

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text: string, highlights: string[] = []) {
  if (!highlights.length) {
    return text;
  }

  const highlightRegex = new RegExp(`(${highlights.map(escapeRegex).join("|")})`, "gi");
  const chunks = text.split(highlightRegex);

  return chunks.map((chunk, index) => {
    const isHighlighted = highlights.some(
      (highlight) => highlight.toLowerCase() === chunk.toLowerCase(),
    );

    return (
      <span key={`${chunk}-${index}`} className={isHighlighted ? styles.ruleEmphasis : undefined}>
        {chunk}
      </span>
    );
  });
}

export function CampaignSite({
  candidate,
  election,
  supporters,
  memberRecords,
}: Props) {
  const supportFlagKey = "kishore-support-locked";
  const [language, setLanguage] = useState<LanguageKey>("en");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [query, setQuery] = useState("");
  const [supportCount, setSupportCount] = useState(0);
  const [hasSupported, setHasSupported] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [submissionName, setSubmissionName] = useState("");
  const [submissionBusiness, setSubmissionBusiness] = useState("");
  const [submissionPhone, setSubmissionPhone] = useState("");
  const [submissionAddress, setSubmissionAddress] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);

  useEffect(() => {
    const isLocked = window.localStorage.getItem(supportFlagKey) === "1";
    setHasSupported(isLocked);

    async function loadSupportCount() {
      try {
        const response = await fetch("/api/support", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { count?: number };
        if (typeof payload.count === "number") {
          setSupportCount(payload.count);
        }
      } catch {
        // Keep zero when the API is temporarily unavailable.
      }
    }

    void loadSupportCount();
  }, []);

  const results = useMemo(() => searchMembers(memberRecords, query, searchMode), [
    memberRecords,
    query,
    searchMode,
  ]);

  const activeCopy = copy[language];
  const hasResults = query.trim().length > 0;
  const phoneDigits = normalizePhone(candidate.whatsapp);
  const venueDisplay = election.venue.replace("VEDIKA", "Vedika");
  const mapsLink = "https://maps.app.goo.gl/WWcPhM7FrLipzLub9";
  const supportMessage = `I support Ch Kishore Kumar for JCCI Director 8.\n\nName: ${submissionName || ""}\nBusiness: ${submissionBusiness || ""}\nPhone: ${submissionPhone || ""}\nAddress: ${submissionAddress || ""}\nNotes: ${submissionNote || ""}`;

  const whatsappLink =
    `https://wa.me/${phoneDigits}?text=` + encodeURIComponent(supportMessage.trim());
  const directWhatsAppLink = `https://wa.me/${phoneDigits}`;
  const emailLink =
    `mailto:${candidate.email}?subject=${encodeURIComponent(
      "JCCI member detail submission",
    )}&body=${encodeURIComponent(supportMessage.trim())}`;

  async function incrementSupport() {
    if (hasSupported || supportLoading) {
      return;
    }

    setSupportLoading(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { count?: number };
      if (typeof payload.count === "number") {
        setSupportCount(payload.count);
      }

      setHasSupported(true);
      window.localStorage.setItem(supportFlagKey, "1");
    } finally {
      setSupportLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brandLockup}>
          <Image
            src="/assets/ballot-number.png"
            alt="Ballot number 8"
            width={76}
            height={76}
            className={styles.brandBadge}
            priority
          />
          <div className={styles.brandHeadlines}>
            <p className={styles.brandEyebrow}>{activeCopy.heroEyebrow}</p>
            <p className={styles.brandTitle}>{candidate.organization}</p>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Section navigation">
          {activeCopy.nav.map((item, index) => (
            <a key={item} href={["#home", "#profile", "#eligibility", "#support", "#contact"][index]}>
              {item}
            </a>
          ))}
        </nav>
        <div className={styles.languageSwitcher} aria-label="Language selector">
          {languageOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={language === option.key ? styles.languageActive : styles.languageButton}
              onClick={() => setLanguage(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <main>
        <section className={styles.hero} id="home">
          <div className={styles.heroContent}>
            <div className={styles.voteHighlight}>{activeCopy.heroTitle}</div>
            <h1>{candidate.name}</h1>
            <p className={styles.heroLead}>{activeCopy.heroLead}</p>
            <div className={styles.heroStats}>
              <div>
                <span className={styles.heroStatLabel}>Ballot</span>
                <strong className={styles.ballotNumberBig}>8</strong>
              </div>
              <div>
                <span className={styles.heroStatLabel}>Date</span>
                <strong className={styles.heroStatHighlight}>{election.date}</strong>
              </div>
              <div>
                <span className={styles.heroStatLabel}>Venue</span>
                <strong className={styles.heroStatHighlight}>Vedika</strong>
                <span>{venueDisplay}</span>
                <a
                  className={styles.mapsButton}
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open directions in Google Maps"
                  title="Open directions"
                >
                  <BiNavigation aria-hidden="true" className={styles.directionIcon} />
                </a>
              </div>
              <div>
                <span className={styles.heroStatLabel}>Time</span>
                <strong className={styles.heroStatHighlight}>{election.time}</strong>
              </div>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#support">
                {activeCopy.primary}
              </a>
              <a className={styles.secondaryAction} href="#eligibility">
                {activeCopy.secondary}
              </a>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroFrame}>
              <Image
                src="/assets/kishore-standing.png"
                alt="Ch Kishore Kumar standing portrait"
                fill
                className={styles.heroImage}
                priority
                sizes="(max-width: 900px) 100vw, 560px"
              />
            </div>
            <div className={styles.heroEmblems}>
              <Image src="/assets/airforce-logo.png" alt="Indian Air Force logo" width={104} height={104} />
              <Image src="/assets/jcci-logo.png" alt="JCCI logo" width={104} height={104} />
              <Image src="/assets/jcma-logo.png" alt="JCMA logo" width={104} height={104} />
            </div>
          </div>
        </section>

        <section className={styles.section} id="profile">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Who Am I</p>
            <h2>Why select me.</h2>
          </div>

          <div className={styles.profileGrid}>
            <article className={styles.profilePanel}>
              <p className={styles.cardLabel}>About me</p>
              <h3>Serving members with discipline and clarity</h3>
              <p>{candidate.background}</p>
            </article>

            <article className={styles.profilePanel}>
              <p className={styles.cardLabel}>Background</p>
              <h3>Indian Air Force veteran</h3>
              <p>
                Disciplined service background, practical leadership, and direct exposure to operational responsibility.
              </p>
              <div className={styles.tagList}>
                {candidate.traits.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
            </article>

            <article className={styles.profilePanel}>
              <p className={styles.cardLabel}>Business expertise</p>
              <h3>Built for chamber decisions</h3>
              <p>
                Practical exposure to taxation, labour, banking and compliance matters that directly affect local businesses.
              </p>
              <div className={styles.tagList}>
                {candidate.expertise.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Business Network</p>
            <h2>Our Family Businesses.</h2>
          </div>
          <div className={styles.supporterGrid}>
            {supporters.map((supporter) => (
              <article className={styles.supporterCard} key={`${supporter.name}-${supporter.business}`}>
                <div className={styles.supporterImage} aria-hidden="true">
                  <Image
                    src={supporter.image}
                    alt={supporter.name}
                    fill
                    className={styles.supporterPortrait}
                    sizes="(max-width: 760px) 100vw, (max-width: 1080px) 50vw, 25vw"
                  />
                </div>
                <h3>{supporter.name}</h3>
                <p className={styles.supporterCompany}>{supporter.business}</p>
                <p className={styles.supporterLocation}>{supporter.location}</p>
                <a className={styles.supporterContact} href={`tel:${normalizePhone(supporter.phone)}`}>
                  {supporter.phone}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>Election Information</p>
            <h2>Rules & Regulations</h2>
          </div>

          <div className={styles.electionGrid}>
            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>Voting rules</p>
              <ul className={styles.ruleList}>
                {election.rules.map((rule) => (
                  <li key={rule.text}>{renderHighlightedText(rule.text, rule.highlights)}</li>
                ))}
              </ul>
            </article>

            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>Election calendar</p>
              <ul className={styles.timelineCalendar}>
                {election.timeline.map((step) => (
                  <li key={`${step.label}-${step.detail}`} className={styles.timelineItem}>
                    <div className={styles.timelineDateBadge}>{step.date}</div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeadingRow}>
                        <strong>{step.label}</strong>
                        <span
                          className={
                            step.status === "done" ? styles.timelineDoneCapsule : styles.timelineUpcomingCapsule
                          }
                        >
                          {step.status === "done" ? "Done" : "Upcoming"}
                        </span>
                      </div>
                      <span>{step.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.section} id="eligibility">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.searchTitle}</p>
            <h2 className={styles.eligibilityHeading}>{activeCopy.searchLead}</h2>
          </div>

          <div className={styles.searchPanel}>
            <div className={styles.modeRow} role="tablist" aria-label="Eligibility search modes">
              {modes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  className={searchMode === mode.key ? styles.modeActive : styles.modeButton}
                  onClick={() => setSearchMode(mode.key)}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <label className={styles.searchInputWrap}>
              <span>Search</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Enter phone, name, business, or address"
              />
            </label>

            <div className={styles.resultBanner}>
              <div>
                <p className={styles.cardLabel}>
                  {hasResults ? (results.length ? activeCopy.resultFound : activeCopy.resultNotFound) : activeCopy.searchTitle}
                </p>
                <h3>
                  {hasResults ? `
                    ${results.length} match${results.length === 1 ? "" : "es"}
                  `.trim() : "Start by typing a member detail"}
                </h3>
                <p>
                  {hasResults
                    ? results.length
                      ? activeCopy.eligible
                      : activeCopy.notEligible
                    : "The search runs instantly on the local member dataset."}
                </p>
              </div>
              <span className={results.length ? styles.successPill : styles.warningPill}>
                {results.length ? "Match found" : "No match"}
              </span>
            </div>

            {hasResults && results.length > 0 ? (
              <div className={styles.resultsList}>
                {results.slice(0, 12).map((record) => (
                  <article className={styles.resultCard} key={`${record.name}-${record.phone}-${record.address}`}>
                    <h4>{record.name}</h4>
                    <p>{record.address || "Address unavailable"}</p>
                    <span>{record.phone || "Phone unavailable"}</span>
                    <small>{record.business}</small>
                  </article>
                ))}
              </div>
            ) : null}

            <div className={styles.missingCtaWrap}>
              <button
                type="button"
                className={styles.missingCtaButton}
                onClick={() => setIsMissingModalOpen(true)}
              >
                {activeCopy.submissionCta}
              </button>
            </div>
          </div>
        </section>

        {isMissingModalOpen ? (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label={activeCopy.submissionTitle}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsMissingModalOpen(false);
              }
            }}
          >
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.sectionKicker}>{activeCopy.submissionTitle}</p>
                  <h3>{activeCopy.submissionLead}</h3>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={() => setIsMissingModalOpen(false)}
                >
                  {activeCopy.close}
                </button>
              </div>

              <div className={styles.formGrid}>
                <form className={styles.submissionForm}>
                  <label>
                    <span>Name</span>
                    <input value={submissionName} onChange={(event) => setSubmissionName(event.target.value)} />
                  </label>
                  <label>
                    <span>Business</span>
                    <input value={submissionBusiness} onChange={(event) => setSubmissionBusiness(event.target.value)} />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input value={submissionPhone} onChange={(event) => setSubmissionPhone(event.target.value)} />
                  </label>
                  <label>
                    <span>Address</span>
                    <input value={submissionAddress} onChange={(event) => setSubmissionAddress(event.target.value)} />
                  </label>
                  <label>
                    <span>Notes</span>
                    <textarea
                      value={submissionNote}
                      onChange={(event) => setSubmissionNote(event.target.value)}
                      rows={4}
                    />
                  </label>

                  <div className={styles.formActions}>
                    <a className={styles.primaryAction} href={whatsappLink} target="_blank" rel="noreferrer">
                      {activeCopy.submit}
                    </a>
                    <a className={styles.secondaryAction} href={emailLink}>
                      {activeCopy.email}
                    </a>
                  </div>
                </form>

                <aside className={styles.sideNote}>
                  <p className={styles.cardLabel}>Best fallback when no backend is used</p>
                  <h3>Fast, familiar, and low friction.</h3>
                  <p>
                    The form prepares a clean message for WhatsApp or email, so members can submit data without waiting for a login or custom server.
                  </p>
                </aside>
              </div>
            </div>
          </div>
        ) : null}

        <section className={styles.section} id="support">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.supportTitle}</p>
            <h2>{activeCopy.supportLead}</h2>
          </div>

          <div className={styles.supportPanel}>
            <button
              type="button"
              className={`${styles.supportButton} ${hasSupported ? styles.supportButtonDone : ""}`}
              onClick={incrementSupport}
              disabled={hasSupported || supportLoading}
            >
              {hasSupported ? activeCopy.supportButtonThanks : activeCopy.supportButton}
            </button>
            <div>
              <p className={styles.cardLabel}>{activeCopy.supportCount}</p>
              <h3>{supportCount}</h3>
              <p>
                This is not official voting. It is only a support signal to understand your vote of confidence.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="contact">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.contactTitle}</p>
            <h2>Connect with me.</h2>
          </div>

          <div className={styles.contactGrid}>
            <a className={styles.contactCard} href={`tel:${normalizePhone(candidate.whatsapp)}`}>
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconPhone}`}>
                  <BiPhoneCall aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>Phone</span>
              </div>
              <strong>{candidate.whatsapp}</strong>
            </a>
            <a className={styles.contactCard} href={`mailto:${candidate.email}`}>
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconMail}`}>
                  <BiEnvelope aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>Email</span>
              </div>
              <strong>{candidate.email}</strong>
            </a>
            <a className={styles.contactCard} href={directWhatsAppLink} target="_blank" rel="noreferrer">
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconWhatsapp}`}>
                  <FaWhatsapp aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>WhatsApp</span>
              </div>
              <strong>Open direct chat with Kishore</strong>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}