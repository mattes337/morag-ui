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
            data-oid=".rp1xn_"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md" data-oid="kcm1z2d">
                <div className="text-center" data-oid="hn6y3n:">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900" data-oid="bf4b0m6">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600" data-oid="5_xzrhh">
                        Welcome to the Vector Database Management System
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-oid="4:ec683">
                <div
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                    data-oid="m2g4at1"
                >
                    <form className="space-y-6" onSubmit={handleLogin} data-oid="usu9tkj">
                        <div data-oid="bub3bu5">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="e-0:edz"
                            >
                                Email address
                            </label>
                            <div className="mt-1" data-oid="_um95uk">
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
                                    data-oid="bu94v-5"
                                />
                            </div>
                        </div>

                        <div data-oid="cs6klpt">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="6g_2o0x"
                            >
                                Password
                            </label>
                            <div className="mt-1" data-oid="j77vjz7">
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
                                    data-oid="1er08t8"
                                />
                            </div>
                        </div>

                        {error && (
                            <div
                                className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
                                data-oid="f.fu4ao"
                            >
                                {error}
                            </div>
                        )}

                        <div data-oid="4apcm5o">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-oid="v_ch56z"
                            >
                                {isLoading ? (
                                    <div className="flex items-center" data-oid=".6y07k7">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            data-oid="wrgzcld"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                data-oid="qr2e.xo"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                data-oid="yvh_0hs"
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

                    <div className="mt-8" data-oid="a9xx9vb">
                        <div className="relative" data-oid="114zsf5">
                            <div className="absolute inset-0 flex items-center" data-oid="balpq_m">
                                <div
                                    className="w-full border-t border-gray-300"
                                    data-oid="ohcmeyf"
                                />
                            </div>
                            <div
                                className="relative flex justify-center text-sm"
                                data-oid="84dqpmp"
                            >
                                <span className="px-2 bg-white text-gray-500" data-oid="zb_jvns">
                                    Demo Credentials
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3" data-oid=".lbhp32">
                            {demoCredentials.map((cred, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillCredentials(cred.email, cred.password)}
                                    className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="fl4mjdl"
                                >
                                    <div
                                        className="flex justify-between items-center"
                                        data-oid=":s56ib-"
                                    >
                                        <div data-oid="e8f_6y-">
                                            <div
                                                className="text-sm font-medium text-gray-900"
                                                data-oid="o4eojdp"
                                            >
                                                {cred.role}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="9_gdvu1"
                                            >
                                                {cred.email}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400" data-oid="yap-ge3">
                                            Click to fill
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 text-center" data-oid="2h_8:eg">
                            <p data-oid="g:.v2o:">
                                Use any of the demo credentials above to sign in
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
