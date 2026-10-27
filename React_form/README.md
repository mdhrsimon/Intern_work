# React_form

Education Portal system with ASP.NET Core API (`ReactFormApi`) and React / RTK Query frontend (`react-redux-form`).

## Local Setup

### 1. Backend Secrets Configuration

Sensitive credentials (JWT signing key and seeded admin credentials) are not stored in source control. Configure them using .NET User Secrets in development:

```bash
cd ReactFormApi

# Initialize user secrets for the API project
dotnet user-secrets init

# Configure a secure JWT signing key (minimum 32 characters, recommended 64+ random characters)
dotnet user-secrets set "Jwt:Key" "A_Very_Long_And_Secure_Random_Secret_Key_64_Characters_Minimum_Length_Here_12345!"

# Configure initial Administrator seed credentials (password must be at least 8 characters and contain at least one digit)
dotnet user-secrets set "Seed:AdminEmail" "admin@gmail.com"
dotnet user-secrets set "Seed:AdminPassword" "AdminPass123!"
```

In production environments, configure these via environment variables instead:
- `Jwt__Key`
- `Seed__AdminEmail`
- `Seed__AdminPassword`

### 2. Run the Backend API

```bash
cd ReactFormApi
dotnet restore
dotnet build
dotnet run
```

The API will start on `http://localhost:5070` (or `https://localhost:7070`).

### 3. Run the Frontend App

```bash
cd react-redux-form
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.
