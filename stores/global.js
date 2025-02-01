import { defineStore } from 'pinia';

export const globalStore = defineStore('global', {
  state: () => ({ isSwiperLoading: false }),
  actions: {
    swiperLoaded(value) {
      this.isSwiperLoading = value;
    },
  },
});
