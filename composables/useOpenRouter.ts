/**
 * Composable for interacting with the OpenRouter API
 * Provides functionality to query the DeepSeek model
 */

import { ref } from 'vue'
import debug from '~/utils/debug'

export const useOpenRouter = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const streamingContent = ref<string>('')
  const isStreaming = ref(false)

  /**
   * Sends a query to the DeepSeek model via OpenRouter API
   * @param prompt The prompt to send to the model
   * @param maxTokens Maximum number of tokens to generate
   * @param streaming Whether to stream the response
   * @returns The generated content or null if an error occurred
   */
  const queryDeepSeek = async (
    prompt: string, 
    maxTokens = 128000, 
    streaming = true,
    onChunk?: (chunk: string) => void
  ): Promise<string | null> => {
     console.log('queryDeepSeek called with:', { 
      promptLength: prompt.length, 
      promptPreview: prompt.substring(0, 50) + '...', 
      maxTokens, 
      streaming 
    })
    
    isLoading.value = true
    error.value = null
    streamingContent.value = ''
    isStreaming.value = streaming

    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl
    // console.log('Site URL from config:', siteUrl)

    try {
      // console.log('Sending request to /api/chat endpoint')
      const requestBody = {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        stream: streaming
      }
      // console.log('Request payload:', { ...requestBody, messages: '[content omitted for brevity]' })
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      // console.log('Response received:', { status: response.status, ok: response.ok })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API request failed:', { status: response.status, error: errorText })
        throw new Error(`API request failed with status ${response.status}: ${errorText}`)
      }

      // Handle streaming response
      if (streaming && response.body) {
        // console.log('Starting streaming response processing...')
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let fullContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            // console.log('Stream completed')
            break
          }
          
          const chunk = decoder.decode(value, { stream: true })
          // console.log('Received raw chunk:', chunk.length, 'bytes')
          const lines = chunk.split('\n').filter(line => line.trim() !== '')
          // console.log('Procconsole.log('queryDeepSeekessing', lines.length, 'non-empty lines')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                // console.log('Received [DONE] signal')
                continue
              }
              
              // Only process non-empty data
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    // console.log('Received content chunk:', content.length, 'characters')
                    fullContent += content
                    streamingContent.value += content
                    if (onChunk) onChunk(content)
                  }
                } catch (e) {
                  console.error('Error parsing streaming response:', e)
                  // Log the problematic data for debugging
                  // console.log('Problematic JSON data:', data.substring(0, 150) + '...')
                }
              }
            }
          }
        }
        
        return fullContent
      } else {
        // Handle regular response
        const data = await response.json()
        if (!data?.choices?.[0]?.message?.content) {
          debug.error('Invalid response format', data)
          throw new Error('Invalid response format from API')
        }
        
        debug.log('Regular response processed', { 
          contentLength: data.choices[0].message.content.length,
          usage: data.usage
        })
        return data.choices[0].message.content
      }
    } catch (err) {
      debug.error('Error querying DeepSeek model', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred'
      return null
    } finally {
      debug.log('Request completed', { success: error.value === null })
      isLoading.value = false
      isStreaming.value = false
    }
  }

  return { queryDeepSeek, isLoading, error }
}