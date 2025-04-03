import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import TemplatePreview from '~/components/organisms/TemplatePreview.vue'
import Button from '~/components/atoms/Button.vue'

// Create mock Marp composable
const createMockMarp = () => {
  const templates = ref([
    {
      name: 'Template 1',
      theme: 'default',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#0000ff',
      headingFont: 'Arial',
      bodyFont: 'Arial'
    },
    {
      name: 'Template 2',
      theme: 'gaia',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      accentColor: '#ff0000',
      headingFont: 'Helvetica',
      bodyFont: 'Helvetica'
    }
  ]);

  return {
    templates,
    selectedTemplate: ref(null),
    loadRandomTemplates: vi.fn(),
    selectTemplate: vi.fn(),
    generateMarpSlides: vi.fn().mockResolvedValue('# MARP Slides'),
    isGenerating: ref(false),
    error: ref(null)
  }
}

let mockMarp;
let mockTemplates;
let mockSelectedTemplate;
let mockIsGenerating;
let mockLoadRandomTemplates;
let mockGenerateMarpSlides;

// Mock the composables
vi.mock('~/composables/useMarp', () => ({
  useMarp: () => mockMarp
}))

describe('TemplatePreview.vue', () => {
  beforeEach(() => {
    // Create fresh mock for each test
    mockMarp = createMockMarp();
    mockTemplates = mockMarp.templates;
    mockSelectedTemplate = mockMarp.selectedTemplate;
    mockIsGenerating = mockMarp.isGenerating;
    mockLoadRandomTemplates = mockMarp.loadRandomTemplates;
    mockGenerateMarpSlides = mockMarp.generateMarpSlides;
    vi.clearAllMocks();

    // Reset the mock for useMarp
    vi.mock('~/composables/useMarp', () => ({
      useMarp: () => mockMarp
    }))
  })

  it('renders template cards for each template', async () => {
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Presentation Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    const templateCards = wrapper.findAll('[data-testid="template-card"]')
    expect(templateCards).toHaveLength(2)
    expect(templateCards[0].text()).toContain('Template 1')
    expect(templateCards[1].text()).toContain('Template 2')
  })

  it('loads templates on mount', () => {
    mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    expect(mockLoadRandomTemplates).toHaveBeenCalled()
  })

  it('selects a template when template card is clicked', async () => {
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Presentation Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    await wrapper.findAll('[data-testid="template-card"]')[0].trigger('click')
    
    expect(mockMarp.selectTemplate).toHaveBeenCalledWith(0)
  })

  it('generates slides when a template is selected', async () => {
    // Set up a selected template
    mockMarp.selectedTemplate.value = mockMarp.templates.value[0];
    
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    await wrapper.findAll('[data-testid="template-card"]')[0].trigger('click')
    
    expect(mockGenerateMarpSlides).toHaveBeenCalledWith('# Test Outline')
  })

  it('emits slides-generated event when slides are generated', async () => {
    // Set up a selected template
    mockMarp.selectedTemplate.value = mockMarp.templates.value[0];
    
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    await wrapper.findAll('[data-testid="template-card"]')[0].trigger('click')
    
    expect(wrapper.emitted('slides-generated')).toBeTruthy()
    expect(wrapper.emitted('slides-generated')[0][0]).toBe('# MARP Slides')
  })

  it('shows loading state when generating slides', async () => {
    // Set the generating state to true
    mockIsGenerating.value = true;
    
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    expect(wrapper.find('[data-testid="loading-indicator"]').exists()).toBe(true)
  })

  it('shows error message when there is an error', async () => {
    mockMarp.error.value = 'Failed to generate slides';
    
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    expect(wrapper.find('[data-testid="error-message"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="error-message"]').text()).toBe('Failed to generate slides')
  })

  it('applies selected class to the selected template card', async () => {
    const mockTemplates = ref([
      { name: 'Template 1', theme: 'default' },
      { name: 'Template 2', theme: 'gaia' }
    ])
    
    const mockMarp = {
      templates: mockTemplates,
      loadRandomTemplates: vi.fn(),
      selectTemplate: vi.fn(),
      generateMarpSlides: vi.fn(),
      isGenerating: ref(false),
      error: ref(null),
      selectedTemplate: ref(null)
    }
    
    vi.mock('~/composables/useMarp', () => ({
      useMarp: () => mockMarp
    }))
    
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Presentation Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    const templateCard = wrapper.findAll('[data-testid="template-card"]')[0]
    await templateCard.trigger('click')
    
    expect(templateCard.classes()).toContain('selected')
  })

  it('refreshes templates when refresh button is clicked', async () => {
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    // First select a template
    await wrapper.findAll('[data-testid="template-card"]')[0].trigger('click')
    
    // Then click refresh
    await wrapper.findAll('button')[0].trigger('click')
    
    expect(mockLoadRandomTemplates).toHaveBeenCalledTimes(2) // Once on mount, once on refresh
    // Verify selectedIndex is reset
    expect(wrapper.findAll('[data-testid="template-card"]').filter(card => card.classes().includes('selected'))).toHaveLength(0)
  })

  it('emits template-selected event when confirm button is clicked', async () => {
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    // First select a template
    mockSelectedTemplate.value = mockTemplates[0]
    await wrapper.findAll('[data-testid="template-card"]')[0].trigger('click')
    await wrapper.vm.$nextTick()
    
    // Ensure the selectedIndex is set
    const vm = wrapper.vm as any
    vm.selectedIndex = 0
    await wrapper.vm.$nextTick()
    
    // Then click confirm
    const buttons = wrapper.findAll('button')
    await buttons[1].trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.emitted('template-selected')).toBeTruthy()
    expect(wrapper.emitted('template-selected')[0][0]).toEqual(mockTemplates[0])
  })

  it('disables confirm button when no template is selected', () => {
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    const confirmButton = wrapper.findAll('button')[1]
    expect(confirmButton.attributes('disabled')).toBe('')
  })

  it('enables confirm button when a template is selected', async () => {
    const wrapper = mount(TemplatePreview, {
      props: {
        outline: '# Test Outline'
      },
      global: {
        stubs: {
          Button: true
        }
      }
    })
    
    // Select a template
    await wrapper.findAll('[data-testid="template-card"]')[0].trigger('click')
    
    const confirmButton = wrapper.findAll('button')[1]
    expect(confirmButton.attributes('disabled')).toBeFalsy()
  })
})