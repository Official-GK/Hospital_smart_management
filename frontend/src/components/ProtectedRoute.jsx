import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ProtectedRoute — wraps pages that require authentication.
 * Redirects to /login if no valid session token is found.
 */
export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('hqms_token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const token = localStorage.getItem('hqms_token');
  if (!token) return null;

  return children;
}
