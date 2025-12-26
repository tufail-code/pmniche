import { Option } from './types';

export const PROBLEM_OPTIONS: Option[] = [
  { id: 'delivery', label: 'Cleaning up messy delivery environments', description: 'Restoring order to chaotic pipelines' },
  { id: 'chaos', label: 'Untangling cross-team chaos', description: 'Bringing harmony to fragmented collaboration' },
  { id: 'migrations', label: 'Leading complex migrations', description: 'Moving from legacy to modern systems' },
  { id: 'translation', label: 'Translating between Compliance, IT, and Product', description: 'Navigating technical and regulatory constraints' },
];

export const ENVIRONMENT_OPTIONS: Option[] = [
  { id: 'banking', label: 'Enterprise Banking & Fintech', description: 'High-stakes financial systems' },
  { id: 'saas', label: 'Fast-moving SaaS', description: 'Rapid growth and experimental cycles' },
  { id: 'public', label: 'Public Sector & Government', description: 'Complex stakeholder landscapes' },
  { id: 'regulated', label: 'Highly Regulated Environments', description: 'Compliance-heavy health or legal tech' },
];

export const STYLE_OPTIONS: Option[] = [
  { id: 'calm', label: 'The Calm Operator', description: 'Stability in high-risk programs' },
  { id: 'integrator', label: 'The Integrator', description: 'Uniting stubborn or siloed teams' },
  { id: 'builder', label: 'The Structure-Builder', description: 'Creating systems in chaotic orgs' },
  { id: 'translator', label: 'The Translator', description: 'Bridging the gap between Execs and Engineers' },
];