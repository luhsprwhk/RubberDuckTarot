import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../lib/hooks/useAuth';

const Login = () => {
  const { showAuthModal, isAuthModalOpen } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    showAuthModal('signIn');
  }, [showAuthModal]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      navigate('/');
    }
  }, [isAuthModalOpen, navigate]);

  return null;
};

export default Login;
