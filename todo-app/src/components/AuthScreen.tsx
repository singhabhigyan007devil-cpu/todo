import React, { useState, useEffect } from 'react';
import { Mail, Lock, Sparkles, Loader2, AlertCircle, Eye, EyeOff, ListTodo, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onContinueAsGuest: () => void;
}

export function AuthScreen({ onAuthSuccess, onContinueAsGuest }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Clear messages when toggling mode
  useEffect(() => {
    setError(null);
    setInfoMessage(null);
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase client is not initialized. Please configure database credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        // In Supabase, if email confirmation is enabled, session might be null.
        if (data.session) {
          onAuthSuccess();
        } else {
          setInfoMessage('Account created! Please check your email inbox for a verification link.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] overflow-hidden select-none">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[140px] animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(41, 151, 255, 0.2) 0%, transparent 70%)',
            animationDuration: '10s'
          }} 
        />
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full blur-[140px] animate-pulse" 
          style={{ 
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            animationDuration: '12s'
          }} 
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md p-8 mx-4 border border-white/5 rounded-[28px] bg-[#0c1017]/75 backdrop-blur-xl apple-product-shadow transition-all duration-300 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-[#2997ff]/10 text-[#2997ff]">
            <ListTodo size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isSignUp ? 'Create your Account' : 'Welcome to TaskFlow'}
          </h2>
          <p className="text-xs text-[#86868b] mt-1.5 max-w-[280px]">
            {isSignUp 
              ? 'Start organizing your workspaces, matrix layouts, and notes in the cloud.' 
              : 'Sign in to access your custom personals, roadmap targets, and pomodoro syncs.'}
          </p>
        </div>

        {/* Messaging Panels */}
        {!supabase && (
          <div className="p-3.5 mb-5 rounded-xl border border-amber-500/20 bg-amber-900/10 text-amber-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Supabase database is not configured. Go back to the landing page and click the <strong>DB Config</strong> button in the header to enter your keys, or click <strong>Continue as Guest</strong> below.
            </span>
          </div>
        )}
        {error && (
          <div className="p-3.5 mb-5 rounded-xl border border-red-500/20 bg-red-900/10 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {infoMessage && (
          <div className="p-3.5 mb-5 rounded-xl border border-[#2997ff]/20 bg-[#2997ff]/5 text-[#2997ff] text-xs flex items-start gap-2.5 animate-fadeIn">
            <Sparkles size={14} className="flex-shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-white/5 bg-[#141a24] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#2997ff]/50 focus:ring-4 focus:ring-[#2997ff]/10 transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-white/5 bg-[#141a24] text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#2997ff]/50 focus:ring-4 focus:ring-[#2997ff]/10 transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white bg-[#2997ff] hover:bg-[#1a85ec] disabled:opacity-50 disabled:hover:bg-[#2997ff] transition-all cursor-pointer btn-pressable"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? 'Create Cloud Account' : 'Sign In'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[#86868b] hover:text-[#2997ff] transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#0c1017] px-3 text-[#86868b]">Or</span>
          </div>
        </div>

        {/* Guest Fallback */}
        <button
          onClick={onContinueAsGuest}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-normal text-[#86868b] border border-white/5 bg-transparent hover:bg-white/5 hover:text-white transition-all cursor-pointer"
        >
          <span>Continue as Guest (Local Mode)</span>
        </button>

      </div>
    </div>
  );
}
