# Maison E-Commerce — Project Reference Document

> **Purpose:** Single source of truth for any AI agent, developer, or reviewer to understand, modify, or audit this project.  
> **Last Updated:** 2026-05-10  
> **Author:** Abishek  
> **Location:** `C:\Users\Abishek\Desktop\Bag\`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Directory Structure](#3-directory-structure)
4. [Architecture & Core Flows](#4-architecture--core-flows)
5. [Frontend Pages](#5-frontend-pages)
6. [Backend API Routes](#6-backend-api-routes)
7. [Database Models](#7-database-models)
8. [Services](#8-services)
9. [Authentication](#9-authentication)
10. [Real-Time (Socket.io)](#10-real-time-socketio)
11. [AI Integration (Gemini)](#11-ai-integration-gemini)
12. [Payment (Khalti)](#12-payment-khalti)
13. [Environment Variables](#13-environment-variables)
14. [Development Guidelines](#14-development-guidelines)
15. [Common Patterns & Conventions](#15-common-patterns--conventions)

---

## 1. Overview

**Maison** is a full-stack luxury e-commerce platform with real-time features, AI-powered content generation, and Nepal-focused payment/phone authentication. Built as a SPA (Single Page Application) with a decoupled Express + MongoDB backend.

### Key Characteristics
- **Luxury aesthetic** — smooth animations (Framer Motion, GSAP), polished UI (shadcn/ui)
- **TypeScript frontend** — strict typing, React 18 + Vite
- **Real-time** — Socket.io for order tracking, notifications, and cart sync
- **AI-powered** — Google Gemini for product descriptions and search assistance
- **Nepal-focused** — NPR currency, Nepal phone auth, Nepali locale defaults

---

## 2. Technology Stack

### Frontend (Client)

| Category | Technology | Version |
|---|---|---|
| Framework | React 18 | ^18.3.1 |
| Build Tool | Vite | ^5.4.19 |
| Language | TypeScript | ^5.8.3 |
| Styling | Tailwind CSS + tailwind-merge + clsx | ^3.4.17 / ^2.6.0 / ^2.1.1 |
| UI Primitives | shadcn/ui (Radix UI components) | Various |
| State (Server) | TanStack React Query | ^5.83.0 |
| State (Local) | React Context (Auth, Store, Theme) | Built-in |
| Animations | Framer Motion, GSAP | ^12.38.0 / ^3.15.0 |
| Smooth Scroll | Lenis | ^1.3.23 |
| Routing | React Router DOM | ^6.30.1 |
| Forms | React Hook Form + Zod + @hookform/resolvers | ^7.61.1 / ^3.25.76 / ^3.10.0 |
| Auth Client | Firebase JS SDK | ^12.13.0 |
| Real-Time | Socket.io-client | ^4.8.3 |
| Charts | Recharts | ^2.15.4 |
| Icons | Lucide React | ^0.462.0 |
| UI Utilities | cmdk, vaul, date-fns, embla-carousel-react | Various |

### Backend (Server)

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | — |
| Framework | Express | ^4.21.0 |
| Database | MongoDB + Mongoose | ^9.6.2 |
| Auth Server | Firebase Admin SDK | ^13.9.0 |
| JWT | jsonwebtoken | ^9.0.2 |
| Real-Time | Socket.io | ^4.8.3 |
| AI | @google/generative-ai | ^0.24.1 |
| Payments | Khalti API | Direct HTTP calls |
| File Storage | Cloudinary | Cloudinary SDK |
| Email | Nodemailer | ^8.0.7 |
| Security | bcryptjs, cors | ^2.4.3 / ^2.8.5 |
| Config | dotenv | ^16.4.5 |
| Dev | nodemon | ^3.1.4 |

---

## 3. Directory Structure

```
Bag/
├── client/                          # React Frontend
│   ├── public/                      # Static assets (images, favicon)
│   ├── src/
│   │   ├── assets/                  # Static images, fonts
│   │   ├── components/              # Shared UI components
│   │   │   ├── admin/               # Admin panel components
│   │   │   │   ├── tabs/            # Tab content: Dashboard, Products, Orders, etc.
│   │   │   │   ├── AdminShared.tsx  # Shared admin layout/wrapper
│   │   │   │   ├── ProductModal.tsx # Create/edit product modal
│   │   │   │   ├── OrderStatusModal.tsx
│   │   │   │   ├── OrderDetailsModal.tsx
│   │   │   │   ├── ConfirmModal.tsx
│   │   │   │   └── PromptModal.tsx
│   │   │   ├── shop/                # Shop/frontend components
│   │   │   ├── site/                # Layout, Navbar, Footer
│   │   │   └── ui/                  # Low-level UI (buttons, inputs, etc.)
│   │   ├── pages/                   # Route-level page components
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.tsx      # Authentication state
│   │   │   ├── StoreContext.tsx     # Cart, Wishlist, Store state
│   │   │   └── ThemeContext.tsx     # Light/Dark theme
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── lib/                     # Client-side utilities
│   │   │   ├── api.ts              # API client (all API calls)
│   │   │   ├── firebase.ts         # Firebase initialization
│   │   │   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │   │   └── validation.ts       # Email, Nepal phone validation
│   │   ├── data/                   # Static/product data
│   │   └── constants/              # Constants (admin tabs, etc.)
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Node.js Backend
│   ├── src/
│   │   ├── app.js                   # Main Express app entry point
│   │   ├── config/                  # Configuration
│   │   │   ├── env.js               # Environment variable parsing (MySQL + MongoDB + Firebase)
│   │   │   ├── database.js          # MongoDB connection
│   │   │   └── seed.js              # Database seeding
│   │   ├── controllers/            # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── cartController.js
│   │   │   ├── wishlistController.js
│   │   │   ├── reviewController.js
│   │   │   ├── questionController.js
│   │   │   ├── couponController.js
│   │   │   ├── contactController.js
│   │   │   ├── notificationController.js
│   │   │   ├── adminController.js
│   │   │   ├── aiController.js
│   │   │   ├── uploadController.js
│   │   │   └── healthController.js
│   │   ├── lib/
│   │   │   └── socket.js           # Socket.io initialization & helper
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT auth + admin role middleware
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── userModel.js
│   │   │   ├── productModel.js
│   │   │   ├── orderModel.js
│   │   │   ├── cartModel.js
│   │   │   ├── wishlistModel.js
│   │   │   ├── couponModel.js
│   │   │   ├── reviewModel.js
│   │   │   ├── questionModel.js
│   │   │   ├── notificationModel.js
│   │   │   ├── contactModel.js
│   │   │   └── orderStatus.js
│   │   ├── routes/                  # Express route definitions
│   │   │   ├── auth.js, products.js, orders.js, cart.js
│   │   │   ├── wishlist.js, coupons.js, contact.js, admin.js
│   │   │   ├── reviews.js, questions.js, notifications.js, ai.js, uploads.js
│   │   ├── services/                # Business logic
│   │   │   ├── authService.js, productService.js, orderService.js
│   │   │   ├── cartService.js, wishlistService.js, couponService.js
│   │   │   ├── reviewService.js, questionService.js
│   │   │   ├── notificationService.js, contactService.js, adminService.js
│   │   │   ├── geminiService.js, otpService.js, uploadService.js
│   │   └── utils/                   # Utilities
│   │       ├── validation.js, mailer.js, emailTemplates.js
│   │       ├── httpError.js, asyncHandler.js
│   ├── public/                      # Server-side static files (images)
│   ├── package.json
│   └── .env                         # Environment variables (DO NOT COMMIT)
│
├── .kilo/                           # Kilo agent configuration
└── MAISON_PROJECT_REFERENCE.md      # ← THIS FILE
```

---

## 4. Architecture & Core Flows

### 4.1 Authentication Flow

```
[User clicks Login/Signup]
       ↓
[Firebase SDK (client)] → Email/password, Google OAuth, or Phone OTP
       ↓
[Firebase ID Token] → POST /api/auth/firebase  (or /auth/login, /auth/google)
       ↓
[Server: Firebase Admin SDK verifies token]
       ↓
[Server: JWT issued] → Stored in localStorage as `maison.token`
       ↓
[Subsequent requests] → Authorization: Bearer <JWT> header
       ↓
[Server middleware: authenticate()] → Decodes JWT → req.user = { id, email, role }
```

**Key detail:** Firebase handles the credential UI/verification. The server uses Firebase Admin SDK to verify the Firebase ID token, then issues its own JWT for session management.

### 4.2 Order Placement Flow

```
[User checks out] → POST /api/orders
       ↓
[Server: orderService.createOrder()]
  - Validates cart items
  - Calculates totals (subtotal + shipping - discount)
  - Creates Order in MongoDB
  - Emits "new_order" via Socket.io to admin room
  - Returns order with order_number
       ↓
[Client: OrderConfirmation page]
       ↓
[Admin sees real-time notification via Socket.io]
```

### 4.3 Khalti Payment Flow

```
[User selects Khalti at checkout]
       ↓
POST /api/orders/khalti-initiate
  → Server calls Khalti API: https://a.khalti.com/api/v2/epayment/initiate/
  → Returns pidx + payment_url
       ↓
[User redirected to Khalti payment page]
       ↓
[After payment, Khalti redirects to return_url]
       ↓
[Order status updated to "processing"]
```

**Khalti Secret Key** (live): `763829f3ec654a02a78de16937109282`  
**Hardcoded in:** `server/src/controllers/orderController.js` line 26

### 4.4 Cart Sync Flow

```
[Guest adds items to cart] → Stored in React Context (client state)
       ↓
[User logs in]
       ↓
[StoreContext: mergeAndFetch()]
  - Posts each guest cart item to /api/cart
  - Fetches full server cart
       ↓
[Cart now synced to server, visible across devices]
       ↓
[Any cart change] → POST/PUT/DELETE /api/cart
  - Server emits "cart_update" via Socket.io
  - Client listens → refetches cart
```

### 4.5 Shipping Cost Logic

```
if (subtotal > 5000 || subtotal === 0) {
    shipping = 0;   // Free shipping over Rs 5000
} else {
    shipping = 150; // Rs 150 flat rate
}
```

---

## 5. Frontend Pages

| File | Route | Purpose | Auth Required? |
|---|---|---|---|
| `Index.tsx` | `/` | Homepage — hero, featured products, categories, testimonials, journal preview | No |
| `Shop.tsx` | `/shop` | Product listing with filters (category, price, rating, sort) and search | No |
| `Product.tsx` | `/product/:slug` | Single product detail page with reviews/questions | No |
| `Cart.tsx` | `/cart` | Shopping cart with item management, coupon input | Partially (checkout needs auth) |
| `Checkout.tsx` | `/checkout` | Multi-step checkout — shipping, payment, order confirmation | Yes |
| `OrderConfirmation.tsx` | `/order-confirmation` | Post-order success page | Yes |
| `Orders.tsx` | `/orders` | User's order history | Yes |
| `TrackOrder.tsx` | `/track/:trackingNumber` | Real-time order status tracking | No (public tracking) |
| `Wishlist.tsx` | `/wishlist` | Saved wishlist items | Yes |
| `Account.tsx` | `/account` | User profile/account settings | Yes |
| `Profile.tsx` | `/profile/:id` | Public user profile | No |
| `Login.tsx` | `/login` | Email/password login + Google OAuth + Phone auth | No |
| `Signup.tsx` | `/signup` | Email/password registration | No |
| `ForgotPassword.tsx` | `/forgot-password` | Password reset initiation | No |
| `Verify.tsx` | `/verify` | Email verification / OTP verification | No |
| `Admin.tsx` | `/admin` | Full admin dashboard with tabs | Yes (admin role) |
| `Contact.tsx` | `/contact` | Contact form submission | No |
| `About.tsx` | `/about` | About page | No |
| `Journal.tsx` | `/journal` | Blog/journal page | No |
| `Offers.tsx` | `/offers` | Promotions/offers page | No |
| `FAQ.tsx` | `/faq` | Frequently asked questions | No |
| `Terms.tsx` | `/terms` | Terms & conditions | No |
| `Privacy.tsx` | `/privacy` | Privacy policy | No |
| `ShippingReturns.tsx` | `/shipping-returns` | Shipping & returns info | No |
| `SizeGuide.tsx` | `/size-guide` | Size guide reference | No |
| `NotFound.tsx` | `*` | 404 not found page | No |

### Admin Panel Tabs

| Tab Key | Component | Purpose |
|---|---|---|
| `dashboard` | `DashboardTab` | Stats overview, recent orders |
| `products` | `ProductsTab` | CRUD products, search, filters |
| `orders` | `OrdersTab` | View all orders, filter by status, update status |
| `customers` | `CustomersTab` | View registered customers |
| `feedback` | `FeedbackTab` | Manage reviews (reply/edit/delete) and questions (answer/edit/delete) |
| `notifications` | `NotificationsTab` | View/send notifications |
| `coupons` | `CouponsTab` | Create/delete discount coupons |
| `profile` | `ProfileTab` | Admin profile settings |

---

## 6. Backend API Routes

### Complete API Reference

#### `POST /api/auth/signup`
```json
// Body: { email, password, firstName, lastName, phone?, street?, city?, zip?, country? }
// Response: { user, token }
```

#### `POST /api/auth/login`
```json
// Body: { email, password }
// Response: { user, token }
```

#### `POST /api/auth/google`
```json
// Body: { credential }  // Google OAuth credential
// Response: { user, token }
```

#### `POST /api/auth/firebase`
```json
// Body: { idToken, profile? }  // Firebase ID token
// Response: { user, token }
```

#### `POST /api/auth/phone/email`
```json
// Body: { phone }  // Looks up email by phone number
// Response: { email }
```

#### `GET /api/auth/me`
```
// Headers: Authorization: Bearer <token>
// Response: { user }
```

#### `PUT /api/auth/profile`
```json
// Headers: Authorization: Bearer <token>
// Body: { firstName, lastName, email, phone, street, city, state, zip, country }
// Response: { user }
```

#### `PUT /api/auth/password`
```json
// Headers: Authorization: Bearer <token>
// Body: { currentPassword, newPassword }
// Response: { message }
```

#### `POST /api/auth/send-otp`
```json
// Body: { email }
// Response: { message }
```

#### `POST /api/auth/verify-otp`
```json
// Body: { email, code }
// Response: { success, message }
```

#### `GET /api/products`
```
// Query: ?category=<slug>&q=<search>
// Response: { products: [...] }
```

#### `GET /api/products/:slug`
```
// Response: { product }
```

#### `POST /api/products` (Admin)
```json
// Headers: Authorization: Bearer <token>
// Body: { slug, name, tagline, category, price, compare_at, description, sizes, colors, ... }
// Response: { product }
```

#### `PUT /api/products/:id` (Admin)
```json
// Response: { product }
```

#### `DELETE /api/products/:id` (Admin)
```json
// Response: { message }
```

#### `POST /api/orders`
```json
// Headers: Authorization: Bearer <token>
// Body: { items, shippingAddress, paymentMethod, ... }
// Response: { order }
```

#### `POST /api/orders/khalti-initiate`
```json
// Headers: Authorization: Bearer <token>
// Body: { amount, purchase_order_id, purchase_order_name, return_url, website_url, customer_info }
// Response: { pidx, payment_url }
```

#### `GET /api/orders/track/:trackingNumber`
```json
// Response: { order }  // Public tracking endpoint
```

#### `GET /api/orders`
```json
// Headers: Authorization: Bearer <token>
// Response: { orders: [...] }
```

#### `GET /api/orders/:orderNumber`
```json
// Headers: Authorization: Bearer <token>
// Response: { order }
```

#### `GET /api/cart` (Authenticated)
```json
// Response: { cart: [...] }
```

#### `POST /api/cart`
```json
// Body: { productId, color, size, qty? }
// Response: { message }
```

#### `PUT /api/cart/:id`
```json
// Body: { qty }
// Response: { message }
```

#### `DELETE /api/cart/:id` or `DELETE /api/cart`
```json
// Response: { message }
```

#### `POST /api/wishlist`
```json
// Body: { productId }
// Response: { action, message }
```

#### `DELETE /api/wishlist/:productId`
```json
// Response: { message }
```

#### `GET /api/wishlist`
```json
// Response: { wishlist: [...], productIds: [...] }
```

#### `POST /api/coupons/validate`
```json
// Body: { code }
// Response: { coupon: { code, pct } }
```

#### `POST /api/contact`
```json
// Body: { name, email, subject, message }
// Response: { message }
```

#### `GET /api/reviews/:productId`
```json
// Response: { reviews: [...], average, count }
```

#### `GET /api/reviews/:productId/eligibility`
```json
// Headers: Authorization: Bearer <token>
// Response: { eligible, reason }
```

#### `POST /api/reviews/:productId`
```json
// Body: { rating, title, body }
// Response: { message }
```

#### `PUT /api/reviews/:reviewId/reply` (Admin)
```json
// Body: { reply }
// Response: { message }
```

#### `PUT /api/reviews/:reviewId` (Admin)
```json
// Body: { rating, title, body }
// Response: { message }
```

#### `DELETE /api/reviews/:reviewId` (Admin)
```json
// Response: { message }
```

#### `GET /api/questions/:productId`
```json
// Response: { questions: [...], count }
```

#### `POST /api/questions/:productId`
```json
// Body: { text }
// Response: { message }
```

#### `PUT /api/questions/:questionId/answer` (Admin)
```json
// Body: { answer }
// Response: { message }
```

#### `PUT /api/questions/:questionId` (Admin)
```json
// Body: { text }
// Response: { message }
```

#### `DELETE /api/questions/:questionId` (Admin)
```json
// Response: { message }
```

#### `POST /api/notifications` (Admin)
```json
// Body: { userId, title, message, link? }
// Response: { message }
```

#### `GET /api/ai/summarize` (Authenticated)
```json
// Body: { text }
// Response: { success, summary }
```

#### `POST /api/ai/search-assistant`
```json
// Body: { query, categories? }
// Response: { success, suggestions }
```

#### `GET /api/health`
```json
// Response: { status, timestamp }
```

#### `GET /api/health/db`
```json
// Response: { status, timestamp, db }
```

---

## 7. Database Models

### User (`/server/src/models/userModel.js`)
| Field | Type | Notes |
|---|---|---|
| `firebase_uid` | String | Unique, sparse (for Firebase users) |
| `email` | String | Required, unique |
| `password_hash` | String | Required (bcrypt) |
| `first_name` | String | Required |
| `last_name` | String | Required |
| `role` | String | `"user"` or `"admin"`, default `"user"` |
| `phone` | String | |
| `avatar` | String | URL |
| `street`, `city`, `state`, `zip`, `country` | String | Default country: Nepal |
| `email_verified` | Boolean | Default `false` |
| `created_at` | Date | Auto |

### Product (`/server/src/models/productModel.js`)
| Field | Type | Notes |
|---|---|---|
| `slug` | String | Required, unique |
| `name` | String | Required |
| `tagline` | String | |
| `category` | String | Enum: `handbags, backpacks, travel, office, college, fashion, accessories` |
| `price` | Number | Required |
| `compare_at` | Number | Original price for discount display |
| `rating` | Number | Default 0 |
| `reviews` | Number | Default 0 (count) |
| `stock` | Number | Default 0 |
| `material` | String | |
| `description` | String | |
| `is_new` | Boolean | Default false |
| `is_bestseller` | Boolean | Default false |
| `sizes` | [String] | |
| `colors` | [{name, hex, image_url}] | |
| `details` | [String] | Bullet-point product details |

### Order (`/server/src/models/orderModel.js`)
| Field | Type | Notes |
|---|---|---|
| `order_number` | String | Required, unique |
| `user` | ObjectId | Ref: User |
| `status` | String | Enum: `processing, shipped, delivered, cancelled`, default `processing` |
| `subtotal` | Number | Required |
| `shipping` | Number | Default 0 |
| `discount` | Number | Default 0 |
| `total` | Number | Required |
| `tracking_number` | String | |
| `shipping_address` | Object | {first_name, last_name, email, phone, street, city, state, zip, country} |
| `payment_method` | String | Default `"card"` |
| `items` | [{product_name, color, size, qty, price, image}] | |
| `created_at` | Date | Auto |

### CartItem (`/server/src/models/cartModel.js`)
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Ref: User |
| `product` | ObjectId | Ref: Product |
| `color` | String | Required |
| `size` | String | Required |
| `qty` | Number | Default 1 |
| **Index** | `{user, product, color, size}` | Unique compound index |

### Wishlist (`/server/src/models/wishlistModel.js`)
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId | Ref: User |
| `product` | ObjectId | Ref: Product |
| **Index** | `{user, product}` | Unique |

### Coupon (`/server/src/models/couponModel.js`)
| Field | Type | Notes |
|---|---|---|
| `code` | String | Required, unique |
| `discount_pct` | Number | Required (percentage) |
| `description` | String | Public description |
| `terms` | String | Internal notes |
| `active` | Boolean | Default `true` |

### Review, Question, Notification, Contact
Located in `/server/src/models/`: `reviewModel.js`, `questionModel.js`, `notificationModel.js`, `contactModel.js`

---

## 8. Services

Located in `/server/src/services/`:

| File | Purpose |
|---|---|
| `authService.js` | Signup, login (email/password, Google, Firebase), profile management, password change |
| `otpService.js` | OTP generation and verification for email authentication |
| `productService.js` | Product CRUD, searching, filtering |
| `orderService.js` | Order creation, listing, status tracking |
| `cartService.js` | Cart CRUD operations |
| `wishlistService.js` | Wishlist toggle/retrieve |
| `couponService.js` | Coupon validation, creation, listing |
| `reviewService.js` | Review CRUD, eligibility check |
| `questionService.js` | Question CRUD, admin answers |
| `notificationService.js` | Notification CRUD, real-time dispatch |
| `contactService.js` | Contact form handling |
| `adminService.js` | Admin stats, order management, customer listing, feedback management |
| `geminiService.js` | Google Gemini AI integration for text summarization and search |
| `uploadService.js` | Image upload (Cloudinary) for products and avatars |

---

## 9. Authentication

### Authentication Methods
1. **Email + Password** — Firebase email auth → server verifies → JWT issued
2. **Google OAuth** — Firebase Google provider popup → server verifies → JWT issued
3. **Phone (Nepal numbers)** — Firebase phone auth with reCAPTCHA → server verifies → JWT issued

### Role System
- **`user`** — Standard customer
- **`admin`** — Admin panel access
- Admin check: `user.role === "admin"` OR `user.email` is in `ADMIN_EMAILS` list (`abishekc441@gmail.com`)

### Token Storage
- Key: `maison.token` (localStorage)
- Format: JWT Bearer token
- Server validates via middleware in `server/src/middleware/auth.js`

### OTP Verification Flow (Email)
1. User signs up → OTP sent to email via `sendOtp`
2. User enters OTP → `verifyOtp` endpoint
3. Server marks email as verified → Firebase token exchanged → JWT issued

---

## 10. Real-Time (Socket.io)

### Server-Side (`/server/src/lib/socket.js`)
- **Rooms:**
  - `user_<userId>` — Private room for each user (order updates, notifications)
  - `admins` — Admin room (new order notifications)
  - `product:<productId>` — Product view room

### Client-Side Events Listened To (`/client/src/context/AuthContext.tsx`)
| Event | Trigger | Action |
|---|---|---|
| `notification` | Any notification | Show toast, refetch notifications |
| `order_update` | Order status change | Show toast, refetch orders + notifications |
| `new_order` | New order placed (admin) | Show toast, refetch orders |
| `cart_update` | Cart changed (in StoreContext) | Refetch cart from server |

### Client Events Emitted
| Event | When |
|---|---|
| `join_user` | User logs in (joins `user_<userId>` room) |
| `join_admin` | Admin logs in (joins `admins` room) |
| `join_product` | Viewing a product page |
| `leave_product` | Leaving a product page |

---

## 11. AI Integration (Gemini)

### Endpoints
- `POST /api/ai/summarize` — Summarize text (authenticated)
- `POST /api/ai/search-assistant` — AI-powered search suggestions (public)

### Backend (`/server/src/controllers/aiController.js`)
Uses `@google/generative-ai` with the Gemini model.

### Frontend (`/client/src/lib/api.ts`)
```typescript
aiApi.summarize(text)         // POST /ai/summarize
aiApi.searchAssistant(query)  // POST /ai/search-assistant
```

---

## 12. Payment (Khalti)

### Integration Details
- **API:** `https://a.khalti.com/api/v2/epayment/initiate/`
- **Live Secret Key:** `763829f3ec654a02a78de16937109282`
- **Flow:** Server-side initiation → Redirect to Khalti → Return to `return_url`
- **Amount:** Converted to Paisa (amount × 100)

### Code Location
`/server/src/controllers/orderController.js` — `initiateKhalti()` function

---

## 13. Environment Variables

### Server (`.env` at server root)
```
# Database
MONGODB_URI=mongodb://localhost:27017/maison_db
# (Also supports MySQL via MYSQL_URL)

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAILS=abishekc441@gmail.com

# Firebase (Admin SDK)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
# Or: FIREBASE_SERVICE_ACCOUNT={json_string}

# Google
GOOGLE_CLIENT_ID=

# App
PORT=5000
CLIENT_URL=http://localhost:8080
```

### Client (`.env` at client root or Vite env)
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_CLIENT_ID=
```

---

## 14. Development Guidelines

### Auto-Update Policy (CRITICAL)
**Every time a task is completed, a file is modified, or a feature is added:**
1. Update the `Auto-Update Log` section in `/server/.agent/rules/project-rules.md`
2. Update this reference document if architecture changes

### Code Standards
- **Frontend:** TypeScript strict mode, camelCase, React hooks
- **Backend:** CommonJS (require/module.exports), async/await with `asyncHandler` wrapper
- **Error handling:** Centralized error handler middleware
- **API calls:** All go through `client/src/lib/api.ts` for consistency

### Testing
```bash
cd client && npm test        # Run Vitest
```

### Running the Project
```bash
# Server
cd server && npm run dev     # Nodemon + Node

# Client
cd client && npm run dev     # Vite dev server (port 5080 or 8080)
```

---

## 15. Common Patterns & Conventions

### API Client Pattern (client/src/lib/api.ts)
- `request<T>(endpoint, options)` — Generic fetch wrapper with JWT auth
- `uploadRequest<T>(endpoint, formData)` — Multipart upload wrapper
- `normalizeAssetUrls()` — Automatically resolves image URLs from Cloudinary/server
- `setToken()` / `getToken()` — JWT persistence in localStorage

### Middleware Chain (server)
```
Request → cors → express.json → auth middleware (where required) → controller
```

### Naming Conventions
| Convention | Example |
|---|---|
| Route files | `auth.js`, `products.js`, `orders.js` |
| Controller files | `authController.js`, `productController.js` |
| Service files | `authService.js`, `productService.js` |
| Model files | `userModel.js`, `productModel.js` |
| Client API groups | `authApi`, `productsApi`, `ordersApi`, `cartApi` |
| MongoDB models | PascalCase: `Order`, `User`, `Product` |

### MongoDB Models → Frontend Type Mapping
- Models use `toJSON()` methods that automatically transform snake_case → camelCase
- This ensures frontend always receives camelCase fields (e.g., `order_number` → `orderNumber`)

### Auth Guard Pattern
```javascript
// Routes that need auth:
router.get("/", authenticate, handler)

// Routes that need admin:
router.get("/", authenticate, requireAdmin, handler)

// Public routes:
router.get("/", handler)
```

### Coupon Discount Logic
- Coupons store `discount_pct` (percentage)
- Applied in `StoreContext.tsx`: `discount = (subtotal * coupon.pct) / 100`
- No stacking — single coupon at a time

### Image URL Resolution
- All image URLs from the API go through `resolveAssetUrl()` in `api.ts`
- Patterns handled:
  - Absolute URLs (https://...) → passed through
  - Data/blob URLs → passed through
  - `/images/...` paths → prefixed with server base URL
  - Image files without prefix → prepended with `/images/`
  - Emails (contain `@`) → not transformed

---

## Known Hardcoded Values

| Value | Location | Notes |
|---|---|---|
| Khalti Secret Key | `server/src/controllers/orderController.js:26` | `763829f3ec654a02a78de16937109282` |
| Admin Emails | `server/src/config/env.js:63` | `abishekc441@gmail.com` |
| Admin Emails (frontend hint) | `client/src/context/AuthContext.tsx:29` | `abishekc441@gmail.com` |
| Free shipping threshold | `client/src/context/StoreContext.tsx:235` | Rs 5,000 |
| Shipping cost | `client/src/context/StoreContext.tsx:235` | Rs 150 flat |
| JWT storage key | `client/src/lib/api.ts:64` | `maison.token` |
| Context local storage key | `client/src/context/StoreContext.tsx:43` | `maison.store.v1` |

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-05-10 | Abishek | Initial project reference document created |

---

*This document should be updated whenever significant architectural changes, new features, or bug fixes are applied to the project.*