import { useApp, AppProvider } from './context/AppContext.js';
import Navbar from './components/Navbar.js';
import ToastContainer from './components/Toast.js';
import AIConcierge from './components/AIConcierge.js';

// Pages
import Home from './pages/Home.js';
import Tryon from './pages/Tryon.js';
import Recommendations from './pages/Recommendations.js';
import Occasion from './pages/Occasion.js';
import Bodyfit from './pages/Bodyfit.js';
import Dashboard from './pages/Dashboard.js';
import SavedLooks from './pages/SavedLooks.js';

function CoreAppContent() {
  const { activeTab } = useApp();

  // Unified page router matching navigation indices
  const renderActivePage = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'tryon':
        return <Tryon />;
      case 'recommendations':
        return <Recommendations />;
      case 'occasion':
        return <Occasion />;
      case 'bodyfit':
        return <Bodyfit />;
      case 'dashboard':
        return <Dashboard />;
      case 'saved':
        return <SavedLooks />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen pink-aesthetic-bg font-sans text-stone-850 relative">
      <Navbar />
      
      {/* Route main layout with smooth animation transition classes */}
      <main className="animate-fade-in pt-20">
        {renderActivePage()}
      </main>

      {/* Shared Floating AI Chat concierge component */}
      <AIConcierge />

      {/* Global notifications overlays */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CoreAppContent />
    </AppProvider>
  );
}
