export type ChartWheelHighlightTarget =
  | 'wheel'
  | 'sun'
  | 'moon'
  | 'ascendant'
  | 'aspects-harmonious'
  | 'aspects-tense'
  | 'aspects-conjunction'
  | `planet:${string}`
  | `sign:${string}`;

export type ChartWheelLegendGroupId = 'planets' | 'signs' | 'aspects';

export type ChartWheelTourStepId = 'wheel' | 'sun' | 'moon' | 'ascendant';

export interface ChartWheelTourStorage {
  completed: boolean;
  completedAt?: string;
}
