"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebook, FaGithub, FaInstagram, FaLinkedinIn, FaCopyright, FaWhatsapp } from "react-icons/fa6";
import { BiEnvelope, BiPhoneCall } from "react-icons/bi";

import styles from "@/app/platform.module.css";
import { platformContact, platformDeveloper, platformFooterLinks, platformMeta, platformNavItems } from "@/lib/platform-data";

type Props = {
  children: React.ReactNode;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function PlatformShell({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <Image src="/assets/jcci-logo.png" alt="JCCI logo" width={50} height={50} priority />
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          {platformNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={isActive ? styles.navActive : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.languageSelectWrap}>
          <select className={styles.languageSelect} defaultValue="en" aria-label="Select language">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="or">Odia</option>
            <option value="te">Telugu</option>
          </select>
        </div>
      </header>

      <div className={styles.page}>{children}</div>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerIntro}>
            <p className={styles.sectionKicker}>Official Portal</p>
            <p className={styles.footerTitle}>{platformMeta.organizationName}</p>
            <p className={styles.smallMuted}>Connecting members, leadership, and business services in one platform.</p>
          </div>

          <div className={styles.footerColumnCard}>
            <p className={styles.footerTitle}>Quick Links</p>
            <div className={styles.footerQuickLinks}>
              {platformNavItems.slice(0, 6).map((item) => (
                <Link key={`quick-${item.href}`} href={item.href}>
                  {item.label}
                </Link>
              ))}
              {platformFooterLinks.map((item) => (
                <Link key={`foot-${item.label}`} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.footerColumnCard}>
            <p className={styles.footerTitle}>Contact</p>
            <div className={styles.footerContactLinks}>
              <a href={`tel:${normalizePhone(platformContact.primaryPhone)}`}>
                <span className={styles.footerContactIcon}><BiPhoneCall aria-hidden="true" /></span>
                <span>{platformContact.primaryPhone}</span>
              </a>
              <a href={`mailto:${platformContact.email}`}>
                <span className={styles.footerContactIcon}><BiEnvelope aria-hidden="true" /></span>
                <span>{platformContact.email}</span>
              </a>
              <a href={`https://wa.me/${normalizePhone(platformContact.whatsappNumber)}`} target="_blank" rel="noreferrer">
                <span className={styles.footerContactIcon}><FaWhatsapp aria-hidden="true" /></span>
                <span>WhatsApp</span>
              </a>
              <a href={platformContact.facebookUrl} target="_blank" rel="noreferrer">
                <span className={styles.footerContactIcon}><FaFacebook aria-hidden="true" /></span>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerMetaRow}>
          <p className={styles.footerBottom}>
            <FaCopyright aria-hidden="true" /> {new Date().getFullYear()} {platformMeta.organizationName}. All rights reserved.
          </p>
        </div>
      </footer>

      <div className={styles.footerCreditBar}>
        <p className={styles.footerCreditInline}>
          <span className={styles.footerCreditLabel}>Developed by</span>
          <span className={styles.footerCreditName}>{platformDeveloper.name}</span>
        </p>

        <div className={styles.footerSocials} aria-label="Developer social links">
          <a href={platformDeveloper.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub profile">
            <FaGithub aria-hidden="true" />
          </a>
          <a href={platformDeveloper.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
            <FaLinkedinIn aria-hidden="true" />
          </a>
          <a href={platformDeveloper.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram profile">
            <FaInstagram aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
