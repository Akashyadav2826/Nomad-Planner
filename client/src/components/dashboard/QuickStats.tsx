import { useQuery } from "@tanstack/react-query";

export default function QuickStats() {
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/user-preferences"],
  });

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ["/api/budget"],
  });

  // Calculate total spent
  const totalSpent = budget?.reduce((total: number, item: any) => total + item.amount, 0) || 0;
  
  // Get the next destination and dates from preferences
  const nextDestination = preferences?.nextDestination;
  const nextDestinationDates = preferences?.nextDestinationDates;
  
  // Format dates for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading state
  if (preferencesLoading || budgetLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 animate-pulse">
            <div className="h-5 bg-neutral-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-neutral-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Upcoming Trip */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-sm">Next Destination</p>
            <p className="font-semibold text-lg text-neutral-800">
              {nextDestination || "No destination set"}
            </p>
            {nextDestinationDates && (
              <p className="text-sm text-neutral-600">
                {formatDate(nextDestinationDates.start)} - {formatDate(nextDestinationDates.end)}
              </p>
            )}
          </div>
          <span className="material-icons text-accent-500">flight_takeoff</span>
        </div>
      </div>
      
      {/* Work Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-sm">Work Schedule</p>
            <p className="font-semibold text-lg text-neutral-800">32 hrs this week</p>
            <div className="flex items-center">
              <span className="text-sm text-secondary-600">↓ 4 hrs from last week</span>
            </div>
          </div>
          <span className="material-icons text-primary-500">work</span>
        </div>
      </div>
      
      {/* Budget Status */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-sm">Monthly Budget</p>
            <p className="font-semibold text-lg text-neutral-800">
              ${totalSpent.toLocaleString()} / ${preferences?.budgetLimit?.toLocaleString() || 0}
            </p>
            {preferences?.budgetLimit && (
              <div className="mt-1 h-1.5 w-40 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="bg-secondary-500 h-full rounded-full" 
                  style={{ width: `${Math.min(100, (totalSpent / preferences.budgetLimit) * 100)}%` }}
                ></div>
              </div>
            )}
          </div>
          <span className="material-icons text-secondary-500">savings</span>
        </div>
      </div>
      
      {/* Time Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-sm">Current Time Zone</p>
            <p className="font-semibold text-lg text-neutral-800">
              {preferences?.timeZone === "Asia/Bali" ? "GMT+8 (Bali)" : preferences?.timeZone || "Not set"}
            </p>
            <p className="text-sm text-neutral-600">Team: GMT-5 to GMT+11</p>
          </div>
          <span className="material-icons text-primary-500">public</span>
        </div>
      </div>
    </div>
  );
}
