/**
 * Composable for interacting with the OpenRouter API
 * Provides functionality to query the DeepSeek model
 */

import { ref } from 'vue'

export const useOpenRouter = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Sends a query to the DeepSeek model via OpenRouter API
   * @param prompt The prompt to send to the model
   * @param maxTokens Maximum number of tokens to generate
   * @returns The generated content or null if an error occurred
   */
  const queryDeepSeek = async (prompt: string, maxTokens = 4000): Promise<string | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Research Assistant'
        },
        body: JSON.stringify({
          model: 'deepseek-ai/deepseek-chat-v3-0324:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from API')
      return data.choices[0].message.content
    } catch (err: any) {
      error.value = err.message || 'An unknown error occurred'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { queryDeepSeek, isLoading, error }
}