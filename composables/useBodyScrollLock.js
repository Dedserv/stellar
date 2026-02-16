import { useScrollLock } from '@vueuse/core';
import { ref, onMounted } from 'vue';

let lockRef = null;

export function useBodyScrollLock() {
  const ready = ref(false);

  onMounted(() => {
    if (!lockRef) {
      lockRef = useScrollLock(document.body);
    }
    ready.value = true;
  });

  const lock = () => {
    if (ready.value && lockRef) lockRef.value = true;
  };

  const unlock = () => {
    if (ready.value && lockRef) lockRef.value = false;
  };

  return { lock, unlock };
}
