import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reading from './pages/Reading';
import OnBoarding from './pages/OnBoarding';
import AuthProvider from './lib/auth/AuthProvider';
import CardsProvider from './lib/cards/CardsProvider';
import { AlertProvider } from './lib/alerts/AlertProvider';
import InsightProvider from './lib/insights/InsightProvider';
import Navbar from './components/Navbar';
import { AlertContainer } from './components/AlertContainer';
import Upgrade from './pages/Upgrade';
import Insights from './pages/Insights';
import Blocks from './pages/Blocks';
import ProtectedRoute from './components/ProtectedRoute';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Preferences from './pages/Preferences';
import Insight from './pages/Insight';
import Login from './pages/Login';
import NewReading from './pages/NewReading';
import Cards from './pages/Cards';
import CardDetail from './pages/CardDetail';
import BlockDetails from './pages/BlockDetails';
import BlockTypesProvider from './lib/blocktypes/BlockTypesProvider';

function App() {
  return (
    <AppWrapper>
      <div className="min-h-screen bg-void-gradient">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/cards/:cardName" element={<CardDetail />} />
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blocks"
              element={
                <ProtectedRoute>
                  <Blocks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blocks/:blockId"
              element={
                <ProtectedRoute>
                  <BlockDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/onboarding" element={<OnBoarding />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/insights/:id" element={<Insight />} />
            <Route path="/login" element={<Login />} />
            <Route path="/new-reading" element={<NewReading />} />
          </Routes>
        </main>
        <AlertContainer />
      </div>
    </AppWrapper>
  );
}

const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BlockTypesProvider>
      <InsightProvider>
        <AlertProvider>
          <AuthProvider>
            <CardsProvider>{children}</CardsProvider>
          </AuthProvider>
        </AlertProvider>
      </InsightProvider>
    </BlockTypesProvider>
  );
};

export default App;
