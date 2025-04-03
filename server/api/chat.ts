import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('API endpoint called: /api/chat')
  const config = useRuntimeConfig()
  const body = await readBody(event)
  
  // Log request details
  console.log('Request body:', {
    model: body.model || 'deepseek-ai/deepseek-chat-v3-0324:free',
    messageCount: body.messages?.length,
    firstMessagePreview: body.messages?.[0]?.content?.substring(0, 50) + '...',
    max_tokens: body.max_tokens,
    stream: body.stream
  })
  
  // Check if API key is configured
  if (!config.openrouterApiKey) {
    console.error('OpenRouter API key is missing')
    throw createError({
      statusCode: 500,
      statusMessage: 'API key configuration is missing'
    })
  }

  try {
    console.log('Sending request to OpenRouter API...')
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.public.siteUrl,
        'X-Title': 'Research Assistant'
      },
      body: JSON.stringify({
        model: body.model || 'deepseek-ai/deepseek-chat-v3-0324:free',
        messages: body.messages,
        max_tokens: body.max_tokens,
        stream: body.stream
      })
    })

    console.log('OpenRouter API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw createError({
        statusCode: response.status,
        statusMessage: `OpenRouter API error: ${response.statusText}`,
        data: errorText
      })
    }

    if (body.stream && response.body) {
      console.log('Streaming response back to client')
      return sendStream(event, response.body)
    }

    const data = await response.json()
    console.log('OpenRouter API response:', {
      choices: data.choices?.length,
      usage: data.usage,
      firstChoicePreview: data.choices?.[0]?.message?.content?.substring(0, 50) + '...'
    })
    return data
  } catch (error) {
    console.error('Error in chat API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to communicate with OpenRouter API',
      data: error
    })
  }
})