import { Link } from "react-router-dom";
import { LegalLayout, LegalSection } from "../components/LegalLayout";
import { REPO_URL } from "../lib/github";

const UPDATED = "7 October 2026";

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "The short version",
    body: (
      <ul>
        <li>There are no accounts. We don’t ask for your name, email or password.</li>
        <li>Your learning progress stays in your own browser.</li>
        <li>We use Google Analytics to understand, in aggregate, how the Site is used.</li>
        <li>Some features load content from third parties such as YouTube, GitHub and Google.</li>
        <li>We don’t sell your data.</li>
      </ul>
    ),
  },
  {
    id: "device",
    title: "Data stored on your device",
    body: (
      <>
        <p>The Site uses your browser’s local storage and cookies to make features work:</p>
        <ul>
          <li>
            <strong>Learning progress:</strong> completed lessons, saved lessons, starred courses and the last
            lesson you opened.
          </li>
          <li>
            <strong>Preferences and caches:</strong> dismissed announcements and a short-lived copy of the
            contributor leaderboard.
          </li>
          <li>
            <strong>Translation choice:</strong> if you switch the Site to Kannada, a <code>googtrans</code>{" "}
            cookie remembers it.
          </li>
        </ul>
        <p>
          This data never leaves your device unless you export it yourself. You can delete it at any time by
          clearing your browser’s site data.
        </p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics",
    body: (
      <p>
        We use Google Analytics to measure page views and events such as opening a lesson. Google may collect
        information like your IP address, approximate location, device and browser type, and set cookies
        (for example <code>_ga</code>). We use this information only in aggregate to improve the Site. You
        can block analytics with your browser’s privacy settings, a content blocker, or{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          Google’s opt-out add-on
        </a>
        . See{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google’s Privacy Policy
        </a>{" "}
        for details.
      </p>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <>
        <p>When you use the Site your browser may connect directly to:</p>
        <ul>
          <li>
            <strong>YouTube:</strong> thumbnails are loaded from YouTube, and videos open on YouTube.
          </li>
          <li>
            <strong>GitHub:</strong> lesson notes and the contributor leaderboard are fetched from GitHub.
          </li>
          <li>
            <strong>Google Fonts:</strong> the Site’s typefaces.
          </li>
          <li>
            <strong>Google Translate:</strong> only if you turn on Kannada translation, in which case the
            page text is sent to Google to be translated.
          </li>
          <li>
            <strong>Image hosts</strong> such as Unsplash and UI Avatars for some images.
          </li>
        </ul>
        <p>
          These providers receive the technical information any website request includes (such as your IP
          address) and handle it under their own privacy policies. Like any website, the servers that host
          the Site may also keep standard request logs for security and reliability.
        </p>
      </>
    ),
  },
  {
    id: "contributors",
    title: "Contributors",
    body: (
      <p>
        If you contribute on{" "}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        , your public GitHub username, name, avatar and contribution counts may be shown on the{" "}
        <Link to="/leaderboard">leaderboard</Link>. Blog posts show the author name and profile link given in
        the post.
      </p>
    ),
  },
  {
    id: "children",
    title: "Students and children",
    body: (
      <p>
        The Site is meant for students and learners of all ages and does not ask for personal information. If
        you are under 18, please use the Site with the knowledge of a parent or guardian.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices",
    body: (
      <ul>
        <li>Clear your browser’s site data to remove progress and preferences.</li>
        <li>Block cookies or analytics through your browser or extensions; the Site keeps working.</li>
        <li>
          Export your progress from <Link to="/learning">My Learning</Link> before clearing data if you want
          to keep it.
        </li>
      </ul>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy as the Site changes. The “Last updated” date above shows the latest
        version.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about privacy? Open an issue on{" "}
        <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        or reach out through any of the channels on our <Link to="/links">Links</Link> page.
      </p>
    ),
  },
];

export function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro="What the Engineering in Kannada website stores, what it shares and the choices you have."
      updated={UPDATED}
      sections={sections}
      other={{ to: "/terms", label: "Terms & Conditions" }}
    />
  );
}
