import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Rendered instead of the image if it fails to load (never retries in a loop). */
  fallback?: ReactNode;
}

/** Lazy image that fades in once decoded and degrades gracefully on error. */
export function Img({ className, fallback, onLoad, onError, src, ...rest }: ImgProps) {
  const [state, setState] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const ref = useRef<HTMLImageElement>(null);

  // With prerendered HTML the image can finish loading before React attaches.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? "loaded" : "error");
  }, []);

  if (state === "error") return <>{fallback ?? null}</>;

  return (
    <img
      ref={ref}
      loading="lazy"
      decoding="async"
      src={src}
      {...rest}
      className={cn(
        "transition-opacity duration-500",
        state === "loaded" ? "opacity-100" : "opacity-0",
        className
      )}
      onLoad={(e) => {
        setState("loaded");
        onLoad?.(e);
      }}
      onError={(e) => {
        setState("error");
        onError?.(e);
      }}
    />
  );
}
