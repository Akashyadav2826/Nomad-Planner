import { z } from "zod";

// Type definitions for Gemini API responses

// Smart Calendar Integration schemas
export const conflictAnalysisSchema = z.object({
  hasConflict: z.boolean(),
  conflictDetails: z.string().optional(),
  suggestedSolutions: z.array(
    z.object({
      description: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    })
  ).optional(),
});

export type ConflictAnalysis = z.infer<typeof conflictAnalysisSchema>;

// Co-working Space Recommendation schemas
export const coworkingRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      name: z.string(),
      location: z.string(),
      rating: z.string().optional(),
      price: z.string(),
      internetSpeed: z.string().optional(),
      amenities: z.array(z.string()),
      matchingCriteria: z.array(z.string()),
      potentialDrawbacks: z.array(z.string()),
      rank: z.number().min(1).max(5),
    })
  ),
  recommendationSummary: z.string(),
});

export type CoworkingRecommendation = z.infer<typeof coworkingRecommendationSchema>;

// Time Zone Management schemas
export const timeZoneRecommendationSchema = z.object({
  optimalMeetingTimes: z.array(
    z.object({
      startTime: z.string(), // ISO string
      endTime: z.string(), // ISO string
      impactAssessment: z.array(
        z.object({
          location: z.string(),
          localTime: z.string(),
          impact: z.enum(["Optimal", "Acceptable", "Challenging"]),
        })
      ),
      reasoning: z.string(),
    })
  ),
  jetlagManagementTips: z.array(z.string()).optional(),
});

export type TimeZoneRecommendation = z.infer<typeof timeZoneRecommendationSchema>;

// Budget Analysis schemas
export const budgetAnalysisSchema = z.object({
  categorizedExpenses: z.array(
    z.object({
      category: z.string(),
      amount: z.number(),
      percentage: z.number(),
      workRelated: z.boolean(),
    })
  ),
  comparisonToAverage: z.object({
    status: z.enum(["Above average", "Below average", "Average"]),
    details: z.string(),
  }),
  recommendations: z.array(
    z.object({
      description: z.string(),
      potentialSavings: z.number().optional(),
      implementationDifficulty: z.enum(["Easy", "Medium", "Hard"]),
    })
  ),
});

export type BudgetAnalysis = z.infer<typeof budgetAnalysisSchema>;

// Community Connection schemas
export const communityRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      name: z.string(),
      type: z.string(), // "Event", "Group", "Community", etc.
      relevanceScore: z.number().min(1).max(10),
      description: z.string(),
      contactMethod: z.string().optional(),
      matchingInterests: z.array(z.string()),
      networkingApproach: z.string(),
    })
  ),
});

export type CommunityRecommendation = z.infer<typeof communityRecommendationSchema>;

// Legal Resource schemas
export const legalResourceSchema = z.object({
  visaRequirements: z.object({
    requiredVisa: z.string(),
    stayDuration: z.string(),
    applicationProcess: z.string(),
    requiredDocuments: z.array(z.string()),
    processingTime: z.string(),
    fees: z.string(),
  }).optional(),
  taxImplications: z.object({
    taxStatus: z.string(),
    reportingRequirements: z.string(),
    treatiesSummary: z.string().optional(),
    keyConsiderations: z.array(z.string()),
  }).optional(),
  workLegality: z.object({
    legalStatus: z.string(),
    restrictions: z.array(z.string()).optional(),
    permissions: z.array(z.string()).optional(),
  }).optional(),
  authoritativeSources: z.array(
    z.object({
      name: z.string(),
      url: z.string().optional(),
      description: z.string(),
    })
  ),
  disclaimer: z.string(),
});

export type LegalResource = z.infer<typeof legalResourceSchema>;

// Generic AI assistant schema for general queries
export const assistantResponseSchema = z.object({
  response: z.string(),
  relatedModules: z.array(z.string()).optional(),
  suggestedActions: z.array(z.string()).optional(),
});

export type AssistantResponse = z.infer<typeof assistantResponseSchema>;

// Helper function to call Gemini API
export async function callGeminiAPI(
  prompt: string,
  context: Record<string, any> = {},
  modelParams: Record<string, any> = {}
): Promise<any> {
  // API key should be set in environment variables
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please set the GEMINI_API_KEY environment variable.");
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      ...modelParams
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }

    // Extract the text content from the response
    const textContent = data.candidates[0].content.parts[0].text;
    
    // Try to parse as JSON
    try {
      return JSON.parse(textContent);
    } catch (e) {
      // If it's not valid JSON, return the raw text
      return { rawResponse: textContent };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Helper functions for each module
export async function analyzeCalendarConflicts(events: any[]): Promise<ConflictAnalysis> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. Analyze these calendar events:
    ${JSON.stringify(events, null, 2)}
    
    Identify any conflicts, especially between work and travel events. Explain the specific issues, 
    and suggest three alternative scheduling options that minimize disruption. 
    
    Format your response as JSON with these fields:
    {
      "hasConflict": boolean,
      "conflictDetails": string (only if hasConflict is true),
      "suggestedSolutions": [
        {
          "description": string,
          "pros": [string],
          "cons": [string]
        }
      ] (only if hasConflict is true)
    }
  `;

  const result = await callGeminiAPI(prompt);
  return conflictAnalysisSchema.parse(result);
}

export async function getCoworkingRecommendations(preferences: any): Promise<CoworkingRecommendation> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. Based on the following user preferences and location data:
    ${JSON.stringify(preferences, null, 2)}
    
    Recommend three suitable co-working spaces, with detailed information about each option 
    including why it matches the user's criteria, any potential drawbacks, and a final ranking. 
    
    Format your response as JSON with this structure:
    {
      "recommendations": [
        {
          "name": string,
          "location": string,
          "rating": string,
          "price": string,
          "internetSpeed": string,
          "amenities": [string],
          "matchingCriteria": [string],
          "potentialDrawbacks": [string],
          "rank": number (1-5)
        }
      ],
      "recommendationSummary": string
    }
  `;

  const result = await callGeminiAPI(prompt);
  return coworkingRecommendationSchema.parse(result);
}

export async function getTimeZoneRecommendations(teamInfo: any): Promise<TimeZoneRecommendation> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. The user has team members in the following locations:
    ${JSON.stringify(teamInfo, null, 2)}
    
    Suggest three optimal time slots that maximize team member waking hours (7 AM - 10 PM local time).
    Include reasoning for each suggestion and identify which team members might be most inconvenienced by each option.
    
    Format your response as JSON with this structure:
    {
      "optimalMeetingTimes": [
        {
          "startTime": string (ISO format),
          "endTime": string (ISO format),
          "impactAssessment": [
            {
              "location": string,
              "localTime": string,
              "impact": string (Optimal/Acceptable/Challenging)
            }
          ],
          "reasoning": string
        }
      ],
      "jetlagManagementTips": [string] (optional)
    }
  `;

  const result = await callGeminiAPI(prompt);
  return timeZoneRecommendationSchema.parse(result);
}

export async function analyzeBudget(expenseData: any): Promise<BudgetAnalysis> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. Analyze this user's expense data:
    ${JSON.stringify(expenseData, null, 2)}
    
    Categorize each expense as either work-related, travel-related, or mixed. Provide a detailed 
    analysis of their spending patterns, compare it to typical digital nomad costs in that location, 
    and suggest three specific ways they could optimize their budget.
    
    Format your response as JSON with this structure:
    {
      "categorizedExpenses": [
        {
          "category": string,
          "amount": number,
          "percentage": number,
          "workRelated": boolean
        }
      ],
      "comparisonToAverage": {
        "status": string (Above average/Below average/Average),
        "details": string
      },
      "recommendations": [
        {
          "description": string,
          "potentialSavings": number,
          "implementationDifficulty": string (Easy/Medium/Hard)
        }
      ]
    }
  `;

  const result = await callGeminiAPI(prompt);
  return budgetAnalysisSchema.parse(result);
}

export async function getCommunityRecommendations(userProfile: any): Promise<CommunityRecommendation> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. The user has provided the following information:
    ${JSON.stringify(userProfile, null, 2)}
    
    Recommend five specific community events or groups they should connect with in their location, 
    including a detailed explanation of why each recommendation matches their profile, specific contact 
    methods or locations, and best approaches for making meaningful connections.
    
    Format your response as JSON with this structure:
    {
      "recommendations": [
        {
          "name": string,
          "type": string,
          "relevanceScore": number (1-10),
          "description": string,
          "contactMethod": string,
          "matchingInterests": [string],
          "networkingApproach": string
        }
      ]
    }
  `;

  const result = await callGeminiAPI(prompt);
  return communityRecommendationSchema.parse(result);
}

export async function getLegalResources(query: any): Promise<LegalResource> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. The user has asked:
    "${query.question}"
    
    Provide comprehensive information about relevant visa options, tax considerations, and work legality 
    for digital nomads. Format your response with clear sections, highlighting key requirements, application 
    processes, timelines, and authoritative sources where they can find official information.
    
    Make clear you're providing general information, not legal advice. Format as structured JSON with this structure:
    {
      "visaRequirements": {
        "requiredVisa": string,
        "stayDuration": string,
        "applicationProcess": string,
        "requiredDocuments": [string],
        "processingTime": string,
        "fees": string
      },
      "taxImplications": {
        "taxStatus": string,
        "reportingRequirements": string,
        "treatiesSummary": string,
        "keyConsiderations": [string]
      },
      "workLegality": {
        "legalStatus": string,
        "restrictions": [string],
        "permissions": [string]
      },
      "authoritativeSources": [
        {
          "name": string,
          "url": string,
          "description": string
        }
      ],
      "disclaimer": string
    }
  `;

  const result = await callGeminiAPI(prompt);
  return legalResourceSchema.parse(result);
}

export async function getAssistantResponse(query: string): Promise<AssistantResponse> {
  const prompt = `
    You are an AI assistant for a digital nomad planner application. The user has asked:
    "${query}"
    
    Provide a helpful response addressing their question. Focus on being concise, informative, and actionable.
    
    Format your response as JSON with this structure:
    {
      "response": string,
      "relatedModules": [string] (optional),
      "suggestedActions": [string] (optional)
    }
  `;

  const result = await callGeminiAPI(prompt);
  return assistantResponseSchema.parse(result);
}
