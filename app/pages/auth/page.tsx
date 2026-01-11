'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1220] to-[#05080f] text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#0f172a] shadow-2xl p-8 border border-white/10">
        
        {/* Logo / Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="text-3xl font-bold tracking-tight mb-1">
            Plore
          </div>
          <p className="text-sm text-white/60">
            {mode === 'login'
              ? 'Welcome back. Let’s continue.'
              : 'Create an account and start exploring.'}
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-lg bg-[#020617] border border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg bg-[#020617] border border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-lg bg-[#020617] border border-white/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-500 transition px-4 py-2 text-sm font-semibold"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3 text-white/40 text-xs">
          <div className="flex-1 h-px bg-white/10" />
          OR
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* OAuth Placeholder */}
        <button
          className="w-full rounded-lg border border-white/10 hover:bg-white/5 transition px-4 py-2 text-sm"
        >
          Continue with Provider
        </button>

        {/* Mode Switch */}
        <div className="mt-6 text-center text-sm text-white/60">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-400 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>

      </div>
    </main>
  );
}