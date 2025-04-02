/**
 * Composable for managing the research process
 * Handles research queries and presentation outline generation
 */

import { ref } from 'vue'
import { useOpenRouter } from './useOpenRouter'
import type { ResearchResult, PresentationOutline } from '~/types/research'

export const useResearch = () => {
  const { queryDeepSeek, isLoading, error } = useOpenRouter()
  const researchResults = ref<string>('')
  const presentationOutline = ref<string>('')
  const researchHistory = ref<ResearchResult[]>([])
  const outlineHistory = ref<PresentationOutline[]>([])

  /**
   * Conducts research on a given topic and its subtopics
   * @param topic The main research topic
   * @param subtopics Array of subtopics to include in the research
   * @returns A promise that resolves when the research is complete
   */
  const conductResearch = async (topic: string, subtopics: string[]): Promise<void> => {
    if (!topic.trim()) {
      error.value = 'Please provide a research topic'
      return
    }

    const filteredSubtopics = subtopics.filter(st => st.trim())
    
    // Construct a detailed research prompt
    const researchPrompt = `Conduct a thorough research study on: ${topic}\n\n` +
      `${filteredSubtopics.length > 0 ? 'Include the following subtopics:\n' + filteredSubtopics.map(st => `- ${st}`).join('\n') : ''}\n\n` +
      'Provide comprehensive information with academic rigor. Include relevant facts, theories, and current developments.'
    
    const result = await queryDeepSeek(researchPrompt, 4000)
    if (result) {
      researchResults.value = result
      
      // Save to history
      researchHistory.value.push({
        topic,
        subtopics: filteredSubtopics,
        content: result,
        timestamp: new Date().toISOString()
      })
      
      // Generate presentation outline
      await generateOutline()
    }
  }

  /**
   * Generates a presentation outline based on the research results
   * @returns A promise that resolves when the outline generation is complete
   */
  const generateOutline = async (): Promise<void> => {
    if (!researchResults.value) {
      error.value = 'No research results available to generate an outline'
      return
    }

    const outlinePrompt = `Based on the following research, create a comprehensive R Markdown presentation outline:\n\n${researchResults.value}\n\n` +
      'Format the outline as a valid R Markdown document with YAML frontmatter, sections, and bullet points. ' +
      'Include appropriate slide breaks, code chunks if relevant, and formatting.'
    
    const result = await queryDeepSeek(outlinePrompt, 2000)
    if (result) {
      presentationOutline.value = result
      
      // Save to history
      outlineHistory.value.push({
        content: result,
        format: 'rmarkdown',
        timestamp: new Date().toISOString()
      })
    }
  }

  return { 
    conductResearch, 
    generateOutline,
    researchResults, 
    presentationOutline, 
    researchHistory,
    outlineHistory,
    isLoading, 
    error 
  }
}