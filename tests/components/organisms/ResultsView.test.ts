import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsView from '~/components/organisms/ResultsView.vue'

// Mock the child components
vi.mock('~/components/molecules/ResultCard.vue', () => ({
  default: {
    name: 'ResultCard',
    props: ['result'],
    template: '<div class="mock-result-card" data-testid="result-card" @click="$emit(\'view-details\', result)">{{ result.topic }}</div>'
  }
}))

describe('ResultsView.vue', () => {
  const mockResults = [
    {
      topic: 'Topic 1',
      subtopics: ['Subtopic 1'],
      content: 'Content 1',
      timestamp: '2023-01-01T12:00:00Z'
    },
    {
      topic: 'Topic 2',
      subtopics: ['Subtopic 2'],
      content: 'Content 2',
      timestamp: '2023-01-02T12:00:00Z'
    }
  ]

  it('renders no results message when results array is empty', () => {
    const wrapper = mount(ResultsView, {
      props: {
        results: []
      }
    })
    
    expect(wrapper.find('[data-testid="no-results"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="result-card"]')).toHaveLength(0)
  })

  it('renders result cards for each result', () => {
    const wrapper = mount(ResultsView, {
      props: {
        results: mockResults
      }
    })
    
    const resultCards = wrapper.findAll('[data-testid="result-card"]')
    expect(resultCards).toHaveLength(2)
    expect(resultCards[0].text()).toContain('Topic 1')
    expect(resultCards[1].text()).toContain('Topic 2')
  })

  it('emits select-result event when a result card emits view-details', async () => {
    const wrapper = mount(ResultsView, {
      props: {
        results: mockResults
      }
    })
    
    // Trigger the view-details event on the first result card
    await wrapper.findAll('[data-testid="result-card"]')[0].vm.$emit('view-details', mockResults[0])
    
    expect(wrapper.emitted('select-result')).toBeTruthy()
    expect(wrapper.emitted('select-result')[0][0]).toEqual(mockResults[0])
  })

  it('applies sorting to results', async () => {
    const wrapper = mount(ResultsView, {
      props: {
        results: mockResults,
        sortBy: 'timestamp',
        sortDirection: 'desc'
      }
    })
    
    const resultCards = wrapper.findAll('[data-testid="result-card"]')
    
    // With descending sort by timestamp, Topic 2 should be first
    expect(resultCards[0].text()).toContain('Topic 2')
    expect(resultCards[1].text()).toContain('Topic 1')
    
    // Change sort direction
    await wrapper.setProps({ sortDirection: 'asc' })
    
    const updatedResultCards = wrapper.findAll('[data-testid="result-card"]')
    
    // With ascending sort, Topic 1 should be first
    expect(updatedResultCards[0].text()).toContain('Topic 1')
    expect(updatedResultCards[1].text()).toContain('Topic 2')
  })

  it('applies filtering to results', async () => {
    const wrapper = mount(ResultsView, {
      props: {
        results: mockResults,
        filterText: 'Topic 1'
      }
    })
    
    const resultCards = wrapper.findAll('[data-testid="result-card"]')
    expect(resultCards).toHaveLength(1)
    expect(resultCards[0].text()).toContain('Topic 1')
    
    // Change filter
    await wrapper.setProps({ filterText: 'Topic 2' })
    
    const updatedResultCards = wrapper.findAll('[data-testid="result-card"]')
    expect(updatedResultCards).toHaveLength(1)
    expect(updatedResultCards[0].text()).toContain('Topic 2')
    
    // Clear filter
    await wrapper.setProps({ filterText: '' })
    
    const allResultCards = wrapper.findAll('[data-testid="result-card"]')
    expect(allResultCards).toHaveLength(2)
  })

  it('renders research results when available', () => {
    const wrapper = mount(ResultsView, {
      props: {
        researchResults: '# Research Results\n\nSome content'
      }
    })
    
    expect(wrapper.find('.research-section').exists()).toBe(true)
    expect(wrapper.find('.research-content').exists()).toBe(true)
  })

  it('renders presentation outline when available', () => {
    const wrapper = mount(ResultsView, {
      props: {
        presentationOutline: '# Presentation Outline'
      }
    })
    
    expect(wrapper.find('.presentation-section').exists()).toBe(true)
    expect(wrapper.find('.outline-content').text()).toBe('# Presentation Outline')
  })

  it('shows template selector when Generate Slides button is clicked', async () => {
    const wrapper = mount(ResultsView, {
      props: {
        presentationOutline: '# Presentation Outline'
      }
    })
    
    await wrapper.find('button:nth-child(2)').trigger('click')
    
    expect(wrapper.findComponent({ name: 'TemplatePreview' }).exists()).toBe(true)
  })

  it('calls downloadOutline when Download button is clicked', async () => {
    // Mock the necessary DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:url')
    global.URL.revokeObjectURL = vi.fn()
    
    const clickMock = vi.fn()
    const linkElement = {
      href: '',
      download: '',
      click: clickMock,
      style: {}
    }
    
    // Mock document.createElement and its methods
    const createElement = document.createElement.bind(document)
    document.createElement = vi.fn().mockImplementation((tag) => {
      if (tag === 'a') return linkElement
      return createElement(tag)
    })
    
    // Create a mock body element
    const mockAppendChild = vi.fn()
    const mockRemoveChild = vi.fn()
    document.body.appendChild = mockAppendChild
    document.body.removeChild = mockRemoveChild
    
    const wrapper = mount(ResultsView, {
      props: {
        presentationOutline: '# Presentation Outline'
      }
    })
    
    await wrapper.find('button:nth-child(1)').trigger('click')
    
    expect(global.URL.createObjectURL).toHaveBeenCalled()
    expect(mockAppendChild).toHaveBeenCalledWith(linkElement)
    expect(clickMock).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalledWith(linkElement)
    expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    
    // Restore original createElement
    document.createElement = createElement
  })
})