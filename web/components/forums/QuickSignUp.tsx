"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function QuickSignUp() {
  const _supabase = supabase;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function signUp() {
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await _supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setMessage('Error: ' + error.message);
      } else if (data.user) {
        // Create profile entry
        const { error: profileError } = await _supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            handle: email.split('@')[0],
            role: 'user',
            country: 'US'
          });

        if (profileError) {
          console.warn('Profile creation failed:', profileError);
        }

        setMessage('Account created! You should now be signed in.');
        setEmail('');
        setPassword('');
        // Force page refresh to show authenticated state
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }

    setLoading(false);
  }

  async function signIn() {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await _supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage('Error: ' + error.message);
      } else {
        setMessage('Signed in successfully!');
        setEmail('');
        setPassword('');
        // Force page refresh to show authenticated state
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded bg-white">
        <p className="mb-4">Quick signup/signin for testing (no email verification required)</p>
        
        <div className="space-y-3">
          <input
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="password123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          
          <div className="flex gap-2">
            <button
              onClick={signUp}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
            <button
              onClick={signIn}
              disabled={loading || !email || !password}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </div>
        </div>
        
        {message && (
          <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
      
      <div className="text-sm text-gray-500">
        <p>💡 <strong>Quick test:</strong> Use email <code>test1@example.com</code> / password <code>password123</code></p>
      </div>
    </div>
  );
}