
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/calendar";
import NotFound from "./pages/NotFound";
import Labels from "./pages/Labels";
import ImportExport from "./pages/import-export";
import Settings from "./pages/settings";
import TimeTracking from "./pages/time-tracking";
import Collaborators from "./pages/collaborators";
import ERDiagram from "./docs/ERDiagram";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryProvider } from "./components/QueryProvider";
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <QueryProvider>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<Index />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="labels" element={<Labels />} />
                  <Route path="import-export" element={<ImportExport />} />
                  <Route path="time-tracking" element={<TimeTracking />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="collaborators" element={<Collaborators />} />
                  <Route path="docs/er" element={<ERDiagram />} />
                </Route>
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="bottom-right" />
          </AuthProvider>
        </Router>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
