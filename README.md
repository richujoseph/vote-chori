# Demokratia - SJCET Online Election System

A secure, high-performance web platform designed for managing college elections with real-time results and administrative oversight.

## System Overview

The system is engineered to handle large-scale student union elections with high reliability and security. It facilitates the entire election lifecycle—from candidate nomination and election staging to real-time vote counting and final result publication.

### Core Workflows

- **Election Lifecycle**: Elections transition through three states: `upcoming` (preparation), `ongoing` (active voting), and `completed` (archived results).
- **Staged Voting**: Voters can only participate in elections marked as `ongoing`.
- **Administrative Control**: Admins manage the creation of elections, categories (e.g., President, Secretary), and candidate profiles.

## Technical Architecture

### Infrastructure
- **Database**: PostgreSQL hosted on **Supabase** for high availability and performance.
- **Object Storage**: **Supabase Storage** for managing candidate photographs and other media assets.
- **Backend Environment**: Next.js App Router with server-side logic protection.

### Security
- **Authentication**: **NextAuth.js** with Google OAuth, strictly limited to the institutional domain (`@sjcetpalai.ac.in`).
- **Authorization (RBAC)**: Fine-grained access control for `student` and `admin` roles.
- **Data Integrity**: Database-level unique constraints (via **Drizzle ORM**) ensure "one person, one vote" logic across all categories.

### API & Frontend
- **API Layer**: **tRPC** for end-to-end typesafe communication.
- **UI Framework**: **Tailwind CSS 4** for a modern, responsive interface.
- **Visualization**: **Recharts** for real-time result analytics.

## Setup & Deployment

### Prerequisites

- Node.js 18+
- Supabase Project (for DB and Storage)
- Google Cloud Console project (for OAuth credentials)

### Local Installation

1.  **Clone and Install:**
    ```bash
    git clone https://github.com/TimsTittus/Demokratia.git
    cd Demokratia
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file with the following keys:
    ```env
    # Database
    DATABASE_URL=
    
    # NextAuth
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=
    
    # Google OAuth
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    
    # Supabase (Storage & Assets)
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    ```

3.  **Database Initialisation:**
    ```bash
    npm run db:push
    ```

4.  **Running Development Server:**
    ```bash
    npm run dev
    ```

## Development Commands

- `npm run dev`: Start local development server.
- `npm run build`: Generate production build.
- `npm run db:studio`: GUI for database management.

## Contributing

1.  Fork the project and create your feature branch.
2.  Ensure code follows the project's ESLint configuration.
3.  Submit a Pull Request with a clear description of changes.
