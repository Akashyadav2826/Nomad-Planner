import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import QuickStats from "./QuickStats";
import AIAssistant from "./AIAssistant";
import { format } from "date-fns";

export default function Dashboard() {
  // Fetch calendar events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/calendar"],
  });

  // Fetch coworking spaces
  const { data: spaces, isLoading: spacesLoading } = useQuery({
    queryKey: ["/api/coworking"],
  });

  // Format date for display
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "h:mm - h:mm a");
  };

  const today = new Date();
  const formattedDate = format(today, "MMMM d, yyyy");

  const todayEvents = events?.filter((event: any) => {
    const eventDate = new Date(event.startTime);
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Dashboard</h2>
        <p className="text-neutral-600">Your digital nomad command center</p>
      </div>
      
      {/* Quick Stats */}
      <QuickStats />
      
      {/* AI Assistant */}
      <AIAssistant />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Calendar Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-neutral-800">Smart Calendar</h3>
            <Link href="/calendar">
              <a className="text-sm text-primary-600 hover:text-primary-700">View full calendar</a>
            </Link>
          </div>
          
          <div className="space-y-3">
            {/* Date header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-neutral-800">Today, {formattedDate}</h4>
                <p className="text-sm text-neutral-500">
                  {todayEvents?.length || 0} events
                  {todayEvents?.some((e: any) => e.eventType === 'travel') && ' • Flight'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-neutral-500 hover:text-neutral-700">
                  <span className="material-icons text-sm">chevron_left</span>
                </button>
                <button className="p-1 text-neutral-500 hover:text-neutral-700">
                  <span className="material-icons text-sm">chevron_right</span>
                </button>
              </div>
            </div>
            
            {/* Calendar events */}
            <div className="space-y-2">
              {eventsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-14 bg-neutral-100 rounded-lg mb-2"></div>
                  </div>
                ))
              ) : todayEvents?.length > 0 ? (
                todayEvents.map((event: any) => (
                  <div 
                    key={event.id} 
                    className={`flex items-start px-3 py-2 rounded-lg ${
                      event.eventType === 'work' 
                        ? 'bg-primary-50 border-l-4 border-primary-500' 
                        : event.eventType === 'travel'
                          ? 'bg-accent-50 border-l-4 border-accent-500'
                          : 'bg-neutral-100 border-l-4 border-neutral-300'
                    }`}
                  >
                    <div className="mr-3">
                      <p className="text-sm font-medium text-neutral-700">
                        {formatEventDate(event.startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{event.title}</p>
                      <p className="text-sm text-neutral-600">{event.location}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-4">No events scheduled for today</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Co-working Suggestions */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg text-neutral-800">Co-working Recommendations</h3>
            <Link href="/coworking">
              <a className="text-sm text-primary-600 hover:text-primary-700">View all spaces</a>
            </Link>
          </div>
          
          <p className="text-neutral-600 mb-4">Top picks for your stay in Bali</p>
          
          <div className="space-y-4">
            {spacesLoading ? (
              [...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-neutral-100 rounded-lg mb-2"></div>
                </div>
              ))
            ) : spaces?.length > 0 ? (
              spaces.slice(0, 2).map((space: any) => (
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
              ))
            ) : (
              <p className="text-neutral-500 text-center py-4">No coworking spaces found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
