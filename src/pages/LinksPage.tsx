import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import * as LucideIcons from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import linksData from '../data/links.json';
import { LinkCategory } from '../types';

// Dynamic icon component
const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = (LucideIcons as any)[iconName] || ExternalLink;
  return <IconComponent className="w-6 h-6 text-primary" />;
};

export function LinksPage() {
  const categories = linksData.categories as LinkCategory[];

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent pb-2">
              Connect With Me
            </h1>
            <p className="text-gray-300 mt-4">
              Find all my profiles and resources in one place
            </p>
          </div>
          
          {categories.map((category) => (
            <div key={category.id} className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">
                {category.title}
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
                          alt={link.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/800x400?text=${link.title}`;
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                        {/* Removed category badge from cover image */}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            {link.icon ? <DynamicIcon iconName={link.icon} /> : <ExternalLink className="w-6 h-6 text-primary" />}
                          </div>
                          {/* <span className="text-sm text-gray-400">{link.id}</span> */}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-white flex items-center gap-2">
                          {link.title}
                          <ExternalLink className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="mt-2 text-gray-400">{link.description}</p>
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
                              {link.title}
                            </h3>
                            <span className="text-sm text-gray-400">{category.title}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 mt-2 flex-grow">{link.description}</p>
                        {/* Removed bottom section with "Visit" text and icon */}
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

