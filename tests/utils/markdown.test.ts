import { describe, it, expect, vi } from 'vitest'
import { renderMarkdown, extractTitle, createSummary, isValidMarkdown } from '~/utils/markdown'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Mock the dependencies
vi.mock('marked', () => ({
  marked: {
    parse: vi.fn((md) => `<p>${md}</p>`)
  }
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html)
  }
}))

describe('markdown utilities', () => {
  describe('renderMarkdown', () => {
    it('returns empty string for empty input', () => {
      expect(renderMarkdown('')).toBe('')
    })

    it('calls marked.parse and DOMPurify.sanitize', () => {
      renderMarkdown('# Test')
      
      expect(marked.parse).toHaveBeenCalledWith('# Test')
      expect(DOMPurify.sanitize).toHaveBeenCalled()
    })

    it('returns sanitized HTML', () => {
      const result = renderMarkdown('# Test')
      
      expect(result).toBe('<p># Test</p>')
    })
  })

  describe('extractTitle', () => {
    it('extracts title from markdown heading', () => {
      const markdown = '# Main Title\n\nSome content'
      
      expect(extractTitle(markdown)).toBe('Main Title')
    })

    it('returns default title when no heading found', () => {
      const markdown = 'Some content without heading'
      
      expect(extractTitle(markdown)).toBe('Research Results')
    })

    it('handles multiple headings by taking the first one', () => {
      const markdown = '# First Heading\n\nContent\n\n# Second Heading'
      
      expect(extractTitle(markdown)).toBe('First Heading')
    })
  })

  describe('createSummary', () => {
    it('removes markdown formatting', () => {
      const markdown = '# Heading\n\n**Bold text** and _italic_ text'
      
      const summary = createSummary(markdown)
      
      expect(summary).not.toContain('#')
      expect(summary).not.toContain('**')
      expect(summary).not.toContain('_')
      expect(summary).toContain('Bold text')
      expect(summary).toContain('italic')
    })

    it('truncates text to specified length', () => {
      const longText = 'A'.repeat(200)
      
      const summary = createSummary(longText, 100)
      
      expect(summary.length).toBeLessThanOrEqual(103) // 100 + '...' length
      expect(summary.endsWith('...')).toBe(true)
    })

    it('does not truncate text shorter than maxLength', () => {
      const shortText = 'Short text'
      
      const summary = createSummary(shortText, 100)
      
      expect(summary).toBe(shortText)
      expect(summary.endsWith('...')).toBe(false)
    })
  })

  describe('isValidMarkdown', () => {
    it('returns true for valid markdown', () => {
      const validMarkdown = '# Heading\n\nParagraph text'
      
      expect(isValidMarkdown(validMarkdown)).toBe(true)
    })

    it('returns false for empty input', () => {
      expect(isValidMarkdown('')).toBe(false)
    })

    it('returns false for non-string input', () => {
      // @ts-ignore - Testing invalid input type
      expect(isValidMarkdown(null)).toBe(false)
      // @ts-ignore - Testing invalid input type
      expect(isValidMarkdown(undefined)).toBe(false)
      // @ts-ignore - Testing invalid input type
      expect(isValidMarkdown(123)).toBe(false)
    })

    it('handles markdown with parsing errors', () => {
      // Mock marked.parse to throw an error
      const originalParse = marked.parse
      marked.parse = vi.fn().mockImplementation(() => {
        throw new Error('Parse error')
      })

      expect(isValidMarkdown('Some content')).toBe(false)

      // Restore original implementation
      marked.parse = originalParse
    })
  })
})