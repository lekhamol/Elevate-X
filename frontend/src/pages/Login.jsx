import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('engineer@safetytwin.io');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('ENGINEER');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const userRole = login(email, password, role);
    redirectToDashboard(userRole);
  };

  const handleQuickDemo = (selectedRole) => {
    const defaultEmail = `${selectedRole.toLowerCase()}@safetytwin.io`;
    const userRole = login(defaultEmail, 'demo123', selectedRole);
    redirectToDashboard(userRole);
  };

  const redirectToDashboard = (targetRole) => {
    if (targetRole === 'OPERATOR') {
      navigate('/operator');
    } else if (targetRole === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/engineer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/20 mb-2">
            <Activity className="w-8 h-8 text-slate-950 font-bold" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-sky-200 to-white bg-clip-text text-transparent">
            Elevator Safety Digital Twin
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Real-Time ESP32 Sensor Telemetry & AI Predictive Safety Suite
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'OPERATOR', label: 'Operator' },
                  { id: 'ENGINEER', label: 'Engineer' },
                  { id: 'ADMIN', label: 'Admin' }
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      role === r.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                placeholder="engineer@safetytwin.io"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-3">
            <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Instant One-Click Demo Logins</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('OPERATOR')}
                className="px-2 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-mono transition-colors"
              >
                Operator
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ENGINEER')}
                className="px-2 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-cyan-300 font-mono transition-colors"
              >
                Lead Engineer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="px-2 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-[11px] text-blue-300 font-mono transition-colors"
              >
                System Admin
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="text-center text-[10px] text-slate-500 font-mono flex items-center justify-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          <span>Spring Boot REST API • MySQL Database • ESP32 Wi-Fi Sync</span>
        </div>
      </div>
    </div>
  );
}
