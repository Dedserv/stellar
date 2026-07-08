export function useAccess() {
  const hasFullAccess = ref(false);

  function handlePurchase() {
    hasFullAccess.value = true;
  }

  return {
    hasFullAccess,
    handlePurchase,
  };
}
