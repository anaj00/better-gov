import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "./store";
import Home from "./pages/Home";
import StatusLookup from "./pages/StatusLookup";
import PublicDashboard from "./pages/PublicDashboard";
import AgencyLogin from "./pages/AgencyLogin";
import AgencyDashboard from "./pages/AgencyDashboard";
import AgencyReceipt from "./pages/AgencyReceipt";

function Protected({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/agency/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/status" element={<StatusLookup />} />
      <Route path="/dashboard" element={<PublicDashboard />} />
      <Route path="/agency" element={<Navigate to="/agency/login" replace />} />
      <Route path="/agency/login" element={<AgencyLogin />} />
      <Route
        path="/agency/dashboard"
        element={
          <Protected>
            <AgencyDashboard />
          </Protected>
        }
      />
      <Route
        path="/agency/receipt/:serial"
        element={
          <Protected>
            <AgencyReceipt />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
