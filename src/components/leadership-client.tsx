"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { BiEnvelope, BiPhoneCall } from "react-icons/bi";
import { FaWhatsapp } from "react-icons/fa6";

import styles from "@/app/platform.module.css";
import type { DirectorProfile } from "@/lib/site-data";

type Props = {
  initialDirectors: DirectorProfile[];
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

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function titleCaseWords(value: string) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
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

function isValidIndianPhone(value: string) {
  return /^\+91[6-9]\d{9}$/.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

export function LeadershipClient({ initialDirectors }: Props) {
  const [directors, setDirectors] = useState<DirectorProfile[]>(() => initialDirectors ?? []);
  const [isDirectorFormOpen, setIsDirectorFormOpen] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<DirectorProfile | null>(null);
  const [directorForm, setDirectorForm] = useState<DirectorFormState>(emptyDirectorForm);
  const [directorFormErrors, setDirectorFormErrors] = useState<DirectorFormErrors>({});
  const [directorFormMessage, setDirectorFormMessage] = useState("");
  const [directorSubmitting, setDirectorSubmitting] = useState(false);
  const [directorPhotoFileName, setDirectorPhotoFileName] = useState("");

  const safeDirectors = useMemo(() => (Array.isArray(directors) ? directors : []), [directors]);

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
      // Ignore temporary failures.
    }
  }, []);

  async function onDirectorPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setDirectorPhotoFileName(file.name);

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
      setDirectorForm((previous) => ({ ...previous, photoUrl: value }));
    };
    reader.readAsDataURL(file);
  }

  function updateDirectorField<K extends keyof DirectorFormState>(key: K, value: DirectorFormState[K]) {
    setDirectorForm((previous) => ({ ...previous, [key]: value }));
    if (directorFormErrors[key]) {
      setDirectorFormErrors((previous) => ({ ...previous, [key]: undefined }));
    }
    if (directorFormMessage) {
      setDirectorFormMessage("");
    }
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
      void loadDirectors();
    } catch {
      setDirectorFormMessage("Unable to save director details right now. Please try again.");
    } finally {
      setDirectorSubmitting(false);
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionKicker}>Leadership</p>
        <h2 className={styles.sectionTitle}>JCCI Core Team and Directors 2026-27</h2>
      </div>

      <article className={styles.infoBanner}>
        <p className={styles.cardLabel}>Official Announcement</p>
        <h3>Election Results 2026-27 (Top 21)</h3>
        <p>The previous popup has been moved here permanently as part of the Leadership section.</p>
      </article>

      <div className={styles.directorGrid}>
        {electionResultsTop21.map((row) => (
          <article key={`${row.ballotNo}-${row.name}`} className={styles.card}>
            <p className={styles.cardLabel}>Ballot No: {row.ballotNo}</p>
            <h3>{row.name}</h3>
            <p>{row.votes} votes</p>
          </article>
        ))}
      </div>

      <div className={styles.directorActions}>
        <button
          type="button"
          className={styles.button}
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

      {safeDirectors.length ? (
        <div className={styles.directorGrid}>
          {safeDirectors.map((director) => (
            <article key={director.id} className={styles.directorCard}>
              <img src={director.photoUrl} alt={director.name} className={styles.directorPhoto} />
              <p className={styles.cardLabel}>{director.businessName}</p>
              <h3>{director.name}</h3>
              <p className={styles.smallMuted}>{director.email}</p>
              <div className={styles.directorActions}>
                <button type="button" className={styles.buttonSecondary} onClick={() => setSelectedDirector(director)}>
                  View Details
                </button>
                <a href={`tel:${normalizePhone(director.contactNumber)}`} className={styles.ghostButton}>
                  <BiPhoneCall aria-hidden="true" />
                </a>
                <a href={`https://wa.me/${normalizePhone(director.whatsappNumber)}`} target="_blank" rel="noreferrer" className={styles.ghostButton}>
                  <FaWhatsapp aria-hidden="true" />
                </a>
                <a href={`mailto:${director.email}`} className={styles.ghostButton}>
                  <BiEnvelope aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <article className={styles.placeholderCard}>
          <p className={styles.cardLabel}>No entries yet</p>
          <h3>Be the first to add Director details</h3>
          <p>Tap Add your details and submit all required information.</p>
        </article>
      )}

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
          <div className={styles.modal}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>JCCI Directors 2026-27</p>
              <h2 className={styles.sectionTitle}>Add your details</h2>
            </div>

            <form className={styles.grid2} onSubmit={submitDirectorProfile}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Name</span>
                <input
                  className={styles.input}
                  value={directorForm.name}
                  onChange={(event) => updateDirectorField("name", sanitizeTextOnly(event.target.value))}
                />
                {directorFormErrors.name ? <small className={styles.errorText}>{directorFormErrors.name}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Business Name</span>
                <input
                  className={styles.input}
                  value={directorForm.businessName}
                  onChange={(event) => updateDirectorField("businessName", sanitizeTextOnly(event.target.value))}
                />
                {directorFormErrors.businessName ? <small className={styles.errorText}>{directorFormErrors.businessName}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Business Address</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={directorForm.businessAddress}
                  onChange={(event) => updateDirectorField("businessAddress", sanitizeAlphaNumeric(event.target.value))}
                />
                {directorFormErrors.businessAddress ? <small className={styles.errorText}>{directorFormErrors.businessAddress}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Residence Address</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={directorForm.residenceAddress}
                  onChange={(event) => updateDirectorField("residenceAddress", sanitizeAlphaNumeric(event.target.value))}
                />
                {directorFormErrors.residenceAddress ? <small className={styles.errorText}>{directorFormErrors.residenceAddress}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Contact Number</span>
                <input
                  className={styles.input}
                  maxLength={10}
                  value={directorForm.contactNumber}
                  onChange={(event) => updateDirectorField("contactNumber", sanitizePhoneDigits(event.target.value))}
                />
                {directorFormErrors.contactNumber ? <small className={styles.errorText}>{directorFormErrors.contactNumber}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>WhatsApp Number</span>
                <input
                  className={styles.input}
                  maxLength={10}
                  value={directorForm.whatsappNumber}
                  onChange={(event) => updateDirectorField("whatsappNumber", sanitizePhoneDigits(event.target.value))}
                />
                {directorFormErrors.whatsappNumber ? <small className={styles.errorText}>{directorFormErrors.whatsappNumber}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Email</span>
                <input
                  className={styles.input}
                  type="email"
                  value={directorForm.email}
                  onChange={(event) => updateDirectorField("email", event.target.value)}
                />
                {directorFormErrors.email ? <small className={styles.errorText}>{directorFormErrors.email}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Experience and Expertise</span>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={directorForm.experienceExpertise}
                  onChange={(event) => updateDirectorField("experienceExpertise", sanitizeAlphaNumeric(event.target.value))}
                />
                {directorFormErrors.experienceExpertise ? <small className={styles.errorText}>{directorFormErrors.experienceExpertise}</small> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Photo to upload</span>
                <input className={styles.input} type="file" accept="image/*" onChange={onDirectorPhotoChange} />
                {directorPhotoFileName ? <small className={styles.smallMuted}>Selected: {directorPhotoFileName}</small> : null}
                {directorFormErrors.photoUrl ? <small className={styles.errorText}>{directorFormErrors.photoUrl}</small> : null}
              </label>

              {directorForm.photoUrl ? <img src={directorForm.photoUrl} alt="Director preview" className={styles.directorPhoto} /> : <div />}

              {directorFormMessage ? <p className={styles.errorText}>{directorFormMessage}</p> : null}

              <div className={styles.directorActions}>
                <button type="submit" className={styles.button} disabled={directorSubmitting}>
                  {directorSubmitting ? "Submitting..." : "Submit details"}
                </button>
                <button type="button" className={styles.buttonSecondary} onClick={() => setIsDirectorFormOpen(false)}>
                  Close
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
          <div className={styles.modal}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionKicker}>Director Profile</p>
              <h2 className={styles.sectionTitle}>{selectedDirector.name}</h2>
            </div>

            <div className={styles.grid2}>
              <img src={selectedDirector.photoUrl} alt={selectedDirector.name} className={styles.directorPhoto} />
              <div className={styles.panel}>
                <p><strong>Name:</strong> {selectedDirector.name}</p>
                <p><strong>Business Name:</strong> {selectedDirector.businessName}</p>
                <p><strong>Business Address:</strong> {selectedDirector.businessAddress}</p>
                <p><strong>Residence Address:</strong> {selectedDirector.residenceAddress}</p>
                <p><strong>Contact:</strong> {selectedDirector.contactNumber}</p>
                <p><strong>WhatsApp:</strong> {selectedDirector.whatsappNumber}</p>
                <p><strong>Email:</strong> {selectedDirector.email}</p>
                <p><strong>Experience:</strong> {selectedDirector.experienceExpertise}</p>
              </div>
            </div>

            <div className={styles.directorActions}>
              <button type="button" className={styles.buttonSecondary} onClick={() => setSelectedDirector(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
