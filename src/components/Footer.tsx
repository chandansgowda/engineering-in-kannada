import React from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { GraduationCap, Youtube, Linkedin, Instagram } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";

export function Footer() {
  const { t } = useTranslation(); // Initialize useTranslation
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark/50 backdrop-blur-sm border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-white">
              {t('engineeringInKannada')}
            </span>
          </div>

          <p className="mt-4 max-w-md text-center text-sm text-gray-400">
            {t('footerTagline')}
          </p>

          <div className="mt-8 flex items-center gap-6">
            <a
              href="https://www.youtube.com/@EngineeringinKannada"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/engineering_in_kannada/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com/chandansgowdru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <FaXTwitter className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/chandan-s-gowda-4b2913183/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>
              {t('footerCopyright', { year: currentYear })}
            </p>
            <p className="mt-1">{t('footerMadeWithLove')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
