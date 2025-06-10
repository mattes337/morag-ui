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

        // Dummy login logic
        setTimeout(() => {
            if (email === 'admin@example.com' && password === 'admin123') {
                setUser({
                    id: '1',
                    name: 'Admin User',
                    email: 'admin@example.com',
                    role: 'admin',
                });
                router.push('/');
            } else if (email === 'user@example.com' && password === 'user123') {
                setUser({
                    id: '2',
                    name: 'Regular User',
                    email: 'user@example.com',
                    role: 'user',
                });
                router.push('/');
            } else if (email === 'viewer@example.com' && password === 'viewer123') {
                setUser({
                    id: '3',
                    name: 'Viewer User',
                    email: 'viewer@example.com',
                    role: 'viewer',
                });
                router.push('/');
            } else {
                setError('Invalid email or password');
            }
            setIsLoading(false);
        }, 1000);
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
            data-oid="f40tekz"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md" data-oid="_2z-vrk">
                <div className="text-center" data-oid="cm0ymgo">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900" data-oid="3vhl4na">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600" data-oid="5-e_khn">
                        Welcome to the Vector Database Management System
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-oid="8y6:v1_">
                <div
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                    data-oid="x5.9wmm"
                >
                    <form className="space-y-6" onSubmit={handleLogin} data-oid="_e1xtm_">
                        <div data-oid="zj8xtvi">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="ep62yor"
                            >
                                Email address
                            </label>
                            <div className="mt-1" data-oid="nj989yy">
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
                                    data-oid="mml3f6."
                                />
                            </div>
                        </div>

                        <div data-oid="-h40:ng">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="5bqzwdm"
                            >
                                Password
                            </label>
                            <div className="mt-1" data-oid="fwp:n09">
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
                                    data-oid="f-4v5p1"
                                />
                            </div>
                        </div>

                        {error && (
                            <div
                                className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
                                data-oid="0tqpxj5"
                            >
                                {error}
                            </div>
                        )}

                        <div data-oid="ublscap">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-oid=":av817s"
                            >
                                {isLoading ? (
                                    <div className="flex items-center" data-oid="ydplv.1">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            data-oid="zz2r57w"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                data-oid="pdesb45"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                data-oid="b6zwsmn"
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

                    <div className="mt-8" data-oid="43fx3s7">
                        <div className="relative" data-oid="gm4tgln">
                            <div className="absolute inset-0 flex items-center" data-oid="cvlqcd8">
                                <div
                                    className="w-full border-t border-gray-300"
                                    data-oid="4:-y5kp"
                                />
                            </div>
                            <div
                                className="relative flex justify-center text-sm"
                                data-oid="vs6pegi"
                            >
                                <span className="px-2 bg-white text-gray-500" data-oid="1xvfjc6">
                                    Demo Credentials
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3" data-oid="07twgdy">
                            {demoCredentials.map((cred, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillCredentials(cred.email, cred.password)}
                                    className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="mzvzsrc"
                                >
                                    <div
                                        className="flex justify-between items-center"
                                        data-oid="qd4b6nm"
                                    >
                                        <div data-oid="t.q6ud:">
                                            <div
                                                className="text-sm font-medium text-gray-900"
                                                data-oid="wkugcdv"
                                            >
                                                {cred.role}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="e:fpwj:"
                                            >
                                                {cred.email}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400" data-oid="j7480nu">
                                            Click to fill
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 text-center" data-oid="qumqyu7">
                            <p data-oid="toi8yfb">
                                Use any of the demo credentials above to sign in
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
