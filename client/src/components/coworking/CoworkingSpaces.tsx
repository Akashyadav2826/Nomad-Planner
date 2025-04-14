import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoworkingRecommendations } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CoworkingSpaces() {
  const [searchCriteria, setSearchCriteria] = useState({
    location: "Bali, Indonesia",
    internetSpeed: 100,
    noiseLevel: "Moderate",
    budget: 20,
    amenities: "standing desk, private phone booth"
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch existing co-working spaces
  const { data: spaces, isLoading: spacesLoading } = useQuery({
    queryKey: ["/api/coworking"],
  });

  // Get recommendations mutation
  const recommendationMutation = useMutation({
    mutationFn: getCoworkingRecommendations,
    onSuccess: (data) => {
      toast({
        title: "Recommendations ready",
        description: "We've found some great coworking spaces for you!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    recommendationMutation.mutate(searchCriteria);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Co-working Spaces</h2>
        <p className="text-neutral-600">Find the perfect place to work from anywhere</p>
      </div>
      
      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Your Perfect Workspace</CardTitle>
          <CardDescription>
            Our AI will recommend the best co-working spaces based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={searchCriteria.location}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <Label htmlFor="internetSpeed">Minimum Internet Speed (Mbps)</Label>
                <Input
                  id="internetSpeed"
                  type="number"
                  value={searchCriteria.internetSpeed}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, internetSpeed: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <Label htmlFor="noiseLevel">Preferred Noise Level</Label>
                <select
                  id="noiseLevel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={searchCriteria.noiseLevel}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, noiseLevel: e.target.value })}
                >
                  <option value="Quiet">Quiet</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Lively">Lively</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="budget">Maximum Budget (€/day)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={searchCriteria.budget}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, budget: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="amenities">Required Amenities (comma separated)</Label>
                <Input
                  id="amenities"
                  value={searchCriteria.amenities}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, amenities: e.target.value })}
                  placeholder="standing desk, private booth, etc."
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            className="bg-primary-600"
            onClick={handleSearch}
            disabled={recommendationMutation.isPending}
          >
            {recommendationMutation.isPending ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Finding spaces...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">search</span>
                Find Spaces
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Recommendations Results */}
      {recommendationMutation.isSuccess && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">AI Recommendations</h3>
          <p className="mb-4 text-neutral-600">{recommendationMutation.data.recommendationSummary}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendationMutation.data.recommendations.map((space, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-primary-100 to-secondary-100 flex items-center justify-center">
                  <span className="material-icons text-primary-600 text-5xl">business</span>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{space.name}</CardTitle>
                      <CardDescription>{space.location}</CardDescription>
                    </div>
                    <Badge className="bg-primary-600">{space.price}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Amenities:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {space.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-secondary-50 text-secondary-700 border-secondary-200">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-neutral-700">Why it matches:</p>
                    <ul className="text-sm text-neutral-600 list-disc pl-5 mt-1">
                      {space.matchingCriteria.slice(0, 3).map((criterion, i) => (
                        <li key={i}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{space.name}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        <div className="space-y-4 p-2">
                          <div>
                            <h4 className="font-medium">Location</h4>
                            <p>{space.location}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Price</h4>
                            <p>{space.price}</p>
                          </div>
                          
                          {space.internetSpeed && (
                            <div>
                              <h4 className="font-medium">Internet Speed</h4>
                              <p>{space.internetSpeed}</p>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-medium">Amenities</h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {space.amenities.map((amenity, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Why it matches your criteria</h4>
                            <ul className="list-disc pl-5 mt-1">
                              {space.matchingCriteria.map((criterion, i) => (
                                <li key={i}>{criterion}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium">Potential drawbacks</h4>
                            <ul className="list-disc pl-5 mt-1">
                              {space.potentialDrawbacks.map((drawback, i) => (
                                <li key={i}>{drawback}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  
                  <Badge className={`${space.rank >= 4 ? "bg-secondary-600" : "bg-neutral-600"}`}>
                    {space.rank >= 4 ? "Highly Recommended" : "Recommended"}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Existing Coworking Spaces */}
      <div>
        <h3 className="text-xl font-bold text-neutral-800 mb-4">Saved Spaces</h3>
        
        {spacesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-neutral-100 rounded-lg mb-2"></div>
              </div>
            ))}
          </div>
        ) : spaces?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spaces.map((space: any) => (
              <div key={space.id} className="flex border border-neutral-200 rounded-lg overflow-hidden">
                <div className="w-24 h-24 bg-neutral-100 flex items-center justify-center">
                  <span className="material-icons text-neutral-400 text-2xl">business</span>
                </div>
                <div className="p-3 flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-neutral-800">{space.name}</h4>
                    <span className="text-sm font-medium text-secondary-600">{space.price}</span>
                  </div>
                  <p className="text-sm text-neutral-600">
                    ⭐ {space.rating} • {space.amenities?.join(' • ')}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    {space.name.includes("Outpost") && (
                      <span className="text-xs bg-secondary-100 text-secondary-800 px-2 py-0.5 rounded">Recommended</span>
                    )}
                    <span className="text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                      {space.name.includes("Outpost") ? "10 min away" : "20 min away"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500">No saved coworking spaces yet.</p>
        )}
      </div>
    </div>
  );
}
