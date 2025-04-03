import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useMarp } from '~/composables/useMarp'

// Mock the dependencies
vi.mock('~/utils/marpUtils', () => ({
  getRandomTemplates: vi.fn((count) => Array(count).fill({
    name: 'Mock Template',
    theme: 'default',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#0000ff',
    headingFont: 'Arial',
    bodyFont: 'Arial'
  })),
  convertRMdToMarp: vi.fn((content) => `MARP: ${content}`)
}))

// Create a test harness to access the reactive properties
const createTestHarness = () => {
  const { 
    templates,
    selectedTemplate,
    isGenerating,
    error,
    marpContent,
    loadRandomTemplates,
    selectTemplate,
    generateMarpSlides
  } = useMarp()
  
  return {
    templates,
    selectedTemplate,
    isGenerating,
    error,
    marpContent,
    loadRandomTemplates,
    selectTemplate,
    generateMarpSlides
  }
}

describe('useMarp composable', () => {
  let harness;
  
  beforeEach(() => {
    harness = createTestHarness()
    vi.clearAllMocks()
  })
  
  describe('loadRandomTemplates', () => {
    it('loads the specified number of templates', () => {
      harness.loadRandomTemplates(3)
      
      expect(harness.templates.value).toHaveLength(3)
    })
    
    it('calls getRandomTemplates with the correct count', () => {
      const { getRandomTemplates } = require('~/utils/marpUtils')
      
      harness.loadRandomTemplates(5)
      
      expect(getRandomTemplates).toHaveBeenCalledWith(5)
    })
  })
  
  describe('selectTemplate', () => {
    beforeEach(() => {
      harness.loadRandomTemplates(3)
    })
    
    it('selects a template by index', () => {
      harness.selectTemplate(1)
      
      expect(harness.selectedTemplate.value).toEqual(harness.templates.value[1])
    })
    
    it('sets error when index is out of bounds', () => {
      harness.selectTemplate(10)
      
      expect(harness.error.value).toBeTruthy()
      expect(harness.selectedTemplate.value).toBeNull()
    })
  })
  
  describe('generateMarpSlides', () => {
    it('sets error when no template is selected', async () => {
      const result = await harness.generateMarpSlides('# Test')
      
      expect(harness.error.value).toBeTruthy()
      expect(result).toBe('')
    })
    
    it('calls convertRMdToMarp with content and template', async () => {
      const { convertRMdToMarp } = require('~/utils/marpUtils')
      
      // Select a template first
      harness.loadRandomTemplates(1)
      harness.selectTemplate(0)
      
      await harness.generateMarpSlides('# Test Content')
      
      expect(convertRMdToMarp).toHaveBeenCalledWith(
        '# Test Content',
        harness.selectedTemplate.value
      )
    })
    
    it('updates marpContent on success', async () => {
      // Select a template first
      harness.loadRandomTemplates(1)
      harness.selectTemplate(0)
      
      await harness.generateMarpSlides('# Test Content')
      
      expect(harness.marpContent.value).toBe('MARP: # Test Content')
    })
    
    it('sets isGenerating to true during generation', async () => {
      // Select a template first
      harness.loadRandomTemplates(1)
      harness.selectTemplate(0)
      
      // Mock a delay in the conversion
      const { convertRMdToMarp } = require('~/utils/marpUtils')
      convertRMdToMarp.mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(() => resolve('MARP: # Test'), 100)
      }))
      
      const promise = harness.generateMarpSlides('# Test')
      
      expect(harness.isGenerating.value).toBe(true)
      
      await promise
      
      expect(harness.isGenerating.value).toBe(false)
    })
  })
})