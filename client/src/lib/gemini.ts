import { apiRequest } from "./queryClient";

// Interface for the client-side Gemini helper functions
// These functions will call our backend API endpoints

export interface ConflictSolution {
  description: string;
  pros: string[];
  cons: string[];
}

export interface ConflictAnalysis {
  hasConflict: boolean;
  conflictDetails?: string;
  suggestedSolutions?: ConflictSolution[];
}

export interface CoworkingRecommendation {
  name: string;
  location: string;
  rating?: string;
  price: string;
  internetSpeed?: string;
  amenities: string[];
  matchingCriteria: string[];
  potentialDrawbacks: string[];
  rank: number;
}

export interface CoworkingRecommendations {
  recommendations: CoworkingRecommendation[];
  recommendationSummary: string;
}

export interface TimeZoneImpact {
  location: string;
  localTime: string;
  impact: "Optimal" | "Acceptable" | "Challenging";
}

export interface OptimalMeetingTime {
  startTime: string;
  endTime: string;
  impactAssessment: TimeZoneImpact[];
  reasoning: string;
}

export interface TimeZoneRecommendation {
  optimalMeetingTimes: OptimalMeetingTime[];
  jetlagManagementTips?: string[];
}

export interface CategorizedExpense {
  category: string;
  amount: number;
  percentage: number;
  workRelated: boolean;
}

export interface BudgetRecommendation {
  description: string;
  potentialSavings?: number;
  implementationDifficulty: "Easy" | "Medium" | "Hard";
}

export interface BudgetAnalysis {
  categorizedExpenses: CategorizedExpense[];
  comparisonToAverage: {
    status: "Above average" | "Below average" | "Average";
    details: string;
  };
  recommendations: BudgetRecommendation[];
}

export interface CommunityRecommendation {
  name: string;
  type: string;
  relevanceScore: number;
  description: string;
  contactMethod?: string;
  matchingInterests: string[];
  networkingApproach: string;
}

export interface CommunityRecommendations {
  recommendations: CommunityRecommendation[];
}

export interface LegalResource {
  visaRequirements?: {
    requiredVisa: string;
    stayDuration: string;
    applicationProcess: string;
    requiredDocuments: string[];
    processingTime: string;
    fees: string;
  };
  taxImplications?: {
    taxStatus: string;
    reportingRequirements: string;
    treatiesSummary?: string;
    keyConsiderations: string[];
  };
  workLegality?: {
    legalStatus: string;
    restrictions?: string[];
    permissions?: string[];
  };
  authoritativeSources: {
    name: string;
    url?: string;
    description: string;
  }[];
  disclaimer: string;
}

export interface AssistantResponse {
  response: string;
  relatedModules?: string[];
  suggestedActions?: string[];
}

// Helper functions to call our backend API endpoints

export async function analyzeCalendarConflicts(): Promise<ConflictAnalysis> {
  const response = await apiRequest("POST", "/api/calendar/analyze", {});
  return await response.json();
}

export async function getCoworkingRecommendations(preferences: any): Promise<CoworkingRecommendations> {
  const response = await apiRequest("POST", "/api/coworking/recommend", preferences);
  return await response.json();
}

export async function getTimeZoneRecommendations(teamInfo: any): Promise<TimeZoneRecommendation> {
  const response = await apiRequest("POST", "/api/timezone/recommend", teamInfo);
  return await response.json();
}

export async function analyzeBudget(): Promise<BudgetAnalysis> {
  const response = await apiRequest("POST", "/api/budget/analyze", {});
  return await response.json();
}

export async function getCommunityRecommendations(userProfile: any): Promise<CommunityRecommendations> {
  const response = await apiRequest("POST", "/api/community/recommend", userProfile);
  return await response.json();
}

export async function getLegalResources(query: { question: string }): Promise<LegalResource> {
  const response = await apiRequest("POST", "/api/legal/resources", query);
  return await response.json();
}

export async function getAssistantResponse(query: string): Promise<AssistantResponse> {
  const response = await apiRequest("POST", "/api/assistant", { query });
  return await response.json();
}
