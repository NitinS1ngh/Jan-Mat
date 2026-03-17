import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProposalFeed from './pages/ProposalFeed';
import ProposalDetail from './pages/ProposalDetail';
import NewProposalPage from './pages/NewProposalPage';
import PeoplesChoiceDashboard from './pages/PeoplesChoiceDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LawsEnactedPage from './pages/LawsEnactedPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/proposals" element={<ProposalFeed />} />
              <Route path="/proposals/new" element={<NewProposalPage />} />
              <Route path="/proposals/:id" element={<ProposalDetail />} />
              <Route path="/peoples-choice" element={<PeoplesChoiceDashboard />} />
              <Route path="/laws" element={<LawsEnactedPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: '"Source Sans 3", sans-serif',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              boxShadow: '0 4px 16px rgba(27,38,59,0.1)',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
