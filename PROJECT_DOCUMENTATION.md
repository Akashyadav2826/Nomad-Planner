# Digital Nomad Planner - AI-Powered Application

## Project Overview
An AI-powered Digital Nomad Planner application using Google Gemini API to help digital nomads effectively manage their travel lifestyle. The application consists of six core modules, all enhanced with AI capabilities to provide personalized planning and resources.

## Core Modules

### 1. Smart Calendar
- **Components:**
  - `SmartCalendar.tsx` - Main calendar component with event management
  - `CalendarConflict.tsx` - AI-assisted conflict detection and resolution
- **Features:**
  - Calendar events display and management
  - AI-powered schedule conflict detection
  - Smart rescheduling suggestions

### 2. Co-working Spaces
- **Components:**
  - `CoworkingSpaces.tsx` - Co-working space finder and recommendation system
- **Features:**
  - Search for co-working spaces based on location and preferences
  - AI recommendations based on user criteria
  - Saved workspace management

### 3. Time Zone Manager
- **Components:**
  - `TimeZoneManager.tsx` - Time zone management for global teams
- **Features:**
  - Team member location tracking
  - World clock for quick time reference
  - AI-powered optimal meeting time suggestions
  - Jetlag management tips

### 4. Budget Tracker
- **Components:**
  - `BudgetTracker.tsx` - Budget management and analysis
- **Features:**
  - Expense tracking and categorization
  - Work vs. personal expense separation
  - Visual spending breakdowns with charts
  - AI-powered budget optimization recommendations

### 5. Community Connector
- **Components:**
  - `CommunityConnector.tsx` - Community and networking finder
- **Features:**
  - Profile-based community recommendations
  - Personalized connection suggestions
  - Networking approach recommendations
  - Community connection tips

### 6. Legal Resources
- **Components:**
  - `LegalResources.tsx` - Legal information for digital nomads
- **Features:**
  - AI-powered legal information for visas and work permits
  - Tax implications analysis for different countries
  - Authoritative resource references
  - Common legal questions and answers

## Technical Architecture

### Frontend
- React with TypeScript
- UI Components: ShadCN UI library
- Routing: Wouter
- State Management: React Query

### Backend
- Node.js with Express
- In-memory storage for data persistence
- RESTful API endpoints

### AI Integration
- Google Gemini API for intelligent features
- JSON-formatted AI responses for structured data handling

## UI Components Used
- **Layout Components:** Cards, Tabs, Dialog, Badge
- **Input Components:** Input, Textarea, Select, Checkbox
- **Display Components:** Toast, Alert, Accordion
- **Navigation:** Sidebar, Mobile Navigation
- **Data Visualization:** Charts (PieChart, BarChart)

## Data Models
- User profile
- Calendar events
- Coworking spaces
- Budget entries
- User preferences
- AI conversations

## Deployment
- The application runs on Replit
- Environment variables for API key management

## Future Enhancements
- Database integration for persistent storage
- Mobile application development
- Advanced AI prompt engineering
- Multi-user support and sharing features