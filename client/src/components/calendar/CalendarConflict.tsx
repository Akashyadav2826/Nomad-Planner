import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { analyzeCalendarConflicts } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function CalendarConflict() {
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch conflict analysis
  const { data: conflictAnalysis, isLoading } = useQuery({
    queryKey: ["/api/calendar/analyze"],
    queryFn: analyzeCalendarConflicts,
  });

  // Apply solution mutation
  const applySolutionMutation = useMutation({
    mutationFn: async (solution: string) => {
      // This would typically update the conflicting events based on the solution
      // For demo purposes, we'll just show a success toast
      return { success: true, solution };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/analyze"] });
      
      toast({
        title: "Solution applied",
        description: "Your calendar has been updated successfully.",
      });
      
      setSelectedSolution(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to apply solution. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplySolution = () => {
    if (selectedSolution === null || !conflictAnalysis?.suggestedSolutions) return;
    
    const solution = conflictAnalysis.suggestedSolutions[selectedSolution].description;
    applySolutionMutation.mutate(solution);
  };

  if (isLoading) {
    return (
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-neutral-200 p-5 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
        <div className="h-24 bg-neutral-200 rounded mb-4"></div>
      </div>
    );
  }

  if (!conflictAnalysis?.hasConflict) {
    return null;
  }

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-primary-100 rounded-full">
          <span className="material-icons text-primary-600">error_outline</span>
        </div>
        <h3 className="font-semibold text-lg text-neutral-800">Potential Conflicts</h3>
      </div>
      
      <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <span className="material-icons text-orange-500 mr-3">warning</span>
          <div>
            <p className="font-medium text-neutral-800">Travel & Work Conflict Detected</p>
            <p className="text-neutral-700 mt-1">
              {conflictAnalysis.conflictDetails}
            </p>
            
            {conflictAnalysis.suggestedSolutions && (
              <div className="mt-3 space-y-3">
                <RadioGroup value={selectedSolution?.toString() || ""} onValueChange={(value) => setSelectedSolution(parseInt(value))}>
                  {conflictAnalysis.suggestedSolutions.map((solution, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem id={`solution-${index}`} value={index.toString()} />
                      <Label htmlFor={`solution-${index}`} className="text-sm text-neutral-700">
                        {solution.description}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            <div className="mt-4 flex space-x-3">
              <Button 
                className="bg-primary-600" 
                onClick={handleApplySolution}
                disabled={selectedSolution === null || applySolutionMutation.isPending}
              >
                {applySolutionMutation.isPending ? "Applying..." : "Apply Solution"}
              </Button>
              <Button variant="outline" className="text-neutral-600 bg-neutral-100">
                Ignore
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
