import { useEffect } from "react";

const SITE = "Engineering in Kannada";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} — Learn to code in Kannada, free`;
  }, [title]);
}
