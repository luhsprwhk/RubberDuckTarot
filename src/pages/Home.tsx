import useAuth from '../hooks/useAuth';
import Landing from '../components/Landing';
import Lobby from '../components/Lobby';

export default function Home() {
  const { user } = useAuth();
  const isUserLoggedIn = !!user;

  return !isUserLoggedIn ? <Landing /> : <Lobby />;
}
