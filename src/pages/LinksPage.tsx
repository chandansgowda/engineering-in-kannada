import * as LucideIcons from 'lucide-react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import linksData from '../data/links.json';
import { LinkCategory } from '../types';

const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = (LucideIcons as any)[iconName] || ExternalLink;
  return <IconComponent className="h-4 w-4 text-primary" />;
};

export function LinksPage() {
  const categories = linksData.categories as LinkCategory[];

  return (
    <div className="min-h-screen bg-dark">
      <ScrollToTop />
      <Header />

      <div className="mx-auto max-w-5xl px-4 pt-28 pb-16 page-enter">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Links</h1>
          <p className="mt-1 text-sm text-gray-400">
            All profiles and resources in one place
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {categories.map((category) => (
            <div key={category.id}>
              {/* Category label */}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 pl-1">
                {category.title}
              </p>

              <div className="flex flex-col gap-3">
                {category.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4
                               rounded-2xl bg-dark-2 border border-white/10 px-6 py-5
                               hover:border-primary/40 hover:bg-dark-3 transition-all duration-200"
                  >
                    {/* Left */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon badge */}
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        {link.icon
                          ? <DynamicIcon iconName={link.icon} />
                          : <ExternalLink className="h-4 w-4 text-primary" />
                        }
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
                          {link.title}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-400 truncate">
                          {link.description}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </a>
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
