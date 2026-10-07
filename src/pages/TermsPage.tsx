import { Link } from "react-router-dom";
import { LegalLayout, LegalSection } from "../components/LegalLayout";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { REPO_URL } from "../lib/github";

const UPDATED = "7 October 2026";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: (
      <p>
        By accessing or using the Engineering in Kannada website (the “Site”), you agree to these Terms
        and Conditions and to our <Link to="/privacy">Privacy Policy</Link>. If you do not agree, please
        do not use the Site.
      </p>
    ),
  },
  {
    id: "service",
    title: "What the Site offers",
    body: (
      <>
        <p>
          The Site organises Engineering in Kannada educational content — course playlists, notes, practice
          links and blog posts — and lets you track your own learning progress. Video lessons are hosted on
          YouTube and open on YouTube; notes and practice material may be hosted on GitHub or other
          third-party services.
        </p>
        <p>
          We may add, change or remove courses, features or content at any time, and we may suspend or
          discontinue the Site without notice.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree to use the Site only for lawful, personal learning purposes. You must not:</p>
        <ul>
          <li>copy, re-upload, sell or redistribute our videos, notes or other course material as your own;</li>
          <li>attempt to disrupt, overload or gain unauthorised access to the Site or its infrastructure;</li>
          <li>scrape the Site or use automated means to access it in a way that degrades the service;</li>
          <li>misrepresent your affiliation with Engineering in Kannada.</li>
        </ul>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <>
        <p>
          The Engineering in Kannada name, logo, videos, notes and other course material are owned by
          Engineering in Kannada or their respective creators and are protected by copyright and other
          laws. You may share links to them, but you may not reproduce them without permission.
        </p>
        <p>
          The Site’s source code is open source and is licensed separately under the terms in the{" "}
          <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
            project’s LICENSE file
          </a>
          . That licence covers the code only, not the course content.
        </p>
      </>
    ),
  },
  {
    id: "contributions",
    title: "Contributions and blog posts",
    body: (
      <p>
        Courses, fixes and blog posts may be contributed through our{" "}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub repository
        </a>
        . By submitting a contribution you confirm that you have the right to do so and that it may be
        published on the Site under the repository’s licence. Blog posts reflect the views of their authors,
        who are responsible for their accuracy. We may edit or remove any contribution at our discretion.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party services and links",
    body: (
      <p>
        The Site links to and relies on services we do not control, including YouTube, GitHub, Instagram,
        X (Twitter), LinkedIn and Google Translate. Your use of those services is governed by their own terms
        and policies, and we are not responsible for their content or availability. Machine translations are
        provided for convenience and may contain errors; the English version is authoritative.
      </p>
    ),
  },
  {
    id: "progress",
    title: "Your progress data",
    body: (
      <p>
        Lesson progress, saved lessons and starred courses are stored only in your browser. Clearing your
        browser data, switching browsers or using private browsing can erase it, and we cannot recover it.
        Use the export option on the <Link to="/learning">My Learning</Link> page to keep a backup.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: (
      <p>
        Content on the Site is provided for educational purposes on an “as is” and “as available” basis.
        While we work to keep it accurate and up to date, we make no warranties, express or implied, about
        its completeness, accuracy or fitness for a particular purpose, and we do not guarantee any academic,
        exam, employment or career outcome. Code examples should be reviewed before use in real projects.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        To the fullest extent permitted by law, Engineering in Kannada and its creators and contributors are
        not liable for any indirect, incidental, special or consequential loss, or for any loss of data,
        arising from your use of, or inability to use, the Site or its content.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time. The “Last updated” date above shows when they last
        changed. Continuing to use the Site after an update means you accept the revised Terms.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These Terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction
        of the courts at Bengaluru, Karnataka.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these Terms? Open an issue on{" "}
        <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        or reach out through any of the channels on our <Link to="/links">Links</Link> page.
      </p>
    ),
  },
];

export function TermsPage() {
  useDocumentTitle("Terms & Conditions");
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="The ground rules for using the Engineering in Kannada website."
      updated={UPDATED}
      sections={sections}
      other={{ to: "/privacy", label: "Privacy Policy" }}
    />
  );
}
