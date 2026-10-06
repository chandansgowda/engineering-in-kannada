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
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-extrabold tracking-tight text-white">
          Engineering <span className="text-primary">in Kannada</span>
        </span>
        <span className="mt-1 font-kannada text-[11px] font-semibold text-neutral-400">
          ಕನ್ನಡದಲ್ಲಿ ಎಂಜಿನಿಯರಿಂಗ್
        </span>
      </span>
    </Link>
  );
}
