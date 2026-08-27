import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// Portals & Landing
import Landing from "./pages/Landing";
import PortalComingSoon from "./components/PortalComingSoon";

// NGO Layout & Pages
import DashboardLayout from "./pages/ngo/DashboardLayout";
import HomeOverview from "./pages/ngo/HomeOverview";
import RescueMgmt from "./pages/ngo/RescueMgmt";
import AnimalMgmt from "./pages/ngo/AnimalMgmt";
import ShelterMgmt from "./pages/ngo/ShelterMgmt";
import VolunteerMgmt from "./pages/ngo/VolunteerMgmt";
import AdoptionMgmt from "./pages/ngo/AdoptionMgmt";
import DonationsMgmt from "./pages/ngo/DonationsMgmt";
import ReportsMgmt from "./pages/ngo/ReportsMgmt";

// Vet Layout & Pages
import VetLayout from "./pages/vet/VetLayout";
import VetQueue from "./pages/vet/VetQueue";
import PatientLookup from "./pages/vet/PatientLookup";
import AnimalMedicalPanel from "./pages/vet/AnimalMedicalPanel";
import VetInventory from "./pages/vet/VetInventory";
import VetAppointments from "./pages/vet/VetAppointments";

// Parent Layout & Pages
import ParentLayout from "./pages/parent/ParentLayout";
import MyPets from "./pages/parent/MyPets";
import ParentPetProfile from "./pages/parent/ParentPetProfile";
import ParentAppointments from "./pages/parent/ParentAppointments";
import LostPetMode from "./pages/parent/LostPetMode";
import AdoptionBrowsing from "./pages/parent/AdoptionBrowsing";
import EmergencyNearby from "./pages/parent/EmergencyNearby";
import RegisterNewPet from "./pages/parent/RegisterNewPet";

// Government Layout & Pages
import GovLayout from "./pages/gov/GovLayout";
import AnalyticsOverview from "./pages/gov/AnalyticsOverview";
import NGOMonitoring from "./pages/gov/NGOMonitoring";
import RegionalAnalytics from "./pages/gov/RegionalAnalytics";
import DiseaseHeatmaps from "./pages/gov/DiseaseHeatmaps";
import CitizenComplaints from "./pages/gov/CitizenComplaints";
import InspectionReports from "./pages/gov/InspectionReports";

// Extended Modules Pages
import DrivePlanner from "./pages/ngo/DrivePlanner";
import CertificateArchive from "./pages/vet/CertificateArchive";
import VetAnalytics from "./pages/vet/VetAnalytics";
import UpcomingBoosters from "./pages/vet/UpcomingBoosters";
import MyApplicationsTracker from "./pages/parent/MyApplicationsTracker";
import SuccessStories from "./pages/parent/SuccessStories";
import GrantTracker from "./pages/gov/GrantTracker";
import ComplianceAlerts from "./pages/gov/ComplianceAlerts";
// Public Pages
import PublicStats from "./pages/PublicStats";
import PublicScanPage from "./pages/PublicScanPage";
import ParentFoundReports from "./pages/parent/ParentFoundReports";
import NGOFoundReports from "./pages/ngo/NGOFoundReports";

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Landing Portal Selector */}
          <Route path="/" element={<Landing />} />

          {/* Stub portals (Coming Soon) */}
          {/* Vet Portal nested under /vet */}
          <Route path="/vet" element={<VetLayout />}>
            <Route index element={<Navigate to="/vet/queue" replace />} />
            <Route path="queue" element={<VetQueue />} />
            <Route path="lookup" element={<PatientLookup />} />
            <Route path="medical/:petId" element={<AnimalMedicalPanel />} />
            <Route path="inventory" element={<VetInventory />} />
            <Route path="appointments" element={<VetAppointments />} />
            <Route path="archive" element={<CertificateArchive />} />
            <Route path="analytics" element={<VetAnalytics />} />
            <Route path="boosters" element={<UpcomingBoosters />} />
          </Route>
          {/* Parent Portal nested under /parent */}
          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<Navigate to="/parent/pets" replace />} />
            <Route path="pets" element={<MyPets />} />
            <Route path="pet/:petId" element={<ParentPetProfile />} />
            <Route path="appointments" element={<ParentAppointments />} />
            <Route path="lost" element={<LostPetMode />} />
            <Route path="adopt" element={<AdoptionBrowsing />} />
            <Route path="emergency" element={<EmergencyNearby />} />
            <Route path="register" element={<RegisterNewPet />} />
            <Route path="tracker" element={<MyApplicationsTracker />} />
            <Route path="community" element={<SuccessStories />} />
            <Route path="found-reports" element={<ParentFoundReports />} />
          </Route>
          {/* Government Portal nested under /government */}
          <Route path="/government" element={<GovLayout />}>
            <Route index element={<Navigate to="/government/analytics" replace />} />
            <Route path="analytics" element={<AnalyticsOverview />} />
            <Route path="monitoring" element={<NGOMonitoring />} />
            <Route path="regional" element={<RegionalAnalytics />} />
            <Route path="heatmap" element={<DiseaseHeatmaps />} />
            <Route path="complaints" element={<CitizenComplaints />} />
            <Route path="inspections" element={<InspectionReports />} />
            <Route path="grants" element={<GrantTracker />} />
            <Route path="alerts" element={<ComplianceAlerts />} />
          </Route>

          {/* NGO Portal nested under /ngo */}
          <Route path="/ngo" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/ngo/overview" replace />} />
            <Route path="overview" element={<HomeOverview />} />
            <Route path="rescues" element={<RescueMgmt />} />
            <Route path="animals" element={<AnimalMgmt />} />
            <Route path="shelter" element={<ShelterMgmt />} />
            <Route path="volunteers" element={<VolunteerMgmt />} />
            <Route path="adoptions" element={<AdoptionMgmt />} />
            <Route path="donations" element={<DonationsMgmt />} />
            <Route path="reports" element={<ReportsMgmt />} />
            <Route path="drives" element={<DrivePlanner />} />
            <Route path="found-reports" element={<NGOFoundReports />} />
          </Route>

          {/* Public Pages outside normal portal shells */}
          <Route path="/public-stats" element={<PublicStats />} />
          <Route path="/scan/:tagId" element={<PublicScanPage />} />

          {/* Catch-all route redirecting back to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
