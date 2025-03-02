export default function scrollLock(isLocked) {
  const lockPage = useScrollLock(document.body);
  lockPage.value = isLocked;

  return {
    lockPage,
  };
}
