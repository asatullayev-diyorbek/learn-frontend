import { createBrowserRouter, Navigate } from "react-router-dom";
import { SiteLayout } from "../layouts/SiteLayout";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ROUTES } from "./paths";

export const router = createBrowserRouter([
  // Focused, chrome-free sign-in (AuthLayout: brand only, no site header/footer).
  { path: ROUTES.login, element: <LoginPage /> },
  // Regular site pages share the header/footer and the current-user state.
  {
    element: <SiteLayout />,
    children: [{ path: ROUTES.home, element: <HomePage /> }],
  },
  { path: "*", element: <Navigate to={ROUTES.home} replace /> },
]);
