export type InvestorProfile = "conservador" | "moderado" | "arrojado";
export type AIProvider     = "gemini" | "deepseek" | "mock";

export interface AllocationItem {
  asset: string;
  category: string;   // "stock" | "etf" | "fii" | "fixed_income" | "crypto"
  allocation: number; // percentual 0-100
  risk: number;       // 0-100 (0=sem risco, 100=altíssimo risco)
  expectedReturn: string;
  timeframe: string;
  rationale: string;
}

export interface FIAAnalysis {
  financialScore: number;
  profile: InvestorProfile;
  monthlyContribution: {
    min: number;
    max: number;
    reason: string;
  };
  allocation: AllocationItem[];
  insights: string[];
  nextSteps: string[];
  confidence: number;
  // Metadados (adicionados pela rota, não pela IA)
  generatedAt: string;
  aiProvider: AIProvider;
}
