# Advanced Topics

This document covers advanced topics related to the Engineering in Kannada platform, including internationalization (i18n) and other technical details.

## Internationalization (i18n)

The platform is designed to support multiple languages to make content accessible to a wider audience. We use the `i18next` library framework for managing translations.

### Supported Languages

Currently, the platform officially supports:

-   **English (`en`)**: Default language.
-   **Kannada (`kn`)**

### Translation File Structure

-   **UI Strings**: General text elements used throughout the user interface (e.g., button labels, navigation links, titles) are stored in JSON files located at `public/locales/<lang-code>/translation.json`.
    -   Example: `public/locales/en/translation.json` for English strings.
    -   Example: `public/locales/kn/translation.json` for Kannada strings.
-   **Content Translations**:
    -   **Courses & Links**: For content like course titles, descriptions, and external links, translations are managed by creating language-specific versions of the JSON data files. For example, if `src/data/courses.json` contains the English course details, `src/data/courses.kn.json` would contain the Kannada translations. The application logic handles loading the appropriate file based on the selected language, falling back to the default English version if a translation is not available.
    -   **Blog Posts**: Blog post translations are handled by creating language-specific markdown files for content and JSON files for metadata.
        -   Metadata: `src/blogs/<blog-slug>/metadata.<lang-code>.json` (e.g., `metadata.kn.json`)
        -   Content: `src/blogs/<blog-slug>/content.<lang-code>.md` (e.g., `content.kn.md`)
    -   **Announcement Banner**: The announcement banner uses translation keys directly in its data file (`src/data/announcements.json`). These keys (e.g., `announcement.quote1`) are then mapped to translated strings in the main `translation.json` files for each language.

### Adding a New Language

To add support for a new language, follow these steps:

1.  **Update i18next Configuration**:
    *   Open the `src/i18n.ts` file.
    *   Add the new language code (e.g., `fr` for French) to the `supportedLngs` array.

2.  **Create UI Translation File**:
    *   Create a new directory for the language in `public/locales/` (e.g., `public/locales/fr/`).
    *   Copy an existing `translation.json` file (e.g., from `public/locales/en/`) into this new directory.
    *   Translate all the string values in the new `public/locales/<new-lang-code>/translation.json` file.

3.  **Translate Content Data**:
    *   **Courses**: Create `src/data/courses.<new-lang-code>.json`. Copy the structure from `courses.json` and translate all relevant fields for each course.
    *   **Videos**: For each course, create `src/data/videos/<course-id>.<new-lang-code>.json`. Translate the video titles.
    *   **Links**: Create `src/data/links.<new-lang-code>.json`. Translate link titles and descriptions.
    *   **Announcements**: Add the new language translations for the announcement keys (e.g. `announcement.quote1`) into the new `public/locales/<new-lang-code>/translation.json` file created in step 2.
    *   **Blog Posts**: For each existing blog post, create:
        *   `src/blogs/<blog-slug>/metadata.<new-lang-code>.json` (translate title, description, tags).
        *   `src/blogs/<blog-slug>/content.<new-lang-code>.md` (translate the blog content).

4.  **Test Thoroughly**:
    *   Run the application locally (`npm run dev`).
    *   Use the language switcher in the header to select the new language.
    *   Navigate through all pages and sections of the website to ensure all UI elements and content are correctly translated and displayed. Check for any missing translations or layout issues.

### Using Translations in Components

To use translated strings within React components:

1.  **Import the Hook**: Import the `useTranslation` hook from `react-i18next`.
    ```typescript
    import { useTranslation } from 'react-i18next';
    ```

2.  **Initialize the Hook**: Call the hook within your functional component.
    ```typescript
    const { t } = useTranslation();
    ```

3.  **Use the `t` Function**: Use the `t` function to access translated strings by their keys.
    ```typescript
    <p>{t('greeting')}</p> // Assuming 'greeting' is a key in your translation.json
    <p>{t('announcement.dsaPython')}</p> // Example for an announcement
    ```

    If a key is not found for the current language, `i18next` will fall back to the default language (English) or display the key itself if not found in the fallback.

### Best Practices for i18n

*   **Consistent Keys**: Use clear and consistent naming conventions for your translation keys.
*   **Fallback Language**: Ensure that your fallback language (English) has complete translations for all keys.
*   **Contextual Comments (Optional but Recommended)**: If a key's meaning might be ambiguous for translators, consider adding comments in your `translation.json` files or maintaining a separate glossary document.
*   **Lazy Loading (Future Consideration)**: For applications with a very large number of languages or extensive translation files, consider implementing lazy loading for translation namespaces to improve initial load performance. `i18next-http-backend` already helps with this by only loading the required language.
*   **Pluralization and Interpolation**: `i18next` supports advanced features like pluralization and string interpolation. Refer to the official `i18next` documentation for details on how to use these features. Example of interpolation already in use:
    ```json
    "footerCopyright": "© {{year}} Engineering in Kannada. All rights reserved."
    ```
    In the code, you would pass the `year` variable: `t('footerCopyright', { year: new Date().getFullYear() })`.

By following these guidelines, we can maintain a well-structured and easily expandable internationalization system for the Engineering in Kannada platform.
