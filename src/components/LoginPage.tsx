import React, { useState } from 'react';
import { SchoolLogoIcon, UserCircleIcon } from './icons.tsx'; // Assuming UserCircleIcon can be used for username
import Card from './Card.tsx';
import config from "@/config/config.json"

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API call / auth check
    setTimeout(() => {
      if (username === 'manubyp' && password === 'Mansaba1985') {
        onLogin(username);
      } else {
        setError('Nama pengguna atau kata sandi salah.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-main-bg p-4 font-sans">
      <div className="flex items-center mb-8">
        <img src={config.logo} className='h-12 w-12 text-brand-primary'></img>
        {/* <SchoolLogoIcon className="h-12 w-12 text-brand-primary" /> */}
        <span className="ml-3 text-3xl font-bold text-text-primary">KELULUSAN</span>
      </div>
      <Card className="w-full max-w-md" titleClassName="text-center text-xl" noPadding>
        <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-center text-text-primary mb-2">Login Admin</h2>
            <p className="text-sm text-text-secondary text-center mb-6">
                Selamat datang! Silakan masuk untuk melanjutkan.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label
                htmlFor="username"
                className="block text-sm font-medium text-text-secondary"
                >
                Nama Pengguna
                </label>
                <div className="mt-1">
                <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="username"
                />
                </div>
            </div>

            <div>
                <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary"
                >
                Kata Sandi
                </label>
                <div className="mt-1">
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                    placeholder="password"
                />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
                </div>
            )}

            <div>
                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-70"
                >
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Masuk'}
                </button>
            </div>
            </form>
        </div>
      </Card>
       <p className="mt-8 text-xs text-text-secondary text-center">
        © {new Date().getFullYear()} MANSABA MEDIA. All rights reserved.
      </p>
    </div>
  );
};

export default LoginPage;