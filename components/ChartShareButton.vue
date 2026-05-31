<template>

  <div v-if="canShare" class="chart-share">

    <VButton

      class="chart-share__btn"

      type="bordered"

      color="secondary"

      rounded

      @click="handleShare"

    >

      {{ buttonLabel }}

    </VButton>

    <span

      class="chart-share__live"

      aria-live="polite"

      aria-atomic="true"

    >

      {{ liveMessage }}

    </span>

  </div>

</template>



<script setup lang="ts">

const { shareUrl, canShare, copyToClipboard, shareNative } = useChartShareUrl();



type FeedbackKind = 'none' | 'copied' | 'shared';



const feedbackKind = ref<FeedbackKind>('none');

let resetTimer: ReturnType<typeof setTimeout> | null = null;



const buttonLabel = computed(() => {

  if (feedbackKind.value === 'copied') return 'Ссылка скопирована';

  if (feedbackKind.value === 'shared') return 'Готово';

  return 'Поделиться';

});



const liveMessage = computed(() => {

  if (feedbackKind.value === 'copied') return 'Ссылка скопирована';

  if (feedbackKind.value === 'shared') return 'Поделились';

  return '';

});



function showFeedback(kind: Exclude<FeedbackKind, 'none'>) {

  feedbackKind.value = kind;

  if (resetTimer) clearTimeout(resetTimer);

  resetTimer = setTimeout(() => {

    feedbackKind.value = 'none';

  }, 2500);

}



async function handleShare() {

  if (!shareUrl.value) return;



  try {

    if (import.meta.client && navigator.share) {

      await shareNative();

      showFeedback('shared');

      return;

    }

  } catch (err) {

    if (err instanceof Error && err.name === 'AbortError') return;

  }



  await copyToClipboard();

  showFeedback('copied');

}



onBeforeUnmount(() => {

  if (resetTimer) clearTimeout(resetTimer);

});

</script>



<style scoped>

@import '~/assets/css/variables.css';



.chart-share {

  display: flex;

  flex-direction: column;

  align-items: center;

}



.chart-share__btn {

  display: flex;

}



.chart-share__live {

  position: absolute;

  width: 1px;

  height: 1px;

  padding: 0;

  margin: -1px;

  overflow: hidden;

  clip: rect(0, 0, 0, 0);

  white-space: nowrap;

  border: 0;

}

</style>


