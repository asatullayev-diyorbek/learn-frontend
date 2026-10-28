import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePlaceholderPage } from "../pages/HomePlaceholderPage";
import { LoginPage } from "../pages/LoginPage";
import { ROUTES } from "./paths";

export const router = createBrowserRouter([
  { path: ROUTES.login, element: <LoginPage /> },
  { path: ROUTES.home, element: <HomePlaceholderPage /> },
  { path: "*", element: <Navigate to={ROUTES.login} replace /> },
]);
