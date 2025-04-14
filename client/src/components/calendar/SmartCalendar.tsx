import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CalendarConflict from "./CalendarConflict";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SmartCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
    eventType: "work",
  });
  
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Fetch calendar events
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/calendar"],
  });

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/calendar", {
        ...eventData,
        userId: 1, // For demo purposes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      toast({
        title: "Event added",
        description: "Your event has been added to the calendar.",
      });
      setIsAddEventOpen(false);
      resetNewEventForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    addEventMutation.mutate({
      ...newEvent,
      startTime: new Date(newEvent.startTime).toISOString(),
      endTime: new Date(newEvent.endTime).toISOString(),
    });
  };

  const resetNewEventForm = () => {
    setNewEvent({
      title: "",
      description: "",
      location: "",
      startTime: "",
      endTime: "",
      eventType: "work",
    });
  };

  // Calendar grid generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Fill in days from previous month to start on Sunday
  const dayOfWeek = monthStart.getDay();
  const prevMonthDays = [];
  for (let i = 0; i < dayOfWeek; i++) {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (dayOfWeek - i));
    prevMonthDays.push(date);
  }
  
  // Fill in days from next month to end on Saturday
  const lastDayOfWeek = monthEnd.getDay();
  const nextMonthDays = [];
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i);
    nextMonthDays.push(date);
  }
  
  const calendarDays = [...prevMonthDays, ...days, ...nextMonthDays];
  
  // Group days into weeks
  const weeks = [];
  let week = [];
  
  for (let i = 0; i < calendarDays.length; i++) {
    week.push(calendarDays[i]);
    
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  
  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    if (!events) return [];
    
    return events.filter((event: any) => {
      const eventDate = new Date(event.startTime);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-800">Smart Calendar</h2>
        <p className="text-neutral-600">Intelligent scheduling for digital nomads</p>
      </div>
      
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <span className="material-icons text-sm mr-1">add</span>
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="eventType">Event Type</Label>
                  <Select
                    value={newEvent.eventType}
                    onValueChange={(value) => setNewEvent({ ...newEvent, eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddEventOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addEventMutation.isPending}>
                    {addEventMutation.isPending ? "Adding..." : "Add Event"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <div className="relative">
            <Button variant="outline" className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50">
              <span className="material-icons text-sm mr-1">filter_list</span>
              Filter
              <span className="material-icons text-sm ml-1">arrow_drop_down</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <span className="material-icons">chevron_left</span>
          </Button>
          <span className="font-medium text-neutral-800">{format(currentDate, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <span className="material-icons">chevron_right</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={view === "month" ? "default" : "ghost"} 
            className={view === "month" ? "bg-primary-600" : "text-neutral-600"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button 
            variant={view === "week" ? "default" : "ghost"} 
            className={view === "week" ? "bg-primary-600" : "text-neutral-600"}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button 
            variant={view === "day" ? "default" : "ghost"} 
            className={view === "day" ? "bg-primary-600" : "text-neutral-600"}
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b border-neutral-200">
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Sunday</div>
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Monday</div>
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Tuesday</div>
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Wednesday</div>
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Thursday</div>
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Friday</div>
          <div className="py-3 text-center text-sm font-medium text-neutral-600">Saturday</div>
        </div>
        
        {/* Calendar Body */}
        <div className="grid grid-cols-7 grid-rows-5 border-b border-neutral-200">
          {weeks.map((week, weekIndex) => (
            week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={`${weekIndex}-${dayIndex}`}
                  className={`min-h-[120px] p-1 border-r border-b border-neutral-200 ${
                    !isCurrentMonth ? "bg-neutral-50" : isToday ? "bg-primary-50" : ""
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-xs ${!isCurrentMonth ? "text-neutral-400" : "text-neutral-700"} p-1 ${isToday ? "font-semibold" : ""}`}>
                    {format(day, "d")}
                  </div>
                  
                  {isLoading ? (
                    <div className="mt-1 animate-pulse">
                      <div className="h-4 bg-neutral-200 rounded mb-1 w-2/3"></div>
                    </div>
                  ) : (
                    dayEvents.slice(0, 3).map((event: any) => (
                      <div 
                        key={event.id}
                        className={`mt-1 text-xs rounded px-2 py-1 truncate ${
                          event.eventType === 'work' 
                            ? 'bg-primary-100 text-primary-800' 
                            : event.eventType === 'travel'
                              ? 'bg-accent-100 text-accent-800'
                              : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {event.title}
                      </div>
                    ))
                  )}
                  
                  {dayEvents.length > 3 && (
                    <div className="mt-1 text-xs text-neutral-500 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      {/* AI Conflict Resolution */}
      <CalendarConflict />
    </div>
  );
}
