import { useEffect, useState } from "react";

const isTranslated = () =>
  document.documentElement.classList.contains("translated-ltr") || document.documentElement.lang === "kn";

/** True while Google Translate has switched the page to Kannada. Always false on the server. */
export function useIsTranslated() {
  const [translated, setTranslated] = useState(false);
  useEffect(() => {
    setTranslated(isTranslated());
    const observer = new MutationObserver(() => setTranslated(isTranslated()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "lang"] });
    return () => observer.disconnect();
  }, []);
  return translated;
}
