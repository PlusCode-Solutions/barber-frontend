import AppRoutes from "./routes";

/**
 * Main Application Component
 * 
 * Routes are now organized in src/routes/ for better maintainability:
 * - publicRoutes.tsx: Authentication and public pages
 * - userRoutes.tsx: Customer dashboard routes
 * - tenantAdminRoutes.tsx: Business admin routes
 * - superAdminRoutes.tsx: Platform admin routes
 */
export default function App() {
  return <AppRoutes />;
}

