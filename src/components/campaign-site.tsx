"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { BiCloudUpload, BiEnvelope, BiPhoneCall } from "react-icons/bi";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa6";

import type { CandidateProfile, DirectorProfile, ElectionInfo, MemberRecord, Supporter } from "@/lib/site-data";
import { searchMembers } from "@/lib/search";
import styles from "../app/page.module.css";

type LanguageKey = "en" | "hi" | "or" | "te";
type SearchMode = "all" | "phone" | "name" | "business" | "address";

type Props = {
  candidate: CandidateProfile;
  election: ElectionInfo;
  supporters: Supporter[];
  memberRecords: MemberRecord[];
  directorProfiles: DirectorProfile[];
};

type CampaignCopy = {
  nav: string[];
  modeLabels: Record<SearchMode, string>;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  heroBallot: string;
  heroDate: string;
  heroVenue: string;
  heroTime: string;
  directionsTitle: string;
  primary: string;
  secondary: string;
  profileKicker: string;
  profileTitle: string;
  aboutLabel: string;
  aboutHeading: string;
  backgroundLabel: string;
  backgroundHeading: string;
  backgroundText: string;
  expertiseLabel: string;
  expertiseHeading: string;
  expertiseText: string;
  businessKicker: string;
  businessTitle: string;
  electionKicker: string;
  electionTitle: string;
  rulesLabel: string;
  calendarLabel: string;
  electionRules: string[];
  timelineLabels: string[];
  doneLabel: string;
  upcomingLabel: string;
  ongoingLabel: string;
  searchTitle: string;
  searchLead: string;
  eligibilitySearchLabel: string;
  searchPlaceholder: string;
  resultFound: string;
  resultNotFound: string;
  eligible: string;
  notEligible: string;
  startTyping: string;
  searchRuns: string;
  slotTitle: string;
  slotLead: string;
  slotPeople: string;
  slotSelectOne: string;
  slotSelectedPrefix: string;
  matchFound: string;
  noMatch: string;
  matchesLabel: string;
  addressUnavailable: string;
  phoneUnavailable: string;
  submissionTitle: string;
  submissionLead: string;
  submissionCta: string;
  close: string;
  formName: string;
  formBusiness: string;
  formPhone: string;
  formAddress: string;
  formNotes: string;
  sideNoteLabel: string;
  sideNoteTitle: string;
  sideNoteText: string;
  supportTitle: string;
  supportLead: string;
  supportCount: string;
  visitorCount: string;
  supportButton: string;
  supportButtonThanks: string;
  supportNote: string;
  submit: string;
  email: string;
  contactTitle: string;
  contactHeading: string;
  contactPhone: string;
  contactEmail: string;
  contactWhatsapp: string;
  contactWhatsappCta: string;
  contactFacebook: string;
  contactFacebookCta: string;
  slotHeadingLine1: string;
  slotHeadingLine2: string;
  footerCredit: string;
};

const copy: Record<LanguageKey, CampaignCopy> = {
  en: {
    nav: ["Home", "Profile", "Book Slot", "Contact"],
    modeLabels: { all: "All", phone: "Phone", name: "Sl No", business: "Establishment", address: "Address" },
    heroEyebrow: "JCCI Election 2026-27",
    heroTitle: "Vote for Director",
    heroLead:
      "I bring veteran discipline, business understanding, and chamber leadership to the director role.",
    heroBallot: "Ballot",
    heroDate: "Date",
    heroVenue: "Venue",
    heroTime: "Time",
    directionsTitle: "Open directions",
    primary: "Search your name in Voter list",
    secondary: "Check Eligibility",
    profileKicker: "Who Am I",
    profileTitle: "Why select me.",
    aboutLabel: "About me",
    aboutHeading: "Serving members with discipline and clarity",
    backgroundLabel: "Background",
    backgroundHeading: "Indian Air Force veteran",
    backgroundText:
      "Disciplined service background, practical leadership, and direct exposure to operational responsibility.",
    expertiseLabel: "Business expertise",
    expertiseHeading: "Built for chamber decisions",
    expertiseText:
      "Practical exposure to taxation, labour, banking and compliance matters that directly affect local businesses.",
    businessKicker: "Business Network",
    businessTitle: "Our Family Businesses.",
    electionKicker: "Election Information",
    electionTitle: "Rules & Regulations",
    rulesLabel: "Voting rules",
    calendarLabel: "Election calendar",
    electionRules: [
      "Members must choose exactly 21 Directors, not more or less, to keep the ballot valid.",
      "Proxy Voting is not allowed.",
      "Membership enrollment deadline was 15.03.2026 up to 5:00 PM.",
      "Only traders who paid membership fee for 2025-2026 (Rs. 500/- per establishment) can vote.",
      "Final voter list publication: 06.04.2026.",
      "Candidate eligibility: any one Proprietor, Director, or Partner of a firm/company.",
      "Voting right: any one Proprietor, Director, or Partner can cast the vote.",
    ],
    timelineLabels: [
      "Nomination filing",
      "Scrutiny & finalisation",
      "Withdrawal deadline",
      "Final candidate list",
      "Voting",
      "Counting",
    ],
    doneLabel: "Done",
    upcomingLabel: "Upcoming",
    ongoingLabel: "Ongoing",
    searchTitle: "Check Eligibility",
    searchLead: "Search your name in Voter list.",
    eligibilitySearchLabel: "Search",
    searchPlaceholder: "Enter Sl No, address, establishment, or phone",
    supportTitle: "Support Signal",
    supportLead: "Show some support.",
    resultFound: "Found in the local member list",
    resultNotFound: "Not found in the local member list",
    eligible: "Likely eligible based on this record",
    notEligible: "No match found yet",
    startTyping: "Start by typing a member detail",
    searchRuns: "The search runs instantly on the local member dataset.",
    slotTitle: "Arrival Slot Planner",
    slotHeadingLine1: "Election timing is",
    slotHeadingLine2: "Pick one arrival slot.",
    slotLead: "Election timing is 9:00 AM to 3:00 PM. Pick one 15-minute arrival slot.",
    slotPeople: "people",
    slotSelectOne: "Select one slot. Tap the same selected slot to unlock and choose a different one.",
    slotSelectedPrefix: "Selected slot:",
    matchFound: "Match found",
    noMatch: "No match",
    matchesLabel: "matches",
    addressUnavailable: "Address unavailable",
    phoneUnavailable: "Phone unavailable",
    submissionTitle: "Add Missing Member Data",
    submissionLead:
      "If your record is missing, send it instantly through WhatsApp or email using the same details below.",
    submissionCta: "Missing? Add here.",
    close: "Close",
    formName: "Name",
    formBusiness: "Business",
    formPhone: "Phone",
    formAddress: "Address",
    formNotes: "Notes",
    sideNoteLabel: "Best fallback when no backend is used",
    sideNoteTitle: "Fast, familiar, and low friction.",
    sideNoteText:
      "The form prepares a clean message for WhatsApp or email, so members can submit data without waiting for a login or custom server.",
    supportCount: "Support taps",
    visitorCount: "Visitors",
    supportButton: "I like this website",
    supportButtonThanks: "I liked this website",
    supportNote:
      "This is not official voting. It is only a support signal to understand your vote of confidence.",
    submit: "Send via WhatsApp",
    email: "Send by Email",
    contactTitle: "Contact",
    contactHeading: "Connect with me.",
    contactPhone: "Phone",
    contactEmail: "Email",
    contactWhatsapp: "WhatsApp",
    contactWhatsappCta: "Open direct chat with Kishore",
    contactFacebook: "Facebook",
    contactFacebookCta: "Follow on Facebook",
    footerCredit: "Developed by Sana Sreeraj",
  },
  hi: {
    nav: ["होम", "प्रोफाइल", "स्लॉट देखें", "संपर्क"],
    modeLabels: { all: "सभी", phone: "फोन", name: "क्रम संख्या", business: "प्रतिष्ठान", address: "पता" },
    heroEyebrow: "JCCI चुनाव 2026-27",
    heroTitle: "Director के लिए वोट दें",
    heroLead:
      "मैं Director की भूमिका में सैन्य अनुशासन, व्यावसायिक समझ और चैंबर नेतृत्व का अनुभव लाता हूं।",
    heroBallot: "मतपत्र",
    heroDate: "तिथि",
    heroVenue: "स्थान",
    heroTime: "समय",
    directionsTitle: "दिशाएं खोलें",
    primary: "अपना नाम मतदाता सूची में खोजें",
    secondary: "पात्रता जांचें",
    profileKicker: "मैं कौन हूं",
    profileTitle: "मुझे क्यों चुनें।",
    aboutLabel: "मेरे बारे में",
    aboutHeading: "अनुशासन और स्पष्टता के साथ सदस्यों की सेवा",
    backgroundLabel: "पृष्ठभूमि",
    backgroundHeading: "भारतीय वायु सेना के पूर्व सैनिक",
    backgroundText: "अनुशासित सेवा पृष्ठभूमि, व्यावहारिक नेतृत्व और जिम्मेदारी का प्रत्यक्ष अनुभव।",
    expertiseLabel: "व्यावसायिक विशेषज्ञता",
    expertiseHeading: "चैंबर निर्णयों के लिए तैयार",
    expertiseText:
      "कर, श्रम, बैंकिंग और अनुपालन विषयों का व्यावहारिक अनुभव जो स्थानीय व्यवसायों को सीधे प्रभावित करता है।",
    businessKicker: "व्यावसायिक नेटवर्क",
    businessTitle: "हमारे पारिवारिक व्यवसाय।",
    electionKicker: "चुनाव जानकारी",
    electionTitle: "नियम और विनियम",
    rulesLabel: "मतदान नियम",
    calendarLabel: "चुनाव कैलेंडर",
    electionRules: [
      "मतपत्र वैध रखने के लिए सदस्यों को ठीक 21 Directors चुनने होंगे, न अधिक न कम।",
      "Proxy Voting की अनुमति नहीं है।",
      "सदस्यता पंजीकरण की अंतिम तिथि 15.03.2026 शाम 5:00 बजे तक थी।",
      "केवल वे व्यापारी वोट दे सकते हैं जिन्होंने 2025-2026 की सदस्यता फीस (Rs. 500/- प्रति प्रतिष्ठान) जमा की है।",
      "अंतिम मतदाता सूची प्रकाशन: 06.04.2026।",
      "उम्मीदवार पात्रता: किसी फर्म/कंपनी का कोई एक Proprietor, Director या Partner।",
      "मतदान अधिकार: किसी एक Proprietor, Director या Partner द्वारा वोट डाला जा सकता है।",
    ],
    timelineLabels: [
      "नामांकन दाखिला",
      "जांच और अंतिमकरण",
      "नाम वापसी अंतिम समय",
      "अंतिम उम्मीदवार सूची",
      "मतदान",
      "गणना",
    ],
    doneLabel: "पूरा",
    upcomingLabel: "आगामी",
    ongoingLabel: "जारी",
    searchTitle: "पात्रता जांचें",
    searchLead: "अपना नाम मतदाता सूची में खोजें।",
    eligibilitySearchLabel: "खोज",
    searchPlaceholder: "क्रम संख्या, पता, प्रतिष्ठान या फोन दर्ज करें",
    supportTitle: "समर्थन संकेत",
    supportLead: "कुछ समर्थन दिखाएं।",
    resultFound: "स्थानीय सदस्य सूची में मिला",
    resultNotFound: "स्थानीय सदस्य सूची में नहीं मिला",
    eligible: "इस रिकॉर्ड के आधार पर संभवतः पात्र",
    notEligible: "अभी तक कोई मिलान नहीं मिला",
    startTyping: "किसी सदस्य का विवरण टाइप करके शुरू करें",
    searchRuns: "यह खोज स्थानीय सदस्य डेटा पर तुरंत चलती है।",
    slotTitle: "आगमन स्लॉट योजना",
    slotHeadingLine1: "चुनाव का समय है",
    slotHeadingLine2: "एक आगमन स्लॉट चुनें।",
    slotLead: "चुनाव समय 9:00 AM से 3:00 PM है। एक 15-मिनट का स्लॉट चुनें।",
    slotPeople: "लोग",
    slotSelectOne: "एक स्लॉट चुनें। उसी चुने हुए स्लॉट पर फिर क्लिक करने से अनलॉक होगा और आप दूसरा स्लॉट चुन सकेंगे।",
    slotSelectedPrefix: "चुना हुआ स्लॉट:",
    matchFound: "मिलान मिला",
    noMatch: "कोई मिलान नहीं",
    matchesLabel: "मिलान",
    addressUnavailable: "पता उपलब्ध नहीं",
    phoneUnavailable: "फोन उपलब्ध नहीं",
    submissionTitle: "गुम सदस्य डेटा जोड़ें",
    submissionLead:
      "यदि आपका रिकॉर्ड गायब है, तो नीचे दिए गए विवरण के साथ WhatsApp या Email द्वारा तुरंत भेजें।",
    submissionCta: "रिकॉर्ड गायब? यहां जोड़ें।",
    close: "बंद करें",
    formName: "नाम",
    formBusiness: "व्यवसाय",
    formPhone: "फोन",
    formAddress: "पता",
    formNotes: "नोट्स",
    sideNoteLabel: "जब बैकएंड नहीं हो, तब सबसे अच्छा विकल्प",
    sideNoteTitle: "तेज, परिचित और आसान।",
    sideNoteText:
      "यह फॉर्म WhatsApp या Email के लिए साफ संदेश तैयार करता है, ताकि सदस्य बिना लॉगिन या सर्वर के भी विवरण भेज सकें।",
    supportCount: "समर्थन टैप्स",
    visitorCount: "आगंतुक",
    supportButton: "मैं किशोर कुमार का समर्थन करता हूं",
    supportButtonThanks: "आपके समर्थन के लिए धन्यवाद",
    supportNote: "यह आधिकारिक मतदान नहीं है। यह केवल आपके विश्वास का समर्थन संकेत है।",
    submit: "WhatsApp से भेजें",
    email: "Email से भेजें",
    contactTitle: "संपर्क",
    contactHeading: "मुझसे जुड़ें।",
    contactPhone: "फोन",
    contactEmail: "ईमेल",
    contactWhatsapp: "व्हाट्सऐप",
    contactWhatsappCta: "किशोर से सीधे चैट खोलें",
    contactFacebook: "फेसबुक",
    contactFacebookCta: "फेसबुक पर फॉलो करें",
    footerCredit: "सना श्रीराज द्वारा विकसित",
  },
  or: {
    nav: ["ମୁଖ୍ୟ", "ପ୍ରୋଫାଇଲ୍", "ସ୍ଲଟ୍ ଦେଖନ୍ତୁ", "ଯୋଗାଯୋଗ"],
    modeLabels: { all: "ସବୁ", phone: "ଫୋନ୍", name: "କ୍ରମ ସଂଖ୍ୟା", business: "ପ୍ରତିଷ୍ଠାନ", address: "ଠିକଣା" },
    heroEyebrow: "JCCI ନିର୍ବାଚନ 2026-27",
    heroTitle: "Director ପାଇଁ ଭୋଟ ଦିଅନ୍ତୁ",
    heroLead:
      "ଚି. କିଶୋର କୁମାର ସେନା ଶୃଙ୍ଖଳା, ବ୍ୟବସାୟ ବୁଝାମଣା ଏବଂ ଚେମ୍ବର ନେତୃତ୍ୱକୁ ଏକାତ୍ମ କରନ୍ତି।",
    heroBallot: "ବ୍ୟାଲଟ୍",
    heroDate: "ତାରିଖ",
    heroVenue: "ସ୍ଥାନ",
    heroTime: "ସମୟ",
    directionsTitle: "ଦିଗ ଖୋଲନ୍ତୁ",
    primary: "ମତଦାତା ତାଲିକାରେ ଆପଣଙ୍କର ନାମ ଖୋଜନ୍ତୁ",
    secondary: "ଯୋଗ୍ୟତା ଯାଞ୍ଚ",
    profileKicker: "ମୁଁ କିଏ",
    profileTitle: "ମୋତେ କାହିଁକି ଚୟନ କରିବେ।",
    aboutLabel: "ମୋ ବିଷୟରେ",
    aboutHeading: "ଶୃଙ୍ଖଳା ଓ ସ୍ପଷ୍ଟତା ସହ ସଦସ୍ୟ ସେବା",
    backgroundLabel: "ପୃଷ୍ଠଭୂମି",
    backgroundHeading: "ଭାରତୀୟ ବାୟୁସେନା ପୂର୍ବ ସେନାନୀ",
    backgroundText: "ଶୃଙ୍ଖଳିତ ସେବା ପୃଷ୍ଠଭୂମି, ପ୍ରାୟୋଗିକ ନେତୃତ୍ୱ ଓ ଦାୟିତ୍ୱର ସିଧା ଅନୁଭବ।",
    expertiseLabel: "ବ୍ୟବସାୟ ଦକ୍ଷତା",
    expertiseHeading: "ଚେମ୍ବର ନିଷ୍ପତ୍ତି ପାଇଁ ପ୍ରସ୍ତୁତ",
    expertiseText:
      "ଟ୍ୟାକ୍ସ, ଲେବର, ବ୍ୟାଙ୍କିଂ ଓ କମ୍ପ୍ଲାୟାନ୍ସ ବିଷୟରେ ପ୍ରାୟୋଗିକ ଅନୁଭବ ଯାହା ସ୍ଥାନୀୟ ବ୍ୟବସାୟକୁ ପ୍ରଭାବିତ କରେ।",
    businessKicker: "ବ୍ୟବସାୟ ନେଟୱର୍କ",
    businessTitle: "ଆମ ପରିବାରର ବ୍ୟବସାୟ।",
    electionKicker: "ନିର୍ବାଚନ ସୂଚନା",
    electionTitle: "ନିୟମ ଓ ବିଧିବଳୀ",
    rulesLabel: "ଭୋଟିଂ ନିୟମ",
    calendarLabel: "ନିର୍ବାଚନ କ୍ୟାଲେଣ୍ଡର",
    electionRules: [
      "ବ୍ୟାଲଟ୍ ବୈଧ ରଖିବାକୁ ସଦସ୍ୟମାନେ ଠିକ 21 ଜଣ Directors ବାଛିବେ, ଅଧିକ କିମ୍ବା କମ୍ ନୁହେଁ।",
      "Proxy Voting ଅନୁମୋଦିତ ନୁହେଁ।",
      "ସଦସ୍ୟତା ନମାଂକନ ଶେଷ ସମୟ 15.03.2026 ସନ୍ଧ୍ୟା 5:00 ପର୍ଯ୍ୟନ୍ତ ଥିଲା।",
      "2025-2026 ପାଇଁ ସଦସ୍ୟତା ଫି (Rs. 500/- ପ୍ରତି ପ୍ରତିଷ୍ଠାନ) ଦେଇଥିବା ବ୍ୟବସାୟୀମାନେ ମାତ୍ର ଭୋଟ ଦେଇପାରିବେ।",
      "ଅନ୍ତିମ ଭୋଟର ତାଲିକା ପ୍ରକାଶ: 06.04.2026।",
      "ପ୍ରାର୍ଥୀ ଯୋଗ୍ୟତା: କମ୍ପାନୀ/ଫର୍ମର ଯେକୌଣସି ଗୋଟିଏ Proprietor, Director କିମ୍ବା Partner।",
      "ଭୋଟିଂ ଅଧିକାର: ଯେକୌଣସି ଗୋଟିଏ Proprietor, Director କିମ୍ବା Partner ଭୋଟ ଦେଇପାରିବେ।",
    ],
    timelineLabels: [
      "ନାମାଙ୍କନ ଦାଖଲ",
      "ସ୍କ୍ରୁଟିନି ଓ ଅନ୍ତିମକରଣ",
      "ପ୍ରତ୍ୟାହାର ଶେଷ ସମୟ",
      "ଅନ୍ତିମ ପ୍ରାର୍ଥୀ ତାଲିକା",
      "ଭୋଟିଂ",
      "ଗଣନା",
    ],
    doneLabel: "ସମ୍ପୂର୍ଣ୍ଣ",
    upcomingLabel: "ଆସନ୍ତା",
    ongoingLabel: "ଚାଲୁଛି",
    searchTitle: "ଯୋଗ୍ୟତା ଯାଞ୍ଚ",
    searchLead: "ମତଦାତା ତାଲିକାରେ ଆପଣଙ୍କର ନାମ ଖୋଜନ୍ତୁ।",
    eligibilitySearchLabel: "ଖୋଜନ୍ତୁ",
    searchPlaceholder: "କ୍ରମ ସଂଖ୍ୟା, ଠିକଣା, ପ୍ରତିଷ୍ଠାନ କିମ୍ବା ଫୋନ୍ ଲେଖନ୍ତୁ",
    supportTitle: "ସମର୍ଥନ ସଙ୍କେତ",
    supportLead: "କିଛି ସମର୍ଥନ ଦିଅନ୍ତୁ।",
    resultFound: "ସ୍ଥାନୀୟ ମେମ୍ବର ତାଲିକାରେ ମିଳିଲା",
    resultNotFound: "ସ୍ଥାନୀୟ ତାଲିକାରେ ମିଳିଲା ନାହିଁ",
    eligible: "ଏହି ରେକର୍ଡ ଅନୁଯାୟୀ ଯୋଗ୍ୟ",
    notEligible: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ମ୍ୟାଚ୍ ନାହିଁ",
    startTyping: "ସଦସ୍ୟ ବିବରଣୀ ଟାଇପ୍ କରି ଆରମ୍ଭ କରନ୍ତୁ",
    searchRuns: "ଏହି ଖୋଜ ସ୍ଥାନୀୟ ସଦସ୍ୟ ତଥ୍ୟ ଉପରେ ତୁରନ୍ତ ଚାଲେ।",
    slotTitle: "ଆଗମନ ସ୍ଲଟ୍ ଯୋଜନା",
    slotHeadingLine1: "ନିର୍ବାଚନ ସମୟ ହେଉଛି",
    slotHeadingLine2: "ଗୋଟିଏ ଆଗମନ ସ୍ଲଟ୍ ବାଛନ୍ତୁ।",
    slotLead: "ନିର୍ବାଚନ ସମୟ 9:00 AM ଠାରୁ 3:00 PM ପର୍ଯ୍ୟନ୍ତ। ଗୋଟିଏ 15-ମିନିଟ୍ ସ୍ଲଟ୍ ବାଛନ୍ତୁ।",
    slotPeople: "ଜଣ",
    slotSelectOne: "ଗୋଟିଏ ସ୍ଲଟ୍ ବାଛନ୍ତୁ। ସେହି ସ୍ଲଟ୍‌କୁ ପୁନି କ୍ଲିକ୍ କଲେ ଅନଲକ୍ ହେବ ଏବଂ ଅନ୍ୟ ସ୍ଲଟ୍ ବାଛିପାରିବେ।",
    slotSelectedPrefix: "ବାଛାଯାଇଥିବା ସ୍ଲଟ୍:",
    matchFound: "ମ୍ୟାଚ୍ ମିଳିଲା",
    noMatch: "ମ୍ୟାଚ୍ ନାହିଁ",
    matchesLabel: "ମ୍ୟାଚ୍",
    addressUnavailable: "ଠିକଣା ଉପଲବ୍ଧ ନାହିଁ",
    phoneUnavailable: "ଫୋନ୍ ଉପଲବ୍ଧ ନାହିଁ",
    submissionTitle: "ଅନୁପସ୍ଥିତ ସଦସ୍ୟ ତଥ୍ୟ ଯୋଡନ୍ତୁ",
    submissionLead:
      "ଆପଣଙ୍କ ରେକର୍ଡ ନଥିଲେ, ଏହି ତଥ୍ୟକୁ WhatsApp କିମ୍ବା Email ଦ୍ୱାରା ତୁରନ୍ତ ପଠାନ୍ତୁ।",
    submissionCta: "ରେକର୍ଡ ନାହିଁ? ଏଠାରେ ଯୋଡନ୍ତୁ।",
    close: "ବନ୍ଦ କରନ୍ତୁ",
    formName: "ନାମ",
    formBusiness: "ବ୍ୟବସାୟ",
    formPhone: "ଫୋନ୍",
    formAddress: "ଠିକଣା",
    formNotes: "ଟିପ୍ପଣୀ",
    sideNoteLabel: "ବ୍ୟାକେଣ୍ଡ ନଥିଲେ ସର୍ବୋତ୍ତମ ବିକଳ୍ପ",
    sideNoteTitle: "ଦ୍ରୁତ, ପରିଚିତ ଓ ସହଜ।",
    sideNoteText:
      "ଏହି ଫର୍ମ WhatsApp କିମ୍ବା Email ପାଇଁ ସୁଚିତ ବାର୍ତ୍ତା ତିଆରି କରେ, ଯାହାରେ ଲଗଇନ୍ କିମ୍ବା ସର୍ଭର ଛଡା ବି ବିବରଣୀ ପଠାଇପାରିବେ।",
    supportCount: "ସମର୍ଥନ ଟାପ୍",
    visitorCount: "ପରିଦର୍ଶକ",
    supportButton: "ମୁଁ କିଶୋର କୁମାରଙ୍କୁ ସମର୍ଥନ କରେ",
    supportButtonThanks: "ଆପଣଙ୍କ ସମର୍ଥନ ପାଇଁ ଧନ୍ୟବାଦ",
    supportNote: "ଏହା ଆଧିକାରିକ ଭୋଟିଂ ନୁହେଁ। ଏହା ଆପଣଙ୍କ ବିଶ୍ୱାସର ସମର୍ଥନ ସଙ୍କେତ ମାତ୍ର।",
    submit: "WhatsApp ରେ ପଠାନ୍ତୁ",
    email: "Email ରେ ପଠାନ୍ତୁ",
    contactTitle: "ଯୋଗାଯୋଗ",
    contactHeading: "ମୋ ସହ ସଂଯୋଗ କରନ୍ତୁ।",
    contactPhone: "ଫୋନ୍",
    contactEmail: "ଇମେଲ୍",
    contactWhatsapp: "WhatsApp",
    contactWhatsappCta: "କିଶୋରଙ୍କ ସହ ସିଧା ଚାଟ୍ ଖୋଲନ୍ତୁ",
    contactFacebook: "ଫେସବୁକ",
    contactFacebookCta: "ଫେସବୁକରେ ଫଲୋ କରନ୍ତୁ",
    footerCredit: "ସନା ଶ୍ରୀରେଜଙ୍କ ଦ୍ୱାରା ତିଆରି",
  },
  te: {
    nav: ["హోమ్", "ప్రొఫైల్", "స్లాట్ చూడండి", "కాంటాక్ట్"],
    modeLabels: { all: "అన్నీ", phone: "ఫోన్", name: "క్రమ సంఖ్య", business: "సంస్థ", address: "చిరునామా" },
    heroEyebrow: "JCCI ఎన్నికలు 2026-27",
    heroTitle: "Director కి ఓటు వేయండి",
    heroLead:
      "చి. కిశోర్ కుమార్ సైనిక క్రమశిక్షణ, వ్యాపార అవగాహన, మరియు చాంబర్ నాయకత్వాన్ని తీసుకొస్తారు.",
    heroBallot: "బ్యాలెట్",
    heroDate: "తేదీ",
    heroVenue: "స్థలం",
    heroTime: "సమయం",
    directionsTitle: "దిశలు తెరవండి",
    primary: "ఓటర్ జాబితాలో మీ పేరు ఖోజండి",
    secondary: "అర్హత తనిఖీ",
    profileKicker: "నేను ఎవరు",
    profileTitle: "నన్నెందుకు ఎంచుకోవాలి.",
    aboutLabel: "నా గురించి",
    aboutHeading: "క్రమశిక్షణతో, స్పష్టతతో సభ్యులకు సేవ",
    backgroundLabel: "పరిచయం",
    backgroundHeading: "భారత వాయుసేన మాజీ సిబ్బంది",
    backgroundText: "క్రమశిక్షణ గల సేవా నేపథ్యం, ప్రాక్టికల్ నాయకత్వం, బాధ్యతలపై ప్రత్యక్ష అనుభవం.",
    expertiseLabel: "వ్యాపార నైపుణ్యం",
    expertiseHeading: "చాంబర్ నిర్ణయాలకు సిద్ధంగా",
    expertiseText:
      "పన్నులు, కార్మిక చట్టాలు, బ్యాంకింగ్ మరియు కంప్లయెన్స్ అంశాలలో ప్రాయోగిక అనుభవం స్థానిక వ్యాపారాలకు ఉపయోగపడుతుంది.",
    businessKicker: "వ్యాపార నెట్‌వర్క్",
    businessTitle: "మన కుటుంబ వ్యాపారాలు.",
    electionKicker: "ఎన్నికల సమాచారం",
    electionTitle: "నియమాలు & నిబంధనలు",
    rulesLabel: "ఓటింగ్ నియమాలు",
    calendarLabel: "ఎన్నికల క్యాలెండర్",
    electionRules: [
      "బ్యాలెట్ చెల్లుబాటు కావాలంటే సభ్యులు కచ్చితంగా 21 Directors ను మాత్రమే ఎంచుకోవాలి, ఎక్కువా తక్కువా కాదు.",
      "Proxy Voting అనుమతించబడదు.",
      "సభ్యత్వ నమోదు గడువు 15.03.2026 సాయంత్రం 5:00 వరకు ఉంది.",
      "2025-2026 సభ్యత్వ రుసుము (Rs. 500/- ప్రతి సంస్థకు) చెల్లించిన వ్యాపారులు మాత్రమే ఓటు వేయగలరు.",
      "తుది ఓటరు జాబితా ప్రచురణ: 06.04.2026.",
      "అభ్యర్థి అర్హత: ఒక సంస్థ/కంపెనీకి చెందిన ఏకైక Proprietor, Director లేదా Partner.",
      "ఓటు హక్కు: ఏకైక Proprietor, Director లేదా Partner ఓటు వేయగలరు.",
    ],
    timelineLabels: [
      "నామినేషన్ దాఖలు",
      "తనిఖీ & తుది నిర్ణయం",
      "వెనక్కి తీసుకునే గడువు",
      "తుది అభ్యర్థుల జాబితా",
      "ఓటింగ్",
      "కౌంటింగ్",
    ],
    doneLabel: "పూర్తి",
    upcomingLabel: "రాబోయే",
    ongoingLabel: "కొనసాగుతోంది",
    searchTitle: "అర్హత తనిఖీ",
    searchLead: "ఓటర్ జాబితాలో మీ పేరు ఖోజండి.",
    eligibilitySearchLabel: "వెతుకు",
    searchPlaceholder: "క్రమ సంఖ్య, చిరునామా, సంస్థ లేదా ఫోన్ నమోదు చేయండి",
    supportTitle: "సపోర్ట్ సిగ్నల్",
    supportLead: "కొంత మద్దతు చూపించండి.",
    resultFound: "స్థానిక సభ్యుల జాబితాలో దొరికింది",
    resultNotFound: "స్థానిక జాబితాలో దొరకలేదు",
    eligible: "ఈ రికార్డు ఆధారంగా అర్హత ఉంది",
    notEligible: "ఇంకా మ్యాచ్ లేదు",
    startTyping: "ఒక సభ్యుడి వివరాలు టైప్ చేసి ప్రారంభించండి",
    searchRuns: "ఈ సెర్చ్ స్థానిక సభ్యుల డేటాపై వెంటనే పనిచేస్తుంది.",
    slotTitle: "వచ్చే సమయ స్లాట్ ప్లానర్",
    slotHeadingLine1: "ఎన్నికల సమయం ఉంటుంది",
    slotHeadingLine2: "ఒక వచ్చే సమయ స్లాట్ ఎంచుకోండి.",
    slotLead: "ఎన్నిక సమయం 9:00 AM నుంచి 3:00 PM వరకు. ఒక 15-నిమిషాల స్లాట్ ఎంచుకోండి.",
    slotPeople: "మంది",
    slotSelectOne: "ఒక స్లాట్ ఎంచుకోండి. అదే స్లాట్‌పై మళ్లీ క్లిక్ చేస్తే అన్‌లాక్ అవుతుంది, తర్వాత మరొక స్లాట్ ఎంచుకోవచ్చు.",
    slotSelectedPrefix: "ఎంచుకున్న స్లాట్:",
    matchFound: "మ్యాచ్ దొరికింది",
    noMatch: "మ్యాచ్ లేదు",
    matchesLabel: "మ్యాచ్‌లు",
    addressUnavailable: "చిరునామా అందుబాటులో లేదు",
    phoneUnavailable: "ఫోన్ అందుబాటులో లేదు",
    submissionTitle: "లేకపోయిన సభ్యుల డేటా జోడించండి",
    submissionLead:
      "మీ రికార్డు లేకపోతే, దిగువ వివరాలతో WhatsApp లేదా Email ద్వారా వెంటనే పంపండి.",
    submissionCta: "రికార్డు లేదు? ఇక్కడ జోడించండి.",
    close: "మూసివేయండి",
    formName: "పేరు",
    formBusiness: "వ్యాపారం",
    formPhone: "ఫోన్",
    formAddress: "చిరునామా",
    formNotes: "గమనికలు",
    sideNoteLabel: "బ్యాక్‌ఎండ్ లేకపోతే ఉత్తమ మార్గం",
    sideNoteTitle: "వేగంగా, సులభంగా, పరిచయంతో.",
    sideNoteText:
      "ఈ ఫారం WhatsApp లేదా Email కోసం స్పష్టమైన సందేశాన్ని సిద్ధం చేస్తుంది. కాబట్టి లాగిన్ లేదా సర్వర్ లేకుండా సభ్యులు వివరాలు పంపవచ్చు.",
    supportCount: "సపోర్ట్ ట్యాప్‌లు",
    visitorCount: "విజిటర్లు",
    supportButton: "నేను కిశోర్ కుమార్‌కు మద్దతు ఇస్తున్నాను",
    supportButtonThanks: "మీ మద్దతుకు ధన్యవాదాలు",
    supportNote: "ఇది అధికారిక ఓటింగ్ కాదు. ఇది మీ మద్దతును అర్థం చేసుకునే సూచిక మాత్రమే.",
    submit: "WhatsApp ద్వారా పంపండి",
    email: "Email ద్వారా పంపండి",
    contactTitle: "సంప్రదింపు",
    contactHeading: "నాతో కలవండి.",
    contactPhone: "ఫోన్",
    contactEmail: "ఇమెయిల్",
    contactWhatsapp: "WhatsApp",
    contactWhatsappCta: "కిశోర్‌తో నేరుగా చాట్ తెరవండి",
    contactFacebook: "ఫేస్‌బుక్",
    contactFacebookCta: "ఫేస్‌బుక్‌లో ఫాలో చేయండి",
    footerCredit: "సనా శ్రీరాజ్ రూపొందించారు",
  },
};

const languageOptions: Array<{ key: LanguageKey; label: string }> = [
  { key: "en", label: "English" },
  { key: "hi", label: "हिन्दी" },
  { key: "or", label: "ଓଡିଆ" },
  { key: "te", label: "తెలుగు" },
];

const modes: SearchMode[] = ["all", "phone", "name", "business", "address"];

type SlotItem = {
  key: string;
  label: string;
};

type DirectorFormState = {
  name: string;
  businessName: string;
  businessAddress: string;
  residenceAddress: string;
  photoUrl: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  experienceExpertise: string;
};

type DirectorFormErrors = Partial<Record<keyof DirectorFormState, string>>;

const emptyDirectorForm: DirectorFormState = {
  name: "",
  businessName: "",
  businessAddress: "",
  residenceAddress: "",
  photoUrl: "",
  contactNumber: "",
  whatsappNumber: "",
  email: "",
  experienceExpertise: "",
};

type ElectionResultRow = {
  ballotNo: number;
  name: string;
  votes: number;
};

const electionResultsTop21: ElectionResultRow[] = [
  { ballotNo: 28, name: "Sanjay Kumar Jain", votes: 610 },
  { ballotNo: 24, name: "Nemani Chaitanya", votes: 591 },
  { ballotNo: 17, name: "K Dillip Reddy", votes: 583 },
  { ballotNo: 12, name: "Dinesh Sunkari", votes: 576 },
  { ballotNo: 18, name: "K Rama Krishna", votes: 557 },
  { ballotNo: 31, name: "Satish Kumar Patro (Nilu)", votes: 555 },
  { ballotNo: 1, name: "A Srinivasa Rao (Arugula)", votes: 551 },
  { ballotNo: 35, name: "V Prabhakar", votes: 516 },
  { ballotNo: 11, name: "D Madhav", votes: 494 },
  { ballotNo: 4, name: "B Satish Kumar", votes: 490 },
  { ballotNo: 14, name: "Gembali Vasanta Rao", votes: 475 },
  { ballotNo: 27, name: "Sanjay Kumar Jain", votes: 470 },
  { ballotNo: 8, name: "Ch Kishore Kumar", votes: 462 },
  { ballotNo: 20, name: "Kella Iswar Rao", votes: 460 },
  { ballotNo: 21, name: "Loknath Patro", votes: 459 },
  { ballotNo: 3, name: "Ankur Soni", votes: 452 },
  { ballotNo: 22, name: "Manoj Kumar Shah", votes: 443 },
  { ballotNo: 7, name: "Bibhu Dutta Padhi (Luna)", votes: 404 },
  { ballotNo: 9, name: "Chandresh Rathod", votes: 400 },
  { ballotNo: 6, name: "Barun Kumar Jain", votes: 391 },
  { ballotNo: 33, name: "Surya Narayana Patnaik", votes: 384 },
];

function canonicalizeDirectorName(value: string) {
  return value
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const eligibleDirectorNameSet = new Set(
  electionResultsTop21.flatMap((item) => {
    const exact = canonicalizeDirectorName(item.name);
    const withoutBracket = canonicalizeDirectorName(item.name.replace(/\([^)]*\)/g, " "));
    return [exact, withoutBracket].filter(Boolean);
  }),
);

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function toProperCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

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

type TimelineStatus = "done" | "upcoming" | "ongoing";

function getIstDateParts(now: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    isoDate: `${valueByType.year}-${valueByType.month}-${valueByType.day}`,
    minutesFromMidnight:
      Number(valueByType.hour ?? "0") * 60 + Number(valueByType.minute ?? "0"),
  };
}

function resolveTimelineStatus(
  step: ElectionInfo["timeline"][number],
  index: number,
  now: Date,
): TimelineStatus {
  const votingIndex = 4;
  const countingIndex = 5;

  if (index !== votingIndex && index !== countingIndex) {
    return step.status;
  }

  const eventDate = "2026-04-12";
  const { isoDate, minutesFromMidnight } = getIstDateParts(now);

  if (isoDate < eventDate) {
    return "upcoming";
  }

  if (isoDate > eventDate) {
    return "done";
  }

  if (index === votingIndex) {
    if (minutesFromMidnight < 9 * 60) {
      return "upcoming";
    }
    if (minutesFromMidnight < 15 * 60) {
      return "ongoing";
    }
    return "done";
  }

  if (minutesFromMidnight < 15 * 60 + 30) {
    return "upcoming";
  }
  if (minutesFromMidnight < 21 * 60) {
    return "ongoing";
  }
  return "done";
}

function normalizeIndianPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return "";
}

function isValidIndianPhone(value: string) {
  return /^\+91[6-9]\d{9}$/.test(value);
}

function sanitizeTextOnly(value: string) {
  return value.replace(/[^A-Za-z\s.'-]/g, "");
}

function sanitizeAlphaNumeric(value: string) {
  return value.replace(/[^A-Za-z0-9\s.,'()\-/#&:]/g, "");
}

function sanitizePhoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function titleCaseWords(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateDirectorForm(form: DirectorFormState) {
  const errors: DirectorFormErrors = {};
  const name = titleCaseWords(sanitizeTextOnly(form.name));
  const businessName = titleCaseWords(sanitizeTextOnly(form.businessName));
  const businessAddress = sanitizeAlphaNumeric(form.businessAddress).trim();
  const residenceAddress = sanitizeAlphaNumeric(form.residenceAddress).trim();
  const experienceExpertise = sanitizeAlphaNumeric(form.experienceExpertise).trim();
  const contactNumber = sanitizePhoneDigits(form.contactNumber);
  const whatsappNumber = sanitizePhoneDigits(form.whatsappNumber);
  const normalizedContact = contactNumber ? `+91${contactNumber}` : "";
  const normalizedWhatsapp = whatsappNumber ? `+91${whatsappNumber}` : "";

  if (!name) {
    errors.name = "Name is required";
  }

  if (name && !eligibleDirectorNameSet.has(canonicalizeDirectorName(name))) {
    errors.name = "Only the announced 21 JCCI Directors can submit this form";
  }
  if (!businessName) {
    errors.businessName = "Business Name is required";
  }
  if (!businessAddress) {
    errors.businessAddress = "Business Address is required";
  }
  if (!residenceAddress) {
    errors.residenceAddress = "Residence / Address is required";
  }
  if (!form.photoUrl.trim()) {
    errors.photoUrl = "Photo is required";
  }

  if (!normalizedContact || !isValidIndianPhone(normalizedContact)) {
    errors.contactNumber = "Contact number must be 10 digits only";
  }

  if (!normalizedWhatsapp || !isValidIndianPhone(normalizedWhatsapp)) {
    errors.whatsappNumber = "WhatsApp number must be 10 digits only";
  }

  if (!form.email.trim() || !isValidEmail(form.email.trim())) {
    errors.email = "A valid email is required";
  }

  if (!experienceExpertise) {
    errors.experienceExpertise = "Experience & Expertise is required";
  }

  return {
    errors,
    normalized: {
      ...form,
      name,
      businessName,
      businessAddress,
      residenceAddress,
      photoUrl: form.photoUrl.trim(),
      contactNumber: normalizedContact,
      whatsappNumber: normalizedWhatsapp,
      email: form.email.trim().toLowerCase(),
      experienceExpertise,
    },
  };
}

export function CampaignSite({
  candidate,
  election,
  supporters,
  memberRecords,
  directorProfiles = [],
}: Props) {
  const supportFlagKey = "kishore-support-locked";
  const slotSelectionKey = "kishore-selected-slot";
  const showWhoAmI = false;
  const showBusinessNetwork = false;
  const slotOptions = useMemo(() => buildElectionSlots(), []);
  const [language, setLanguage] = useState<LanguageKey>("en");
  const [searchMode, setSearchMode] = useState<SearchMode>("all");
  const [query, setQuery] = useState("");
  const [supportCount, setSupportCount] = useState(121);
  const [visitorCount, setVisitorCount] = useState(0);
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);
  const [hasSupported, setHasSupported] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [submissionName, setSubmissionName] = useState("");
  const [submissionBusiness, setSubmissionBusiness] = useState("");
  const [submissionPhone, setSubmissionPhone] = useState("");
  const [submissionAddress, setSubmissionAddress] = useState("");
  const [submissionNote, setSubmissionNote] = useState("");
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);
  const [directors, setDirectors] = useState<DirectorProfile[]>(() => directorProfiles ?? []);
  const [isDirectorFormOpen, setIsDirectorFormOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | null>(null);
  const [directorForm, setDirectorForm] = useState<DirectorFormState>(emptyDirectorForm);
  const [directorFormErrors, setDirectorFormErrors] = useState<DirectorFormErrors>({});
  const [directorFormMessage, setDirectorFormMessage] = useState("");
  const [directorSubmitting, setDirectorSubmitting] = useState(false);
  const [directorPhotoFileName, setDirectorPhotoFileName] = useState("");
  const [isResultsPopupOpen, setIsResultsPopupOpen] = useState(true);
  const [timelineNow, setTimelineNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const autoCloseTimer = window.setTimeout(() => {
      setIsResultsPopupOpen(false);
    }, 120_000);

    return () => {
      window.clearTimeout(autoCloseTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimelineNow(new Date());
    }, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const loadSupportCount = useCallback(async () => {
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
      // Keep current count when the API is temporarily unavailable.
    }
  }, []);

  const loadSlotCounts = useCallback(async () => {
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
      // Keep current slot counts when API is unavailable.
    }
  }, []);

  const loadVisitorCount = useCallback(async () => {
    try {
      const response = await fetch("/api/visitors", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { count?: number };
      if (typeof payload.count === "number") {
        setVisitorCount(payload.count);
      }
    } catch {
      // Keep current count when the API is temporarily unavailable.
    }
  }, []);

  const loadDirectors = useCallback(async () => {
    try {
      const response = await fetch("/api/directors", { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { directors?: DirectorProfile[] };
      if (Array.isArray(payload.directors)) {
        setDirectors(payload.directors);
      }
    } catch {
      // Keep existing director cards if API is temporarily unavailable.
    }
  }, []);

  const registerVisitor = useCallback(async () => {
    try {
      const response = await fetch("/api/visitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        await loadVisitorCount();
        return;
      }

      const payload = (await response.json()) as { count?: number };
      if (typeof payload.count === "number") {
        setVisitorCount(payload.count);
      }
    } catch {
      // Ignore temporary errors and continue rendering the page.
      await loadVisitorCount();
    }
  }, [loadVisitorCount]);

  useEffect(() => {
    function syncLocalState() {
      const isLocked = window.localStorage.getItem(supportFlagKey) === "1";
      const storedSlot = window.localStorage.getItem(slotSelectionKey);
      setHasSupported(isLocked);
      setSelectedSlot(storedSlot || null);
    }

    function refreshFromServer() {
      void loadSupportCount();
      void loadSlotCounts();
      void loadVisitorCount();
      void loadDirectors();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refreshFromServer();
      }
    }

    function onWindowFocus() {
      refreshFromServer();
    }

    function onPageShow() {
      syncLocalState();
      refreshFromServer();
    }

    function onStorageChange(event: StorageEvent) {
      if (event.key === supportFlagKey || event.key === slotSelectionKey) {
        syncLocalState();
      }
    }

    syncLocalState();
    void registerVisitor();
    refreshFromServer();

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("storage", onStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("storage", onStorageChange);
    };
  }, [loadDirectors, loadSlotCounts, loadSupportCount, loadVisitorCount, registerVisitor]);

  function updateDirectorField<K extends keyof DirectorFormState>(key: K, value: DirectorFormState[K]) {
    setDirectorForm((previous) => ({ ...previous, [key]: value }));
    if (directorFormErrors[key]) {
      setDirectorFormErrors((previous) => ({ ...previous, [key]: undefined }));
    }
    if (directorFormMessage) {
      setDirectorFormMessage("");
    }
  }

  async function onDirectorPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setDirectorPhotoFileName(file.name);

    if (!file.type.startsWith("image/")) {
      const allowedExtensions = /\.(jpe?g|png|heic|heif|webp|gif|bmp|avif)$/i;
      if (!allowedExtensions.test(file.name)) {
        setDirectorFormErrors((previous) => ({
          ...previous,
          photoUrl: "Please upload a valid image file",
        }));
        setDirectorPhotoFileName("");
        return;
      }
    }

    // Keep payloads small enough for API body limits and faster loads.
    const maxSizeInBytes = 700 * 1024;
    if (file.size > maxSizeInBytes) {
      setDirectorFormErrors((previous) => ({
        ...previous,
        photoUrl: "Image must be 700KB or smaller",
      }));
      setDirectorPhotoFileName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      updateDirectorField("photoUrl", value);
    };
    reader.readAsDataURL(file);
  }

  async function submitDirectorProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { errors, normalized } = validateDirectorForm(directorForm);
    if (Object.keys(errors).length) {
      setDirectorFormErrors(errors);
      return;
    }

    setDirectorSubmitting(true);
    setDirectorFormMessage("");

    try {
      const response = await fetch("/api/directors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalized),
      });

      const payload = (await response.json()) as { director?: DirectorProfile; error?: string };
      if (!response.ok || !payload.director) {
        setDirectorFormMessage(payload.error ?? "Unable to save director details.");
        return;
      }

      setDirectors((previous) => [payload.director as DirectorProfile, ...previous]);
      setIsDirectorFormOpen(false);
      setSelectedDirector(payload.director as DirectorProfile);
      setDirectorForm(emptyDirectorForm);
      setDirectorPhotoFileName("");
      setDirectorFormErrors({});
      setDirectorFormMessage("");
    } catch {
      setDirectorFormMessage("Unable to save director details right now. Please try again.");
    } finally {
      setDirectorSubmitting(false);
    }
  }

  const results = useMemo(() => searchMembers(memberRecords, query, searchMode), [
    memberRecords,
    query,
    searchMode,
  ]);

  const activeCopy = copy[language];
  const hasResults = query.trim().length > 0;
  const safeDirectors = Array.isArray(directors) ? directors : [];
  const phoneDigits = normalizePhone(candidate.whatsapp);
  const supportMessage = `I support Ch Kishore Kumar for JCCI Director 8.\n\nName: ${submissionName || ""}\nBusiness: ${submissionBusiness || ""}\nPhone: ${submissionPhone || ""}\nAddress: ${submissionAddress || ""}\nNotes: ${submissionNote || ""}`;

  const whatsappLink =
    `https://wa.me/${phoneDigits}?text=` + encodeURIComponent(supportMessage.trim());
  const directWhatsAppLink = `https://wa.me/${phoneDigits}`;
  const emailLink =
    `mailto:${candidate.email}?subject=${encodeURIComponent(
      "JCCI member detail submission",
    )}&body=${encodeURIComponent(supportMessage.trim())}`;
  const selectedSlotLabel =
    slotOptions.find((slot) => slot.key === selectedSlot)?.label ?? "";
  const navItems = showWhoAmI ? activeCopy.nav : activeCopy.nav.filter((_, index) => index !== 1);
  const navHrefs = showWhoAmI
    ? ["#home", "#profile", "#slots", "#contact"]
    : ["#home", "#slots", "#contact"];

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

      await loadSupportCount();

      setHasSupported(true);
      window.localStorage.setItem(supportFlagKey, "1");
    } finally {
      setSupportLoading(false);
    }
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
      if (nextSlot) {
        window.localStorage.setItem(slotSelectionKey, nextSlot);
      } else {
        window.localStorage.removeItem(slotSelectionKey);
      }
    } finally {
      setSlotLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      {isResultsPopupOpen ? (
        <div
          className={styles.resultsPopupBackdrop}
          role="dialog"
          aria-modal="true"
          aria-label="JCCI Election Results 2026-27"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsResultsPopupOpen(false);
            }
          }}
        >
          <div className={styles.resultsPopupCard}>
            <div className={styles.resultsPopupHeader}>
              <div>
                <p className={styles.sectionKicker}>Official Announcement</p>
                <h3>JCCI Election Results 2026-27 (Top 21)</h3>
                <p>Congratulations to the new Core team of JCCI, 21 Directors.</p>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={() => setIsResultsPopupOpen(false)}
              >
                {activeCopy.close}
              </button>
            </div>

            <div className={styles.resultsTableWrap}>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Ballot No.</th>
                    <th>Name</th>
                    <th>Votes</th>
                  </tr>
                </thead>
                <tbody>
                  {electionResultsTop21.map((row) => (
                    <tr key={`${row.ballotNo}-${row.name}`}>
                      <td>{row.ballotNo}</td>
                      <td>{row.name}</td>
                      <td>{row.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      <header className={styles.topbar}>
        <div className={styles.brandLockup}>
          <Image
            src="/assets/jcci-logo.png"
            alt="JCCI logo"
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
          {navItems.map((item, index) => (
            <a key={item} href={navHrefs[index]}>
              {item}
            </a>
          ))}
          <a href="#directors">JCCI Directors 2026-27</a>
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
            <div className={styles.voteHighlight}>Thank you from</div>
            <h1>{candidate.name}</h1>
            <p className={styles.heroLead}>
              for electing as the director at <span className={styles.heroMetric}>13th rank</span> with{" "}
              <span className={styles.heroMetric}>462 votes</span>.
            </p>
            <p className={styles.heroTransitionNote}>
              This website will soon be fully transitioned into the official JCCI website.
            </p>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroFrame}>
              <Image
                src="/assets/kishore.png"
                alt="Ch Kishore Kumar portrait"
                fill
                className={styles.heroImage}
                priority
                sizes="(max-width: 900px) 100vw, 560px"
              />
            </div>
          </div>
        </section>

        {showWhoAmI ? (
          <section className={styles.section} id="profile">
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>{activeCopy.profileKicker}</p>
              <h2>{activeCopy.profileTitle}</h2>
            </div>

            <div className={styles.profileGrid}>
              <article className={styles.profilePanel}>
                <p className={styles.cardLabel}>{activeCopy.aboutLabel}</p>
                <h3>{activeCopy.aboutHeading}</h3>
                <p>{candidate.background}</p>
              </article>

              <article className={styles.profilePanel}>
                <p className={styles.cardLabel}>{activeCopy.backgroundLabel}</p>
                <h3>{activeCopy.backgroundHeading}</h3>
                <p>{activeCopy.backgroundText}</p>
                <div className={styles.tagList}>
                  {candidate.traits.map((trait) => (
                    <span key={trait}>{trait}</span>
                  ))}
                </div>
              </article>

              <article className={styles.profilePanel}>
                <p className={styles.cardLabel}>{activeCopy.expertiseLabel}</p>
                <h3>{activeCopy.expertiseHeading}</h3>
                <p>{activeCopy.expertiseText}</p>
                <div className={styles.tagList}>
                  {candidate.expertise.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : null}

        <section className={styles.section} id="directors">
          <div className={styles.directorHeaderRow}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>JCCI Core Team</p>
              <h2>JCCI Directors 2026-27</h2>
            </div>

            <div className={styles.directorSectionActions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={() => {
                setDirectorForm(emptyDirectorForm);
                setDirectorPhotoFileName("");
                setDirectorFormErrors({});
                setDirectorFormMessage("");
                setIsDirectorFormOpen(true);
              }}
            >
              Add your details
            </button>
            </div>
          </div>

          {safeDirectors.length ? (
            <div className={styles.directorGrid}>
              {safeDirectors.map((director) => (
                <article
                  key={director.id}
                  className={styles.directorCard}
                  onClick={() => setSelectedDirector(director)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedDirector(director);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.directorPhotoWrap}>
                    <img src={director.photoUrl} alt={director.name} className={styles.directorPhoto} />
                  </div>
                  <h3>{director.name}</h3>
                  <p className={styles.directorBusiness}>{director.businessName}</p>
                  <div className={styles.directorQuickActions}>
                    <a
                      href={`tel:${normalizePhone(director.contactNumber)}`}
                      className={styles.directorIconButton}
                      aria-label={`Call ${director.name}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <BiPhoneCall aria-hidden="true" />
                    </a>
                    <a
                      href={`https://wa.me/${normalizePhone(director.whatsappNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.directorIconButton}
                      aria-label={`WhatsApp ${director.name}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <FaWhatsapp aria-hidden="true" />
                    </a>
                    <a
                      href={`mailto:${director.email}`}
                      className={styles.directorIconButton}
                      aria-label={`Email ${director.name}`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <BiEnvelope aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>No entries yet</p>
              <h3>Be the first to add Director details</h3>
              <p>Tap "Add your details" and submit all required information.</p>
            </article>
          )}
        </section>

        {showBusinessNetwork ? (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>{activeCopy.businessKicker}</p>
              <h2>{activeCopy.businessTitle}</h2>
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
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.electionKicker}</p>
            <h2>{activeCopy.electionTitle}</h2>
          </div>

          <div className={styles.electionGrid}>
            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>{activeCopy.rulesLabel}</p>
              <ul className={styles.ruleList}>
                {election.rules.map((rule, index) => (
                  <li key={rule.text}>
                    {renderHighlightedText(activeCopy.electionRules[index] ?? rule.text, rule.highlights)}
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.infoCard}>
              <p className={styles.cardLabel}>{activeCopy.calendarLabel}</p>
              <ul className={styles.timelineCalendar}>
                {election.timeline.map((step, index) => {
                  const timelineStatus = resolveTimelineStatus(step, index, timelineNow);
                  const statusClassName =
                    timelineStatus === "done"
                      ? styles.timelineDoneCapsule
                      : timelineStatus === "ongoing"
                        ? styles.timelineOngoingCapsule
                        : styles.timelineUpcomingCapsule;
                  const statusLabel =
                    timelineStatus === "done"
                      ? activeCopy.doneLabel
                      : timelineStatus === "ongoing"
                        ? activeCopy.ongoingLabel
                        : activeCopy.upcomingLabel;

                  return (
                    <li key={`${step.label}-${step.detail}`} className={styles.timelineItem}>
                      <div className={styles.timelineDateBadge}>{step.date}</div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineHeadingRow}>
                          <strong>{activeCopy.timelineLabels[index] ?? step.label}</strong>
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
                  key={mode}
                  type="button"
                  className={searchMode === mode ? styles.modeActive : styles.modeButton}
                  onClick={() => setSearchMode(mode)}
                >
                  {activeCopy.modeLabels[mode]}
                </button>
              ))}
            </div>

            <label className={styles.searchInputWrap}>
              <span>{activeCopy.eligibilitySearchLabel}</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={activeCopy.searchPlaceholder}
              />
            </label>

            <div className={styles.resultBanner}>
              <div>
                <p className={styles.cardLabel}>
                  {hasResults ? (results.length ? activeCopy.resultFound : activeCopy.resultNotFound) : activeCopy.searchTitle}
                </p>
                <h3>
                  {hasResults ? `
                    ${results.length} ${activeCopy.matchesLabel}
                  `.trim() : activeCopy.startTyping}
                </h3>
                <p>
                  {hasResults
                    ? results.length
                      ? activeCopy.eligible
                      : activeCopy.notEligible
                    : activeCopy.searchRuns}
                </p>
              </div>
              <span className={results.length ? styles.successPill : styles.warningPill}>
                {results.length ? activeCopy.matchFound : activeCopy.noMatch}
              </span>
            </div>

            {hasResults && results.length > 0 ? (
              <div className={styles.resultsList}>
                {results.slice(0, 12).map((record) => (
                  <article className={styles.resultCard} key={`${record.name}-${record.phone}-${record.address}`}>
                    <div className={styles.resultSerial}>{record.slNo || "-"}</div>
                    <div className={styles.resultCardBody}>
                      <h4>{toProperCase(record.name)}</h4>
                      <p>{record.address ? toProperCase(record.address) : activeCopy.addressUnavailable}</p>
                      <span>{record.phone || activeCopy.phoneUnavailable}</span>
                    </div>
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

          <div className={styles.slotSection} id="slots">
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>{activeCopy.slotTitle}</p>
              <h2 className={styles.slotHeading}>
                <span className={`${styles.slotHeadingLine} ${styles.slotHeadingPrimary}`}>
                  {activeCopy.slotHeadingLine1} <span className={styles.slotTimeBlue}>9:00 AM to 3:00 PM</span>.
                </span>
                <span className={`${styles.slotHeadingLine} ${styles.slotHeadingSecondary}`}>
                  {activeCopy.slotHeadingLine2}
                </span>
              </h2>
            </div>

            <div className={styles.slotPlanner}>
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
                      <strong>{slotCount} {activeCopy.slotPeople}</strong>
                    </button>
                  );
                })}
              </div>

              <p className={styles.slotHint}>
                {selectedSlot && selectedSlotLabel
                  ? `${activeCopy.slotSelectedPrefix} ${selectedSlotLabel}`
                  : activeCopy.slotSelectOne}
              </p>
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
                    <span>{activeCopy.formName}</span>
                    <input value={submissionName} onChange={(event) => setSubmissionName(event.target.value)} />
                  </label>
                  <label>
                    <span>{activeCopy.formBusiness}</span>
                    <input value={submissionBusiness} onChange={(event) => setSubmissionBusiness(event.target.value)} />
                  </label>
                  <label>
                    <span>{activeCopy.formPhone}</span>
                    <input value={submissionPhone} onChange={(event) => setSubmissionPhone(event.target.value)} />
                  </label>
                  <label>
                    <span>{activeCopy.formAddress}</span>
                    <input value={submissionAddress} onChange={(event) => setSubmissionAddress(event.target.value)} />
                  </label>
                  <label>
                    <span>{activeCopy.formNotes}</span>
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
                  <p className={styles.cardLabel}>{activeCopy.sideNoteLabel}</p>
                  <h3>{activeCopy.sideNoteTitle}</h3>
                  <p>{activeCopy.sideNoteText}</p>
                </aside>
              </div>
            </div>
          </div>
        ) : null}

        {isDirectorFormOpen ? (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="Add director details"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setIsDirectorFormOpen(false);
              }
            }}
          >
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.sectionKicker}>JCCI Directors 2026-27</p>
                  <h3>Add your details</h3>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={() => setIsDirectorFormOpen(false)}
                >
                  {activeCopy.close}
                </button>
              </div>

              <form className={styles.directorForm} onSubmit={submitDirectorProfile}>
                <div className={styles.directorFormIntro}>
                  <span className={styles.directorFormBadge}>Required profile</span>
                  <p>Use text for names, alphanumeric text for addresses and experience, and Indian +91 phone numbers only.</p>
                </div>

                <div className={styles.directorFormGrid}>
                  <label className={styles.directorField}>
                    <span>Name</span>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="name"
                      autoCapitalize="words"
                      value={directorForm.name}
                      onChange={(event) => updateDirectorField("name", sanitizeTextOnly(event.target.value))}
                      onBlur={(event) => updateDirectorField("name", titleCaseWords(sanitizeTextOnly(event.target.value)))}
                      placeholder="Full name"
                    />
                    {directorFormErrors.name ? <small className={styles.directorError}>{directorFormErrors.name}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Business Name</span>
                    <input
                      type="text"
                      inputMode="text"
                      autoComplete="organization"
                      autoCapitalize="words"
                      value={directorForm.businessName}
                      onChange={(event) => updateDirectorField("businessName", sanitizeTextOnly(event.target.value))}
                      onBlur={(event) => updateDirectorField("businessName", titleCaseWords(sanitizeTextOnly(event.target.value)))}
                      placeholder="Business or firm name"
                    />
                    {directorFormErrors.businessName ? <small className={styles.directorError}>{directorFormErrors.businessName}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Business Address</span>
                    <textarea
                      rows={2}
                      value={directorForm.businessAddress}
                      onChange={(event) => updateDirectorField("businessAddress", sanitizeAlphaNumeric(event.target.value))}
                      placeholder="Business location, market, road, town"
                    />
                    {directorFormErrors.businessAddress ? <small className={styles.directorError}>{directorFormErrors.businessAddress}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Residence / Address</span>
                    <textarea
                      rows={2}
                      value={directorForm.residenceAddress}
                      onChange={(event) => updateDirectorField("residenceAddress", sanitizeAlphaNumeric(event.target.value))}
                      placeholder="Residence or communication address"
                    />
                    {directorFormErrors.residenceAddress ? <small className={styles.directorError}>{directorFormErrors.residenceAddress}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Contact Number</span>
                    <div className={styles.directorPhoneInput}>
                      <span className={styles.directorPhonePrefix} aria-hidden="true">🇮🇳 +91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={directorForm.contactNumber}
                        onChange={(event) => updateDirectorField("contactNumber", sanitizePhoneDigits(event.target.value))}
                        placeholder="10 digit number"
                      />
                    </div>
                    {directorFormErrors.contactNumber ? <small className={styles.directorError}>{directorFormErrors.contactNumber}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>WhatsApp Number</span>
                    <div className={styles.directorPhoneInput}>
                      <span className={styles.directorPhonePrefix} aria-hidden="true">🇮🇳 +91</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        value={directorForm.whatsappNumber}
                        onChange={(event) => updateDirectorField("whatsappNumber", sanitizePhoneDigits(event.target.value))}
                        placeholder="10 digit number"
                      />
                    </div>
                    {directorFormErrors.whatsappNumber ? <small className={styles.directorError}>{directorFormErrors.whatsappNumber}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Email</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={directorForm.email}
                      onChange={(event) => updateDirectorField("email", event.target.value)}
                      placeholder="name@example.com"
                    />
                    {directorFormErrors.email ? <small className={styles.directorError}>{directorFormErrors.email}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Experience & Expertise</span>
                    <textarea
                      rows={3}
                      value={directorForm.experienceExpertise}
                      onChange={(event) => updateDirectorField("experienceExpertise", sanitizeAlphaNumeric(event.target.value))}
                      placeholder="Business experience, industry skills, chamber contribution"
                    />
                    {directorFormErrors.experienceExpertise ? <small className={styles.directorError}>{directorFormErrors.experienceExpertise}</small> : null}
                  </label>

                  <label className={styles.directorField}>
                    <span>Photo to upload</span>
                    <div className={styles.directorFileInputWrap}>
                      <input
                        id="director-photo-upload"
                        className={styles.directorFileInput}
                        type="file"
                        accept="image/*,.heic,.heif,.jpg,.jpeg,.png"
                        onChange={onDirectorPhotoChange}
                      />
                      <label htmlFor="director-photo-upload" className={styles.directorFileInputLabel}>
                        <span className={styles.directorFileIcon}>
                          <BiCloudUpload aria-hidden="true" />
                        </span>
                        <span className={styles.directorFileTitle}>Choose a file or drag & drop</span>
                        <span className={styles.directorFileHint}>Max 20MB</span>
                        <span className={styles.directorFileButton}>Browse file</span>
                      </label>
                    </div>
                    {directorPhotoFileName ? <small className={styles.directorHelper}>Selected: {directorPhotoFileName}</small> : null}
                    <small className={styles.directorHelper}>Supported: jpg, jpeg, png, heic and other image formats.</small>
                    {directorForm.photoUrl ? (
                      <img src={directorForm.photoUrl} alt="Director preview" className={styles.directorPreviewImage} />
                    ) : null}
                    {directorFormErrors.photoUrl ? <small className={styles.directorError}>{directorFormErrors.photoUrl}</small> : null}
                  </label>
                </div>

                {directorFormMessage ? <p className={styles.directorErrorBanner}>{directorFormMessage}</p> : null}

                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryAction} disabled={directorSubmitting}>
                    {directorSubmitting ? "Submitting..." : "Submit details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {selectedDirector ? (
          <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="Director details"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedDirector(null);
              }
            }}
          >
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.sectionKicker}>Director Profile</p>
                  <h3>{selectedDirector.name}</h3>
                </div>
                <button
                  type="button"
                  className={styles.modalCloseButton}
                  onClick={() => setSelectedDirector(null)}
                >
                  {activeCopy.close}
                </button>
              </div>

              <div className={styles.directorDetailLayout}>
                <img src={selectedDirector.photoUrl} alt={selectedDirector.name} className={styles.directorDetailPhoto} />
                <div className={styles.directorDetailBody}>
                  <p><strong>Name:</strong> {selectedDirector.name}</p>
                  <p><strong>Business Name:</strong> {selectedDirector.businessName}</p>
                  <p><strong>Business Address:</strong> {selectedDirector.businessAddress}</p>
                  <p><strong>Residence / Address:</strong> {selectedDirector.residenceAddress}</p>
                  <p><strong>Contact:</strong> {selectedDirector.contactNumber}</p>
                  <p><strong>WhatsApp Number:</strong> {selectedDirector.whatsappNumber}</p>
                  <p><strong>Email:</strong> {selectedDirector.email}</p>
                  <p><strong>Experience & Expertise:</strong> {selectedDirector.experienceExpertise}</p>
                  <div className={styles.directorQuickActions}>
                    <a
                      href={`tel:${normalizePhone(selectedDirector.contactNumber)}`}
                      className={styles.directorIconButton}
                      aria-label={`Call ${selectedDirector.name}`}
                    >
                      <BiPhoneCall aria-hidden="true" />
                    </a>
                    <a
                      href={`https://wa.me/${normalizePhone(selectedDirector.whatsappNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.directorIconButton}
                      aria-label={`WhatsApp ${selectedDirector.name}`}
                    >
                      <FaWhatsapp aria-hidden="true" />
                    </a>
                    <a
                      href={`mailto:${selectedDirector.email}`}
                      className={styles.directorIconButton}
                      aria-label={`Email ${selectedDirector.name}`}
                    >
                      <BiEnvelope aria-hidden="true" />
                    </a>
                  </div>
                </div>
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
            <div className={styles.supportStats}>
              <div>
                <p className={styles.cardLabel}>{activeCopy.supportCount}</p>
                <h3 className={`${styles.supportCountValue} ${styles.supportCountBlue}`}>{supportCount}</h3>
              </div>
              <div>
                <p className={styles.cardLabel}>{activeCopy.visitorCount}</p>
                <h3 className={`${styles.supportCountValue} ${styles.supportCountBlack}`}>{visitorCount}</h3>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} id="contact">
          <div className={styles.sectionHeader}>
            <p className={styles.sectionKicker}>{activeCopy.contactTitle}</p>
            <h2>{activeCopy.contactHeading}</h2>
          </div>

          <div className={styles.contactGrid}>
            <a className={styles.contactCard} href={`tel:${normalizePhone(candidate.whatsapp)}`}>
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconPhone}`}>
                  <BiPhoneCall aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>{activeCopy.contactPhone}</span>
              </div>
              <strong>{candidate.whatsapp}</strong>
            </a>
            <a className={styles.contactCard} href={`mailto:${candidate.email}`}>
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconMail}`}>
                  <BiEnvelope aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>{activeCopy.contactEmail}</span>
              </div>
              <strong>{candidate.email}</strong>
            </a>
            <a className={styles.contactCard} href={directWhatsAppLink} target="_blank" rel="noreferrer">
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconWhatsapp}`}>
                  <FaWhatsapp aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>{activeCopy.contactWhatsapp}</span>
              </div>
              <strong>{activeCopy.contactWhatsappCta}</strong>
            </a>
            <a className={styles.contactCard} href="https://www.facebook.com/share/1DotT8cg6w/" target="_blank" rel="noreferrer">
              <div className={styles.contactCardHead}>
                <span className={`${styles.contactIcon} ${styles.contactIconFacebook}`}>
                  <FaFacebook aria-hidden="true" />
                </span>
                <span className={styles.contactLabel}>{activeCopy.contactFacebook}</span>
              </div>
              <strong>{activeCopy.contactFacebookCta}</strong>
            </a>
          </div>
        </section>

        <footer className={styles.pageFooter}>
          <p className={styles.pageFooterText}>{activeCopy.footerCredit}</p>
          <div className={styles.pageFooterLinks} aria-label="Developer social links">
            <a href="https://github.com/sanasreeraj" target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <FaGithub aria-hidden="true" />
            </a>
            <a href="https://www.linkedin.com/in/sana-sreeraj/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
              <FaLinkedinIn aria-hidden="true" />
            </a>
            <a href="https://www.instagram.com/iamsanasreeraj/" target="_blank" rel="noreferrer" aria-label="Instagram profile">
              <FaInstagram aria-hidden="true" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}