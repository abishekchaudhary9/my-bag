# Maison Project Rules & Architecture

This document serves as a persistent memory for the Maison E-commerce project. It outlines the core architecture, technology stack, and directory structure to ensure consistency and minimize re-scanning.

## Current State
- **Stability:** The project is in an active development phase with a fully functional frontend and backend.
- **Recent Additions:** 
    - Initial project documentation and architecture summary created.
    - Full-stack integration with MongoDB, Firebase, and Gemini AI is established.
    - Added branded `placeholder.png` to the public assets.
    - Fixed favicon loading issue by linking `favicon.png` in `index.html`.
- **Active Areas:** Refinement of the Admin Dashboard and Feedback systems.

## Technology Stack

### Frontend (Client)
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS (Aesthetics prioritized)
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** TanStack Query (React Query) + React Context (Auth, Store, Theme)
- **Animations:** Framer Motion, GSAP, Lenis (Smooth scrolling)

### Backend (Server)
- **Runtime:** Node.js (Express)
- **Database:** MongoDB (Mongoose)
- **Authentication:** Firebase Admin SDK + JWT
- **Real-time:** Socket.io (Order tracking, notifications)
- **AI Integration:** Google Gemini AI

## Logic & Core Flows

### Authentication Flow
1. **Frontend:** User logs in via Firebase (Web SDK).
2. **Token Exchange:** The Firebase ID Token is sent to the `/api/auth/verify` endpoint.
3. **Backend:** Firebase Admin SDK verifies the token and retrieves user data.
4. **Session:** A JWT or session is established for subsequent API requests.

### Real-time Order Tracking
1. **Socket Initialization:** Sockets are initialized on server startup (`initSocket`).
2. **Order Updates:** When an order status changes in the database, a socket event is emitted to the specific user's room.
3. **Frontend Listeners:** The `TrackOrder` page listens for these events and updates the UI instantly without refresh.

### AI Integration
- **Gemini AI:** Used for intelligent product descriptions, automated customer queries, or administrative tasks via the `/api/ai` routes.

## Directory Structure

### `/client` (Frontend)
- `src/components`: UI components (shadcn/ui and custom).
- `src/pages`: Views (Shop, Product, Admin, Profile, etc.).
- `src/context`: Global state (Auth, Store, Theme).

### `/server` (Backend)
- `src/controllers`: Request handlers.
- `src/models`: Mongoose schemas.
- `src/routes`: API endpoints.
- `src/middleware`: Auth and Error handling.

## Development Guidelines
- **Visual Excellence:** Maintain high-end aesthetics with smooth transitions.
- **Type Safety:** Strict TypeScript usage in the frontend.
- **Auto-Update Policy:** **CRITICAL:** Every time a task is completed, a file modified, or a feature added, update this file's 'Current State', 'Logic', and 'Auto-Update Log' sections.

---

## Auto-Update Log
*This section is automatically updated after every significant task.*

- **2026-05-10:** Restructured file to include 'Current State' and 'Logic' sections. Formalized the Auto-Update Policy.
- **2026-05-10:** Added branded `placeholder.png` to `client/public/`. Identified user-added `favicon.png`.
- **2026-05-10:** Fixed favicon visibility by adding the explicit link tag to `index.html`.
