# Nomad Planner Pro

A comprehensive travel planning application for digital nomads and frequent travelers.

## Features

- Trip planning and itinerary management
- Accommodation and transportation bookings
- Expense tracking
- Location-based recommendations
- Offline access to important travel information
- Weather forecasts for destinations

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/NomadPlannerPro.git
   cd NomadPlannerPro
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/nomadplanner
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```

4. Run database migrations:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run check` - Run TypeScript type checking

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 