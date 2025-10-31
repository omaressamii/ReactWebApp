import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { useAppSelector } from "./redux/hooks";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorkOrders from "./pages/WorkOrders";
import Requisitions from "./pages/Requisitions";
import CreateRequisition from "./pages/CreateRequisition";
import RequisitionDetails from "./pages/RequisitionDetails";
import Issues from "./pages/Issues";
import CreateIssue from "./pages/CreateIssue";
import Receipts from "./pages/Receipts";
import IssueReturns from "./pages/IssueReturns";
import AssetArrangements from "./pages/AssetArrangements";
import AssetInquiry from "./pages/AssetInquiry";
import LocationInventory from "./pages/LocationInventory";
import ServicesArchive from "./pages/ServicesArchive";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { Sidebar } from "./components/layout/Sidebar";
import { isScreenAccessible } from "./constants/Screens";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based and permission-based access
  if (!isScreenAccessible(user?.role || null, location.pathname, user?.permissions)) {
    return (
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.user);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/work-orders"
        element={
          <ProtectedRoute>
            <WorkOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requisitions"
        element={
          <ProtectedRoute>
            <Requisitions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requisitions/create"
        element={
          <ProtectedRoute>
            <CreateRequisition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requisitions/:id"
        element={
          <ProtectedRoute>
            <RequisitionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues"
        element={
          <ProtectedRoute>
            <Issues />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues/create"
        element={
          <ProtectedRoute>
            <CreateIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/issues/:issueCode"
        element={
          <ProtectedRoute>
            <div className="p-6">
              <h1 className="text-2xl font-bold">Issue Details</h1>
              <p className="text-muted-foreground mt-2">Issue details page coming soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <ProtectedRoute>
            <Receipts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <IssueReturns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arrangements"
        element={
          <ProtectedRoute>
            <AssetArrangements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asset-inquiry"
        element={
          <ProtectedRoute>
            <AssetInquiry />
          </ProtectedRoute>
        }
      />
      <Route
        path="/location-inventory"
        element={
          <ProtectedRoute>
            <LocationInventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/archive"
        element={
          <ProtectedRoute>
            <ServicesArchive />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
