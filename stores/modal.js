import { defineStore } from 'pinia';

export const modalStore = defineStore('modal', {
  state: () => ({ isModalShow: false }),
  actions: {
    openModal(value) {
      this.isModalShow = value;
    },
  },
});
