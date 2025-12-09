import { useState, useEffect } from 'react';
import { Toaster } from 'sonner@2.0.3';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { logout } from './firebase/auth';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import { HistoryPage } from './components/HistoryPage';
import { PRPage } from './components/PRPage';
import { ProfilePageEnhanced } from './components/ProfilePageEnhanced';
import { ChatbotWidget } from './components/ChatbotWidget';
import { StartSessionPageEnhanced } from './components/StartSessionPageEnhanced';
import PlanningPage from './components/PlanningPage';
import NutritionPageEnhanced from './components/NutritionPageEnhanced';
import WorkoutTemplatesPage from './components/WorkoutTemplatesPage';
import { DebugPanel } from './components/DebugPanel';

type Page = 'landing' | 'login' | 'register' | 'home' | 'history' | 'pr' | 'profile' | 'start-session' | 'planning' | 'nutrition' | 'templates';

function AppContent() {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [scheduledWorkoutToStart, setScheduledWorkoutToStart] = useState<any>(null);

  // Rediriger vers home si l'utilisateur est connecté
  useEffect(() => {
    if (currentUser && currentPage === 'landing') {
      setCurrentPage('home');
    } else if (!currentUser && currentPage !== 'landing' && currentPage !== 'login' && currentPage !== 'register') {
      setCurrentPage('landing');
    }
  }, [currentUser]);

  const navigate = (page: Page, data?: any) => {
    if (data?.scheduledWorkout) {
      setScheduledWorkoutToStart(data.scheduledWorkout);
    }
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('landing');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={navigate} />;
      case 'login':
        return <LoginPage onNavigate={navigate} onLogin={handleLogin} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} onRegister={handleLogin} />;
      case 'home':
        return <HomePage key="home" onNavigate={navigate} onLogout={handleLogout} />;
      case 'history':
        return <HistoryPage key="history" onNavigate={navigate} onLogout={handleLogout} />;
      case 'pr':
        return <PRPage key="pr" onNavigate={navigate} onLogout={handleLogout} />;
      case 'profile':
        return <ProfilePageEnhanced key="profile" onNavigate={navigate} onLogout={handleLogout} />;
      case 'start-session':
        return <StartSessionPageEnhanced key="start-session" onNavigate={navigate} onLogout={handleLogout} scheduledWorkout={scheduledWorkoutToStart} />;
      case 'planning':
        return <PlanningPage key="planning" onNavigate={navigate} onLogout={handleLogout} />;
      case 'nutrition':
        return <NutritionPageEnhanced key="nutrition" onNavigate={navigate} onLogout={handleLogout} />;
      case 'templates':
        return <WorkoutTemplatesPage key="templates" onNavigate={navigate} onLogout={handleLogout} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
      <Toaster position="top-right" theme="dark" />
      {currentUser && <DebugPanel />}
      {currentUser && <ChatbotWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}