// src/services/TranslateService.ts

// Type declaration for Google Translate API
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
    doGTranslate: (lang_pair: string) => void;
  }
}

// Indian languages supported by Google Translate
export const INDIAN_LANGUAGES = [
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

class TranslateService {
  private isInitialized = false;
  private scriptId = 'google-translate-script';

  /**
   * Initialize Google Translate script and create necessary elements
   */
  public initialize(): Promise<void> {
    return new Promise((resolve) => {
      // Skip if already initialized
      if (this.isInitialized || document.getElementById(this.scriptId)) {
        this.isInitialized = true;
        this.applyPageFixes();
        this.applyStoredTranslation();
        resolve();
        return;
      }

      // Create hidden elements for Google Translate
      this.createHiddenElements();
      
      // Add the Google Translate direct function
      this.addTranslateFunction();
      
      // Load Google Translate script
      const script = document.createElement('script');
      script.id = this.scriptId;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
      script.async = true;
      
      // Handle script loaded event
      script.onload = () => {
        this.isInitialized = true;
        this.applyPageFixes();
        this.applyStoredTranslation();
        resolve();
      };
      
      document.body.appendChild(script);
    });
  }

  /**
   * Create hidden DOM elements required for Google Translate
   */
  private createHiddenElements(): void {
    // Create hidden container for Google Translate Element
    const translateDiv = document.createElement('div');
    translateDiv.id = 'google_translate_element';
    translateDiv.className = 'hidden';
    document.body.appendChild(translateDiv);
    
    // Create additional hidden elements for GTranslate
    const gtranslateDiv = document.createElement('div');
    gtranslateDiv.id = 'gtranslate_wrapper';
    gtranslateDiv.className = 'hidden';
    gtranslateDiv.innerHTML = `
      <div id="google_translate_element2"></div>
      <script type="text/javascript">
      function googleTranslateElementInit2() {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: '${INDIAN_LANGUAGES.map(lang => lang.code).join(',')}',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE
        }, 'google_translate_element2');
      }
      </script>
    `;
    document.body.appendChild(gtranslateDiv);
  }
  
  /**
   * Add the doGTranslate function to the global scope
   */
  private addTranslateFunction(): void {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `
      function doGTranslate(lang_pair) {
        if (lang_pair.value) lang_pair = lang_pair.value;
        if (lang_pair == 'en|en') return;
        
        // Try first method (more compatible)
        var teCombo = document.querySelector('.goog-te-combo');
        if (teCombo) {
          teCombo.value = lang_pair.split('|')[1];
          teCombo.dispatchEvent(new Event('change'));
          return;
        }
        
        // Use the direct iframe method as backup
        var lang = lang_pair.split('|')[1];
        // Create cookie
        document.cookie = 'googtrans=/en/' + lang + ';expires=' + (new Date(Date.now() + 999999999)).toUTCString() + ';path=/;domain=' + location.hostname;
        document.cookie = 'googtrans=/en/' + lang + ';expires=' + (new Date(Date.now() + 999999999)).toUTCString() + ';path=/;domain=.' + location.hostname;
        
        // Refresh translations without page reload
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = location.protocol + '//' + location.hostname + location.pathname + '?gtrans=' + lang;
        document.body.appendChild(iframe);
        setTimeout(function() {
          iframe.src = '';
          document.body.removeChild(iframe);
        }, 500);
      }
    `;
    document.head.appendChild(script);
  }
  
  /**
   * Apply stored translation preference
   */
  public applyStoredTranslation(delay = 1000): void {
    const savedLanguage = localStorage.getItem('preferred_language');
    if (savedLanguage && savedLanguage !== 'en' && window.doGTranslate) {
      setTimeout(() => {
        window.doGTranslate(`en|${savedLanguage}`);
        this.applyPageFixes(); // Apply fixes after translation
      }, delay);
    }
  }
  
  /**
   * Apply fixes to the page to handle Google Translate modifications
   */
  public applyPageFixes(): void {
    // Fix body positioning
    document.body.style.top = '0px';
    document.body.style.position = 'static';
    
    // Fix document height
    document.documentElement.style.height = 'auto';
    
    // Hide Google's translation bar
    const topBanner = document.querySelector('.goog-te-banner-frame');
    if (topBanner instanceof HTMLElement) {
      topBanner.style.display = 'none';
    }
    
    // Hide any Google translate iframes
    const translateIframes = document.querySelectorAll('iframe.goog-te-menu-frame');
    translateIframes.forEach(iframe => {
      if (iframe instanceof HTMLElement) {
        iframe.style.display = 'none';
      }
    });
  }
  
  /**
   * Change the current language
   */
  public changeLanguage(langCode: string): void {
    // Save to localStorage
    localStorage.setItem('preferred_language', langCode);
    
    // Apply translation
    if (window.doGTranslate) {
      window.doGTranslate(`en|${langCode}`);
      
      // Apply fixes after translation
      setTimeout(() => this.applyPageFixes(), 300);
    }
  }
  
  /**
   * Get the current language code
   */
  public getCurrentLanguage(): string {
    return localStorage.getItem('preferred_language') || 'en';
  }
  
  /**
   * Setup continuous monitoring for Google Translate modifications
   */
  public setupMonitoring(): void {
    // MutationObserver to monitor body style changes
    const observer = new MutationObserver(() => this.applyPageFixes());
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    
    // Periodically check and fix Google Translate modifications
    setInterval(() => this.applyPageFixes(), 2000);
  }
}

// Export singleton instance
export const translateService = new TranslateService();
export default translateService;
