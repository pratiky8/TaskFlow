import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
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
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
    const { confirmPassword, ...userData } = formData;
    const result = await signup(userData);
    setIsSubmitting(false);
    
    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)' }}>
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ background: '#4f46e5' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#1c1917' }}>Create your account</h1>
          <p style={{ color: '#78716c' }}>Start managing your projects today</p>
        </div>

        <div className="bg-white rounded-xl p-8" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 20px -2px rgb(0 0 0 / 0.05)' }}>
          {authError && (
            <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#44403c' }}>
                Full name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg outline-none transition-all"
                style={{
                  borderColor: errors.name ? '#fca5a5' : '#e7e5e4',
                  backgroundColor: errors.name ? '#fef2f2' : 'white',
                }}
                placeholder="Name"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm" style={{ color: '#dc2626' }}>{errors.name}</p>
              )}
            </div>

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
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm" style={{ color: '#dc2626' }}>{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#44403c' }}>
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg outline-none transition-all"
                style={{
                  borderColor: errors.confirmPassword ? '#fca5a5' : '#e7e5e4',
                  backgroundColor: errors.confirmPassword ? '#fef2f2' : 'white',
                }}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm" style={{ color: '#dc2626' }}>{errors.confirmPassword}</p>
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
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #f5f5f4' }}>
            <p style={{ color: '#78716c' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium transition-colors hover:underline" style={{ color: '#4f46e5' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
