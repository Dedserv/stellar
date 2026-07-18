<template>
  <div class="quiz-birth">
    <div class="quiz-birth__fields">
      <label class="quiz-birth__field">
        <span class="quiz-birth__label">День</span>
        <select
          class="quiz-birth__select"
          :value="birthDate.day ?? ''"
          @change="onChange('day', $event)"
        >
          <option value="" disabled>День</option>
          <option v-for="day in availableDays" :key="day" :value="day">{{ day }}</option>
        </select>
      </label>
      <label class="quiz-birth__field">
        <span class="quiz-birth__label">Месяц</span>
        <select
          class="quiz-birth__select"
          :value="birthDate.month ?? ''"
          @change="onChange('month', $event)"
        >
          <option value="" disabled>Месяц</option>
          <option v-for="month in months" :key="month.value" :value="month.value">
            {{ month.label }}
          </option>
        </select>
      </label>
      <label class="quiz-birth__field">
        <span class="quiz-birth__label">Год</span>
        <select
          class="quiz-birth__select"
          :value="birthDate.year ?? ''"
          @change="onChange('year', $event)"
        >
          <option value="" disabled>Год</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { BirthDateFields } from '~/stores/personalityQuiz';
  import { getBirthYearOptions, getDaysInMonth } from '~/composables/useBirthDate';

  const props = defineProps<{
    birthDate: BirthDateFields;
  }>();

  const emit = defineEmits<{
    update: [field: keyof BirthDateFields, value: number | null];
  }>();

  const months = [
    { label: 'Январь', value: 1 },
    { label: 'Февраль', value: 2 },
    { label: 'Март', value: 3 },
    { label: 'Апрель', value: 4 },
    { label: 'Май', value: 5 },
    { label: 'Июнь', value: 6 },
    { label: 'Июль', value: 7 },
    { label: 'Август', value: 8 },
    { label: 'Сентябрь', value: 9 },
    { label: 'Октябрь', value: 10 },
    { label: 'Ноябрь', value: 11 },
    { label: 'Декабрь', value: 12 },
  ];

  const years = getBirthYearOptions();

  const availableDays = computed(() => {
    const month = props.birthDate.month ?? 1;
    const year = props.birthDate.year ?? new Date().getFullYear();
    const count = getDaysInMonth(month, year);
    return Array.from({ length: count }, (_, index) => index + 1);
  });

  function onChange(field: keyof BirthDateFields, event: Event) {
    const raw = (event.target as HTMLSelectElement).value;
    const value = raw === '' ? null : Number(raw);
    emit('update', field, Number.isNaN(value as number) ? null : value);

    if (field !== 'day' && props.birthDate.day) {
      const month = field === 'month' ? (value as number) : props.birthDate.month;
      const year = field === 'year' ? (value as number) : props.birthDate.year;
      if (month && year && props.birthDate.day > getDaysInMonth(month, year)) {
        emit('update', 'day', null);
      }
    }
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .quiz-birth__fields {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem;
  }

  .quiz-birth__field {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .quiz-birth__label {
    font-size: 1.2rem;
    color: $gray;
  }

  .quiz-birth__select {
    width: 100%;
    padding: 1.2rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    color: $primaryWhite;
    font-family: inherit;
    font-size: 1.4rem;
    appearance: none;
  }
</style>
