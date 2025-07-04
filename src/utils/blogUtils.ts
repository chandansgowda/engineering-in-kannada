import { BlogMetadata, BlogPost } from '../types';
import i18n from '../i18n'; // Import i18n instance

// Import all blog content files as raw strings
const allContentModules: Record<string, string> = import.meta.glob('../blogs/*/content*.md', {
  eager: true,
  query: '?raw', 
  import: 'default', 
});

// Import all metadata files as modules (Vite handles JSON modules by default)
const allMetadataModules: Record<string, { default: BlogMetadata }> = import.meta.glob('../blogs/*/metadata*.json', {
  eager: true,
  // No import: 'default' here, as we want the module to access its default export
});

export const getBlogPosts = (): BlogPost[] => {
  const posts: BlogPost[] = [];
  const processedSlugs = new Set<string>();
  const currentLang = i18n.language || 'en';

  for (const path in allMetadataModules) {
    const slug = path.split('/')[2];

    if (processedSlugs.has(slug)) {
      continue;
    }

    let metadataMod: { default: BlogMetadata } | undefined;
    let contentStr: string | undefined; // Content is now a direct string
    let postLang = currentLang;

    // 1. Try current language metadata
    const currentLangMetadataPath = `../blogs/${slug}/metadata.${currentLang}.json`;
    if (allMetadataModules[currentLangMetadataPath]) {
      metadataMod = allMetadataModules[currentLangMetadataPath];
      // Try corresponding current language content for this metadata
      const currentLangContentPath = `../blogs/${slug}/content.${currentLang}.md`;
      if (allContentModules[currentLangContentPath]) {
        contentStr = allContentModules[currentLangContentPath];
      } else {
        // Fallback to default content if current lang content not found
        const defaultContentPath = `../blogs/${slug}/content.md`;
        contentStr = allContentModules[defaultContentPath]; // Might be undefined if no default content.md
      }
    } 
    // 2. Fallback to default language metadata (metadata.json)
    else {
      const defaultMetadataPath = `../blogs/${slug}/metadata.json`;
      if (allMetadataModules[defaultMetadataPath]) {
        metadataMod = allMetadataModules[defaultMetadataPath];
        postLang = 'en'; 
        // Try corresponding current language content
        const currentLangContentPath = `../blogs/${slug}/content.${currentLang}.md`;
        if (allContentModules[currentLangContentPath]) {
          contentStr = allContentModules[currentLangContentPath];
        } else {
          // Fallback to default content for default metadata
          const defaultContentPath = `../blogs/${slug}/content.md`;
          contentStr = allContentModules[defaultContentPath]; // Might be undefined
        }
      }
    }

    if (metadataMod && metadataMod.default) {
      const metadata = metadataMod.default;
      // Use contentStr if available, otherwise use metadata.description.
      // contentStr can be undefined if no corresponding .md file was found.
      posts.push({
        metadata,
        content: contentStr || metadata.description, // Fallback to description
        slug,
        lang: postLang,
      });
      processedSlugs.add(slug);
    } else {
      console.warn(`Metadata module or default export missing for slug: ${slug} in getBlogPosts. Path: ${path}`);
    }
  }

  return posts.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
};

export const getBlogPost = (slug: string): BlogPost | null => {
  const currentLang = i18n.language || 'en';
  let metadataMod: { default: BlogMetadata } | undefined;
  let contentStr: string | undefined; // Content is now a direct string
  let postLang = currentLang;

  const currentLangMetadataPath = `../blogs/${slug}/metadata.${currentLang}.json`;
  const currentLangContentPath = `../blogs/${slug}/content.${currentLang}.md`;
  const defaultMetadataPath = `../blogs/${slug}/metadata.json`;
  const defaultContentPath = `../blogs/${slug}/content.md`;

  // Determine which metadata to use
  if (allMetadataModules[currentLangMetadataPath]) {
    metadataMod = allMetadataModules[currentLangMetadataPath];
    // postLang is already currentLang
  } else if (allMetadataModules[defaultMetadataPath]) {
    metadataMod = allMetadataModules[defaultMetadataPath];
    postLang = 'en'; // Metadata is default
  } else {
    console.warn(`No metadata found for slug: ${slug}`);
    return null; // No metadata, cannot proceed
  }

  // Determine which content to use, based on metadata language preference
  if (postLang === currentLang && allContentModules[currentLangContentPath]) {
    // Preferred: current language content with current language metadata
    contentStr = allContentModules[currentLangContentPath];
  } else if (allContentModules[defaultContentPath]) {
    // Fallback 1: default content (if current lang content not found or metadata is default)
    contentStr = allContentModules[defaultContentPath];
  } else if (postLang !== currentLang && allContentModules[currentLangContentPath]){
    // Fallback 2: current language content even if metadata was default (less common case but possible)
     contentStr = allContentModules[currentLangContentPath];
  }


  if (!metadataMod || !metadataMod.default) {
    console.error(`Critical: Metadata resolved but module or default export missing for slug: ${slug}`);
    return null;
  }
  
  // For getBlogPost, content is essential. If no contentStr was found by any means.
  if (contentStr === undefined) {
    console.error(`Content string is undefined for slug: ${slug}. Paths checked: ${currentLangContentPath}, ${defaultContentPath}`);
    return null; 
  }

  const metadata = metadataMod.default;

  return {
    metadata,
    content: contentStr, // contentStr is now the actual string content
    slug,
    lang: postLang,
  };
};
