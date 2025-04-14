import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyzeBudget, BudgetAnalysis } from "@/lib/gemini";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function BudgetTracker() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newEntry, setNewEntry] = useState({
    amount: "",
    category: "accommodation",
    description: "",
    date: new Date().toISOString().split('T')[0],
    isWorkRelated: false
  });
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  
  // Fetch budget entries
  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/budget"],
  });
  
  // Fetch user preferences for budget limit
  const { data: preferences } = useQuery({
    queryKey: ["/api/user-preferences"],
  });
  
  // Calculate totals
  const totalSpent = entries?.reduce((sum: number, entry: any) => sum + entry.amount, 0) || 0;
  const budgetLimit = preferences?.budgetLimit || 0;
  const remaining = Math.max(0, budgetLimit - totalSpent);
  
  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await apiRequest("POST", "/api/budget", {
        ...expenseData,
        userId: 1 // For demo purposes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budget"] });
      toast({
        title: "Expense added",
        description: "Your expense has been added to the budget tracker.",
      });
      setIsAddExpenseOpen(false);
      resetNewExpenseForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Budget analysis mutation
  const analysisMutation = useMutation({
    mutationFn: analyzeBudget,
    onSuccess: (data) => {
      toast({
        title: "Analysis complete",
        description: "Your budget analysis is ready to view.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze budget. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newEntry.amount || !newEntry.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    addExpenseMutation.mutate({
      ...newEntry,
      amount: parseInt(newEntry.amount),
      date: new Date(newEntry.date).toISOString()
    });
  };
  
  const resetNewExpenseForm = () => {
    setNewEntry({
      amount: "",
      category: "accommodation",
      description: "",
      date: new Date().toISOString().split('T')[0],
      isWorkRelated: false
    });
  };
  
  const handleAnalyzeBudget = () => {
    analysisMutation.mutate();
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    if (!entries) return { pieData: [], barData: [] };
    
    const categories: Record<string, number> = {};
    
    entries.forEach((entry: any) => {
      if (categories[entry.category]) {
        categories[entry.category] += entry.amount;
      } else {
        categories[entry.category] = entry.amount;
      }
    });
    
    const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    
    // For bar chart - work vs. personal
    const workRelated = entries.reduce((sum: number, entry: any) => 
      entry.isWorkRelated ? sum + entry.amount : sum, 0);
    
    const personal = entries.reduce((sum: number, entry: any) => 
      !entry.isWorkRelated ? sum + entry.amount : sum, 0);
    
    const barData = [
      { name: "Work-related", amount: workRelated },
      { name: "Personal", amount: personal }
    ];
    
    return { pieData, barData };
  };
  
  const { pieData, barData } = prepareChartData();
  
  // Colors for pie chart
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Budget Tracker</h2>
        <p className="text-neutral-600">Track and optimize your spending as a digital nomad</p>
      </div>
      
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Monthly spending summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600">Total Budget</p>
              <p className="text-2xl font-bold text-neutral-800">${budgetLimit.toLocaleString()}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-neutral-600">Spent</p>
                <p className="text-xl font-semibold text-neutral-800">${totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Remaining</p>
                <p className="text-xl font-semibold text-secondary-600">${remaining.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  totalSpent > budgetLimit * 0.9 
                    ? "bg-red-500" 
                    : totalSpent > budgetLimit * 0.7 
                      ? "bg-orange-500" 
                      : "bg-secondary-500"
                }`}
                style={{ width: `${Math.min(100, (totalSpent / budgetLimit) * 100)}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-neutral-500">
              {totalSpent > budgetLimit
                ? "You've exceeded your budget"
                : `${Math.round((totalSpent / budgetLimit) * 100)}% of budget used`}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAnalyzeBudget}
              disabled={analysisMutation.isPending}
            >
              {analysisMutation.isPending ? "Analyzing..." : "Analyze Spending"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
            {entriesLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-neutral-500">Loading data...</p>
              </div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-neutral-500">No expense data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Work vs. Personal</CardTitle>
          </CardHeader>
          <CardContent className="h-52">
            {entriesLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-neutral-500">Loading data...</p>
              </div>
            ) : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="amount" fill="#3B82F6" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-neutral-500">No expense data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Expense Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest spending activities</CardDescription>
              </div>
              
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary-600 hover:bg-primary-700">
                    <span className="material-icons text-sm mr-1">add</span>
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newEntry.amount}
                        onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newEntry.category}
                        onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accommodation">Accommodation</SelectItem>
                          <SelectItem value="coworking">Co-working Space</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="internet">Internet</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newEntry.description}
                        onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEntry.date}
                        onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        id="isWorkRelated"
                        type="checkbox"
                        checked={newEntry.isWorkRelated}
                        onChange={(e) => setNewEntry({ ...newEntry, isWorkRelated: e.target.checked })}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Label htmlFor="isWorkRelated">Work-related expense</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addExpenseMutation.isPending}>
                        {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-14 bg-neutral-100 rounded-lg mb-2"></div>
                    </div>
                  ))}
                </div>
              ) : entries?.length > 0 ? (
                <div className="space-y-2">
                  {entries.slice().reverse().slice(0, 10).map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          entry.isWorkRelated ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-700"
                        }`}>
                          <span className="material-icons text-lg">
                            {entry.category === "accommodation" ? "home" 
                            : entry.category === "coworking" ? "business_center"
                            : entry.category === "food" ? "restaurant"
                            : entry.category === "transportation" ? "directions_car"
                            : entry.category === "entertainment" ? "local_activity"
                            : entry.category === "internet" ? "wifi"
                            : entry.category === "equipment" ? "laptop"
                            : "attach_money"}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium capitalize">{entry.category}</p>
                          <p className="text-sm text-neutral-500">{entry.description || "No description"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-neutral-800">${entry.amount.toLocaleString()}</p>
                        <p className="text-xs text-neutral-500">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-neutral-500">No expenses recorded yet</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="mt-2"
                  >
                    Add your first expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* AI Budget Analysis */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Budget Insights</CardTitle>
              <CardDescription>AI-powered analysis of your spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisMutation.isPending ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-6 bg-neutral-100 rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-neutral-100 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : analysisMutation.isSuccess ? (
                <>
                  <div className="p-3 rounded-lg border border-neutral-200">
                    <p className="font-medium text-neutral-700 mb-1">Spending Analysis</p>
                    <p className="text-sm text-neutral-600">{analysisMutation.data.comparisonToAverage.details}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium text-neutral-700 mb-2">Recommendations</p>
                    <div className="space-y-2">
                      {analysisMutation.data.recommendations.map((rec, index) => (
                        <div key={index} className="p-3 rounded-lg border border-neutral-200">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-neutral-700">{rec.description}</p>
                            <Badge className={`
                              ${rec.implementationDifficulty === "Easy" 
                                ? "bg-green-100 text-green-800" 
                                : rec.implementationDifficulty === "Medium" 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-red-100 text-red-800"}
                            `}>
                              {rec.implementationDifficulty}
                            </Badge>
                          </div>
                          {rec.potentialSavings && (
                            <p className="text-sm text-secondary-600">Potential savings: ${rec.potentialSavings}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <span className="material-icons text-neutral-400 text-4xl mb-2">analytics</span>
                  <p className="text-neutral-500">Click "Analyze Spending" to get personalized insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
