# EcoFinds - Sustainable Marketplace

## Overview

EcoFinds is a full-stack sustainable marketplace application that allows users to buy and sell eco-friendly products. The platform focuses on promoting environmental responsibility by connecting buyers with sellers offering sustainable goods, tracking carbon savings, and providing eco-scoring for products.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 using TypeScript and modern development tools:

- **UI Framework**: React with TypeScript for type safety and developer experience
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

The application follows a component-based architecture with reusable UI components, custom hooks for business logic, and clear separation of concerns between pages, components, and utilities.

### Backend Architecture

The backend is an Express.js server with PostgreSQL database integration:

- **Server Framework**: Express.js with TypeScript for API development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: OpenID Connect integration with Replit Auth for secure user authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **Payment Processing**: Stripe integration for secure payment handling
- **Database Migrations**: Drizzle Kit for database schema management

The API follows RESTful conventions with middleware for authentication, logging, and error handling. The server implements a storage abstraction layer to decouple business logic from database operations.

### Data Storage Solutions

- **Primary Database**: PostgreSQL hosted on Neon for production-grade data persistence
- **ORM**: Drizzle ORM provides type-safe database queries and schema management
- **Session Storage**: PostgreSQL-backed session storage for user authentication persistence
- **Schema Management**: Drizzle migrations for version-controlled database schema changes

The database schema includes tables for users, products, reviews, cart items, orders, and sessions with proper relationships and constraints.

### Authentication and Authorization

- **Authentication Provider**: OpenID Connect integration with Replit's authentication service
- **Session Management**: Secure session-based authentication with HTTP-only cookies
- **Authorization**: Route-level protection with middleware checking authenticated user status
- **User Management**: Profile management with support for buyer/seller roles

### External Dependencies

- **Payment Processing**: Stripe for secure payment handling and PCI compliance
- **Database Hosting**: Neon Database for PostgreSQL hosting with connection pooling
- **Authentication**: Replit OpenID Connect for user authentication and identity management
- **UI Components**: Radix UI primitives for accessible, headless UI components
- **Email/Communication**: Ready for integration with email services for order confirmations and notifications

The architecture supports environmental impact tracking, product categorization with sustainability scoring, and a complete e-commerce workflow from product listing to order fulfillment.