import { defineStore } from 'pinia';

export const modalStore = defineStore('modal', {
  state: () => ({ isModalShow: true }),
  actions: {
    openModal(value) {
      this.isModalShow = value;
    },
  },
});
