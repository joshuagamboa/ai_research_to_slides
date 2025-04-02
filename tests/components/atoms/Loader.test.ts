import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Loader from '~/components/atoms/Loader.vue'

describe('Loader.vue', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(Loader)
    
    expect(wrapper.classes()).toContain('loader')
    expect(wrapper.attributes('aria-label')).toBe('Loading')
  })

  it('applies size class when size prop is provided', () => {
    const wrapper = mount(Loader, {
      props: {
        size: 'large'
      }
    })
    
    expect(wrapper.classes()).toContain('loader')
    expect(wrapper.classes()).toContain('loader-large')
  })

  it('applies custom aria-label when label prop is provided', () => {
    const wrapper = mount(Loader, {
      props: {
        label: 'Processing request'
      }
    })
    
    expect(wrapper.attributes('aria-label')).toBe('Processing request')
  })
})