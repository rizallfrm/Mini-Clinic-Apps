import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse, Lock, Mail, ArrowRight,
  Shield, Stethoscope, UserCheck, AlertCircle, Eye, EyeOff,
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin',   email: 'admin@clinic.com',   password: 'Admin123!',   icon: Shield,      color: 'from-rose-500 to-pink-600' },
  { role: 'Dokter',  email: 'doctor@clinic.com',  password: 'Doctor123!',  icon: Stethoscope, color: 'from-emerald-500 to-teal-600' },
  { role: 'Petugas', email: 'officer@clinic.com', password: 'Officer123!', icon: UserCheck,   color: 'from-indigo-500 to-blue-600' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau kata sandi salah. Periksa kembali dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div
      className="min-h-screen flex items-stretch"
      style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a30 60%, #0a1628 100%)' }}
    >
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d2438 0%, #071524 100%)' }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glows */}
        <div className="absolute top-20 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-5 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

        {/* Brand top */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <img src="/logo.png" alt="Clinica Logo" className="w-20 h-20 object-contain scale-125 origin-left" />
            <div>
              <div className="text-white font-bold text-xl leading-tight">Clinica</div>
              <div className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase">Healthcare System</div>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Sistem Informasi<br />Klinik Modern
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Platform terpadu untuk manajemen pasien, antrean, pemeriksaan dokter, dan inventaris obat.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {[
              { icon: '🏥', text: 'Manajemen antrean & registrasi pasien' },
              { icon: '🩺', text: 'Pencatatan rekam medis & SOAP' },
              { icon: '💊', text: 'Resep & inventaris stok obat' },
              { icon: '📊', text: 'Dashboard laporan & statistik' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-base">{f.icon}</span>
                <span className="text-xs text-slate-400">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[11px] text-slate-600">
          &copy; {new Date().getFullYear()} Clinica Healthcare System
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
          <div className="text-center mb-10 lg:hidden flex flex-col items-center">
            <img src="/logo.png" alt="Clinica Logo" className="w-28 h-28 object-contain mb-2 scale-110" />
            <h1 className="text-3xl font-extrabold text-white">Clinica</h1>
            <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5">Healthcare System</p>
          </div>

          {/* Session expired */}
          {isExpired && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-xs font-medium"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', color: '#fbbf24' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Sesi Anda telah berakhir. Silakan masuk kembali.</span>
            </div>
          )}

          {/* Card */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>

            {/* Card header strip */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #10b981, #0891b2)' }} />

            <div className="p-7">
              <h2 className="text-lg font-bold text-white mb-1">Masuk ke Akun</h2>
              <p className="text-slate-400 text-xs mb-6">
                Masukkan kredensial Anda untuk melanjutkan.
              </p>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-xs"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: '#4b6a8a' }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="nama@clinica.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e2e8f0',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: '#4b6a8a' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#e2e8f0',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                      style={{ color: '#4b6a8a' }}
                      tabIndex={-1}
                    >
                      {showPass
                        ? <EyeOff className="w-4 h-4" />
                        : <Eye className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition mt-2"
                  style={{
                    background: loading ? '#059669' : 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                    opacity: loading ? 0.8 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Memproses...</span></>
                    : <><span>Masuk ke Dashboard</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-center text-[11px] text-slate-500 mb-3 font-medium uppercase tracking-wider">
                  Login Demo Cepat
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map(acc => {
                    const Icon = acc.icon;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => fillDemo(acc)}
                        className="flex flex-col items-center gap-2 py-3 rounded-xl transition cursor-pointer"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${acc.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-300">{acc.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer mobile */}
          <p className="text-center text-[11px] text-slate-600 mt-5 lg:hidden">
            &copy; {new Date().getFullYear()} Mini Clinic Information System
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
