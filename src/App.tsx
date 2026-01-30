import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import EstimateForm from "./pages/EstimateForm";
import QuoteDashboard from "./pages/QuoteDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/estimate" element={<EstimateForm />} />
      <Route path="/quote/:id" element={<QuoteDashboard />} />
    </Routes>
  );
}

export default App;
