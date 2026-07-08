<template>

  <div class="personality-result page">

    <div v-if="pending" class="container">

      <ChartSkeleton :progress="50" />

    </div>



    <template v-else-if="result">

      <NavChips

        :chips="sectionChips"

        :active-section="activeId"

        aria-label="Навигация по результату"

        @navigate="scrollToSection"

      />



      <div ref="contentRef" class="container personality-result__content">

        <ArchetypeHero

          :result="result"

          :formatted-birth-date="formattedBirthDate"

          :share-label="shareLabel"

          :share-live-message="shareLiveMessage"

          @share="onShare"

        />



        <ResultSection id="portrait" title="✨ Портрет">

          <p>{{ result.content.portrait }}</p>

        </ResultSection>



        <ResultSection v-if="hasPersonalizedElements" id="elements" title="🌌 Стихии">

          <ElementsChart :elements="result.elements" />

        </ResultSection>



        <ResultSection v-else id="elements-cta" title="🌌 Стихии">

          <p class="personality-result__cta-text">

            Персональная шкала стихий доступна после прохождения теста с датой рождения.

          </p>

          <VButton

            class="personality-result__cta-button layout-upper"

            type="bordered"

            color="secondary"

            rounded

            @click="navigateTo('/personality-test')"

          >

            Пройти тест

          </VButton>

        </ResultSection>



        <ResultSection id="advice" title="💫 Космический совет">

          <p class="personality-result__advice">{{ result.content.cosmicAdvice }}</p>

        </ResultSection>



        <PaywallBanner v-if="!hasFullAccess" @purchase="handlePurchase" />



        <ResultSection v-if="hasFullAccess" id="strengths" title="💪 Сильные стороны">

          <StrengthCard

            v-for="item in result.content.strengths"

            :key="item.title"

            :item="item"

          />

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="growth" title="🌱 Зоны роста">

          <GrowthCard

            v-for="item in result.content.growthAreas"

            :key="item.title"

            :item="item"

          />

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="love" title="❤️ Любовь">

          <p>{{ result.content.love }}</p>



          <ResultSubheading title="Язык любви" />

          <p>{{ result.content.loveLanguage }}</p>



          <CompatibilityCards :items="result.content.compatibility" />



          <ResultCallout variant="warning" :text="result.content.loveWarning" />

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="career" title="💼 Карьера">

          <p>{{ result.content.career }}</p>



          <RolesGrid :roles="result.content.idealRoles" />



          <ResultSubheading title="Стиль работы" />

          <p>{{ result.content.workStyle }}</p>



          <ResultCallout variant="money" :text="result.content.moneyMindset" />

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="self" title="🧘 Саморазвитие">

          <p>{{ result.content.selfDevelopment }}</p>



          <ResultCallout variant="ritual" :text="result.content.morningRitual" />

          <ResultCallout variant="challenge" :text="result.content.monthlyChallenge" />

          <ResultCallout variant="practice">

            <span v-html="formatPracticeText(result.content.recommendedPractice)" />

          </ResultCallout>

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="conflicts" title="⚡ Конфликты и триггеры">

          <ResultSubheading title="Что выводит из себя" />

          <p>{{ result.content.conflictTriggers }}</p>



          <ResultSubheading title="Как ты конфликтуешь" />

          <p>{{ result.content.conflictStyle }}</p>

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="friendship" title="👯 Типология дружбы">

          <ResultSubheading title="Какой ты друг" />

          <p>{{ result.content.friendshipStyle }}</p>



          <ResultSubheading title="С кем легко" />

          <p>{{ result.content.friendshipMatches }}</p>



          <ResultSubheading title="С кем искрит" />

          <p>{{ result.content.friendshipClashes }}</p>

        </ResultSection>



        <ResultSection v-if="hasFullAccess" id="decisions" title="🧭 Стиль принятия решений">

          <p v-if="decisionStyleParts.main">{{ decisionStyleParts.main }}</p>

          <ResultCallout

            v-if="decisionStyleParts.rule"

            variant="rule"

            :text="decisionStyleParts.rule"

          />

        </ResultSection>

      </div>

    </template>

  </div>

</template>



<script setup lang="ts">

  import type { PersonalityTestResponse } from '~/types/personality';



  const PERSONALITY_RESULT_KEY = 'stellara:personality-result';

  const route = useRoute();

  const router = useRouter();

  const config = useRuntimeConfig();



  const archetypeId = computed(() => {

    const id = route.query.archetypeId;

    return typeof id === 'string' ? id : '';

  });



  function readSessionResult(id: string): PersonalityTestResponse | null {

    if (!import.meta.client) return null;



    try {

      const cached = sessionStorage.getItem(PERSONALITY_RESULT_KEY);

      if (!cached) return null;



      const parsed = JSON.parse(cached) as PersonalityTestResponse;

      return parsed.archetypeId === id ? parsed : null;

    } catch {

      return null;

    }

  }



  async function fetchSharedResult(id: string): Promise<PersonalityTestResponse | null> {

    try {

      const content = await $fetch<{

        archetypeId: string;

        archetype: string;

        zodiacSign: string;

        element: string;

        modality: string;

        content: PersonalityTestResponse['content'];

      }>(`/api/personality-result?archetypeId=${encodeURIComponent(id)}`);



      return {

        archetypeId: content.archetypeId,

        archetype: content.archetype,

        zodiacSign: content.zodiacSign,

        birthDate: '',

        element: { name: content.element, score: 0 },

        modality: content.modality,

        elements: { fire: 0, earth: 0, air: 0, water: 0 },

        content: content.content,

      };

    } catch {

      return null;

    }

  }



  async function resolveResult(id: string): Promise<PersonalityTestResponse | null> {

    if (!id) return null;

    return readSessionResult(id) ?? fetchSharedResult(id);

  }



  const { data: result, pending } = await useAsyncData(

    `personality-result-${archetypeId.value}`,

    () => resolveResult(archetypeId.value),

    { watch: [archetypeId] }

  );



  if (!archetypeId.value) {

    await navigateTo('/', { replace: true });

  } else if (!pending.value && !result.value) {

    await navigateTo('/', { replace: true });

  }



  onMounted(() => {

    nextTick(() => {

      document.querySelector('.page')?.classList.remove('scroll-lock');

    });



    const id = archetypeId.value;

    if (!id) return;



    const sessionResult = readSessionResult(id);

    if (sessionResult) {

      result.value = sessionResult;

    } else if (!pending.value && !result.value) {

      router.replace('/');

    }

  });



  const hasPersonalizedElements = computed(() => {

    if (!result.value?.birthDate) return false;

    const { fire, earth, air, water } = result.value.elements;

    return fire + earth + air + water > 0;

  });



  const { hasFullAccess, handlePurchase } = useAccess();

  watch(archetypeId, () => {
    hasFullAccess.value = false;
  });



  const decisionStyleParts = computed(() => {

    const text = result.value?.content.decisionStyle ?? '';

    const marker = 'Правило:';

    const index = text.indexOf(marker);



    if (index === -1) {

      return { main: text, rule: '' };

    }



    return {

      main: text.slice(0, index).trim(),

      rule: text.slice(index + marker.length).trim(),

    };

  });



  function formatPracticeText(text: string): string {

    return text.replace(

      /(https?:\/\/[^\s]+)/g,

      '<a href="$1" target="_blank" rel="noopener noreferrer" class="personality-result__link">$1</a>'

    );

  }



  const sectionChips = computed(() => {

    const chips = [{ id: 'portrait', label: 'Портрет' }];

    if (hasPersonalizedElements.value) {

      chips.push({ id: 'elements', label: 'Стихии' });

    } else {

      chips.push({ id: 'elements-cta', label: 'Стихии' });

    }

    chips.push({ id: 'advice', label: 'Совет' });



    if (hasFullAccess.value) {

      chips.push(

        { id: 'strengths', label: 'Сильные стороны' },

        { id: 'growth', label: 'Рост' },

        { id: 'love', label: 'Любовь' },

        { id: 'career', label: 'Карьера' },

        { id: 'self', label: 'Развитие' },

        { id: 'conflicts', label: 'Конфликты' },

        { id: 'friendship', label: 'Дружба' },

        { id: 'decisions', label: 'Решения' }

      );

    }



    return chips;

  });



  const isContentReady = computed(() => !pending.value && !!result.value);

  const contentRef = ref<HTMLElement | null>(null);



  const { activeId, scrollToSection } = useSectionNav(sectionChips, {

    offset: 134,

    ready: isContentReady,

  });

  const { buttonLabel: shareLabel, liveMessage: shareLiveMessage, shareResult } = useShareCard();



  useResultReveal(contentRef, isContentReady, { watchRefs: [hasFullAccess] });



  const formattedBirthDate = computed(() => {

    if (!result.value?.birthDate) return '';

    const [year, month, day] = result.value.birthDate.split('-');

    const months = [

      'января',

      'февраля',

      'марта',

      'апреля',

      'мая',

      'июня',

      'июля',

      'августа',

      'сентября',

      'октября',

      'ноября',

      'декабря',

    ];

    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;

  });



  const canonicalResultUrl = computed(() => {

    const origin = config.public.NUXT_SITE_URL || 'https://www.stellara.ru';

    const archetypeId = route.query.archetypeId;

    if (typeof archetypeId !== 'string' || !archetypeId) return origin;

    return `${origin}/personality-result?archetypeId=${encodeURIComponent(archetypeId)}`;

  });



  useSeoMeta({

    title: () =>

      result.value

        ? `${result.value.archetype} — ваш архетип | Stellara`

        : 'Результат теста | Stellara',

    description: () => result.value?.content.portrait ?? 'Астрологический тест личности Stellara',

    ogTitle: () => result.value?.archetype,

    ogDescription: () => result.value?.content.cosmicAdvice,

    ogUrl: () => canonicalResultUrl.value,

  });



  async function onShare() {

    if (result.value) {

      await shareResult(result.value);

    }

  }

</script>



<style scoped>

  @import '~/assets/css/variables.css';



  .personality-result__content {

    padding-bottom: 4.8rem;

    padding: 0 1.2rem;



    @mixin desktop {

      padding: 0;

    }

  }



  .personality-result__advice {

    margin: 0;

    font-size: 1.6rem;

    color: $lightGrayOrange;

  }



  .personality-result__cta-text {

    margin: 0 0 1.6rem;

    color: $gray;

    line-height: 1.5;

  }



  .personality-result__cta-button {

    display: inline-flex;

  }



  .personality-result__content :deep(.personality-result__link) {

    color: $softOrange;

    text-decoration: underline;

  }

</style>

