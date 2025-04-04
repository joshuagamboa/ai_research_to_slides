/**
 * Utilities for handling SVG images in MARP slides
 */

import { generateHash, getDataUrl, storeContent } from './storageUtils'

/**
 * Converts an SVG string to a data URL for use in MARP slides
 * @param svgContent The SVG content as a string
 * @returns A data URL for the SVG
 */
export const svgToDataUrl = (svgContent: string): string => {
  // Generate a hash for the SVG content
  const hash = generateHash(svgContent)

  // Convert to base64
  const base64 = btoa(svgContent)

  // Store in localStorage
  storeContent(hash, 'image/svg+xml', base64)

  // Get the data URL
  const dataUrl = getDataUrl(hash)

  return dataUrl || `data:image/svg+xml;base64,${base64}`
}

/**
 * Creates an HTML img tag for an SVG with proper styling for MARP
 * @param svgContent The SVG content as a string
 * @param altText Alternative text for the image
 * @returns An HTML img tag with the SVG as a data URL
 */
export const createSvgImgTag = (svgContent: string, altText: string = 'R Plot'): string => {
  const dataUrl = svgToDataUrl(svgContent)

  return `<div class="r-plot">
  <img src="${dataUrl}" alt="${altText}" style="max-width: 100%; max-height: 70vh;" />
</div>`
}

/**
 * Replaces R code chunks in markdown with SVG images
 * @param markdown The markdown content
 * @param rCodeToSvg A map of R code to SVG content
 * @returns The markdown with R code chunks replaced by SVG images
 */
export const replaceRCodeWithSvg = (markdown: string, rCodeToSvg: Record<string, string>): string => {
  let processedMarkdown = markdown

  // Regular expression to find R code chunks
  const rCodeChunkRegex = /```{r.*?}\n([\s\S]*?)\n```/g

  // Find all R code chunks
  const matches = [...processedMarkdown.matchAll(rCodeChunkRegex)]

  // Process each R code chunk
  for (const match of matches) {
    const fullMatch = match[0]
    const rCode = match[1].trim()

    // Check if we have an SVG for this R code
    if (rCodeToSvg[rCode]) {
      const svgContent = rCodeToSvg[rCode]
      const imgTag = createSvgImgTag(svgContent, `R Plot: ${rCode.substring(0, 20)}...`)

      // Replace the R code chunk with the SVG image
      processedMarkdown = processedMarkdown.replace(fullMatch, imgTag)
    }
  }

  return processedMarkdown
}

/**
 * Extracts all SVG data URLs from markdown
 * @param markdown The markdown content
 * @returns An array of SVG data URLs
 */
export const extractSvgDataUrls = (markdown: string): string[] => {
  const dataUrlRegex = /data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+/g
  return [...markdown.matchAll(dataUrlRegex)].map(match => match[0])
}

/**
 * Checks if markdown contains SVG images
 * @param markdown The markdown content
 * @returns True if the markdown contains SVG images
 */
export const containsSvgImages = (markdown: string): boolean => {
  return markdown.includes('data:image/svg+xml;base64,') ||
         markdown.includes('<svg') ||
         markdown.includes('![') && markdown.includes('.svg')
}

/**
 * Converts standard Markdown SVG image syntax to HTML for better MARP compatibility
 * @param markdown The markdown content
 * @returns The markdown with SVG images converted to HTML
 */
export const convertMarkdownSvgToHtml = (markdown: string): string => {
  // Regular expression to find Markdown image syntax with SVG data URLs
  const svgImageRegex = /!\[(.*?)\]\((data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+)\)/g

  // Replace Markdown image syntax with HTML
  return markdown.replace(svgImageRegex, (match, alt, dataUrl) => {
    return `<div class="r-plot">
  <img src="${dataUrl}" alt="${alt}" style="max-width: 100%; max-height: 70vh;" />
</div>`
  })
}
