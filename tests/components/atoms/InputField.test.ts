import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputField from '~/components/atoms/InputField.vue'

describe('InputField.vue', () => {
  it('renders properly with default props', () => {
    const wrapper = mount(InputField)
    
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('label').exists()).toBe(false)
    expect(wrapper.find('.input-error').exists()).toBe(false)
    expect(wrapper.find('.input-help').exists()).toBe(false)
  })

  it('renders label when label prop is provided', () => {
    const wrapper = mount(InputField, {
      props: {
        label: 'Test Label',
        id: 'test-input'
      }
    })
    
    const label = wrapper.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Test Label')
    expect(label.attributes('for')).toBe('test-input')
  })

  it('binds input attributes correctly', () => {
    const wrapper = mount(InputField, {
      props: {
        id: 'test-input',
        type: 'email',
        placeholder: 'Enter email',
        disabled: true,
        required: true,
        modelValue: 'test@example.com'
      }
    })
    
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('test-input')
    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('placeholder')).toBe('Enter email')
    expect(input.attributes('disabled')).toBe('')
    expect(input.attributes('required')).toBe('')
    expect(input.element.value).toBe('test@example.com')
  })

  it('displays error message when error prop is provided', () => {
    const wrapper = mount(InputField, {
      props: {
        error: 'This field is required'
      }
    })
    
    const errorMessage = wrapper.find('.input-error')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toBe('This field is required')
  })

  it('displays help text when helpText prop is provided', () => {
    const wrapper = mount(InputField, {
      props: {
        helpText: 'Enter your email address'
      }
    })
    
    const helpText = wrapper.find('.input-help')
    expect(helpText.exists()).toBe(true)
    expect(helpText.text()).toBe('Enter your email address')
  })

  it('emits update:modelValue event when input value changes', async () => {
    const wrapper = mount(InputField)
    
    const input = wrapper.find('input')
    await input.setValue('new value')
    
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['new value'])
  })
})