/**
 * Utilities for safely rendering Markdown content
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Renders markdown content safely using DOMPurify to prevent XSS attacks
 * @param markdown The markdown content to render
 * @returns Sanitized HTML string
 */
export const renderMarkdown = (markdown: string): string => {
  if (!markdown) return ''
  return DOMPurify.sanitize(marked.parse(markdown))
}

/**
 * Extracts the title from markdown content
 * @param markdown The markdown content
 * @returns The extracted title or a default title
 */
export const extractTitle = (markdown: string): string => {
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  return titleMatch ? titleMatch[1].trim() : 'Research Results'
}

/**
 * Creates a summary of markdown content
 * @param markdown The markdown content
 * @param maxLength Maximum length of the summary
 * @returns A shortened summary of the content
 */
export const createSummary = (markdown: string, maxLength = 150): string => {
  // Remove markdown formatting
  const plainText = markdown
    .replace(/#+\s+/g, '') // Remove headings
    .replace(/\*\*|__/g, '') // Remove bold
    .replace(/\*|_/g, '') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just the text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\n\s*\n/g, '\n') // Compress multiple newlines
    .trim()

  // Truncate and add ellipsis if needed
  if (plainText.length <= maxLength) {
    return plainText
  }
  
  return plainText.substring(0, maxLength).trim() + '...'
}

/**
 * Validates if a string is valid markdown
 * @param content The content to validate
 * @returns True if the content is valid markdown
 */
export const isValidMarkdown = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false
  
  try {
    // Try to parse the markdown - if it doesn't throw an error, it's valid
    marked.parse(content)
    return true
  } catch (error) {
    return false
  }
}