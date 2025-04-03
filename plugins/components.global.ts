import { defineNuxtPlugin } from '#app'
import ResearchForm from '~/components/molecules/ResearchForm.vue'
import TemplatePreview from '~/components/organisms/TemplatePreview.vue'
import Loader from '~/components/atoms/Loader.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('ResearchForm', ResearchForm)
  nuxtApp.vueApp.component('TemplatePreview', TemplatePreview)
  nuxtApp.vueApp.component('Loader', Loader)
})