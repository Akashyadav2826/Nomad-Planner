import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  currentLocation: text("current_location"),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  currentLocation: true,
  profileImage: true,
});

// Calendar events schema
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  eventType: text("event_type").notNull(), // 'work', 'travel', 'personal'
  isConflict: boolean("is_conflict").default(false),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  userId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  eventType: true,
  isConflict: true,
});

// Coworking spaces schema
export const coworkingSpaces = pgTable("coworking_spaces", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  location: text("location").notNull(),
  price: text("price"),
  rating: text("rating"),
  amenities: text("amenities").array(),
  internetSpeed: text("internet_speed"),
});

export const insertCoworkingSpaceSchema = createInsertSchema(coworkingSpaces).pick({
  userId: true,
  name: true,
  location: true,
  price: true,
  rating: true,
  amenities: true,
  internetSpeed: true,
});

// Budget entries schema
export const budgetEntries = pgTable("budget_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  category: text("category").notNull(), // 'accommodation', 'food', 'transportation', etc.
  description: text("description"),
  date: timestamp("date").notNull(),
  isWorkRelated: boolean("is_work_related").default(false),
});

export const insertBudgetEntrySchema = createInsertSchema(budgetEntries).pick({
  userId: true,
  amount: true,
  category: true,
  description: true,
  date: true,
  isWorkRelated: true,
});

// User preferences schema
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  timeZone: text("time_zone"),
  budgetLimit: integer("budget_limit"),
  preferredWorkHours: jsonb("preferred_work_hours"), // JSON object with days and hours
  nextDestination: text("next_destination"),
  nextDestinationDates: jsonb("next_destination_dates"), // JSON with start and end dates
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  timeZone: true,
  budgetLimit: true,
  preferredWorkHours: true,
  nextDestination: true,
  nextDestinationDates: true,
});

// AI conversation history
export const aiConversations = pgTable("ai_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  module: text("module").notNull(), // which module this conversation belongs to
  messages: jsonb("messages").notNull(), // array of message objects
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).pick({
  userId: true,
  module: true,
  messages: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type CoworkingSpace = typeof coworkingSpaces.$inferSelect;
export type InsertCoworkingSpace = z.infer<typeof insertCoworkingSpaceSchema>;

export type BudgetEntry = typeof budgetEntries.$inferSelect;
export type InsertBudgetEntry = z.infer<typeof insertBudgetEntrySchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
