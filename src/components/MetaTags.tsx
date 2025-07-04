import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  keywords?: string; // Added keywords prop
}

const DEFAULT_TITLE = 'Engineering in Kannada';
const DEFAULT_DESCRIPTION = 'Learn engineering concepts in Kannada. Courses, tutorials, and articles on various engineering topics.';
const DEFAULT_IMAGE_URL = '/images/logo.png'; // Assuming a default logo exists at this path
const DEFAULT_KEYWORDS = 'engineering, kannada, tutorials, courses, programming, tech, education';

export const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  imageUrl,
  url,
  keywords,
}) => {
  const pageTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImageUrl = imageUrl || DEFAULT_IMAGE_URL;
  const pageKeywords = keywords || DEFAULT_KEYWORDS;

  const getWindowLocationHref = () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.href;
    }
    return '';
  };

  const getWindowLocationOrigin = () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }
    return '';
  };

  const pageUrl = url || getWindowLocationHref();
  const baseUrl = getWindowLocationOrigin();

  let absoluteImageUrl = pageImageUrl;
  if (!pageImageUrl.startsWith('http')) {
    if (baseUrl) {
      if (pageImageUrl.startsWith('/')) {
        absoluteImageUrl = `${baseUrl}${pageImageUrl}`;
      } else {
        absoluteImageUrl = `${baseUrl}/${pageImageUrl}`;
      }
    }
    // If no baseUrl, absoluteImageUrl remains pageImageUrl (which might be relative).
    // This is generally fine for <meta property="og:image"> if the path is absolute from root like /images/foo.png
    // but a full URL is preferred. For client-side rendering, baseUrl should almost always be available.
  }

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph metadata tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={DEFAULT_TITLE} />

      {/* Twitter Card metadata tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}
      {/* <meta name="twitter:creator" content="@YourTwitterHandle" /> */}

      {/* Additional useful meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      {/* Add more tags as needed, e.g., for specific social platforms or SEO requirements */}
    </Helmet>
  );
};

export default MetaTags;
