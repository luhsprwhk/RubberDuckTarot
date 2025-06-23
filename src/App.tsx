import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Reading from './pages/Reading';
import Readings from './pages/Readings';
import OnBoarding from './pages/OnBoarding';
import AuthProvider from './shared/auth/AuthProvider';
import CardsProvider from './shared/cards/CardsProvider';
import Navbar from './components/Navbar';

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
              <Route path="/readings" element={<Readings />} />
              <Route path="/onboarding" element={<OnBoarding />} />
            </Routes>
          </main>
        </div>
      </CardsProvider>
    </AuthProvider>
  );
}

export default App;
