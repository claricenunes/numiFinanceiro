export type InvestorProfile = "conservative" | "moderate" | "aggressive";
export type AIProvider     = "gemini" | "deepseek" | "mock";

export interface AllocationItem {
  asset: string;
  category: string;   // "stock" | "etf" | "fii" | "fixed_income" | "crypto"
  allocation: number; // percentage 0-100
  risk: number;       // 0-100 (0=no risk, 100=very high risk)
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
  // Metadata (added by the route, not by the AI)
  generatedAt: string;
  aiProvider: AIProvider;
}
