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

        <ResultSection
          id="portrait"
          title="Портрет"
          subtitle="Кто ты на самом деле"
          icon="user"
          carded
        >
          <p>{{ result.content.portrait }}</p>
        </ResultSection>

        <ResultSection
          v-if="hasPersonalizedElements"
          id="elements"
          title="Стихии"
          subtitle="Баланс твоих энергий"
          icon="crystal"
        >
          <ElementsChart :elements="result.elements" />
        </ResultSection>

        <ResultSection
          v-else
          id="elements-cta"
          title="Стихии"
          subtitle="Баланс твоих энергий"
          icon="crystal"
          carded
        >
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

        <ResultSection
          id="advice"
          title="Космический совет"
          subtitle="Вселенная говорит с тобой"
          icon="star"
        >
          <CosmicAdvice :text="result.content.cosmicAdvice" />
        </ResultSection>

        <!-- Locked: preview teasers -->
        <template v-if="!hasFullAccess">
          <ResultSection
            id="strengths"
            title="Сильные стороны"
            subtitle="Твои главные дары"
            icon="check"
          >
            <div class="preview-grid">
              <ResultPreviewCard
                v-for="(item, index) in strengthPreviews"
                :key="item.title"
                :label="`Дар ${index + 1}`"
                :title="item.title"
                :text="item.text"
                :icon="index === 0 ? 'clock' : 'people'"
                teaser
              />
            </div>
          </ResultSection>

          <ResultSection
            id="love"
            title="Любовь"
            subtitle="Твой язык чувств и привязанности"
            icon="heart"
          >
            <div class="preview-grid">
              <ResultPreviewCard
                label="Язык любви"
                :title="loveLanguageTeaser.title"
                :text="loveLanguageTeaser.text"
                teaser
              />
              <ResultPreviewCard
                label="Совместимость"
                :title="compatibilityTeaser.title"
                :text="compatibilityTeaser.text"
                teaser
              />
            </div>
          </ResultSection>

          <ResultSection
            id="career"
            title="Карьера"
            subtitle="Где твой талант раскроется"
            icon="briefcase"
          >
            <div class="preview-grid">
              <ResultPreviewCard
                label="Призвание"
                :title="careerTeaser.title"
                :text="careerTeaser.text"
                :list="rolePreviewList"
                teaser
              />
              <ResultPreviewCard
                label="Деньги"
                :title="moneyTeaser.title"
                :text="moneyTeaser.text"
                teaser
              />
            </div>
          </ResultSection>

          <ResultSection
            id="self"
            title="Саморазвитие"
            subtitle="Твой путь роста"
            icon="chart"
          >
            <div class="preview-grid">
              <ResultPreviewCard
                label="Утренний ритуал"
                :title="ritualTeaser.title"
                :text="ritualTeaser.text"
                teaser
              />
              <ResultPreviewCard
                label="Вызов на месяц"
                :title="challengeTeaser.title"
                :text="challengeTeaser.text"
                teaser
              />
            </div>
          </ResultSection>

          <PaywallBanner :stubs="paywallStubs" @purchase="handlePurchase" />
        </template>

        <!-- Unlocked: full content -->
        <template v-else>
          <ResultSection
            id="strengths"
            title="Сильные стороны"
            subtitle="Твои главные дары"
            icon="check"
          >
            <div class="result-body-card">
              <StrengthCard
                v-for="item in result.content.strengths"
                :key="item.title"
                :item="item"
              />
            </div>
          </ResultSection>

          <ResultSection
            id="growth"
            title="Зоны роста"
            subtitle="Куда расти дальше"
            icon="growth"
          >
            <GrowthCard
              v-for="item in result.content.growthAreas"
              :key="item.title"
              :item="item"
            />
          </ResultSection>

          <ResultSection
            id="love"
            title="Любовь"
            subtitle="Твой язык чувств и привязанности"
            icon="heart"
          >
            <div class="result-body-card">
              <p>{{ result.content.love }}</p>
              <ResultSubheading title="Язык любви" />
              <p>{{ result.content.loveLanguage }}</p>
            </div>
            <CompatibilityCards :items="result.content.compatibility" />
            <ResultCallout variant="warning" :text="result.content.loveWarning" />
          </ResultSection>

          <ResultSection
            id="career"
            title="Карьера"
            subtitle="Где твой талант раскроется"
            icon="briefcase"
          >
            <div class="result-body-card">
              <p>{{ result.content.career }}</p>
              <ResultSubheading title="Стиль работы" />
              <p>{{ result.content.workStyle }}</p>
            </div>
            <RolesGrid :roles="result.content.idealRoles" />
            <ResultCallout variant="money" :text="result.content.moneyMindset" />
          </ResultSection>

          <ResultSection
            id="self"
            title="Саморазвитие"
            subtitle="Твой путь роста"
            icon="chart"
          >
            <div class="result-body-card">
              <p>{{ result.content.selfDevelopment }}</p>
            </div>
            <ResultCallout variant="ritual" :text="result.content.morningRitual" />
            <ResultCallout variant="challenge" :text="result.content.monthlyChallenge" />
            <ResultCallout variant="practice">
              <span v-html="formatPracticeText(result.content.recommendedPractice)" />
            </ResultCallout>
          </ResultSection>

          <ResultSection
            id="conflicts"
            title="Конфликты и триггеры"
            subtitle="Что выводит из равновесия"
            icon="zap"
            carded
          >
            <ResultSubheading title="Что выводит из себя" />
            <p>{{ result.content.conflictTriggers }}</p>
            <ResultSubheading title="Как ты конфликтуешь" />
            <p>{{ result.content.conflictStyle }}</p>
          </ResultSection>

          <ResultSection
            id="friendship"
            title="Типология дружбы"
            subtitle="Как ты дружишь"
            icon="people"
            carded
          >
            <ResultSubheading title="Какой ты друг" />
            <p>{{ result.content.friendshipStyle }}</p>
            <ResultSubheading title="С кем легко" />
            <p>{{ result.content.friendshipMatches }}</p>
            <ResultSubheading title="С кем искрит" />
            <p>{{ result.content.friendshipClashes }}</p>
          </ResultSection>

          <ResultSection
            id="decisions"
            title="Стиль принятия решений"
            subtitle="Как ты выбираешь"
            icon="compass"
            carded
          >
            <p v-if="decisionStyleParts.main">{{ decisionStyleParts.main }}</p>
            <ResultCallout
              v-if="decisionStyleParts.rule"
              variant="rule"
              :text="decisionStyleParts.rule"
            />
          </ResultSection>
        </template>

        <ResultSection
          id="share"
          class="share-section"
          title="Поделиться"
          subtitle="Расскажи о своём архетипе миру"
          icon="share"
        >
          <div class="share-section__panel">
            <img
              v-if="previewUrl"
              :src="previewUrl"
              class="share-section__preview"
              :alt="`Карточка архетипа ${result.archetype}`"
              width="320"
              height="320"
            />
            <div class="share-section__aside">
              <p class="share-section__quote">«{{ result.content.cosmicAdvice }}»</p>
              <p class="share-section__hint">
                {{
                  hasPersonalizedElements
                    ? 'Отправь подруге — сравните баланс стихий'
                    : 'Пройди тест и получи свой личный радар стихий'
                }}
              </p>
              <ChartShareButton
                :label="shareLabel"
                :live-message="shareLiveMessage"
                @share="onShare"
              />
            </div>
          </div>
        </ResultSection>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { PersonalityTestResponse } from '~/types/personality';
  import type { NavChipItem } from '~/components/shared/NavChips.vue';
  import type { PaywallStub } from '~/components/personality/PaywallBanner.vue';
  import { extractHook, splitTeaser, teaserBody, truncateText } from '~/utils/previewTeaser';

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

  const strengthPreviews = computed(() =>
    (result.value?.content.strengths ?? []).slice(0, 2).map((item) => ({
      title: item.title,
      text: truncateText(item.description, 140),
    }))
  );

  const loveLanguageTeaser = computed(() =>
    splitTeaser(result.value?.content.loveLanguage ?? '', 48, 120)
  );

  const compatibilityTeaser = computed(() => {
    const first = result.value?.content.compatibility?.[0];
    if (!first) {
      return { title: 'Совместимость', text: 'Раскроется в полном портрете.' };
    }
    return {
      title: first.archetype,
      text: truncateText(first.why, 120),
    };
  });

  const careerTeaser = computed(() => {
    const content = result.value?.content;
    if (!content) return { title: '', text: '' };
    const role = content.idealRoles[0];
    if (role) {
      return {
        title: role.role,
        text: truncateText(role.why || content.career, 120),
      };
    }
    return splitTeaser(content.career, 48, 120);
  });

  const rolePreviewList = computed(() =>
    (result.value?.content.idealRoles ?? []).slice(0, 3).map((role) => role.role)
  );

  const moneyTeaser = computed(() =>
    splitTeaser(result.value?.content.moneyMindset ?? '', 48, 110)
  );

  const ritualTeaser = computed(() =>
    splitTeaser(result.value?.content.morningRitual ?? '', 48, 110)
  );

  const challengeTeaser = computed(() =>
    splitTeaser(result.value?.content.monthlyChallenge ?? '', 48, 110)
  );

  const paywallStubs = computed<PaywallStub[]>(() => {
    const content = result.value?.content;
    if (!content) return [];

    const growth = content.growthAreas[0];
    const conflictHook = extractHook(content.conflictTriggers, 42);
    const friendshipHook = extractHook(content.friendshipStyle, 42);

    return [
      {
        label: 'Зоны роста',
        title: growth?.title ?? 'Зоны роста',
        desc: truncateText(growth?.description ?? '', 80),
      },
      {
        label: 'Конфликты',
        title: conflictHook || 'Конфликты',
        desc: teaserBody(content.conflictTriggers, conflictHook, 80),
      },
      {
        label: 'Дружба',
        title: friendshipHook || 'Дружба',
        desc: teaserBody(content.friendshipStyle, friendshipHook, 80),
      },
    ];
  });

  const sectionChips = computed<NavChipItem[]>(() => {
    const chips: NavChipItem[] = [{ id: 'portrait', label: 'Портрет' }];

    chips.push({
      id: hasPersonalizedElements.value ? 'elements' : 'elements-cta',
      label: 'Стихии',
    });

    chips.push({ id: 'advice', label: 'Совет' });
    chips.push({ id: 'strengths', label: 'Сильные стороны' });

    if (hasFullAccess.value) {
      // Order must match DOM: strengths → growth → love → career → self → …
      chips.push(
        { id: 'growth', label: 'Рост' },
        { id: 'love', label: 'Любовь' },
        { id: 'career', label: 'Карьера' },
        { id: 'self', label: 'Развитие' },
        { id: 'conflicts', label: 'Конфликты' },
        { id: 'friendship', label: 'Дружба' },
        { id: 'decisions', label: 'Решения' }
      );
    } else {
      chips.push(
        { id: 'love', label: 'Любовь' },
        { id: 'career', label: 'Карьера' },
        { id: 'self', label: 'Развитие' },
        { id: 'paywall', label: 'Полный портрет', paid: true }
      );
    }

    chips.push({ id: 'share', label: 'Поделиться' });
    return chips;
  });

  const isContentReady = computed(() => !pending.value && !!result.value);
  const contentRef = ref<HTMLElement | null>(null);

  const { activeId, scrollToSection } = useSectionNav(sectionChips, {
    offset: 134,
    ready: isContentReady,
  });

  const {
    buttonLabel: shareLabel,
    liveMessage: shareLiveMessage,
    previewUrl,
    shareResult,
    buildPreviewUrl,
  } = useShareCard();

  useResultReveal(contentRef, isContentReady, { watchRefs: [hasFullAccess] });

  watch(
    result,
    (value) => {
      if (value) buildPreviewUrl(value);
    },
    { immediate: true }
  );

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

  const canonicalResultUrl = computed((): string => {
    const siteUrl = config.public.NUXT_SITE_URL;
    const origin =
      typeof siteUrl === 'string' && siteUrl ? siteUrl : 'https://www.stellara.ru';
    const id = route.query.archetypeId;
    if (typeof id !== 'string' || !id) return origin;
    return `${origin}/personality-result?archetypeId=${encodeURIComponent(id)}`;
  });

  useSeoMeta({
    title: () =>
      result.value
        ? `${result.value.archetype} — ваш архетип | Stellara`
        : 'Результат теста | Stellara',
    description: () => result.value?.content.portrait ?? 'Астрологический тест личности Stellara',
    ogTitle: () => result.value?.archetype ?? undefined,
    ogDescription: () => result.value?.content.cosmicAdvice ?? undefined,
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
    padding: 0 1.2rem 4.8rem;

    @mixin desktop {
      padding: 0 0 4.8rem;
    }
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

  .preview-grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: 1fr;

    @mixin tablet {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .result-body-card {
    margin-bottom: 1.6rem;
    padding: 1.6rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: $lightGrayOrange;
    font-size: 1.6rem;
    line-height: 1.5;
  }

  .result-body-card :deep(p) {
    margin: 0;
  }

  .result-body-card :deep(p + p) {
    margin-top: 1.2rem;
  }


  .share-section__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    max-width: 64rem;
    margin: 0 auto;

    @mixin tablet {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 2.4rem;
    }
  }

  .share-section__preview {
    flex-shrink: 0;
    width: 100%;
    max-width: 32rem;
    height: auto;
    border-radius: 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.25),
      0 0 40px rgba(233, 168, 124, 0.06);
  }

  .share-section__aside {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    width: 100%;
    max-width: 32rem;
    text-align: center;

    @mixin tablet {
      align-items: flex-start;
      text-align: left;
    }
  }

  .share-section__quote {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 300;
    font-style: italic;
    line-height: 1.45;
    color: $lightGrayOrange;
  }

  .share-section__hint {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.4;
    color: $gray;
  }
</style>
