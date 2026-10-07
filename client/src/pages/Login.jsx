import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const toast = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast.warning('Please enter both login ID and password.', 'Required Fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(identifier, password);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}! Access granted.`, 'Login Successful');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error, 'Access Denied');
    }
  };

  const handleAutoFill = () => {
    setIdentifier('admin');
    setPassword('admin123');
    toast.info('Demo credentials auto-filled: admin / admin123', 'Credentials Applied');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 0%, #f0fdf4 0%, #f8fafc 50%, #f1f5f9 100%)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Decorative ambient background blur orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(12, 90, 72, 0.08) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 20px 40px -15px rgba(12, 90, 72, 0.08), 0 8px 16px -6px rgba(0, 0, 0, 0.04)',
          padding: '36px 32px',
          position: 'relative',
          zIndex: 1,
          animation: 'modalFadeIn 0.3s ease-out forwards'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '16px'
            }}
          >
            <Logo variant="horizontal" height={85} style={{ margin: '0 auto', display: 'flex', justifyContent: 'center' }} />
          </div>

          <h2 style={{ margin: '0', fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Sign In to Portal
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Input 1: Login ID / Mail */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              htmlFor="login-identifier"
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#334155',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '6px'
              }}
            >
              Login ID / Email *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <Mail size={16} />
              </div>
              <input
                id="login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin or email"
                autoComplete="username"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: '#1e293b',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0c5a48';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(12, 90, 72, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                }}
              />
            </div>
          </div>

          {/* Input 2: Password with Professional Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                htmlFor="login-password"
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#334155',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Password *
              </label>
              <button
                type="button"
                onClick={handleAutoFill}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '11.5px',
                  color: '#0c5a48',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                Demo Fill?
              </button>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none'
                }}
              >
                <Lock size={16} />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  padding: '11px 44px 11px 40px',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: '#1e293b',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '12px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0c5a48';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(12, 90, 72, 0.12)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                }}
              />

              {/* Password Visibility Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: showPassword ? '#0c5a48' : '#94a3b8',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0c5a48';
                  e.currentTarget.style.background = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = showPassword ? '#0c5a48' : '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember Me Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#475569',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#0c5a48',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              />
              <span>Keep me signed in</span>
            </label>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Session: 30 Days</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0c5a48 0%, #06372c 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(12, 90, 72, 0.28)',
              transition: 'all 0.18s ease',
              marginTop: '4px'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && !loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(12, 90, 72, 0.36)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(12, 90, 72, 0.28)';
            }}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 size={16} className="spin-animate" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Note */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <CheckCircle2 size={13} style={{ color: '#059669' }} />
          <span>256-Bit SSL Encrypted Enterprise Authentication</span>
        </div>
      </div>

      {/* =========================================================
          CORNER CREDENTIALS HELPER BADGE (SPEC REQUIREMENT)
          "make mention the credentials in small in the login page corner"
          ========================================================= */}
      <div
        className="corner-credentials-pill"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #cbd5e1',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#334155',
          transition: 'all 0.2s ease'
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: '#ecfdf5',
            color: '#0c5a48',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}
        >
          <KeyRound size={15} />
        </div>

        <div>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700 }}>
            Demo Access
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1px' }}>
            <span>
              mail: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>admin</strong>
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span>
              pass: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>admin123</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoFill}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#0c5a48',
            cursor: 'pointer',
            marginLeft: '4px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ecfdf5';
            e.currentTarget.style.borderColor = '#a7f3d0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }}
          title="Click to insert credentials into form"
        >
          Auto Fill
        </button>
      </div>
    </div>
  );
}
