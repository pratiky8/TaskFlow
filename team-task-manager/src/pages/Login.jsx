import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const result = await login(formData);
    setIsSubmitting(false);
    
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: '#4f46e5' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1c1917' }}>Welcome back</h1>
          <p style={{ color: '#78716c' }}>Sign in to continue managing your projects</p>
        </div>

        <div className="bg-white rounded-xl p-8" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 20px -2px rgb(0 0 0 / 0.05)' }}>
          {authError && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#44403c' }}>
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg outline-none transition-all"
                style={{
                  borderColor: errors.email ? '#fca5a5' : '#e7e5e4',
                  backgroundColor: errors.email ? '#fef2f2' : 'white',
                }}
                placeholder="name@company.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm" style={{ color: '#dc2626' }}>{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#44403c' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg outline-none transition-all"
                style={{
                  borderColor: errors.password ? '#fca5a5' : '#e7e5e4',
                  backgroundColor: errors.password ? '#fef2f2' : 'white',
                }}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm" style={{ color: '#dc2626' }}>{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              style={{
                background: isSubmitting ? '#a8a29e' : '#4f46e5',
                color: 'white',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader size="small" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f5f5f4' }}>
            <p style={{ color: '#78716c' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium transition-colors hover:underline" style={{ color: '#4f46e5' }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
