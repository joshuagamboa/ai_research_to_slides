/**
 * Composable for managing the research process
 * Handles research queries and presentation outline generation
 */

import { ref } from 'vue'
import { useOpenRouter } from './useOpenRouter'
import { createDebugger } from '~/utils/debug'
import type { ResearchResult, PresentationOutline } from '~/types/research'

export const useResearch = () => {
  // Initialize debugger for this composable
  const debug = createDebugger('useResearch')
  const { queryDeepSeek, isLoading, error, streamingContent, isStreaming } = useOpenRouter()
  const researchResults = ref<string>('')
  const presentationOutline = ref<string>('')
  const researchHistory = ref<ResearchResult[]>([])
  const outlineHistory = ref<PresentationOutline[]>([])
  const isResearchComplete = ref<boolean>(false)
  const isOutlineComplete = ref<boolean>(false)

  /**
   * Conducts research automatically without requiring topic/subtopics input
   * Uses a default research prompt focused on a general topic
   * @returns A promise that resolves when the research is complete
   */
  const conductResearch = async (topic?: string): Promise<void> => {
    // debug.log('Starting research process', { topic });
    isResearchComplete.value = false;
    researchResults.value = '';
    
    // Default research prompt for automatic research
    let researchPrompt = `Conduct a thorough research study on artificial intelligence and its applications in modern society. 

Include the following subtopics:
- Machine learning and deep learning
- Natural language processing
- Computer vision
- AI ethics and governance
- Future trends in AI

Provide comprehensive information with academic rigor. Include relevant facts, theories, and current developments.`
    
    // If a topic is provided, use it instead of the default
    if (topic) {
      // debug.log('Using provided topic for research', { topic });
      console.log('Conducting research on user-provided topic:', topic);
      
      researchPrompt = `Conduct a thorough research study on ${topic}. 

Provide comprehensive information with academic rigor. Include relevant facts, theories, and current developments. Organize the information into logical sections with appropriate headings.`;
    }
    
    try {
        // debug.log('Preparing research query');
        // debug.log('Sending research query', { promptLength: researchPrompt.length });
        
        // Use streaming API for real-time updates
        const result = await queryDeepSeek(
            researchPrompt, 
            4000, 
            true, // Enable streaming
            (chunk) => {
                // debug.log('Received streaming chunk', { chunkLength: chunk.length });
                // This callback will be called for each chunk of the streaming response
                researchResults.value += chunk
            }
        )
        
        if (result) {
            // debug.log('Research completed successfully', { resultLength: result.length });
            // Ensure the final result is set (in case streaming had issues)
            researchResults.value = result
            
            // Save to history
            researchHistory.value.push({
                topic: topic || 'Artificial Intelligence',
                subtopics: topic ? [] : ['Machine learning', 'NLP', 'Computer vision', 'AI ethics', 'Future trends'],
                content: result,
                timestamp: new Date().toISOString()
            })
            
            isResearchComplete.value = true;
        } else {
            debug.error('Research completed but returned no result');
        }
    } catch (err) {
        debug.error('Research process failed', err);
        error.value = 'Failed to complete research. Please try again.';
    }
}

  /**
   * Generates a presentation outline based on the research results
   * @param inNewWindow Whether to open the outline in a new window
   * @returns A promise that resolves when the outline generation is complete
   */
  const generateOutline = async (inNewWindow: boolean = false): Promise<void> => {
    // debug.log('Starting outline generation', { inNewWindow });
    isOutlineComplete.value = false;
    presentationOutline.value = '';
    
    if (!researchResults.value) {
      debug.error('Cannot generate outline - no research results available');
      error.value = 'No research results available to generate an outline'
      return
    }

    const outlinePrompt = `Based on the following research, create a comprehensive presentation outline using MARP-compatible Markdown format:\n\n${researchResults.value}\n\n` +
      'Format the outline as follows:\n' +
      '1. Your document MUST begin with these exact MARP directives as the first lines of your response:\n' +
      '```\n---\nmarp: true\ntheme: gaia\nclass: lead\npaginate: true\nbackgroundColor: #fff\nbackgroundImage: url(\'./background.svg\')\n---\n```\n\n' +
      '2. Create a title slide with a clear # Title and ## Subtitle. Include an image on the left side using: ![bg left:40% 80%](./robot_ai_logo.svg)\n' +
      '3. ALWAYS use "---" on a separate line to create a slide break between each main topic or key point.\n' +
      '4. For each slide:\n' +
      '   - Use # for slide titles (only one per slide)\n' +
      '   - Use ## for section headings within a slide\n' +
      '   - Use ### for subsections\n' +
      '   - Keep content concise to prevent overflow\n' +
      '5. For tables, use proper markdown table syntax with headers. IMPORTANT: Make sure each table row ends with a pipe character and is followed by a newline:\n' +
      '   ```\n' +
      '   | Header 1 | Header 2 | Header 3 |\n' +
      '   | -------- | -------- | -------- |\n' +
      '   | Cell 1   | Cell 2   | Cell 3   |\n' +
      '   ```\n' +
      '6. Use bullet points for lists (not too many per slide):\n' +
      '   - Main point\n' +
      '     - Sub point\n' +
      '7. For emphasis, use **bold** or *italic* text.\n' +
      '8. Include image placeholders if relevant: ![alt text](image-url)\n' +
      '9. IMPORTANT: Ensure each slide has a clear purpose and doesn\'t contain too much text that would cause overflow.\n' +
      'IMPORTANT: The MARP directives should ONLY appear once at the very beginning of the document. Do NOT include them as visible content within your slides. Do NOT use R Markdown specific syntax.'
    
    // debug.log('Sending outline generation query', { promptLength: outlinePrompt.length });
    
    // Use streaming for real-time updates if not opening in a new window
    const result = await queryDeepSeek(
      outlinePrompt, 
      2000, 
      !inNewWindow, // Stream only if not opening in new window
      (chunk) => {
        // debug.log('Received outline chunk', { chunkLength: chunk.length });
        // This callback will be called for each chunk of the streaming response
        presentationOutline.value += chunk
      }
    )
    
    if (result) {
      // Ensure the final result is set (in case streaming had issues)
      presentationOutline.value = result
      
      // Save to history
      outlineHistory.value.push({
        content: result,
        format: 'markdown',
        timestamp: new Date().toISOString()
      })
      
      isOutlineComplete.value = true;
      
      // If requested to open in new window, do so
      if (inNewWindow && typeof window !== 'undefined') {
        const outlineWindow = window.open('', '_blank');
        if (outlineWindow) {
          outlineWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>MARP Presentation Outline</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; padding: 2rem; line-height: 1.5; }
                pre { background-color: #f5f5f5; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
                button { padding: 0.75rem 1.5rem; background-color: #4f46e5; color: white; border: none; 
                         border-radius: 0.5rem; cursor: pointer; font-weight: 600; margin-top: 1rem; }
                button:hover { background-color: #4338ca; }
                h1 { color: #1e40af; }
                .note { background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 1rem; margin-bottom: 1rem; }
              </style>
            </head>
            <body>
              <h1>MARP Presentation Outline</h1>
              <div class="note">This outline uses standard Markdown format compatible with MARP. Any non-slide content appears at the beginning of the document.</div>
              <pre>${presentationOutline.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              <button id="generateSlides">Generate Slides</button>
              <script>
                document.getElementById('generateSlides').addEventListener('click', function() {
                  window.opener.postMessage({ action: 'generateSlides' }, '*');
                });
              </script>
            </body>
            </html>
          `);
          outlineWindow.document.close();
        }
      }
    }
  }

  /**
   * Generates HTML slides from the R Markdown outline using MARP
   * @returns A promise that resolves when the slides generation is complete
   */
  const generateSlides = async (): Promise<void> => {
    if (!presentationOutline.value) {
      error.value = 'No presentation outline available to generate slides'
      return
    }
    
    // This function would integrate with the useMarp composable
    // The actual implementation would be handled by the research.vue page
    // This is just a placeholder to complete the API
  }

  // Listen for messages from the outline window
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.action === 'generateSlides') {
        generateSlides()
      }
    })
  }

  return { 
    conductResearch, 
    generateOutline,
    generateSlides,
    researchResults, 
    presentationOutline, 
    researchHistory,
    outlineHistory,
    isLoading, 
    error,
    isStreaming,
    streamingContent,
    isResearchComplete,
    isOutlineComplete
  }
}