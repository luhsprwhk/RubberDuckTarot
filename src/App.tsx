import AppRoutes from './router';

import AuthProvider from './lib/auth/AuthProvider';
import CardsProvider from './lib/cards/CardsProvider';
import { AlertProvider } from './lib/alerts/AlertProvider';
import InsightProvider from './lib/insights/InsightProvider';
import BlockTypesProvider from './lib/blocktypes/BlockTypesProvider';
import Navbar from './components/Navbar';
import { AlertContainer } from './components/AlertContainer';

function App() {
  return (
    <AppWrapper>
      <div className="min-h-screen bg-void-gradient bg-void-blur">
        <Navbar />
        <main>
          <AppRoutes />
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
