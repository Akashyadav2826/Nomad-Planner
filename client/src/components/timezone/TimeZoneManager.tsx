import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getTimeZoneRecommendations, TimeZoneRecommendation, OptimalMeetingTime } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TimeZoneManager() {
  const [teamLocations, setTeamLocations] = useState([
    { name: "London, UK", timeZone: "GMT+0" },
    { name: "New York, USA", timeZone: "GMT-5" },
    { name: "Tokyo, Japan", timeZone: "GMT+9" },
    { name: "Sydney, Australia", timeZone: "GMT+11" }
  ]);
  
  const [newLocation, setNewLocation] = useState({ name: "", timeZone: "" });
  const { toast } = useToast();

  // Get time zone recommendations mutation
  const recommendationMutation = useMutation({
    mutationFn: getTimeZoneRecommendations,
    onSuccess: (data) => {
      toast({
        title: "Meeting times ready",
        description: "We've found the best times for your global team to meet!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get meeting time recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.timeZone) {
      toast({
        title: "Missing information",
        description: "Please enter both location name and time zone.",
        variant: "destructive",
      });
      return;
    }
    
    setTeamLocations([...teamLocations, newLocation]);
    setNewLocation({ name: "", timeZone: "" });
  };

  const handleRemoveLocation = (index: number) => {
    const updatedLocations = [...teamLocations];
    updatedLocations.splice(index, 1);
    setTeamLocations(updatedLocations);
  };

  const handleFindMeetingTimes = () => {
    const userTimeZone = "GMT+8"; // Bali, hardcoded for demo
    
    recommendationMutation.mutate({
      teamMembers: teamLocations,
      userLocation: "Bali, Indonesia",
      userTimeZone
    });
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Optimal":
        return "bg-green-100 text-green-800";
      case "Acceptable":
        return "bg-yellow-100 text-yellow-800";
      case "Challenging":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Time Zone Manager</h2>
        <p className="text-neutral-600">Find the optimal meeting times for your global team</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Team's Locations</CardTitle>
              <CardDescription>
                Add your team members' locations to find the best meeting times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {teamLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-neutral-600">{location.timeZone}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveLocation(index)}
                  >
                    <span className="material-icons text-neutral-500">close</span>
                  </Button>
                </div>
              ))}
              
              <div className="pt-4 border-t border-neutral-200">
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <Label htmlFor="location-name">Location</Label>
                    <Input
                      id="location-name"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="location-timezone">Time Zone</Label>
                    <Input
                      id="location-timezone"
                      value={newLocation.timeZone}
                      onChange={(e) => setNewLocation({ ...newLocation, timeZone: e.target.value })}
                      placeholder="GMT+/-X"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="w-full bg-secondary-600 hover:bg-secondary-700"
                      onClick={handleAddLocation}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="bg-primary-600"
                onClick={handleFindMeetingTimes}
                disabled={recommendationMutation.isPending || teamLocations.length < 2}
              >
                {recommendationMutation.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Finding times...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">schedule</span>
                    Find Optimal Meeting Times
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>World Clock</CardTitle>
            <CardDescription>Current times across your team's locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamLocations.map((location, index) => {
              // This is simplified - in a real app we would do proper time zone calculations
              const now = new Date();
              const offset = parseInt(location.timeZone.replace("GMT", "")) || 0;
              const localTime = new Date(now.getTime() + (offset - new Date().getTimezoneOffset() / 60) * 3600000);
              
              return (
                <div key={index} className="flex justify-between items-center p-2 border-b border-neutral-200 last:border-0">
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-xs text-neutral-500">{location.timeZone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{localTime.toLocaleTimeString()}</p>
                    <p className="text-xs text-neutral-500">{localTime.toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      
      {/* Meeting Time Recommendations */}
      {recommendationMutation.isSuccess && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Optimal Meeting Times</CardTitle>
            <CardDescription>
              Based on your team's locations and preferred waking hours (7 AM - 10 PM local time)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="option1">
              <TabsList className="mb-4">
                {recommendationMutation.data.optimalMeetingTimes.map((time, index) => (
                  <TabsTrigger key={index} value={`option${index + 1}`}>
                    Option {index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {recommendationMutation.data.optimalMeetingTimes.map((time, index) => (
                <TabsContent key={index} value={`option${index + 1}`} className="space-y-4">
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-primary-900">
                        {new Date(time.startTime).toLocaleTimeString()} - {new Date(time.endTime).toLocaleTimeString()} (Your time)
                      </h3>
                      <Badge className="bg-primary-600">Recommended</Badge>
                    </div>
                    <p className="text-sm text-neutral-700">{time.reasoning}</p>
                  </div>
                  
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 bg-neutral-100 p-2 font-medium text-sm">
                      <div>Location</div>
                      <div>Local Time</div>
                      <div>Impact</div>
                    </div>
                    
                    {time.impactAssessment.map((assessment, i) => (
                      <div key={i} className="grid grid-cols-3 p-2 border-t border-neutral-200">
                        <div className="text-sm">{assessment.location}</div>
                        <div className="text-sm">{assessment.localTime}</div>
                        <div>
                          <Badge className={getImpactColor(assessment.impact)}>
                            {assessment.impact}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Jet Lag Tips */}
      {recommendationMutation.isSuccess && recommendationMutation.data.jetlagManagementTips && (
        <Card>
          <CardHeader>
            <CardTitle>Jet Lag Management Tips</CardTitle>
            <CardDescription>
              Personalized advice to help you stay productive while traveling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendationMutation.data.jetlagManagementTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="material-icons text-primary-600 mr-2 mt-0.5">lightbulb</span>
                  <p className="text-sm text-neutral-700">{tip}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
