import useAuth from '../lib/hooks/useAuth';
import Landing from '../components/Landing';
import Lobby from '../components/Lobby';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  const isUserLoggedIn = !!user;
  return isUserLoggedIn ? <Lobby /> : <Landing />;
}
