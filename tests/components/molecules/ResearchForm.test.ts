import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ResearchForm from '~/components/molecules/ResearchForm.vue'

import { ref } from 'vue'

// Mock the composables
const mockResearch = {
  conductResearch: vi.fn().mockResolvedValue(undefined),
  isLoading: ref(false),
  error: ref(null)
}

vi.mock('~/composables/useResearch', () => ({
  useResearch: () => mockResearch
}))

describe('ResearchForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ResearchForm)
  })

  it('renders the form with topic input and subtopic inputs', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('[data-test="topic-input"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="add-subtopic"]').exists()).toBe(true)
  })

  it('adds a new subtopic input when add button is clicked', async () => {
    const initialSubtopicCount = wrapper.findAll('[data-test="subtopic-input"]').length
    
    await wrapper.find('[data-test="add-subtopic"]').trigger('click')
    
    const newSubtopicCount = wrapper.findAll('[data-test="subtopic-input"]').length
    expect(newSubtopicCount).toBe(initialSubtopicCount + 1)
  })

  it('removes a subtopic input when remove button is clicked', async () => {
    // First add a subtopic
    await wrapper.find('[data-test="add-subtopic"]').trigger('click')
    const initialSubtopicCount = wrapper.findAll('[data-test="subtopic-input"]').length
    
    // Then remove it
    await wrapper.find('[data-test="remove-subtopic"]').trigger('click')
    
    const newSubtopicCount = wrapper.findAll('[data-test="subtopic-input"]').length
    expect(newSubtopicCount).toBe(initialSubtopicCount - 1)
  })

  it('validates form before submission', async () => {
    // Submit with empty topic
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check for validation error in topic input
    const topicInput = wrapper.findComponent('[data-test="topic-input"]')
    expect(topicInput.props('error')).toBeTruthy()
  })

  it('submits the form with valid data', async () => {
    // Set form values using component refs
    const topicInput = wrapper.findComponent('[data-test="topic-input"]')
    await topicInput.vm.$emit('update:modelValue', 'Test Topic')
    
    const subtopicInput = wrapper.findComponent('[data-test="subtopic-input"]')
    await subtopicInput.vm.$emit('update:modelValue', 'Test Subtopic')
    
    // Submit form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Check that conductResearch was called with correct parameters
    expect(mockResearch.conductResearch).toHaveBeenCalledWith('Test Topic', ['Test Subtopic'])
    expect(wrapper.emitted('research-complete')).toBeTruthy()
  })

  it('shows loading state when isLoading is true', async () => {
    mockResearch.isLoading.value = true
    const wrapper = mount(ResearchForm)
    expect(wrapper.find('[data-test="submit-button"]').text()).toContain('Researching')
    mockResearch.isLoading.value = false
  })
})