# Nomad-Planner

A comprehensive travel planning application for digital nomads and frequent travelers, helping you organize your trips, manage accommodations, and track expenses efficiently.

## Features

- Trip planning and itinerary management
- Accommodation and transportation bookings
- Expense tracking and budget management
- Location-based recommendations
- Offline access to important travel information
- Weather forecasts for destinations
- User authentication and profile management
- Real-time collaboration for group trips

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **API Integration**: Weather and Maps APIs
- **Deployment**: GitHub Actions for CI/CD

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Git for version control

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Akashyadav2826/Nomad-Planner.git
   cd Nomad-Planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/nomadplanner
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Run database migrations

## Project Structure

```
Nomad-Planner/
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared types and utilities
├── attached_assets/ # Static assets
└── docs/           # Project documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries used in this project 