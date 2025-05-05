import React, { useEffect, useState, useRef } from 'react';
import { Globe } from 'lucide-react';

// Indian languages supported by Google Translate
const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ur', name: 'اردو (Urdu)' }
];

let isScriptAdded = false;

const GoogleTranslate: React.FC<{
  position?: 'desktop' | 'mobile';
  setIsMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ position = 'desktop', setIsMenuOpen }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language') || 'en';
    setSelectedLanguage(savedLanguage);

    if (!isScriptAdded) {
      isScriptAdded = true;

      if (!document.getElementById('google_translate_element')) {
        const element = document.createElement('div');
        element.id = 'google_translate_element';
        element.style.display = 'none';
        document.body.appendChild(element);
      }

      window.googleTranslateElementInit = () => {
        try {
          // Define the translate instance globally for easier access
          (window as any).googleTranslateInstance = new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: INDIAN_LANGUAGES.map(lang => lang.code).join(','),
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );

          // Apply saved language after Google Translate is initialized
          const tryApplySavedLang = () => {
            const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (selectElement) {
              // Wait a bit more to ensure everything is properly initialized
              setTimeout(() => {
                // Only change if not English (default)
                if (savedLanguage !== 'en') {
                  changeLanguage(savedLanguage);
                }
              }, 500);
            } else {
              setTimeout(tryApplySavedLang, 500);
            }
          };
          
          // Give Google Translate more time to fully initialize
          setTimeout(tryApplySavedLang, 2000);

          // Fix scroll issue caused by Google Translate
          const observer = new MutationObserver(() => {
            if (document.body.style.top) {
              const scrollTop = parseInt(document.body.style.top || '0', 10) * -1;
              document.body.style.position = '';
              document.body.style.top = '';
              window.scrollTo(0, scrollTop);
            }
          });

          observer.observe(document.body, { 
            attributes: true, 
            attributeFilter: ['style'] 
          });

        } catch (error) {
          console.error('Google Translate initialization error:', error);
        }
      };

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);

      const style = document.createElement('style');
      style.textContent = `
        .goog-te-banner-frame, .skiptranslate { display: none !important; }
        body { top: 0 !important; position: static !important; }
        .goog-te-gadget-icon { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        iframe.skiptranslate { display: none !important; }
        .goog-te-gadget { font-size: 0 !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    // Set the selected language in state and localStorage
    setSelectedLanguage(langCode);
    localStorage.setItem('preferred_language', langCode);

    const doTranslate = (langCode: string) => {
      // Get the Google Translate select element
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (!selectElement) {
        console.error('Google Translate element not found');
        return false;
      }

      // If English is selected, reset to original language
      if (langCode === 'en') {
        // Use Google's API to switch back to original language
        const googleFrame = document.getElementsByClassName('goog-te-menu-frame')[0] as HTMLIFrameElement;
        if (googleFrame) {
          const innerDoc = googleFrame.contentDocument || googleFrame.contentWindow?.document;
          if (innerDoc) {
            const originBtn = innerDoc.getElementsByTagName('button')[0];
            if (originBtn) {
              originBtn.click();
              setIsDropdownOpen(false);
              if (setIsMenuOpen) setIsMenuOpen(false);
              return true;
            }
          }
        }
        
        // If the above doesn't work, just reload the page
        window.location.reload();
        return true;
      }
      
      // Set the dropdown value and trigger change
      selectElement.value = langCode;
      
      // Create and dispatch proper events for the Google Translate element
      const event = new Event('change', { bubbles: true });
      selectElement.dispatchEvent(event);
      
      return true;
    };

    // First ensure Google Translate is properly loaded before attempting to translate
    if ((window as any).google && (window as any).google.translate) {
      doTranslate(langCode);
    } else {
      console.log('Google Translate not ready, retrying...');
      // Try again after a short delay
      setTimeout(() => {
        if ((window as any).google && (window as any).google.translate) {
          doTranslate(langCode);
        } else {
          console.error('Google Translate failed to load properly');
          // As a last resort, try the cookie-based approach
          if (langCode === 'en') {
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.reload();
          } else {
            document.cookie = `googtrans=/en/${langCode}; path=/;`;
          }
        }
      }, 1000);
    }

    // Close dropdowns
    setIsDropdownOpen(false);
    if (setIsMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`flex items-center gap-2 text-sm ${position === 'mobile' ? 'p-2 w-full' : ''} text-gray-300 hover:text-primary`}
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        {INDIAN_LANGUAGES.find(lang => lang.code === selectedLanguage)?.name.split(' ')[0] || 'English'}
      </button>

      {isDropdownOpen && (
        <div className={`absolute ${position === 'desktop' ? 'right-0' : 'left-0'} mt-2 w-48 rounded-md shadow-lg bg-dark border border-white/10 z-50`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {INDIAN_LANGUAGES.map(language => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`block w-full text-left px-4 py-2 text-sm ${selectedLanguage === language.code ? 'text-primary' : 'text-gray-300 hover:text-primary hover:bg-white/5'}`}
                role="menuitem"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
