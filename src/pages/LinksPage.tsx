import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import * as LucideIcons from 'lucide-react';
import { ExternalLink } from 'lucide-react';
// import linksData from '../data/links.json'; // To be loaded dynamically
import { LinkCategory } from '../types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Dynamic icon component
const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = (LucideIcons as any)[iconName] || ExternalLink;
  return <IconComponent className="w-6 h-6 text-primary" />;
};

export function LinksPage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<LinkCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      let loadedLinksData;
      const lang = i18n.language;
      try {
        if (lang === 'kn') {
          try {
            loadedLinksData = (await import('../data/links.kn.json')).default;
          } catch (knError) {
            console.warn("Failed to load links.kn.json, falling back to default.", knError);
            loadedLinksData = (await import('../data/links.json')).default;
          }
        } else {
          // For 'en' or any other language, load the default links.json
          loadedLinksData = (await import('../data/links.json')).default;
        }
        setCategories(loadedLinksData.categories || []);
      } catch (error) {
        console.error("Failed to load links data, attempting absolute fallback:", error);
        try {
          const fallbackData = (await import('../data/links.json')).default;
          setCategories(fallbackData.categories || []);
        } catch (defaultError) {
          console.error("Failed to load default links.json as absolute fallback:", defaultError);
          setCategories([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, [i18n.language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Header />
        <div className="flex justify-center items-center py-12">
          <p className="text-white text-xl">{t('loading', 'Loading links...')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent pb-2">
              {t('connectWithMe')}
            </h1>
            <p className="text-gray-300 mt-4">
              {t('linksPageSubtitle')}
            </p>
          </div>
          
          {categories.map((category) => (
            <div key={category.id} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">
                {category.title} {/* Category titles from JSON are already localized */}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.links.map((link) => (
                  link.coverImage ? (
                    // Card with cover image
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group cursor-pointer overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={link.coverImage}
                          alt={link.title} // Alt text from JSON is localized
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/800x400?text=${link.title}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                          <span className="inline-flex items-center rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                            {category.title} {/* Category title from JSON */}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            {link.icon ? <DynamicIcon iconName={link.icon} /> : <ExternalLink className="w-4 h-4 text-primary" />}
                          </div>
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-white flex items-center gap-2">
                          {link.title} {/* Link title from JSON */}
                          <ExternalLink className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="mt-2 text-gray-400">{link.description}</p> {/* Link description from JSON */}
                      </div>
                    </a>
                  ) : (
                    // Enhanced tile without cover image
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group cursor-pointer rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 flex flex-col h-full"
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            {link.icon ? <DynamicIcon iconName={link.icon} /> : <ExternalLink className="w-6 h-6 text-primary" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {link.title} {/* Link title from JSON */}
                            </h3>
                            <span className="text-sm text-gray-400">{category.title}</span> {/* Category title from JSON */}
                          </div>
                        </div>
                        <p className="text-gray-400 mt-2 flex-grow">{link.description}</p> {/* Link description from JSON */}
                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-sm text-primary">{t('visitLink')}</span>
                          <ExternalLink className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
                        </div>
                      </div>
                    </a>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

