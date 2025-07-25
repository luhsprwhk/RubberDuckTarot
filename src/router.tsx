import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Welcome from './pages/Welcome';
import CreateInsight from './pages/CreateInsight';
import OnBoarding from './pages/OnBoarding';
import Upgrade from './pages/Upgrade';
import Insights from './pages/Insights';
import Blocks from './pages/Blocks';
import ArchivedBlocks from './pages/ArchivedBlocks';
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
import NotionCallback from './pages/NotionCallback';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route
      path="/create-insight"
      element={
        <ProtectedRoute>
          <CreateInsight />
        </ProtectedRoute>
      }
    />
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
      path="/blocks/archived"
      element={
        <ProtectedRoute>
          <ArchivedBlocks />
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
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <OnBoarding />
        </ProtectedRoute>
      }
    />
    <Route path="/upgrade" element={<Upgrade />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/features" element={<Features />} />
    <Route path="/welcome" element={<Welcome />} />
    <Route path="/preferences" element={<Preferences />} />
    <Route
      path="/insights/:id"
      element={
        <ProtectedRoute>
          <Insight />
        </ProtectedRoute>
      }
    />
    <Route path="/login" element={<Login />} />
    <Route
      path="/new-insight"
      element={
        <ProtectedRoute>
          <NewInsight />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notion-callback"
      element={
        <ProtectedRoute>
          <NotionCallback />
        </ProtectedRoute>
      }
    />
    <Route path="/privacy" element={<Privacy />} />
    <Route path="/terms" element={<Terms />} />
  </Routes>
);

export default AppRoutes;
