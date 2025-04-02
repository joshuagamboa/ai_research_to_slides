import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultCard from '~/components/molecules/ResultCard.vue'

// Mock the renderMarkdown utility
vi.mock('~/utils/markdown', () => ({
  renderMarkdown: (content) => `<div>${content}</div>`,
  extractTitle: () => 'Test Title',
  createSummary: () => 'Test summary...',
}))

describe('ResultCard.vue', () => {
  const mockResult = {
    topic: 'Test Topic',
    subtopics: ['Subtopic 1', 'Subtopic 2'],
    content: '# Test Content\n\nThis is test content.',
    timestamp: '2023-01-01T12:00:00Z'
  }

  it('renders the result card with correct data', () => {
    const wrapper = mount(ResultCard, {
      props: {
        result: mockResult
      }
    })
    
    expect(wrapper.find('.card-title').text()).toContain('Test Title')
    expect(wrapper.find('.card-summary').exists()).toBe(true)
    expect(wrapper.find('.card-meta').text()).toContain('Test Topic')
    expect(wrapper.find('.card-date').exists()).toBe(true)
  })

  it('displays subtopics when available', () => {
    const wrapper = mount(ResultCard, {
      props: {
        result: mockResult
      }
    })
    
    const subtopics = wrapper.findAll('.subtopic-tag')
    expect(subtopics.length).toBe(2)
    expect(subtopics[0].text()).toBe('Subtopic 1')
    expect(subtopics[1].text()).toBe('Subtopic 2')
  })

  it('does not display subtopics section when no subtopics', () => {
    const resultWithoutSubtopics = {
      ...mockResult,
      subtopics: []
    }
    
    const wrapper = mount(ResultCard, {
      props: {
        result: resultWithoutSubtopics
      }
    })
    
    expect(wrapper.find('.subtopics-container').exists()).toBe(false)
  })

  it('emits view-details event when view button is clicked', async () => {
    const wrapper = mount(ResultCard, {
      props: {
        result: mockResult
      }
    })
    
    await wrapper.find('[data-test="view-details"]').trigger('click')
    
    expect(wrapper.emitted('view-details')).toBeTruthy()
    expect(wrapper.emitted('view-details')[0][0]).toEqual(mockResult)
  })

  it('formats the date correctly', () => {
    const wrapper = mount(ResultCard, {
      props: {
        result: mockResult
      }
    })
    
    // Check that the date is formatted (this will depend on your implementation)
    expect(wrapper.find('.card-date').text()).not.toBe('')
    expect(wrapper.find('.card-date').text()).not.toBe('2023-01-01T12:00:00Z')
  })
})