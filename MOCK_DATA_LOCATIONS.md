# Mock Data Locations Analysis

This document lists all locations where mock data is currently used in the codebase and needs to be removed/replaced with database repository calls.

## 🎯 Primary Mock Data Locations (TO BE REMOVED)

### 1. Vector Search Mock Data
**File:** `lib/vectorSearch.ts`
- **Lines:** 48-100+
- **Description:** Contains hardcoded search results with "Research Papers" database references
- **Mock Content:** 
  - Machine learning content
  - Neural networks content
  - Deep learning content
  - AI ethics content
  - Vector database content
- **Action Required:** Replace with actual database queries

### 2. AppContext Hardcoded Data
**File:** `contexts/AppContext.tsx`
- **Lines:** 137-200+
- **Description:** Hardcoded initial state data
- **Mock Content:**
  - Databases: "Research Papers", "Company Knowledge Base"
  - Documents: "Machine Learning Fundamentals.pdf", "AI Ethics Lecture", "Company Website Analysis"
  - API Keys: "Production Workflow", "Development Environment"
  - Database servers: Qdrant and Neo4j configurations
- **Action Required:** Remove hardcoded data, load from database via services

### 3. Authentication Hardcoded Credentials
**File:** `app/api/auth/login/route.ts`
- **Lines:** 19-27
- **Description:** Demo users with hardcoded credentials
- **Mock Content:**
  - admin@example.com / admin123
  - user@example.com / user123
  - viewer@example.com / viewer123
  - john.doe@example.com / password
- **Action Required:** Remove hardcoded credentials, use proper authentication

## ✅ Mock Data Locations (TO KEEP - Testing Only)

### 1. Database Seeding
**File:** `lib/migrations/seed.ts`
- **Lines:** 39-150+
- **Description:** Legitimate seed data for development/testing
- **Content:** Sample databases, documents, users, API keys
- **Action:** KEEP - This is the only acceptable location for mock data

### 2. Test Utilities
**File:** `__tests__/utils/test-utils.tsx`
- **Lines:** 5-50+
- **Description:** Mock data for unit/integration tests
- **Content:** mockUser, mockDatabase, mockDocument, mockApiKey, mockJob
- **Action:** KEEP - Required for testing

### 3. All Test Files
**Files:** `__tests__/**/*.test.ts(x)`
- **Description:** Jest mocks and test data
- **Action:** KEEP - Required for testing framework

## 🔧 Implementation Plan

### Phase 1: Remove Vector Search Mock Data
1. Update `lib/vectorSearch.ts` to use actual database queries
2. Implement proper vector search against configured database servers
3. Remove hardcoded "Research Papers" references

### Phase 2: Remove AppContext Hardcoded Data
1. Remove hardcoded initial state in `contexts/AppContext.tsx`
2. Implement proper data loading from database services
3. Add loading states for initial data fetch
4. Handle empty states when no data exists

### Phase 3: Fix Authentication
1. Remove hardcoded credentials from `app/api/auth/login/route.ts`
2. Implement proper password hashing and verification
3. Use database-stored user credentials only

### Phase 4: Testing
1. Run `npm run test` to ensure all tests pass
2. Verify no fallbacks to mock data exist
3. Confirm only seeder contains sample data

## 📋 Files to Modify

### Core Application Files
- `lib/vectorSearch.ts` - Remove mock search results
- `contexts/AppContext.tsx` - Remove hardcoded initial data
- `app/api/auth/login/route.ts` - Remove hardcoded credentials

### Files to Keep As-Is
- `lib/migrations/seed.ts` - Legitimate seeding
- `__tests__/**/*` - All test files
- Any placeholder text in UI components (forms, inputs, etc.)

## 🎯 Success Criteria

- ✅ All fallbacks to mock data removed
- ✅ Mock texts only exist in seeder (`lib/migrations/seed.ts`)
- ✅ `npm run test` builds and all tests pass
- ✅ Application loads data from database services only
- ✅ No hardcoded "Research Papers" or other sample content in application logic