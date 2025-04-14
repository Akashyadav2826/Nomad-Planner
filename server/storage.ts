import {
  User, InsertUser, users,
  CalendarEvent, InsertCalendarEvent, calendarEvents,
  CoworkingSpace, InsertCoworkingSpace, coworkingSpaces,
  BudgetEntry, InsertBudgetEntry, budgetEntries,
  UserPreferences, InsertUserPreferences, userPreferences,
  AiConversation, InsertAiConversation, aiConversations
} from "@shared/schema";

// Define storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Calendar events methods
  getCalendarEvents(userId: number): Promise<CalendarEvent[]>;
  getCalendarEventById(id: number): Promise<CalendarEvent | undefined>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined>;
  deleteCalendarEvent(id: number): Promise<boolean>;
  
  // Coworking spaces methods
  getCoworkingSpaces(userId: number): Promise<CoworkingSpace[]>;
  getCoworkingSpaceById(id: number): Promise<CoworkingSpace | undefined>;
  createCoworkingSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace>;
  
  // Budget entries methods
  getBudgetEntries(userId: number): Promise<BudgetEntry[]>;
  getBudgetEntryById(id: number): Promise<BudgetEntry | undefined>;
  createBudgetEntry(entry: InsertBudgetEntry): Promise<BudgetEntry>;
  updateBudgetEntry(id: number, entry: Partial<InsertBudgetEntry>): Promise<BudgetEntry | undefined>;
  
  // User preferences methods
  getUserPreferences(userId: number): Promise<UserPreferences | undefined>;
  createOrUpdateUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences>;
  
  // AI conversation methods
  getAiConversations(userId: number, module: string): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  updateAiConversation(id: number, messages: any[]): Promise<AiConversation | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calendarEvents: Map<number, CalendarEvent>;
  private coworkingSpaces: Map<number, CoworkingSpace>;
  private budgetEntries: Map<number, BudgetEntry>;
  private userPreferences: Map<number, UserPreferences>;
  private aiConversations: Map<number, AiConversation>;
  
  private currentUserId: number;
  private currentCalendarEventId: number;
  private currentCoworkingSpaceId: number;
  private currentBudgetEntryId: number;
  private currentUserPreferencesId: number;
  private currentAiConversationId: number;

  constructor() {
    this.users = new Map();
    this.calendarEvents = new Map();
    this.coworkingSpaces = new Map();
    this.budgetEntries = new Map();
    this.userPreferences = new Map();
    this.aiConversations = new Map();
    
    this.currentUserId = 1;
    this.currentCalendarEventId = 1;
    this.currentCoworkingSpaceId = 1;
    this.currentBudgetEntryId = 1;
    this.currentUserPreferencesId = 1;
    this.currentAiConversationId = 1;
    
    // Initialize with a demo user
    this.createUser({
      username: "alexmorgan",
      password: "password123", // In a real app, this would be hashed
      fullName: "Alex Morgan",
      currentLocation: "Bangalore, India",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80"
    });
    
    // Add demo user preferences
    this.createOrUpdateUserPreferences({
      userId: 1,
      timeZone: "Asia/Kolkata",
      budgetLimit: 2500,
      preferredWorkHours: {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "13:00" },
      },
      nextDestination: "Goa, India",
      nextDestinationDates: {
        start: "2025-04-15",
        end: "2025-06-20"
      }
    });
    
    // Add some calendar events
    this.createCalendarEvent({
      userId: 1,
      title: "Team Weekly Sync",
      description: "Regular team meeting",
      startTime: new Date("2025-03-15T09:00:00+05:30"), // IST timezone
      endTime: new Date("2025-03-15T10:00:00+05:30"),
      location: "Zoom",
      eventType: "work",
      isConflict: false
    });
    
    this.createCalendarEvent({
      userId: 1,
      title: "Train to Mumbai",
      description: "Business trip to Mumbai",
      startTime: new Date("2025-03-15T13:00:00+05:30"), // IST timezone
      endTime: new Date("2025-03-15T17:30:00+05:30"),
      location: "Bangalore City Railway Station",
      eventType: "travel",
      isConflict: false
    });
    
    this.createCalendarEvent({
      userId: 1,
      title: "Client Presentation",
      description: "Present design concepts to client",
      startTime: new Date("2025-03-15T17:00:00+05:30"), // IST timezone
      endTime: new Date("2025-03-15T18:00:00+05:30"),
      location: "Google Meet",
      eventType: "work",
      isConflict: false
    });
    
    this.createCalendarEvent({
      userId: 1,
      title: "Team Meeting",
      description: "Weekly team sync with US team",
      startTime: new Date("2025-04-15T20:00:00+05:30"), // IST timezone (morning EST)
      endTime: new Date("2025-04-15T21:00:00+05:30"),
      location: "Zoom",
      eventType: "work",
      isConflict: true
    });
    
    this.createCalendarEvent({
      userId: 1,
      title: "Flight to Goa",
      description: "Weekend getaway",
      startTime: new Date("2025-04-15T17:00:00+05:30"), // IST timezone
      endTime: new Date("2025-04-15T19:00:00+05:30"),
      location: "Bangalore Airport (BLR) to Goa Airport (GOI)",
      eventType: "travel",
      isConflict: true
    });
    
    // Add some coworking spaces
    this.createCoworkingSpace({
      userId: 1,
      name: "WeWork Galaxy",
      location: "Residency Road, Bangalore",
      price: "₹800/day",
      rating: "4.6",
      amenities: ["Fast WiFi", "Meeting Rooms", "Cafe", "24/7 Access"],
      internetSpeed: "300 Mbps"
    });
    
    this.createCoworkingSpace({
      userId: 1,
      name: "91springboard",
      location: "Koramangala, Bangalore",
      price: "₹650/day",
      rating: "4.5",
      amenities: ["200mbps", "Standing desks", "Game Room", "Events"],
      internetSpeed: "200 Mbps"
    });
    
    // Add some budget entries
    this.createBudgetEntry({
      userId: 1,
      amount: 600,
      category: "accommodation",
      description: "Co-living space with work area",
      date: new Date("2025-03-01"),
      isWorkRelated: true
    });
    
    this.createBudgetEntry({
      userId: 1,
      amount: 150,
      category: "coworking",
      description: "Co-working space membership",
      date: new Date("2025-03-01"),
      isWorkRelated: true
    });
    
    this.createBudgetEntry({
      userId: 1,
      amount: 450,
      category: "food",
      description: "Groceries and eating out",
      date: new Date("2025-03-01"),
      isWorkRelated: false
    });
    
    this.createBudgetEntry({
      userId: 1,
      amount: 200,
      category: "transportation",
      description: "Local transport and taxis",
      date: new Date("2025-03-01"),
      isWorkRelated: false
    });
    
    this.createBudgetEntry({
      userId: 1,
      amount: 300,
      category: "entertainment",
      description: "Activities and outings",
      date: new Date("2025-03-01"),
      isWorkRelated: false
    });
    
    this.createBudgetEntry({
      userId: 1,
      amount: 50,
      category: "internet",
      description: "Internet upgrade",
      date: new Date("2025-03-01"),
      isWorkRelated: true
    });
    
    this.createBudgetEntry({
      userId: 1,
      amount: 200,
      category: "equipment",
      description: "New monitor",
      date: new Date("2025-03-01"),
      isWorkRelated: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Calendar events methods
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values()).filter(
      (event) => event.userId === userId
    );
  }

  async getCalendarEventById(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.currentCalendarEventId++;
    const newEvent: CalendarEvent = { ...event, id };
    this.calendarEvents.set(id, newEvent);
    return newEvent;
  }

  async updateCalendarEvent(id: number, eventUpdates: Partial<InsertCalendarEvent>): Promise<CalendarEvent | undefined> {
    const event = this.calendarEvents.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdates };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteCalendarEvent(id: number): Promise<boolean> {
    return this.calendarEvents.delete(id);
  }

  // Coworking spaces methods
  async getCoworkingSpaces(userId: number): Promise<CoworkingSpace[]> {
    return Array.from(this.coworkingSpaces.values()).filter(
      (space) => space.userId === userId
    );
  }

  async getCoworkingSpaceById(id: number): Promise<CoworkingSpace | undefined> {
    return this.coworkingSpaces.get(id);
  }

  async createCoworkingSpace(space: InsertCoworkingSpace): Promise<CoworkingSpace> {
    const id = this.currentCoworkingSpaceId++;
    const newSpace: CoworkingSpace = { ...space, id };
    this.coworkingSpaces.set(id, newSpace);
    return newSpace;
  }

  // Budget entries methods
  async getBudgetEntries(userId: number): Promise<BudgetEntry[]> {
    return Array.from(this.budgetEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }

  async getBudgetEntryById(id: number): Promise<BudgetEntry | undefined> {
    return this.budgetEntries.get(id);
  }

  async createBudgetEntry(entry: InsertBudgetEntry): Promise<BudgetEntry> {
    const id = this.currentBudgetEntryId++;
    const newEntry: BudgetEntry = { ...entry, id };
    this.budgetEntries.set(id, newEntry);
    return newEntry;
  }

  async updateBudgetEntry(id: number, entryUpdates: Partial<InsertBudgetEntry>): Promise<BudgetEntry | undefined> {
    const entry = this.budgetEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...entryUpdates };
    this.budgetEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreferences | undefined> {
    return Array.from(this.userPreferences.values()).find(
      (prefs) => prefs.userId === userId
    );
  }

  async createOrUpdateUserPreferences(prefs: InsertUserPreferences): Promise<UserPreferences> {
    const existingPrefs = await this.getUserPreferences(prefs.userId);
    
    if (existingPrefs) {
      const updatedPrefs = { ...existingPrefs, ...prefs };
      this.userPreferences.set(existingPrefs.id, updatedPrefs);
      return updatedPrefs;
    } else {
      const id = this.currentUserPreferencesId++;
      const newPrefs: UserPreferences = { ...prefs, id };
      this.userPreferences.set(id, newPrefs);
      return newPrefs;
    }
  }

  // AI conversation methods
  async getAiConversations(userId: number, module: string): Promise<AiConversation[]> {
    return Array.from(this.aiConversations.values()).filter(
      (conv) => conv.userId === userId && conv.module === module
    );
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.currentAiConversationId++;
    const newConversation: AiConversation = { 
      ...conversation, 
      id, 
      createdAt: new Date() 
    };
    this.aiConversations.set(id, newConversation);
    return newConversation;
  }

  async updateAiConversation(id: number, messages: any[]): Promise<AiConversation | undefined> {
    const conversation = this.aiConversations.get(id);
    if (!conversation) return undefined;
    
    const updatedConversation = { ...conversation, messages };
    this.aiConversations.set(id, updatedConversation);
    return updatedConversation;
  }
}

// Export the storage instance
export const storage = new MemStorage();
