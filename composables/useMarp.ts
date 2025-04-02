/**
 * Composable for managing MARP slide templates and conversion
 */

import { ref, computed } from 'vue'
import type { MarpTemplate } from '~/types/research'
import { getRandomTemplates, convertRMdToMarp } from '~/utils/marpUtils'

export const useMarp = () => {
  const templates = ref<MarpTemplate[]>([])
  const selectedTemplate = ref<MarpTemplate | null>(null)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const marpContent = ref<string>('')

  /**
   * Loads a random selection of templates
   * @param count Number of templates to load
   */
  const loadRandomTemplates = (count = 5) => {
    templates.value = getRandomTemplates(count)
  }

  /**
   * Selects a template by index
   * @param index Index of the template to select
   */
  const selectTemplate = (index: number) => {
    if (index >= 0 && index < templates.value.length) {
      selectedTemplate.value = templates.value[index]
    } else {
      error.value = 'Invalid template index'
    }
  }

  /**
   * Converts R Markdown content to MARP slides
   * @param rmdContent R Markdown content to convert
   * @returns Promise resolving to the converted MARP content
   */
  const generateMarpSlides = async (rmdContent: string): Promise<string> => {
    if (!selectedTemplate.value) {
      error.value = 'Please select a template first'
      return ''
    }

    isGenerating.value = true
    error.value = null

    try {
      const result = convertRMdToMarp(rmdContent, selectedTemplate.value)
      marpContent.value = result
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to generate MARP slides'
      return ''
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * Checks if a template is currently selected
   */
  const hasSelectedTemplate = computed(() => selectedTemplate.value !== null)

  return {
    templates,
    selectedTemplate,
    isGenerating,
    error,
    marpContent,
    loadRandomTemplates,
    selectTemplate,
    generateMarpSlides,
    hasSelectedTemplate
  }
}