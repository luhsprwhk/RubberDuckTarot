import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reading from './pages/Reading';
import OnBoarding from './pages/OnBoarding';
import AuthProvider from './lib/auth/AuthProvider';
import CardsProvider from './lib/cards/CardsProvider';
import { AlertProvider } from './lib/alerts/AlertProvider';
import Navbar from './components/Navbar';
import { AlertContainer } from './components/AlertContainer';
import Upgrade from './pages/Upgrade';
import Insights from './pages/Insights';
import Pricing from './pages/Pricing';
import Preferences from './pages/Preferences';
import Insight from './pages/Insight';
import Login from './pages/Login';
import NewReading from './pages/NewReading';
import BlockTypesProvider from './lib/blocktypes/BlockTypesProvider';

function App() {
  return (
    <BlockTypesProvider>
      <AlertProvider>
        <AuthProvider>
          <CardsProvider>
            <div className="min-h-screen bg-void-gradient">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/reading" element={<Reading />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/onboarding" element={<OnBoarding />} />
                  <Route path="/upgrade" element={<Upgrade />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/preferences" element={<Preferences />} />
                  <Route path="/insight/:id" element={<Insight />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/new-reading" element={<NewReading />} />
                </Routes>
              </main>
              <AlertContainer />
            </div>
          </CardsProvider>
        </AuthProvider>
      </AlertProvider>
    </BlockTypesProvider>
  );
}

export default App;
