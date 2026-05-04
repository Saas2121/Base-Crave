# CRAVE - Food Discovery Platform

A platform connecting consumers with nearby food businesses offering discounted end-of-day menu items.

## Project Structure

```
crave/
├── backend/           # Express.js API server
├── client-app/        # React app for consumers
├── store-app/         # React app for store owners
└── docs/            # Project documentation
```

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- Supabase account and project

### 2. Supabase Setup
1. Create a new Supabase project if you haven't already
2. Go to **SQL Editor** in your Supabase dashboard
3. Run this SQL to create the database tables:

```sql
-- Borrar tablas si existen
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS packs CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('consumer', 'store_admin')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stores table
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  is_open BOOLEAN DEFAULT TRUE,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packs table
CREATE TABLE packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  title TEXT NOT NULL,
  description TEXT,
  pack_type TEXT NOT NULL CHECK (pack_type IN ('surprise', 'fixed')),
  price INTEGER NOT NULL,
  original_price INTEGER,
  pickup_start TIMESTAMP NOT NULL,
  pickup_end TIMESTAMP NOT NULL,
  total_quantity INTEGER NOT NULL,
  remaining_quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'expired')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  store_id UUID REFERENCES stores(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reservations table
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  pack_id UUID REFERENCES packs(id),
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'reserved' CHECK (status IN ('reserved', 'in_process', 'ready', 'picked_up', 'cancelled', 'expired')),
  pickup_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Environment Variables

The `.env` files are already created with your Supabase credentials. If you need to update them:

**backend/.env**
```
SUPABASE_URL=https://kcuipgnjqdatxmosrtpu.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdWlwZ25qcWRhdHhtb3NydHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc2NjQ4NTYsImV4cCI6MjA5MzI0MDg1Nn0.txdObNUVWRa7YAKIOxF7O8117cq_PZd6MJRGz3su-B0
JWT_SECRET=crave_jwt_secret_2026_change_me
PORT=3000
```

**client-app/.env**
```
VITE_SUPABASE_URL=https://kcuipgnjqdatxmosrtpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdWlwZ25qcWRhdHhtb3NydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjQ4NTYsImV4cCI6MjA5MzI0MDg1Nn0.hdmkRNQdAtOuojihQ1kEFnd88Rc38L4w-bVWgwyU0Rs
```

**store-app/.env**
```
VITE_SUPABASE_URL=https://kcuipgnjqdatxmosrtpu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdWlwZ25qcWRhdHhtb3NydHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NjQ4NTYsImV4cCI6MjA5MzI0MDg1Nn0.hdmkRNQdAtOuojihQ1kEFnd88Rc38L4w-bVWgwyU0Rs
```

### 4. Install Dependencies

Open 3 separate terminals and run:

**Terminal 1 - Backend:**
```bash
cd D:\Usuario\Documents\Nico\programacion\Crave\backend
npm install
npm run dev
```

**Terminal 2 - Client App:**
```bash
cd D:\Usuario\Documents\Nico\programacion\Crave\client-app
npm install
npm run dev
```

**Terminal 3 - Store App:**
```bash
cd D:\Usuario\Documents\Nico\programacion\Crave\store-app
npm install
npm run dev
```

### 5. Access the Apps

- **Client App:** http://localhost:5175 (or the port shown in terminal)
- **Store App:** http://localhost:5174 (or the port shown in terminal)

## Features

### Consumer App (client-app)
- Start screen with Sign In / Register
- Home with search options (List, Map, Favorites, Profile)
- Browse stores and packs
- View pack details
- Reserve packs with quantity selection
- View pickup QR code after reservation
- Manage favorites
- Profile with reservation history

### Store App (store-app)
- Dashboard with stats (Active Packs, Pending Orders)
- Quick actions (Manage Packs, Scan QR, Toggle Store, Profile)
- Create Fixed Product packs
- Create Surprise packs
- Manage existing packs (edit/delete)
- Orders management: Accept, Ready, Cancel/Reject orders
- Scan QR codes to verify pickups
- Toggle store open/closed
- Profile management

## Technologies Used

- **Backend:** Node.js, Express, TypeScript, Supabase
- **Frontend:** React 19, TypeScript, Vite, Zustand
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT tokens

## Troubleshooting

### Actualizar constraint de reservations (si ya tienes la tabla)
```sql
ALTER TABLE reservations DROP CONSTRAINT reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('reserved', 'in_process', 'ready', 'picked_up', 'cancelled', 'expired'));
```

### "Could not find the table 'public.Users' in the schema cache"
- Make sure you ran the SQL script in your Supabase SQL Editor
- Check that table names are in lowercase (users, stores, packs, etc.)
- Wait a few minutes for Supabase to refresh its schema cache

### Blank screen
- Open browser developer tools (F12) and check the Console tab for errors
- Make sure all 3 servers are running (backend, client-app, store-app)
- Check that the .env files have the correct credentials

### Port already in use
- If port 3000 is in use, change PORT in backend/.env
- If port 5173/5174 is in use, Vite will automatically try the next available port
