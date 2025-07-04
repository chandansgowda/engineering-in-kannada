import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentLanguageDisplay = i18n.language === 'kn' ? 'ಕನ್ನಡ' : i18n.language.toUpperCase();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center p-2 text-gray-300 hover:text-white focus:outline-none"
      aria-label={`Switch language to ${i18n.language === 'en' ? 'Kannada' : 'English'}`}
    >
      <Globe size={20} />
      <span className="ml-1.5 text-xs font-medium">
        {currentLanguageDisplay}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
