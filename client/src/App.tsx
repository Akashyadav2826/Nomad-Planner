import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Home from "@/pages/home";
import CalendarPage from "@/pages/calendar";
import CoworkingPage from "@/pages/coworking";
import TimezonePage from "@/pages/timezone";
import BudgetPage from "@/pages/budget";
import CommunityPage from "@/pages/community";
import LegalPage from "@/pages/legal";
import { useState } from "react";

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - hidden on mobile */}
        <Sidebar />
        
        {/* Mobile Navigation */}
        <MobileNav isOpen={mobileNavOpen} setIsOpen={setMobileNavOpen} />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 md:py-6 md:px-8 px-4 pt-20 pb-6">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/calendar" component={CalendarPage} />
            <Route path="/coworking" component={CoworkingPage} />
            <Route path="/timezone" component={TimezonePage} />
            <Route path="/budget" component={BudgetPage} />
            <Route path="/community" component={CommunityPage} />
            <Route path="/legal" component={LegalPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
