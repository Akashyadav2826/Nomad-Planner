import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCalendarEventSchema, insertCoworkingSpaceSchema, insertBudgetEntrySchema, insertUserPreferencesSchema } from "@shared/schema";
import { z } from "zod";
import {
  callGeminiAPI,
  analyzeCalendarConflicts,
  getCoworkingRecommendations,
  getTimeZoneRecommendations,
  analyzeBudget,
  getCommunityRecommendations,
  getLegalResources,
  getAssistantResponse
} from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Current user route (temporary, would use auth in real app)
  app.get("/api/current-user", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always return user 1
      const user = await storage.getUser(1);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // User preferences routes
  app.get("/api/user-preferences", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always use user 1
      const preferences = await storage.getUserPreferences(1);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user preferences" });
    }
  });

  app.post("/api/user-preferences", async (req: Request, res: Response) => {
    try {
      const validatedPrefs = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.createOrUpdateUserPreferences(validatedPrefs);
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating user preferences" });
    }
  });

  // Calendar routes
  app.get("/api/calendar", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always use user 1
      const events = await storage.getCalendarEvents(1);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Error fetching calendar events" });
    }
  });

  app.post("/api/calendar", async (req: Request, res: Response) => {
    try {
      const validatedEvent = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validatedEvent);
      res.json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating calendar event" });
    }
  });

  app.put("/api/calendar/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const event = await storage.updateCalendarEvent(id, req.body);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Error updating calendar event" });
    }
  });

  app.delete("/api/calendar/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteCalendarEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting calendar event" });
    }
  });

  // Calendar AI analysis
  app.post("/api/calendar/analyze", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always use user 1
      const events = await storage.getCalendarEvents(1);
      const analysis = await analyzeCalendarConflicts(events);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing calendar:", error);
      res.status(500).json({ message: "Error analyzing calendar" });
    }
  });

  // Co-working spaces routes
  app.get("/api/coworking", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always use user 1
      const spaces = await storage.getCoworkingSpaces(1);
      res.json(spaces);
    } catch (error) {
      res.status(500).json({ message: "Error fetching coworking spaces" });
    }
  });

  app.post("/api/coworking", async (req: Request, res: Response) => {
    try {
      const validatedSpace = insertCoworkingSpaceSchema.parse(req.body);
      const space = await storage.createCoworkingSpace(validatedSpace);
      res.json(space);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating coworking space" });
    }
  });

  // Co-working AI recommendations
  app.post("/api/coworking/recommend", async (req: Request, res: Response) => {
    try {
      const preferences = req.body;
      const recommendations = await getCoworkingRecommendations(preferences);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting coworking recommendations:", error);
      res.status(500).json({ message: "Error getting coworking recommendations" });
    }
  });

  // Time zone management routes
  app.post("/api/timezone/recommend", async (req: Request, res: Response) => {
    try {
      const teamInfo = req.body;
      const recommendations = await getTimeZoneRecommendations(teamInfo);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting time zone recommendations:", error);
      res.status(500).json({ message: "Error getting time zone recommendations" });
    }
  });

  // Budget routes
  app.get("/api/budget", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always use user 1
      const entries = await storage.getBudgetEntries(1);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching budget entries" });
    }
  });

  app.post("/api/budget", async (req: Request, res: Response) => {
    try {
      const validatedEntry = insertBudgetEntrySchema.parse(req.body);
      const entry = await storage.createBudgetEntry(validatedEntry);
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating budget entry" });
    }
  });

  // Budget AI analysis
  app.post("/api/budget/analyze", async (req: Request, res: Response) => {
    try {
      // For demo, we'll always use user 1
      const entries = await storage.getBudgetEntries(1);
      const analysis = await analyzeBudget({
        entries,
        currentLocation: "Thailand",
        nextDestination: "Vietnam"
      });
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing budget:", error);
      res.status(500).json({ message: "Error analyzing budget" });
    }
  });

  // Community connection routes
  app.post("/api/community/recommend", async (req: Request, res: Response) => {
    try {
      const userProfile = req.body;
      const recommendations = await getCommunityRecommendations(userProfile);
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting community recommendations:", error);
      res.status(500).json({ message: "Error getting community recommendations" });
    }
  });

  // Legal resources routes
  app.post("/api/legal/resources", async (req: Request, res: Response) => {
    try {
      const query = req.body;
      const resources = await getLegalResources(query);
      res.json(resources);
    } catch (error) {
      console.error("Error getting legal resources:", error);
      res.status(500).json({ message: "Error getting legal resources" });
    }
  });

  // General AI assistant
  app.post("/api/assistant", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query is required and must be a string" });
      }
      
      const response = await getAssistantResponse(query);
      res.json(response);
    } catch (error) {
      console.error("Error getting assistant response:", error);
      res.status(500).json({ message: "Error getting assistant response" });
    }
  });

  return httpServer;
}
