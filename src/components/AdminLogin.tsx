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
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/events');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="p-6 bg-navy-light border-2 border-cyan rounded-lg shadow-lg w-full max-w-md mx-4 sm:mx-auto">
        <h2 className="text-2xl font-bold text-cyan text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-base"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded bg-navy text-white border border-gray-800 focus:border-cyan focus:outline-none text-base"
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 transition duration-300 text-base font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}