
export interface NicheData {
  problem: string;
  environment: string;
  style: string;
}

export type StepId = 'welcome' | 'problem' | 'environment' | 'style' | 'result';

export interface Option {
  id: string;
  label: string;
  description?: string;
}
