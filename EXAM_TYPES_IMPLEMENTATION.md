# Multiple Exam Types Implementation

## Overview

This implementation adds support for multiple exam types (AWS Developer, AWS Solutions Architect, LPIC-1, etc.) to the Q&A application.

## What was implemented:

### Backend Changes:

1. **Updated Question interface** (`lib/types.ts`):
   - Added `examType?: string` field to Question interface
   - Added new `ExamType` interface

2. **New API endpoints**:
   - `GET/POST /api/exam-types` - Manage exam types
   - `POST /api/seed-exam-types` - Seed initial exam types

3. **Updated existing APIs**:
   - `GET /api/questions` - Now supports `examType` query parameter
   - `POST /api/questions` - Includes examType in question creation
   - `POST /api/questions/submit` - Includes examType in public submissions

### Frontend Changes:

1. **New Components**:
   - `ExamTypeSelector` - Dynamic exam type selector with mobile support
   - `DropdownMenu` UI component for mobile dropdown

2. **Updated HomePage**:
   - Dynamic exam type buttons in navbar (desktop)
   - Mobile-friendly dropdown for exam types
   - URL parameter handling (`?examType=aws-developer`)
   - Real-time filtering based on selected exam type

3. **Responsive Design**:
   - Desktop: Horizontal buttons in navbar
   - Mobile: Burger menu dropdown in main content area

### Database Schema:

- Questions now have an optional `examType` field
- New `examTypes` collection stores available exam types
- Backward compatibility: existing questions default to "aws-developer"

## Setup Instructions:

### 1. Install Dependencies:

```bash
pnpm install
```

### 2. Seed Initial Exam Types:

```bash
# Option 1: Using the API endpoint
curl -X POST http://localhost:3000/api/seed-exam-types \
  -H "Content-Type: application/json" \
  -d '{"adminPassword": "your_admin_password"}'

# Option 2: Using the script (after installing dependencies)
pnpm run seed:exam-types
```

### 3. Start the Development Server:

```bash
pnpm run dev
```

## Usage:

1. Visit `http://localhost:3000`
2. Use exam type buttons in navbar (desktop) or dropdown (mobile)
3. URL updates automatically: `?examType=aws-solutions-architect`
4. Questions filter dynamically based on selected exam type
5. Search works within selected exam type

## Adding New Exam Types:

1. Use admin panel or API to add new exam types
2. Frontend automatically updates with new buttons
3. Questions can be assigned to any exam type

## Backward Compatibility:

- Existing questions without examType default to "aws-developer"
- No breaking changes to existing functionality
- All existing features continue to work

## Mobile Support:

- Responsive design with hamburger menu
- Touch-friendly dropdown interface
- Optimized for mobile screens
