import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "./store";
import Home from "./pages/Home";
import RequestForm from "./pages/RequestForm";
import Confirmation from "./pages/Confirmation";
import StatusLookup from "./pages/StatusLookup";
import PublicDashboard from "./pages/PublicDashboard";
import AgencyLogin from "./pages/AgencyLogin";
import AgencyDashboard from "./pages/AgencyDashboard";
import RequestDetails from "./pages/RequestDetails";

function Protected({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/agency" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/request" element={<RequestForm />} />
      <Route path="/request/:processId" element={<RequestForm />} />
      <Route path="/confirmation/:serial" element={<Confirmation />} />
      <Route path="/status" element={<StatusLookup />} />
      <Route path="/dashboard" element={<PublicDashboard />} />
      <Route path="/agency" element={<AgencyLogin />} />
      <Route
        path="/agency/requests"
        element={
          <Protected>
            <AgencyDashboard />
          </Protected>
        }
      />
      <Route
        path="/agency/requests/:serial"
        element={
          <Protected>
            <RequestDetails />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
