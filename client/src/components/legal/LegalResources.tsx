import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getLegalResources } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LegalResources() {
  const [query, setQuery] = useState("");
  const [inputQuery, setInputQuery] = useState({
    question: "I'm a US citizen planning to work remotely from Portugal for 3 months starting in June. What visa do I need, what are the tax implications, and am I legally allowed to work for my US company while there?"
  });
  
  const { toast } = useToast();
  
  // Legal resources mutation
  const legalResourcesMutation = useMutation({
    mutationFn: getLegalResources,
    onSuccess: (data) => {
      toast({
        title: "Legal information ready",
        description: "We've compiled legal information based on your query.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get legal information. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleGetLegalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a question about visa requirements, taxes, or work legality.",
        variant: "destructive",
      });
      return;
    }
    
    legalResourcesMutation.mutate({ question: query });
  };
  
  const handleExampleQuery = () => {
    setQuery(inputQuery.question);
    legalResourcesMutation.mutate(inputQuery);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Legal Resources</h2>
        <p className="text-neutral-600">Navigate visa requirements, tax obligations, and work legality</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Legal Information Query</CardTitle>
          <CardDescription>
            Ask about visa requirements, tax implications, and work legality for your specific situation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGetLegalInfo} className="space-y-4">
            <Textarea
              placeholder="e.g., I'm a US citizen planning to work remotely from Portugal for 3 months. What visa do I need and what are the tax implications?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
            />
          </form>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <Button 
            className="bg-primary-600 w-full sm:w-auto"
            onClick={handleGetLegalInfo}
            disabled={legalResourcesMutation.isPending || !query.trim()}
          >
            {legalResourcesMutation.isPending ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Getting information...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">gavel</span>
                Get Legal Information
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleExampleQuery}
            disabled={legalResourcesMutation.isPending}
          >
            Try Example Query
          </Button>
        </CardFooter>
      </Card>
      
      {/* Legal Information Results */}
      {legalResourcesMutation.isSuccess && (
        <Card>
          <CardHeader>
            <CardTitle>Legal Information</CardTitle>
            <CardDescription>
              Information based on your query about legal requirements
            </CardDescription>
            <Alert className="mt-2 bg-amber-50 border-amber-200 text-amber-800">
              <AlertDescription className="flex items-start">
                <span className="material-icons text-amber-500 mr-2">info</span>
                <span>
                  <strong>Disclaimer:</strong> {legalResourcesMutation.data.disclaimer}
                </span>
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visa" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="visa">Visa Requirements</TabsTrigger>
                <TabsTrigger value="tax">Tax Implications</TabsTrigger>
                <TabsTrigger value="work">Work Legality</TabsTrigger>
              </TabsList>
              
              <TabsContent value="visa" className="mt-4">
                {legalResourcesMutation.data.visaRequirements ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <h3 className="font-semibold text-primary-900 mb-2">Required Visa</h3>
                      <p className="text-neutral-700">{legalResourcesMutation.data.visaRequirements.requiredVisa}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-800 mb-2">Stay Duration</h4>
                        <p className="text-neutral-600">{legalResourcesMutation.data.visaRequirements.stayDuration}</p>
                      </div>
                      
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-800 mb-2">Processing Time & Fees</h4>
                        <p className="text-neutral-600">
                          <strong>Processing:</strong> {legalResourcesMutation.data.visaRequirements.processingTime}<br />
                          <strong>Fees:</strong> {legalResourcesMutation.data.visaRequirements.fees}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-800 mb-2">Application Process</h4>
                      <p className="text-neutral-600">{legalResourcesMutation.data.visaRequirements.applicationProcess}</p>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-800 mb-2">Required Documents</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {legalResourcesMutation.data.visaRequirements.requiredDocuments.map((doc, index) => (
                          <li key={index} className="text-neutral-600">{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-neutral-500">
                    <p>No visa information available for this query.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tax" className="mt-4">
                {legalResourcesMutation.data.taxImplications ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <h3 className="font-semibold text-primary-900 mb-2">Tax Status</h3>
                      <p className="text-neutral-700">{legalResourcesMutation.data.taxImplications.taxStatus}</p>
                    </div>
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-800 mb-2">Reporting Requirements</h4>
                      <p className="text-neutral-600">{legalResourcesMutation.data.taxImplications.reportingRequirements}</p>
                    </div>
                    
                    {legalResourcesMutation.data.taxImplications.treatiesSummary && (
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-800 mb-2">Tax Treaties Summary</h4>
                        <p className="text-neutral-600">{legalResourcesMutation.data.taxImplications.treatiesSummary}</p>
                      </div>
                    )}
                    
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <h4 className="font-medium text-neutral-800 mb-2">Key Considerations</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {legalResourcesMutation.data.taxImplications.keyConsiderations.map((item, index) => (
                          <li key={index} className="text-neutral-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-neutral-500">
                    <p>No tax information available for this query.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="work" className="mt-4">
                {legalResourcesMutation.data.workLegality ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <h3 className="font-semibold text-primary-900 mb-2">Work Legality Status</h3>
                      <p className="text-neutral-700">{legalResourcesMutation.data.workLegality.legalStatus}</p>
                    </div>
                    
                    {legalResourcesMutation.data.workLegality.restrictions && legalResourcesMutation.data.workLegality.restrictions.length > 0 && (
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-800 mb-2">Restrictions</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {legalResourcesMutation.data.workLegality.restrictions.map((item, index) => (
                            <li key={index} className="text-neutral-600">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {legalResourcesMutation.data.workLegality.permissions && legalResourcesMutation.data.workLegality.permissions.length > 0 && (
                      <div className="p-4 border border-neutral-200 rounded-lg">
                        <h4 className="font-medium text-neutral-800 mb-2">Permissions</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {legalResourcesMutation.data.workLegality.permissions.map((item, index) => (
                            <li key={index} className="text-neutral-600">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-neutral-500">
                    <p>No work legality information available for this query.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <h3 className="font-semibold text-neutral-800 mb-2">Authoritative Sources</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-4">
                  {legalResourcesMutation.data.authoritativeSources.map((source, index) => (
                    <div key={index} className="pb-3 border-b border-neutral-200 last:border-0">
                      <h4 className="font-medium text-neutral-800">{source.name}</h4>
                      <p className="text-sm text-neutral-600 mb-1">{source.description}</p>
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline flex items-center"
                        >
                          <span>{source.url}</span>
                          <span className="material-icons text-sm ml-1">open_in_new</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Common Legal Questions */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">Common Legal Questions for Digital Nomads</h3>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-medium text-neutral-800">
              What is the difference between a tourist visa and a digital nomad visa?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              Tourist visas are typically short-term and do not permit work activities, while digital nomad visas are specifically designed for remote workers who want to live in a foreign country while working for employers or clients in other countries. Digital nomad visas usually have longer stay periods and explicitly allow remote work.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger className="font-medium text-neutral-800">
              How do I handle taxes if I'm working across multiple countries?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              Tax obligations for digital nomads can be complex. Most countries tax residents based on either citizenship (like the US) or residency. You may need to track days spent in each country, as many determine tax residency based on physical presence (often 183+ days). Consider consulting with an international tax professional and look into tax treaties between countries to avoid double taxation.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger className="font-medium text-neutral-800">
              Which countries currently offer digital nomad visas?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              Many countries now offer digital nomad visas or similar programs, including Estonia, Croatia, Portugal, Greece, Spain, Costa Rica, Mexico, Georgia, Dubai (UAE), Barbados, Bermuda, Cayman Islands, Iceland, Norway, and Thailand. Each has different requirements regarding minimum income, application fees, and duration of stay.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-4">
            <AccordionTrigger className="font-medium text-neutral-800">
              Can I use a tourist visa to work remotely?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              While many digital nomads do work remotely while on tourist visas, this technically falls into a legal gray area in most countries. Tourist visas typically prohibit any form of work, including remote work. Some countries are explicitly cracking down on this practice, while others tacitly allow it. To remain fully compliant with local laws, you should obtain a proper work visa or digital nomad visa.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-5">
            <AccordionTrigger className="font-medium text-neutral-800">
              How does health insurance work for digital nomads?
            </AccordionTrigger>
            <AccordionContent className="text-neutral-600">
              Most domestic health insurance plans don't provide coverage outside your home country. Digital nomads typically rely on international health insurance plans or specialized travel insurance designed for long-term travelers that covers healthcare across multiple countries. Some countries require proof of health insurance as part of their visa application process.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
