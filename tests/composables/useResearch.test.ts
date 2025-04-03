import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useResearch } from '~/composables/useResearch'

// Mock the dependencies
const mockQueryDeepSeek = vi.fn().mockResolvedValue('Mock research results')
vi.mock('~/composables/useOpenRouter', () => ({
  useOpenRouter: () => ({
    queryDeepSeek: mockQueryDeepSeek,
    isLoading: false,
    error: { value: null }
  })
}))

// Create a test harness to access the reactive properties
const createTestHarness = () => {
  const { 
    researchResults,
    presentationOutline,
    researchHistory,
    outlineHistory,
    conductResearch,
    generateOutline,
    isLoading,
    error
  } = useResearch()
  
  return {
    researchResults,
    presentationOutline,
    researchHistory,
    outlineHistory,
    conductResearch,
    generateOutline,
    isLoading,
    error
  }
}

describe('useResearch composable', () => {
  let harness;
  
  beforeEach(() => {
    harness = createTestHarness()
    vi.clearAllMocks()
  })
  
  describe('conductResearch', () => {
    it('sets error when topic is empty', async () => {
      await harness.conductResearch('', [])
      
      expect(harness.error.value).toBeTruthy()
      expect(harness.researchResults.value).toBe('')
    })
    
    it('calls queryDeepSeek with formatted prompt', async () => {
      const { useOpenRouter } = await import('~/composables/useOpenRouter')
      const mockQueryDeepSeek = useOpenRouter().queryDeepSeek
      
      await harness.conductResearch('AI Ethics', ['Privacy', 'Bias'])
      
      expect(mockQueryDeepSeek).toHaveBeenCalled()
      const prompt = mockQueryDeepSeek.mock.calls[0][0]
      
      expect(prompt).toContain('AI Ethics')
      expect(prompt).toContain('Privacy')
      expect(prompt).toContain('Bias')
    })
    
    it('updates researchResults and history on success', async () => {
      await harness.conductResearch('AI Ethics', ['Privacy'])
      
      expect(harness.researchResults.value).toBe('Mock research results')
      expect(harness.researchHistory.value).toHaveLength(1)
      expect(harness.researchHistory.value[0].topic).toBe('AI Ethics')
      expect(harness.researchHistory.value[0].subtopics).toEqual(['Privacy'])
    })
  })
  
  describe('generateOutline', () => {
    it('sets error when no research results', async () => {
      harness.researchResults.value = ''
      
      await harness.generateOutline()
      
      expect(harness.error.value).toBeTruthy()
      expect(harness.presentationOutline.value).toBe('')
    })
    
    it('calls queryDeepSeek with outline prompt', async () => {
      const { useOpenRouter } = await import('~/composables/useOpenRouter')
      const mockQueryDeepSeek = useOpenRouter().queryDeepSeek
      
      harness.researchResults.value = 'Some research results'
      await harness.generateOutline()
      
      expect(mockQueryDeepSeek).toHaveBeenCalled()
      const prompt = mockQueryDeepSeek.mock.calls[0][0]
      
      expect(prompt).toContain('presentation outline')
      expect(prompt).toContain('Some research results')
    })
    
    it('updates presentationOutline and history on success', async () => {
      harness.researchResults.value = 'Some research results'
      await harness.generateOutline()
      
      expect(harness.presentationOutline.value).toBe('Mock research results')
      expect(harness.outlineHistory.value).toHaveLength(1)
    })
  })
})