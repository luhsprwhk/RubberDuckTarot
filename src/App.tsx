import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Reading from './pages/Reading';
import OnBoarding from './pages/OnBoarding';
import AuthProvider from './lib/auth/AuthProvider';
import CardsProvider from './lib/cards/CardsProvider';
import Navbar from './components/Navbar';
import Upgrade from './pages/Upgrade';
import Insights from './pages/Insights';
import Preferences from './pages/Preferences';
import Insight from './pages/Insight';

function App() {
  return (
    <AuthProvider>
      <CardsProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/onboarding" element={<OnBoarding />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="/insight/:id" element={<Insight />} />
            </Routes>
          </main>
        </div>
      </CardsProvider>
    </AuthProvider>
  );
}

export default App;
