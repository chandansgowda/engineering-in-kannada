/**
 * Whole-site Kannada translation via Google's website translator.
 * The script is only loaded once someone switches to Kannada; the choice is kept
 * in Google's own `googtrans` cookie so it survives navigation and reloads.
 */

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (options: Record<string, unknown>, elementId: string) => unknown;
      };
    };
  }
}

const COOKIE = "googtrans";
const TARGET = "kn";
let loading: Promise<void> | null = null;

export function isKannadaActive() {
  return new RegExp(`(?:^|; )${COOKIE}=/[^/]+/${TARGET}`).test(document.cookie);
}

function cookieDomains() {
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", host];
  if (parts.length > 2) domains.push(`.${parts.slice(-2).join(".")}`);
  return domains;
}

function writeCookie(value: string | null) {
  for (const domain of cookieDomains()) {
    const d = domain ? `; domain=${domain}` : "";
    document.cookie = value
      ? `${COOKIE}=${value}; path=/${d}; SameSite=Lax`
      : `${COOKIE}=; path=/${d}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

/**
 * Google Translate swaps React's text nodes for its own <font> wrappers, which
 * makes React throw on later updates. Tolerate nodes that were moved elsewhere.
 */
let patched = false;
function patchDomForTranslation() {
  if (patched) return;
  patched = true;
  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child) as T;
  };
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insertBefore.call(this, node, ref) as T;
  };
}

function loadTranslator(): Promise<void> {
  if (loading) return loading;
  patchDomForTranslation();
  loading = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      new window.google!.translate!.TranslateElement(
        { pageLanguage: "en", includedLanguages: TARGET, autoDisplay: false },
        "google_translate_element"
      );
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("translator-unavailable"));
    };
    document.body.appendChild(script);
  });
  return loading;
}

/** Re-applies the saved choice on page load. */
export function initTranslation() {
  if (isKannadaActive()) loadTranslator().catch(() => writeCookie(null));
}

export async function translateToKannada() {
  writeCookie(`/en/${TARGET}`);
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    select.value = TARGET;
    select.dispatchEvent(new Event("change"));
    return;
  }
  try {
    await loadTranslator();
  } catch (err) {
    writeCookie(null);
    throw err;
  }
}

/** Restoring the original English DOM reliably needs a reload. */
export function showOriginalEnglish() {
  writeCookie(null);
  window.location.reload();
}
