import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reading from './pages/Reading';
import OnBoarding from './pages/OnBoarding';
import Upgrade from './pages/Upgrade';
import Insights from './pages/Insights';
import Blocks from './pages/Blocks';
import ProtectedRoute from './components/ProtectedRoute';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Preferences from './pages/Preferences';
import Insight from './pages/Insight';
import Login from './pages/Login';
import NewInsight from './pages/NewInsight';
import Cards from './pages/Cards';
import CardDetail from './pages/CardDetail';
import BlockDetails from './pages/BlockDetails';

const AppRoutes = () => (
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
    <Route path="/new-insight" element={<NewInsight />} />
  </Routes>
);

export default AppRoutes;
