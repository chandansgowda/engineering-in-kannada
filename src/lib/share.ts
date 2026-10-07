import { toast } from "../store/toast";

/**
 * Opens the native share sheet where available (phones), otherwise copies the
 * link and confirms with a toast.
 */
export async function shareLink(title: string, url: string) {
  if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast("Link copied to clipboard", "success");
  } catch {
    toast("Couldn't copy the link", "error");
  }
}
