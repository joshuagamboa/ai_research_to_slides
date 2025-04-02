import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '~/components/atoms/Button.vue'

describe('Button.vue', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Test Button'
      }
    })
    
    expect(wrapper.text()).toBe('Test Button')
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn-primary')
    expect(wrapper.classes()).not.toContain('btn-block')
    expect(wrapper.classes()).not.toContain('btn-loading')
    expect(wrapper.attributes('disabled')).toBeFalsy()
  })

  it('applies variant class correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'btn-secondary'
      },
      slots: {
        default: 'Secondary Button'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-secondary')
    expect(wrapper.classes()).not.toContain('btn-primary')
  })

  it('applies block class when block prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        block: true
      }
    })
    
    expect(wrapper.classes()).toContain('btn-block')
  })

  it('disables the button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })
    
    expect(wrapper.attributes('disabled')).toBe('')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    })
    
    expect(wrapper.classes()).toContain('btn-loading')
    expect(wrapper.find('.loader').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBe('')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click event when loading', async () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    })
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})