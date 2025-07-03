import useAuth from '../lib/hooks/useAuth';
import Landing from '../components/Landing';
import Loading from '../components/Loading';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading text="Loading..." />
      </div>
    );
  }

  const isUserLoggedIn = !!user;
  return isUserLoggedIn ? <Dashboard /> : <Landing />;
}
