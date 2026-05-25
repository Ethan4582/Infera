import type { Provider, ModelId } from '@/lib/sdk/types'

export interface ProviderConfig {
  id: Provider
  label: string
  models: { id: ModelId; label: string }[]
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'groq',
    label: 'Groq',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
  },
]