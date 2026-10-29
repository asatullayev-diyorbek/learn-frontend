import { createBrowserRouter, Navigate } from "react-router-dom";
import { SiteLayout } from "../layouts/SiteLayout";
import { CourseDetailPage } from "../pages/CourseDetailPage";
import { CoursesPage } from "../pages/CoursesPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";
import { ROUTES } from "./paths";

export const router = createBrowserRouter([
  // Focused, chrome-free sign-in (AuthLayout: brand only, no site header/footer).
  { path: ROUTES.login, element: <LoginPage /> },
  // Regular site pages share the header/footer and the current-user state.
  {
    element: <SiteLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.courses, element: <CoursesPage /> },
      { path: ROUTES.courseDetailPattern, element: <CourseDetailPage /> },
      // Signed-in only; ProfilePage guards itself once /me has resolved.
      { path: ROUTES.profile, element: <ProfilePage /> },
    ],
  },
  { path: "*", element: <Navigate to={ROUTES.home} replace /> },
]);
