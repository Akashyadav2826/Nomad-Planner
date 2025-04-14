import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/current-user"],
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200">
      <div className="flex items-center justify-center h-16 border-b border-neutral-200 px-4">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary-500">travel_explore</span>
          <h1 className="text-xl font-bold text-neutral-800">Nomad Planner</h1>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <Link href="/">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location ===  "/" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">dashboard</span>
            <span className={location === "/" ? "font-medium" : ""}>Dashboard</span>
          </a>
        </Link>
        <Link href="/calendar">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/calendar" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">calendar_today</span>
            <span className={location === "/calendar" ? "font-medium" : ""}>Smart Calendar</span>
          </a>
        </Link>
        <Link href="/coworking">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/coworking" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">business_center</span>
            <span className={location === "/coworking" ? "font-medium" : ""}>Co-working Spaces</span>
          </a>
        </Link>
        <Link href="/timezone">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/timezone" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">schedule</span>
            <span className={location === "/timezone" ? "font-medium" : ""}>Time Zone Manager</span>
          </a>
        </Link>
        <Link href="/budget">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/budget" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">account_balance_wallet</span>
            <span className={location === "/budget" ? "font-medium" : ""}>Budget Tracker</span>
          </a>
        </Link>
        <Link href="/community">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/community" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">people</span>
            <span className={location === "/community" ? "font-medium" : ""}>Community</span>
          </a>
        </Link>
        <Link href="/legal">
          <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${location === "/legal" ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:bg-neutral-100"}`}>
            <span className="material-icons">gavel</span>
            <span className={location === "/legal" ? "font-medium" : ""}>Legal Resources</span>
          </a>
        </Link>
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center space-x-3">
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt={`${user.fullName}'s avatar`} 
                className="h-8 w-8 rounded-full" 
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-medium text-sm">
                  {user.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-neutral-800">{user.fullName}</p>
              <p className="text-xs text-neutral-500">Currently in {user.currentLocation}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
