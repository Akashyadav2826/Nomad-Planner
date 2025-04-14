import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getCommunityRecommendations } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CommunityConnector() {
  const [userProfile, setUserProfile] = useState({
    currentLocation: "Medellín, Colombia",
    profession: "UX designer",
    interests: "hiking, language exchange, design thinking",
    durationOfStay: "2 months",
    networkingGoals: "meet local designers and potential clients"
  });
  
  const { toast } = useToast();
  
  // Recommendations mutation
  const recommendationMutation = useMutation({
    mutationFn: getCommunityRecommendations,
    onSuccess: (data) => {
      toast({
        title: "Recommendations ready",
        description: "We've found some community connections for you!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get community recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleGetRecommendations = (e: React.FormEvent) => {
    e.preventDefault();
    recommendationMutation.mutate(userProfile);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Community Connector</h2>
        <p className="text-neutral-600">Find your tribe anywhere in the world</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Help us connect you to the right communities</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGetRecommendations} className="space-y-4">
                <div>
                  <Label htmlFor="currentLocation">Current Location</Label>
                  <Input
                    id="currentLocation"
                    value={userProfile.currentLocation}
                    onChange={(e) => setUserProfile({ ...userProfile, currentLocation: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={userProfile.profession}
                    onChange={(e) => setUserProfile({ ...userProfile, profession: e.target.value })}
                    placeholder="Your profession"
                  />
                </div>
                
                <div>
                  <Label htmlFor="interests">Interests (comma separated)</Label>
                  <Textarea
                    id="interests"
                    value={userProfile.interests}
                    onChange={(e) => setUserProfile({ ...userProfile, interests: e.target.value })}
                    placeholder="hiking, photography, etc."
                    className="resize-none"
                  />
                </div>
                
                <div>
                  <Label htmlFor="durationOfStay">Duration of Stay</Label>
                  <Select
                    value={userProfile.durationOfStay}
                    onValueChange={(value) => setUserProfile({ ...userProfile, durationOfStay: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 week">1 week</SelectItem>
                      <SelectItem value="2 weeks">2 weeks</SelectItem>
                      <SelectItem value="1 month">1 month</SelectItem>
                      <SelectItem value="2 months">2 months</SelectItem>
                      <SelectItem value="3 months">3 months</SelectItem>
                      <SelectItem value="6 months">6 months</SelectItem>
                      <SelectItem value="1 year+">1 year+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="networkingGoals">Networking Goals</Label>
                  <Textarea
                    id="networkingGoals"
                    value={userProfile.networkingGoals}
                    onChange={(e) => setUserProfile({ ...userProfile, networkingGoals: e.target.value })}
                    placeholder="What you hope to achieve by connecting with others"
                    className="resize-none"
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-primary-600"
                onClick={handleGetRecommendations}
                disabled={recommendationMutation.isPending}
              >
                {recommendationMutation.isPending ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Finding communities...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">search</span>
                    Find Communities
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {recommendationMutation.isSuccess ? (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-neutral-800">Recommended Connections</h3>
              <p className="text-neutral-600">Based on your profile and location</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendationMutation.data.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{rec.name}</CardTitle>
                        <Badge className="bg-primary-600">
                          {rec.type}
                        </Badge>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Relevance Score:</p>
                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full bg-secondary-500 rounded-full"
                            style={{ width: `${(rec.relevanceScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-right text-neutral-500 mt-1">{rec.relevanceScore}/10</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Matching Interests:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.matchingInterests.map((interest, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-secondary-50 text-secondary-700 border-secondary-200">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {rec.contactMethod && (
                        <div>
                          <p className="text-sm font-medium text-neutral-700">Contact Method:</p>
                          <p className="text-sm text-neutral-600">{rec.contactMethod}</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <div>
                        <p className="text-sm font-medium text-neutral-700">Networking Approach:</p>
                        <p className="text-sm text-neutral-600">{rec.networkingApproach}</p>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card className="h-full flex flex-col justify-center items-center p-8">
              <div className="text-center max-w-md">
                <span className="material-icons text-primary-500 text-5xl mb-4">people</span>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">Find Your Community</h3>
                <p className="text-neutral-600 mb-6">
                  Fill out your profile details and let our AI assistant find the perfect communities for you to connect with.
                </p>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleGetRecommendations}
                    disabled={recommendationMutation.isPending}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Community Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Community Connection Tips</CardTitle>
          <CardDescription>How to make meaningful connections as a digital nomad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="mb-3">
                <span className="material-icons text-primary-600 text-xl">event</span>
              </div>
              <h4 className="font-medium text-neutral-800 mb-2">Attend Local Events</h4>
              <p className="text-sm text-neutral-600">
                Look for meetups, workshops, and conferences in your area that align with your professional and personal interests.
              </p>
            </div>
            
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="mb-3">
                <span className="material-icons text-primary-600 text-xl">laptop</span>
              </div>
              <h4 className="font-medium text-neutral-800 mb-2">Join Online Communities</h4>
              <p className="text-sm text-neutral-600">
                Participate in location-specific Facebook groups, Slack channels, and forums for digital nomads in your area.
              </p>
            </div>
            
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="mb-3">
                <span className="material-icons text-primary-600 text-xl">volunteer_activism</span>
              </div>
              <h4 className="font-medium text-neutral-800 mb-2">Volunteer Your Skills</h4>
              <p className="text-sm text-neutral-600">
                Offer your professional skills to local organizations or causes to build connections while giving back.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
