/**
 * Utilities for MARP slide generation and template management
 */

import type { MarpTemplate } from '~/types/research'

/**
 * Predefined MARP templates with various styles
 */
export const TEMPLATES: MarpTemplate[] = [
  {
    name: 'Professional Blue',
    theme: 'default',
    backgroundColor: '#ffffff',
    textColor: '#2c3e50',
    accentColor: '#3498db',
    headingFont: 'Arial, sans-serif',
    bodyFont: 'Helvetica, sans-serif'
  },
  {
    name: 'Dark Tech',
    theme: 'gaia',
    backgroundColor: '#1a1a2e',
    textColor: '#e6e6e6',
    accentColor: '#0f3460',
    headingFont: 'Courier New, monospace',
    bodyFont: 'Courier New, monospace'
  },
  {
    name: 'Warm Sunset',
    theme: 'uncover',
    backgroundColor: '#fff5e6',
    textColor: '#5c3a21',
    accentColor: '#e67e22',
    headingFont: 'Georgia, serif',
    bodyFont: 'Palatino, serif'
  },
  {
    name: 'Clean Green',
    theme: 'default',
    backgroundColor: '#f0fff0',
    textColor: '#1e3f1e',
    accentColor: '#2e8b57',
    headingFont: 'Verdana, sans-serif',
    bodyFont: 'Arial, sans-serif'
  },
  {
    name: 'Bold Contrast',
    theme: 'gaia',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#ff5722',
    headingFont: 'Impact, sans-serif',
    bodyFont: 'Arial Black, sans-serif'
  },
  {
    name: 'Soft Pastel',
    theme: 'uncover',
    backgroundColor: '#f8f4ff',
    textColor: '#4a4453',
    accentColor: '#b399d4',
    headingFont: 'Comic Sans MS, cursive',
    bodyFont: 'Comic Sans MS, cursive'
  },
  {
    name: 'Ocean Depth',
    theme: 'default',
    backgroundColor: '#e6f7ff',
    textColor: '#003366',
    accentColor: '#0066cc',
    headingFont: 'Trebuchet MS, sans-serif',
    bodyFont: 'Tahoma, sans-serif'
  }
]

/**
 * Ensures text remains readable by calculating contrast ratio
 * @returns Array of templates with good text contrast
 */
export function getReadableTemplates(): MarpTemplate[] {
  return TEMPLATES.filter(template => {
    // Simple contrast check (WCAG AA requires at least 4.5:1 for normal text)
    const bg = template.backgroundColor
    const text = template.textColor
    const contrast = calculateContrast(bg, text)
    return contrast >= 4.5
  })
}

/**
 * Calculates contrast ratio between two colors
 * @param hex1 First color in hex format
 * @param hex2 Second color in hex format
 * @returns Contrast ratio (higher is better)
 */
function calculateContrast(hex1: string, hex2: string): number {
  // Convert hex to RGB and calculate luminance
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  const lum1 = (0.2126 * rgb1.r + 0.7152 * rgb1.g + 0.0722 * rgb1.b) / 255
  const lum2 = (0.2126 * rgb2.r + 0.7152 * rgb2.g + 0.0722 * rgb2.b) / 255

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Converts hex color to RGB values
 * @param hex Hex color string
 * @returns RGB color object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

/**
 * Gets a random selection of templates
 * @param count Number of templates to return
 * @returns Array of randomly selected templates
 */
export function getRandomTemplates(count = 5): MarpTemplate[] {
  if (count <= 0) return []

  // Use original TEMPLATES array to match test expectations
  const templates = [...TEMPLATES]
  const maxTemplates = templates.length

  // Return all templates if count exceeds available templates
  if (count >= maxTemplates) {
    return [...templates] // Return a copy to avoid modifying original
  }

  // Fisher-Yates shuffle algorithm with a new array to ensure independence
  const shuffled = [...templates]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, count)
}

/**
 * Converts R Markdown content to MARP-compatible markdown
 * @param rmdContent R Markdown content
 * @param template MARP template to apply
 * @returns MARP-formatted markdown
 */
export const convertRMdToMarp = (rmdContent: string, template: MarpTemplate): string => {
  let cleanedContent = rmdContent;

  // Remove any existing frontmatter
  cleanedContent = cleanedContent.replace(/^---[\s\S]*?^---/m, '');

  // Process R code chunks - these will be handled by the R integration
  // Just preserve them for now
  cleanedContent = cleanedContent.replace(/```{r.*?}\n([\s\S]*?)\n```/g, (match, codeContent) => {
    return match; // Keep the original R code chunk
  });

  // Add Marp-specific directives for slides that need special treatment
  cleanedContent = cleanedContent.replace(/^# (.*?)$/gm, (match, title) => {
    return `<!-- _class: lead -->\n# ${title}`;
  });

  // Handle background images and colors
  cleanedContent = cleanedContent.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
    if (alt.toLowerCase().includes('background')) {
      return `![bg ${alt.includes('cover') ? 'cover' : 'contain'}](${src})`;
    }
    return match;
  });

  // Add Marpit frontmatter with theme settings
  const marpContent = `---
marp: true
theme: ${template.theme}
style: |
  section {
    background-color: ${template.backgroundColor};
    color: ${template.textColor};
    font-family: ${template.bodyFont};
  }
  section h1, section h2, section h3 {
    color: ${template.accentColor};
    font-family: ${template.headingFont};
  }
  section.lead {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  section a {
    color: ${template.accentColor};
  }
paginate: true
---

${cleanedContent}`;

  return marpContent;
}

/**
 * Gets a contrasting color for text based on background color
 * @param bgColor Background color in hex format
 * @returns Contrasting text color (black or white)
 */
export const getContrastColor = (bgColor: string): string => {
  const rgb = hexToRgb(bgColor)
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

export const cleanRMarkdownForProcessing = (content: string) => {
  // Remove MARP frontmatter if present
  let cleaned = content.replace(/^---\s*marp:\s*true[\s\S]*?---/m, '');

  // Remove HTML-like content temporarily
  const htmlPlaceholders: {[key: string]: string} = {};
  let placeholderCount = 0;

  cleaned = cleaned.replace(/<[^>]+>/g, (match) => {
    const placeholder = `__HTML_PLACEHOLDER_${placeholderCount}__`;
    htmlPlaceholders[placeholder] = match;
    placeholderCount++;
    return placeholder;
  });

  return {
    content: cleaned,
    htmlPlaceholders
  };
}

export const restoreHtmlContent = (content: string, htmlPlaceholders: {[key: string]: string}): string => {
  let restored = content;
  for (const [placeholder, html] of Object.entries(htmlPlaceholders)) {
    restored = restored.replace(placeholder, html);
  }
  return restored;
}

// These functions are already exported above
