import { defineStore } from 'pinia';

export const modalStore = defineStore('modal', {
  state: () => ({ isModalShow: true }),
  actions: {
    openModal() {
      this.isModalShow = true;
    },

    closeModal() {
      this.isModalShow = false;
    },
  },
});
