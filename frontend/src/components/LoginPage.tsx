/**
 * LoginPage Component
 *
 * Renders the login form for user authentication. Handles form state, error display, and navigation.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Main login page for TaskPilot app.
 * Handles user input, login logic, and error feedback.
 */
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1d29 0%, #13141c 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '600',
            color: '#e5e7eb',
            marginBottom: '8px'
          }}>TaskPilot</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '8px'
            }}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1e2330',
                border: '1px solid #2d3548',
                borderRadius: '8px',
                color: '#e5e7eb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#2d3548'}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '500',
              color: '#d1d5db',
              marginBottom: '8px'
            }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1e2330',
                border: '1px solid #2d3548',
                borderRadius: '8px',
                color: '#e5e7eb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#2d3548'}
            />
          </div>

          <button 
            type="submit" 
            className="btn primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '500'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};
