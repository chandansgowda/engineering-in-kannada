import { BlogMetadata, BlogPost } from '../types';
import i18n from '../i18n'; // Import i18n instance

// Import all blog content files (e.g., content.md, content.kn.md, etc.)
const allContentModules: Record<string, string> = import.meta.glob('../blogs/*/content*.md', {
  eager: true,
  query: '?raw', // Imports the raw content of the file
  import: 'default', // Imports the default export (the raw string)
});

// Import all metadata files (e.g., metadata.json, metadata.kn.json, etc.)
const allMetadataModules: Record<string, BlogMetadata> = import.meta.glob('../blogs/*/metadata*.json', {
  eager: true,
  import: 'default', // Imports the default export (the JSON object)
});

export const getBlogPosts = (): BlogPost[] => {
  const posts: BlogPost[] = [];
  const processedSlugs = new Set<string>();
  const currentLang = i18n.language || 'en';

  // Iterate over all metadata files to identify unique blog slugs
  // Prioritize metadata.<lang>.json, then metadata.json
  for (const path in allMetadataModules) {
    const slug = path.split('/')[2];

    if (processedSlugs.has(slug)) {
      continue;
    }

    let metadata: BlogMetadata | undefined;
    let content: string | undefined; // For list view, content is mainly for description or snippet
    let postLang = currentLang; // Assume current language initially

    // 1. Try current language metadata
    const currentLangMetadataPath = `../blogs/${slug}/metadata.${currentLang}.json`;
    if (allMetadataModules[currentLangMetadataPath]) {
      metadata = allMetadataModules[currentLangMetadataPath];
      // Try corresponding current language content for this metadata
      const currentLangContentPath = `../blogs/${slug}/content.${currentLang}.md`;
      if (allContentModules[currentLangContentPath]) {
        content = allContentModules[currentLangContentPath];
      } else {
        // Fallback to default content if current lang content not found for current lang metadata
        content = allContentModules[`../blogs/${slug}/content.md`];
      }
    } 
    // 2. Fallback to default language metadata (metadata.json)
    else {
      const defaultMetadataPath = `../blogs/${slug}/metadata.json`;
      if (allMetadataModules[defaultMetadataPath]) {
        metadata = allMetadataModules[defaultMetadataPath];
        postLang = 'en'; // Metadata is default, so post lang is default
        // Try corresponding current language content (if metadata was default but content for current lang exists)
        const currentLangContentPath = `../blogs/${slug}/content.${currentLang}.md`;
        if (allContentModules[currentLangContentPath]) {
          content = allContentModules[currentLangContentPath];
        } else {
          // Fallback to default content for default metadata
          content = allContentModules[`../blogs/${slug}/content.md`];
        }
      }
    }

    if (metadata) {
      posts.push({
        metadata,
        content: content || metadata.description, // Use description as snippet
        slug,
        lang: postLang,
      });
      processedSlugs.add(slug);
    }
  }

  return posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
};

export const getBlogPost = (slug: string): BlogPost | null => {
  const currentLang = i18n.language || 'en';
  let metadata: BlogMetadata | undefined;
  let content: string | undefined;
  let postLang = currentLang;

  // Strategy:
  // 1. Try metadata.<currentLang>.json + content.<currentLang>.md
  // 2. Try metadata.<currentLang>.json + content.md (default content)
  // 3. Try metadata.json (default) + content.<currentLang>.md
  // 4. Try metadata.json (default) + content.md (default)

  const currentLangMetadataPath = `../blogs/${slug}/metadata.${currentLang}.json`;
  const currentLangContentPath = `../blogs/${slug}/content.${currentLang}.md`;
  const defaultMetadataPath = `../blogs/${slug}/metadata.json`;
  const defaultContentPath = `../blogs/${slug}/content.md`;

  if (allMetadataModules[currentLangMetadataPath] && allContentModules[currentLangContentPath]) {
    // Case 1: Full current language match
    metadata = allMetadataModules[currentLangMetadataPath];
    content = allContentModules[currentLangContentPath];
    // postLang is already currentLang
  } else if (allMetadataModules[currentLangMetadataPath] && allContentModules[defaultContentPath]) {
    // Case 2: Current language metadata, default content
    metadata = allMetadataModules[currentLangMetadataPath];
    content = allContentModules[defaultContentPath];
    // postLang is currentLang (metadata language takes precedence)
  } else if (allMetadataModules[defaultMetadataPath] && allContentModules[currentLangContentPath]) {
    // Case 3: Default metadata, current language content
    metadata = allMetadataModules[defaultMetadataPath];
    content = allContentModules[currentLangContentPath];
    postLang = 'en'; // Metadata is default
  } else if (allMetadataModules[defaultMetadataPath] && allContentModules[defaultContentPath]) {
    // Case 4: Full default fallback
    metadata = allMetadataModules[defaultMetadataPath];
    content = allContentModules[defaultContentPath];
    postLang = 'en';
  } else {
    // No valid combination found for the given slug
    return null;
  }

  return {
    metadata,
    content,
    slug,
    lang: postLang,
  };
};
