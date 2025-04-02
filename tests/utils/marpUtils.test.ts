import { describe, it, expect } from 'vitest'
import { getRandomTemplates, convertRMdToMarp, TEMPLATES, getContrastColor } from '~/utils/marpUtils'

describe('marpUtils', () => {
  describe('getRandomTemplates', () => {
    it('returns the requested number of templates', () => {
      const templates = getRandomTemplates(3)
      
      expect(templates).toHaveLength(3)
      templates.forEach(template => {
        expect(TEMPLATES).toContainEqual(template)
      })
    })

    it('returns all templates if count exceeds available templates', () => {
      const templates = getRandomTemplates(100)
      
      expect(templates).toHaveLength(TEMPLATES.length)
      expect(templates).toEqual(expect.arrayContaining(TEMPLATES))
    })

    it('returns empty array if count is 0', () => {
      const templates = getRandomTemplates(0)
      
      expect(templates).toHaveLength(0)
    })

    it('returns different templates on multiple calls', () => {
      // This test might occasionally fail due to randomness
      // but it's unlikely if there are enough templates
      const firstCall = getRandomTemplates(3)
      const secondCall = getRandomTemplates(3)
      
      // Check if the arrays are different (not guaranteed but likely)
      const isDifferent = firstCall.some((template, index) => 
        template !== secondCall[index]
      )
      
      expect(isDifferent).toBe(true)
    })
  })

  describe('convertRMdToMarp', () => {
    it('converts R Markdown to MARP format with template', () => {
      const rmdContent = '# Title\n\n## Slide 1\n\nContent'
      const template = TEMPLATES[0] // Use the first template
      
      const marpContent = convertRMdToMarp(rmdContent, template)
      
      // Check that the template properties are applied
      expect(marpContent).toContain('theme:')
      expect(marpContent).toContain(template.theme)
      expect(marpContent).toContain(template.backgroundColor)
      expect(marpContent).toContain(template.textColor)
      
      // Check that the content is preserved
      expect(marpContent).toContain('# Title')
      expect(marpContent).toContain('## Slide 1')
      expect(marpContent).toContain('Content')
    })

    it('handles empty content', () => {
      const template = TEMPLATES[0]
      
      const marpContent = convertRMdToMarp('', template)
      
      // Should still have the MARP header
      expect(marpContent).toContain('---')
      expect(marpContent).toContain('marp: true')
    })

    it('preserves slide separators', () => {
      const rmdContent = '# Slide 1\n\nContent 1\n\n---\n\n# Slide 2\n\nContent 2'
      const template = TEMPLATES[0]
      
      const marpContent = convertRMdToMarp(rmdContent, template)
      
      // Count the number of slide separators (should be at least 2: header and the one in content)
      const separatorCount = (marpContent.match(/---/g) || []).length
      expect(separatorCount).toBeGreaterThanOrEqual(2)
      
      // Check that both slides are preserved
      expect(marpContent).toContain('# Slide 1')
      expect(marpContent).toContain('Content 1')
      expect(marpContent).toContain('# Slide 2')
      expect(marpContent).toContain('Content 2')
    })
  })

  describe('getContrastColor', () => {
    it('returns black for light background colors', () => {
      expect(getContrastColor('#ffffff')).toBe('#000000') // White background
      expect(getContrastColor('#f0f0f0')).toBe('#000000') // Light gray background
      expect(getContrastColor('#ffff00')).toBe('#000000') // Yellow background
    })

    it('returns white for dark background colors', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff') // Black background
      expect(getContrastColor('#333333')).toBe('#ffffff') // Dark gray background
      expect(getContrastColor('#0000ff')).toBe('#ffffff') // Blue background
    })

    it('handles edge cases correctly', () => {
      // Edge case colors that are near the brightness threshold
      expect(getContrastColor('#808080')).toBe('#ffffff') // Medium gray
      expect(getContrastColor('#909090')).toBe('#000000') // Slightly lighter gray
    })
  })
})