import { Link } from "react-router-dom";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src="/images/logo.jpg"
      alt=""
      width={36}
      height={36}
      className={`${className} rounded-xl object-cover ring-1 ring-white/10`}
    />
  );
}

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Engineering in Kannada — home">
      <LogoMark />
      <span className="flex flex-col gap-1.5 notranslate" translate="no">
        <span className="whitespace-nowrap text-[15px] font-extrabold leading-none tracking-tight text-white">
          Engineering <span className="text-primary">in Kannada</span>
        </span>
        <span className="font-kannada text-[11px] font-semibold leading-none text-neutral-400">
          ಕನ್ನಡದಲ್ಲಿ ಎಂಜಿನಿಯರಿಂಗ್
        </span>
      </span>
    </Link>
  );
}
