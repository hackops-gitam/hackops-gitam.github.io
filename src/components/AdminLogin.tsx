// src/components/AdminLogin.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCredentials } from '../config/adminConfig';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === adminCredentials.email && password === adminCredentials.password) {
      // Simple authentication match
      localStorage.setItem('isAdmin', 'true'); // Store admin status
      navigate('/admin/events');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="p-6 bg-navy-light border-cyan rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-cyan mb-4">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
          </div>
          <div>
            <label className="block text-white">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-navy text-white border border-gray-800 focus:border-cyan"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}