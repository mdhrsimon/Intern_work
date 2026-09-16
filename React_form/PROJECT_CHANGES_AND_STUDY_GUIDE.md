# Project Architecture & Complete Code Changes Study Guide

This document provides a comprehensive, detailed breakdown of all changes made to the system for study and review purposes. It covers the end-to-end architectural workflow: **Authentication &rarr; User Management &rarr; Class/Channel Management &rarr; Assignments &rarr; Policy Authorization &rarr; Student/Staff Functionality**.

---

## 1. System Architectural Overview

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                 1. AUTHENTICATION                                 │
│             JWT Bearer Tokens, Secure HttpOnly Cookies, Refresh Tokens            │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                               2. USER MANAGEMENT                                  │
│             Admin manages users (CRUD, Role changes, Active/Inactive)             │
│            * No class assignment happens here (strict module isolation)           │
│            * "View User" provides read-only summary of assigned classes           │
│            * Admin self-protection prevents accidental lockout/deletion           │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           3. CLASS/CHANNEL MANAGEMENT                             │
│         Standalone module creating classes with unique IDs (ID: 1, ID: 2...)      │
│             Mathematics A, Mathematics B, Database Systems, Web Technology        │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              4. CLASS ASSIGNMENTS                                 │
│            Admin establishes the (User ↔ ClassChannel) relationship               │
│               Class Channel ──► Staff / Teachers ──► Assigned Students            │
│                 (Visual Tree View of Membership & Assignment Dialog)              │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                            5. POLICY AUTHORIZATION                                │
│       Backend checks: Is Teacher assigned to Class? ──► Allowed (200)             │
│                       Is Teacher NOT assigned?      ──► Forbidden (403)           │
│                       Student tries to ManageClass? ──► Forbidden (403)           │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Summary of Created & Modified Files

### Backend (`ReactFormApi`)

| File Path | Status | Purpose & Description |
| :--- | :--- | :--- |
| [`Models/ClassChannel.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Models/ClassChannel.cs) | **NEW** | Entity representing a class channel (`Id`, `Name`, `Code`, `Description`, `CreatedAt`, navigation property `Enrollments`). |
| [`Models/ClassEnrollment.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Models/ClassEnrollment.cs) | **NEW** | Relationship entity mapping `ClassChannelId`, `ApplicationUserId`, and `RoleInClass` (`"Staff"` or `"Student"`). Unique index prevents duplicate enrollments. |
| [`Models/Classes/ClassDtos.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Models/Classes/ClassDtos.cs) | **NEW** | Data Transfer Objects for Class listing, Class details with members, Create/Update requests, and Assignment requests. |
| [`Controllers/ClassesController.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Controllers/ClassesController.cs) | **NEW** | RESTful controller handling Class CRUD, member assignment/removal, `GET /my-classes`, and **Policy Authorization Enforcement** on `GET /{id}` (returning `403 Forbidden` if a teacher or student attempts to access unauthorized classes). |
| [`Models/Accounts/AccountDtos.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Models/Accounts/AccountDtos.cs) | **MODIFIED** | Updated `AccountDto` to include read-only `AssignedClasses` list for the View User feature and removed online/offline presence properties. |
| [`Controllers/AccountController.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Controllers/AccountController.cs) | **MODIFIED** | Added self-protection rules (Admin cannot delete or deactivate own account), mapped assigned classes in user responses, and added role-filtering and status toggling. |
| [`Data/AppDbContext.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Data/AppDbContext.cs) | **MODIFIED** | Added `DbSet<ClassChannel>` and `DbSet<ClassEnrollment>` with cascade delete configurations and unique composite indexes. |
| [`Data/DbSeeder.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Data/DbSeeder.cs) | **MODIFIED** | Seeds default roles (`Admin`, `Staff`, `Student`), default users (`admin`, `staff` [John Smith], `sarah@edu.com`, `student` [Alex Rai], `ram@edu.com`, `priya@edu.com`), default classes, and default assignments. |
| [`Program.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Program.cs) | **MODIFIED** | Configured automated EF Core migration execution (`await db.Database.MigrateAsync()`) on application startup. |
| [`Migrations/20260910070009_AddClassChannelsAndAssignments.cs`](file:///d:/Intern_project/React_form/ReactFormApi/Migrations/20260910070009_AddClassChannelsAndAssignments.cs) | **NEW** | EF Core migration creating `ClassChannels` and `ClassEnrollments` tables in SQL Server. |

---

### Frontend (`react-redux-form`)

| File Path | Status | Purpose & Description |
| :--- | :--- | :--- |
| [`src/types/account.ts`](file:///d:/Intern_project/React_form/react-redux-form/src/types/account.ts) | **MODIFIED** | Added `AssignedClassSummary` interface and updated `AccountUser` (removed online/offline fields). |
| [`src/types/class.ts`](file:///d:/Intern_project/React_form/react-redux-form/src/types/class.ts) | **MODIFIED** | Added interfaces for `ClassChannel`, `ClassMember`, `ClassWithMembers`, `CreateClassRequest`, `UpdateClassRequest`, and `AssignMemberRequest`. |
| [`src/api/classApi.ts`](file:///d:/Intern_project/React_form/react-redux-form/src/api/classApi.ts) | **MODIFIED** | RTK Query API slice for class operations: `getClasses`, `getMyClasses`, `getClassById`, `createClass`, `updateClass`, `deleteClass`, `assignMember`, and `removeMember`. |
| [`src/redux/store.ts`](file:///d:/Intern_project/React_form/react-redux-form/src/redux/store.ts) | **MODIFIED** | Registered `classApi` reducer and middleware into the Redux store. |
| [`src/components/admin/ConfirmationModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/ConfirmationModal.tsx) | **NEW** | Reusable modal dialog with custom warning text and actions for confirming Delete, Deactivate, and Role Change operations. |
| [`src/components/admin/ViewUserModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/ViewUserModal.tsx) | **NEW** | Modal displaying user profile details and a **read-only list of assigned classes**, with clear notes that assignments are managed in the Assignment module. |
| [`src/components/admin/CreateUserModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/CreateUserModal.tsx) | **NEW** | Modal dialog for creating new users (Full Name, Email, Password, Role). |
| [`src/components/admin/EditUserModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/EditUserModal.tsx) | **NEW** | Modal dialog for updating existing user details and optional password resets. |
| [`src/components/admin/UserManagementView.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/UserManagementView.tsx) | **NEW** | Main User Management component with search, role filters, active status filters, confirmation dialogs, self-protection, and clean table layout. |
| [`src/components/admin/CreateClassModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/CreateClassModal.tsx) | **NEW** | Modal dialog for creating a new class channel. |
| [`src/components/admin/EditClassModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/EditClassModal.tsx) | **NEW** | Modal dialog for modifying class channel name, code, and description. |
| [`src/components/admin/ClassManagementView.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/ClassManagementView.tsx) | **NEW** | Standalone module for managing classes with explicit IDs (`ID: 1`, `ID: 2`...), member counters, and CRUD actions. |
| [`src/components/admin/AssignUserModal.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/AssignUserModal.tsx) | **NEW** | Dialog for assigning an active user to a class channel with role selection (Staff or Student). |
| [`src/components/admin/ClassAssignmentView.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/admin/ClassAssignmentView.tsx) | **NEW** | Tree hierarchy visualization of class channels with assigned Teachers and Students, assignment buttons, and unassignment controls. |
| [`src/pages/AdminDashboard.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/pages/AdminDashboard.tsx) | **MODIFIED** | Solid single purple header; clean tab navigation for **User Management**, **Class Management**, and **Class Assignments**. |
| [`src/pages/StaffDashboard.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/pages/StaffDashboard.tsx) | **MODIFIED** | Solid single blue header; displays teacher's assigned classes and student roster for each class, with policy feedback. |
| [`src/pages/StudentDashboard.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/pages/StudentDashboard.tsx) | **MODIFIED** | Solid single emerald header; displays student's enrolled classes and instructors. |
| [`src/components/Navbar.tsx`](file:///d:/Intern_project/React_form/react-redux-form/src/components/Navbar.tsx) | **MODIFIED** | Cleaned up navigation icons and badges. |

---

## 3. Deep Dive into Architectural Concepts

### 1. Stage 1: User Management
- **Role Separation**: Admins manage system accounts (identities). A user has a role (`Admin`, `Staff` [Teacher], `Student`) and an active status (`true` / `false`).
- **No Class Assignment in User Management**: User Management is exclusively for managing identity and credentials. Class assignments are strictly isolated in Stage 3.
- **View User**: When an Admin clicks **View**, the `ViewUserModal` fetches the user details including `AssignedClasses` (read-only) so admins can see where a user is enrolled without altering it there.
- **Account Control (Active/Inactive)**: Inactive users cannot log in. Toggling an account to inactive requires confirmation.
- **Self-Protection**: The currently logged-in administrator cannot delete or deactivate their own session.
- **Confirmation Modals**: Delete, Deactivate, and Role Changes all require confirmation.

### 2. Stage 2: Class / Channel Management
- **Class Channel Identification**: Each class receives a permanent auto-increment integer ID:
  - *Mathematics A* $\to$ `ID: 1`
  - *Mathematics B* $\to$ `ID: 2`
  - *Database Systems* $\to$ `ID: 3`
  - *Web Technology* $\to$ `ID: 4`
- **Metadata**: Each class has a `Code` (e.g., `MATH-101`) and `Description`.

### 3. Stage 3: Class Assignments (User &harr; Class Relationship)
- **Data Model**: Implemented using `ClassEnrollment` in Entity Framework Core with a unique composite index on `(ClassChannelId, ApplicationUserId)`.
- **Tree Visualization**:
  ```
  Mathematics A (ID: 1)
  ├── Staff / Teacher
  │   └── John Smith
  └── Students
      ├── Alex Rai
      ├── Ram Thapa
      └── Priya Sharma
  ```
- **Independent Role Assignments**: A user assigned as `Staff` in a class is considered the Instructor for that channel. Changing a user's system role does not automatically alter their class assignments.

### 4. Stage 4: Policy Authorization Enforcement
- **Backend Enforcement**:
  In `ClassesController.cs`, `GET /api/classes/{id}` evaluates:
  1. `User.IsInRole("Admin")`: **ALLOWED** (Global access).
  2. `User.IsInRole("Staff")`:
     - Checks `ClassEnrollments.Any(e => e.ClassChannelId == id && e.ApplicationUserId == userId && e.RoleInClass == "Staff")`.
     - If assigned: **ALLOWED** (200 OK).
     - If not assigned: **FORBIDDEN** (HTTP 403: `"Policy Enforcement: Access Denied. You are not assigned as a Teacher in this class."`).
  3. `User.IsInRole("Student")`:
     - Checks `ClassEnrollments.Any(e => e.ClassChannelId == id && e.ApplicationUserId == userId)`.
     - If enrolled: **ALLOWED** (200 OK).
     - If not enrolled: **FORBIDDEN** (HTTP 403).

---

## 4. Default Seeded Credentials for Testing

| Role | Username / Email | Password | Full Name | Default Assigned Classes |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `Admin@123` | System Administrator | All Classes (Global Access) |
| **Teacher** | `staff` | `Staff@123` | John Smith | *Mathematics A*, *Database Systems* |
| **Teacher** | `sarah@edu.com` | `Staff@123` | Sarah Doe | *Mathematics B*, *Web Technology* |
| **Student** | `student` | `Student@123` | Alex Rai | *Mathematics A*, *Mathematics B*, *Database Systems* |
| **Student** | `ram@edu.com` | `Student@123` | Ram Thapa | *Mathematics A*, *Web Technology* |
| **Student** | `priya@edu.com` | `Student@123` | Priya Sharma | *Mathematics A*, *Database Systems* |

---

## 5. Endpoints Reference Table

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Logs in user and returns JWT + HttpOnly refresh token cookie. |
| `POST` | `/api/auth/logout` | Public | Revokes refresh token and clears cookies. |
| `GET` | `/api/auth/me` | Authenticated | Returns current session identity and role. |
| `GET` | `/api/accounts` | Admin | Paged accounts list with role and status filters. |
| `GET` | `/api/accounts/{id}` | Admin | Get single account with read-only assigned classes. |
| `POST` | `/api/accounts` | Admin | Create user account. |
| `PUT` | `/api/accounts/{id}` | Admin | Update user details (with self-deactivation protection). |
| `PATCH` | `/api/accounts/{id}/role` | Admin | Change account role. |
| `PATCH` | `/api/accounts/{id}/active` | Admin | Toggle active/inactive status (with self-protection). |
| `DELETE` | `/api/accounts/{id}` | Admin | Delete account (with self-protection). |
| `GET` | `/api/classes` | Authenticated | List class channels with member counters. |
| `GET` | `/api/classes/my-classes` | Authenticated | Returns classes assigned to current user. |
| `GET` | `/api/classes/{id}` | Policy Protected | Get class members. Returns `403 Forbidden` if unauthorized. |
| `POST` | `/api/classes` | Admin | Create class channel. |
| `PUT` | `/api/classes/{id}` | Admin | Update class channel. |
| `DELETE` | `/api/classes/{id}` | Admin | Delete class channel and its enrollments. |
| `POST` | `/api/classes/{id}/members` | Admin | Assign user to class channel. |
| `DELETE` | `/api/classes/{id}/members/{userId}`| Admin | Remove user from class channel. |
