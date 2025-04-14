import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAssistantResponse, analyzeCalendarConflicts } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  // Fetch calendar conflicts
  const { data: conflictAnalysis, isLoading: conflictLoading } = useQuery({
    queryKey: ["/api/calendar/analyze"],
    queryFn: analyzeCalendarConflicts,
  });

  // Assistant mutation for handling queries
  const assistantMutation = useMutation({
    mutationFn: getAssistantResponse,
    onSuccess: (data) => {
      setQuery("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAskAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    assistantMutation.mutate(query);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-full">
          <span className="material-icons text-primary-600">tips_and_updates</span>
        </div>
        <h3 className="font-semibold text-lg text-neutral-800">AI Assistant</h3>
      </div>
      
      {conflictLoading ? (
        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      ) : conflictAnalysis?.hasConflict ? (
        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
          <p className="text-neutral-700">{conflictAnalysis.conflictDetails}</p>
          
          {conflictAnalysis.suggestedSolutions && (
            <div className="mt-3 space-y-2">
              <h4 className="font-medium text-sm text-neutral-700">Suggested solutions:</h4>
              <div className="space-y-2">
                {conflictAnalysis.suggestedSolutions.map((solution, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="material-icons text-xs text-neutral-500 mt-0.5">radio_button_unchecked</span>
                    <p className="text-sm text-neutral-700">{solution.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : assistantMutation.isSuccess ? (
        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
          <p className="text-neutral-700">{assistantMutation.data.response}</p>
          
          {assistantMutation.data.suggestedActions && assistantMutation.data.suggestedActions.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="font-medium text-sm text-neutral-700">Suggested actions:</h4>
              <div className="space-y-2">
                {assistantMutation.data.suggestedActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="material-icons text-xs text-neutral-500 mt-0.5">radio_button_unchecked</span>
                    <p className="text-sm text-neutral-700">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-lg p-4 mb-4">
          <p className="text-neutral-700">I'm your AI assistant for digital nomad planning. Ask me anything about your schedule, budget, travel plans, or any other travel or work-related questions.</p>
        </div>
      )}
      
      <form onSubmit={handleAskAssistant} className="relative">
        <input 
          type="text" 
          placeholder="Ask me anything about your schedule, budget, or travel plans..." 
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={assistantMutation.isPending}
        />
        <button 
          type="submit"
          className="absolute inset-y-0 right-0 px-3 text-primary-600"
          disabled={assistantMutation.isPending || !query.trim()}
        >
          {assistantMutation.isPending ? (
            <span className="material-icons animate-spin">refresh</span>
          ) : (
            <span className="material-icons">send</span>
          )}
        </button>
      </form>
    </div>
  );
}
