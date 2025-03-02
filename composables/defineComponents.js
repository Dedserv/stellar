import { defineAsyncComponent } from 'vue';

const components = {
  VCard: defineAsyncComponent(() => import('@/components/ui/VCard.vue')),
  VCheckbox: defineAsyncComponent(() => import('@/components/ui/VCheckbox.vue')),
  SelectInput: defineAsyncComponent(() => import('@/components/ui/SelectInput.vue')),
  VueSelect: defineAsyncComponent(() => import('vue3-select-component')),
};

export default components;
