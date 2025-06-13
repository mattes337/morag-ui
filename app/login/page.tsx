'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { setUser } = useApp();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                router.push('/');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const demoCredentials = [
        { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
        { email: 'user@example.com', password: 'user123', role: 'User' },
        { email: 'viewer@example.com', password: 'viewer123', role: 'Viewer' },
    ];

    const fillCredentials = (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
    };

    return (
        <div
            className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
            data-oid="w40ufgy"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md" data-oid="5:qv7yg">
                <div className="text-center" data-oid="0m4v5v:">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900" data-oid="w312a8i">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600" data-oid="dysr2xk">
                        Welcome to the Vector Database Management System
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-oid="nq_ivzz">
                <div
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                    data-oid="rjxs7hb"
                >
                    <form className="space-y-6" onSubmit={handleLogin} data-oid="l4sa7k5">
                        <div data-oid="x5nkx6z">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="rurg.4t"
                            >
                                Email address
                            </label>
                            <div className="mt-1" data-oid="i9bbnpf">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your email"
                                    data-oid="sbs-0ck"
                                />
                            </div>
                        </div>

                        <div data-oid="d4-rxv-">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="vly-imk"
                            >
                                Password
                            </label>
                            <div className="mt-1" data-oid="bk7k0kw">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter your password"
                                    data-oid="7.gh055"
                                />
                            </div>
                        </div>

                        {error && (
                            <div
                                className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
                                data-oid="eqjmvpw"
                            >
                                {error}
                            </div>
                        )}

                        <div data-oid="-s0s1y8">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-oid="2i71zdh"
                            >
                                {isLoading ? (
                                    <div className="flex items-center" data-oid="jtr7-7e">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            data-oid="pnr4d5k"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                data-oid="8nek69m"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                data-oid="7r7yvf6"
                                            ></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8" data-oid="rb28-3q">
                        <div className="relative" data-oid="dt8dr26">
                            <div className="absolute inset-0 flex items-center" data-oid="1wz5f5s">
                                <div
                                    className="w-full border-t border-gray-300"
                                    data-oid="y:2wzfm"
                                />
                            </div>
                            <div
                                className="relative flex justify-center text-sm"
                                data-oid="on9vu-g"
                            >
                                <span className="px-2 bg-white text-gray-500" data-oid="-vu5k5b">
                                    Demo Credentials
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3" data-oid="j2iyxyx">
                            {demoCredentials.map((cred, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillCredentials(cred.email, cred.password)}
                                    className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="xuv5.lk"
                                >
                                    <div
                                        className="flex justify-between items-center"
                                        data-oid="mogx.jz"
                                    >
                                        <div data-oid="oxsoqb:">
                                            <div
                                                className="text-sm font-medium text-gray-900"
                                                data-oid="cbya69g"
                                            >
                                                {cred.role}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="cl64k9p"
                                            >
                                                {cred.email}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400" data-oid="gb7-2oc">
                                            Click to fill
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 text-center" data-oid="_qvizpg">
                            <p data-oid="vp:hn4t">
                                Use any of the demo credentials above to sign in
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
