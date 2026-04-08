"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BiNavigation } from "react-icons/bi";

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
    searchLead:
      "Search the member list by phone number, name, business name, or address.",
    supportTitle: "Support Signal",
    supportLead:
      "Tap once to record your support on this device. It is a local campaign signal, not an official vote count.",
    submissionTitle: "Add Missing Member Data",
    submissionLead:
      "If your record is missing, send it instantly through WhatsApp or email using the same details below.",
    contactTitle: "Contact",
    resultFound: "Found in the local member list",
    resultNotFound: "Not found in the local member list",
    eligible: "Likely eligible based on this record",
    notEligible: "No match found yet",
    supportCount: "Support taps on this device",
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
    contactTitle: "ଯୋଗାଯୋଗ",
    resultFound: "ସ୍ଥାନୀୟ ମେମ୍ବର ତାଲିକାରେ ମିଳିଲା",
    resultNotFound: "ସ୍ଥାନୀୟ ତାଲିକାରେ ମିଳିଲା ନାହିଁ",
    eligible: "ଏହି ରେକର୍ଡ ଅନୁଯାୟୀ ଯୋଗ୍ୟ",
    notEligible: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ",
    supportCount: "ଏହି ଡିଭାଇସର ସମର୍ଥନ ସଂଖ୍ୟା",
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
    contactTitle: "కాంటాక్ట్",
    resultFound: "స్థానిక సభ్యుల జాబితాలో దొరికింది",
    resultNotFound: "స్థానిక జాబితాలో దొరకలేదు",
    eligible: "ఈ రికార్డు ఆధారంగా అర్హత ఉంది",
    notEligible: "ఇంకా మ్యాచ్ లేదు",
    supportCount: "ఈ పరికరంలో సపోర్ట్ ట్యాప్స్",
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

export function CampaignSite({
  candidate,
  election,
  supporters,
  memberRecords,
}: Props) {
  const [language, setLanguage] = useState<LanguageKey>("en");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [query, setQuery] = useState("");
  const [supportCount, setSupportCount] = useState(0);
  const [submissionName, setSubmissionName] = useState("");
  const [submissionBusiness, setSubmissionBusiness] = useState("");
  const [submissionPhone, setSubmissionPhone] = useState("");
  const [submissionAddress, setSubmissionAddress] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");

  useEffect(() => {
    const storedValue = window.localStorage.getItem("kishore-support-count");
    const parsedValue = storedValue ? Number(storedValue) : 0;

    if (!Number.isNaN(parsedValue)) {
      setSupportCount(parsedValue);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("kishore-support-count", String(supportCount));
  }, [supportCount]);

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
  const emailLink =
    `mailto:${candidate.email}?subject=${encodeURIComponent(
      "JCCI member detail submission",
    )}&body=${encodeURIComponent(supportMessage.trim())}`;

  function incrementSupport() {
    setSupportCount((current) => current + 1);
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
                  {getInitials(supporter.name)}
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
              <p className={styles.cardLabel}>Date and venue</p>
              <h3>{election.date}</h3>
              <p>{election.time}</p>
              <p>{election.venue}</p>
            </article>

            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>Voting rules</p>
              <ul className={styles.ruleList}>
                {election.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </article>

            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>Timeline</p>
              <ul className={styles.timelineList}>
                {election.timeline.map((step) => (
                  <li key={step.label}>
                    <strong>{step.label}</strong>
                    <span>{step.detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.section} id="eligibility">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.searchTitle}</p>
            <h2>{activeCopy.searchLead}</h2>
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

            <div className={styles.resultsList}>
              {(hasResults ? results.slice(0, 12) : memberRecords.slice(0, 4)).map((record) => (
                <article className={styles.resultCard} key={`${record.name}-${record.phone}-${record.address}`}>
                  <h4>{record.name}</h4>
                  <p>{record.address || "Address unavailable"}</p>
                  <span>{record.phone || "Phone unavailable"}</span>
                  <small>{record.business}</small>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.submissionTitle}</p>
            <h2>{activeCopy.submissionLead}</h2>
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
                <textarea value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} rows={4} />
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
        </section>

        <section className={styles.section} id="support">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.supportTitle}</p>
            <h2>{activeCopy.supportLead}</h2>
          </div>

          <div className={styles.supportPanel}>
            <button type="button" className={styles.supportButton} onClick={incrementSupport}>
              I Support Kishore Kumar
            </button>
            <div>
              <p className={styles.cardLabel}>{activeCopy.supportCount}</p>
              <h3>{supportCount}</h3>
              <p>Stored locally in this browser for a quick visual signal.</p>
            </div>
          </div>
        </section>

        <section className={styles.section} id="contact">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.contactTitle}</p>
            <h2>Reach the campaign in one tap.</h2>
          </div>

          <div className={styles.contactGrid}>
            <a className={styles.contactCard} href={`tel:${normalizePhone(candidate.whatsapp)}`}>
              <span>Phone</span>
              <strong>{candidate.whatsapp}</strong>
            </a>
            <a className={styles.contactCard} href={`mailto:${candidate.email}`}>
              <span>Email</span>
              <strong>{candidate.email}</strong>
            </a>
            <a className={styles.contactCard} href={whatsappLink} target="_blank" rel="noreferrer">
              <span>WhatsApp</span>
              <strong>Open a prefilled message</strong>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}