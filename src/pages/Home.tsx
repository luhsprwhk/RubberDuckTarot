import useAuth from '../lib/hooks/useAuth';
import Landing from '../components/Landing';
import Lobby from '../components/Lobby';
import Loading from '../components/Loading';

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
  return isUserLoggedIn ? <Lobby /> : <Landing />;
}
