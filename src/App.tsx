import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SearchPage from "./pages/Search";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";

/* ================= DASHBOARD ================= */

import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ProfilePage from "./pages/dashboard/ProfilePage";
import PersonalDetailsPage from "./pages/dashboard/PersonalDetailsPage";
import PreferencePage from "./pages/dashboard/PreferencePage";
import PhotosPage from "./pages/dashboard/PhotosPage";

/* ================= ADMIN ================= */

import AdminLogin from "./pages/admin/AdminLogin";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* ================= USER ROUTES ================= */}

          <Route path="/" element={<Index />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/profiles" element={<SearchPage />} />
          <Route path="/profile/:id" element={<Profile />} />

          <Route path="/subscription" element={<Subscription />} />

          {/* ================= USER DASHBOARD ================= */}

          <Route path="/dashboard" element={<DashboardLayout />}>

            <Route path="profile" element={<ProfilePage />} />

            <Route path="personal" element={<PersonalDetailsPage />} />

            <Route path="preference" element={<PreferencePage />} />

            <Route path="photos" element={<PhotosPage />} />

          </Route>

          {/* ================= ADMIN ================= */}

          <Route path="/admin/login" element={<AdminLogin />} />

          {/* <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          /> */}

          {/* ================= 404 ================= */}

          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;