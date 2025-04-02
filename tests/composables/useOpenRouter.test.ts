import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useOpenRouter } from '~/composables/useOpenRouter'

// Mock the fetch function
global.fetch = vi.fn()

// Create a test harness to access the reactive properties
const createTestHarness = () => {
  const { 
    queryDeepSeek,
    isLoading,
    error
  } = useOpenRouter()
  
  return {
    queryDeepSeek,
    isLoading,
    error
  }
}

describe('useOpenRouter composable', () => {
  let harness;
  
  beforeEach(() => {
    harness = createTestHarness()
    vi.clearAllMocks()
    global.fetch.mockClear()
  })
  
  describe('queryDeepSeek', () => {
    it('sets isLoading to true during API call', async () => {
      // Mock a delayed response
      global.fetch.mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ result: 'Mock response' })
        }), 100)
      }))
      
      const promise = harness.queryDeepSeek('Test query')
      
      expect(harness.isLoading.value).toBe(true)
      
      await promise
      
      expect(harness.isLoading.value).toBe(false)
    })
    
    it('makes API call with correct parameters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'Mock response' })
      })
      
      await harness.queryDeepSeek('Test query', 1000)
      
      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url, options] = global.fetch.mock.calls[0]
      
      expect(url).toContain('/api')
      expect(JSON.parse(options.body)).toEqual({
        model: 'deepseek-ai/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content: 'Test query' }],
        max_tokens: 1000
      })
    })
    
    it('returns API response on success', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ result: 'Mock response' })
      })
      
      const result = await harness.queryDeepSeek('Test query')
      
      expect(result).toBe('Mock response')
    })
    
    it('sets error on API failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      })
      
      await harness.queryDeepSeek('Test query')
      
      expect(harness.error.value).toBeTruthy()
      expect(harness.error.value).toContain('API request failed with status 500')
    })
    
    it('sets error on network failure', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'))
      
      await harness.queryDeepSeek('Test query')
      
      expect(harness.error.value).toBeTruthy()
      expect(harness.error.value).toContain('Network error')
    })
  })
})