import type { ChartWheelTourStepId } from '~/types/chartWheel';

export const WHEEL_TOUR_STORAGE_KEY = 'stellara:natalchart:wheel-tour:v1';

export const WHEEL_TOUR_AUTO_DELAY_MS = 500;

export const WHEEL_TOUR_STEP_IDS: ChartWheelTourStepId[] = ['wheel', 'sun', 'moon', 'ascendant'];

export interface WheelTourStepCopy {
  id: ChartWheelTourStepId;
  body: string;
}

export const WHEEL_TOUR_STEP_COPY: WheelTourStepCopy[] = [
  {
    id: 'wheel',
    body:
      'Это схема неба в момент вашего рождения. Разноцветные сектора — 12 знаков зодиака, сгруппированные по четырём стихиям (огонь, земля, воздух, вода).',
  },
  {
    id: 'sun',
    body: 'Ядро вашей личности. Положение Солнца в знаке показывает ваш характер, способ мышления и самовыражения.',
  },
  {
    id: 'moon',
    body: 'Ваш эмоциональный мир. Луна отвечает за чувства, интуицию, подсознательные реакции и то, что вы прячете внутри.',
  },
  {
    id: 'ascendant',
    body: 'Ваша «маска» при первой встрече. Асцендент — это как вас воспринимают окружающие в первые минуты знакомства.',
  },
];

export const WHEEL_TOUR_TITLE_FALLBACK: Record<ChartWheelTourStepId, string> = {
  wheel: 'Ваша натальная карта',
  sun: 'Солнце',
  moon: 'Луна',
  ascendant: 'Асцендент',
};
