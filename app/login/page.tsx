'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [headerAuthEnabled, setHeaderAuthEnabled] = useState(false);
    const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);
    const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
    const router = useRouter();
    const { setUser } = useApp();

    useEffect(() => {
        // Check auth configuration and perform auto-login if enabled
        const checkAuthMode = async () => {
            try {
                // First check if user is already authenticated
                const loginResponse = await fetch('/api/auth/login', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    // User is already authenticated via headers
                    setUser(data.user);
                    router.push('/');
                    return;
                } else if (loginResponse.status === 403) {
                    // Header auth enabled but user not enabled
                    setHeaderAuthEnabled(true);
                    return;
                }

                // Check auth configuration
                const configResponse = await fetch('/api/auth/config', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (configResponse.ok) {
                    const config = await configResponse.json();
                    setAutoLoginEnabled(config.enableAutoLogin);

                    // Perform auto-login if enabled and not already attempted
                    if (config.enableAutoLogin && !autoLoginAttempted) {
                        setAutoLoginAttempted(true);
                        await performAutoLogin();
                    }
                }
            } catch (error) {
                console.error('Auth mode check failed:', error);
                setHeaderAuthEnabled(false);
            }
        };

        const performAutoLogin = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/auth/auto-login', {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    router.push('/');
                } else {
                    console.warn('Auto-login failed, falling back to manual login');
                }
            } catch (error) {
                console.error('Auto-login error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthMode();
    }, [setUser, router, autoLoginAttempted]);

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
                credentials: 'include'
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
        { email: 'admin@morag.local', password: 'admin123', role: 'Development Admin' },
        { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
        { email: 'user@example.com', password: 'user123', role: 'User' },
        { email: 'viewer@example.com', password: 'viewer123', role: 'Viewer' },
    ];

    const fillCredentials = (email: string, password: string) => {
        setEmail(email);
        setPassword(password);
    };

    // Show loading state during auto-login attempt
    if (autoLoginEnabled && !autoLoginAttempted && isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Auto-Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Automatically signing you in...
                        </p>
                        <div className="mt-8 flex justify-center">
                            <svg
                                className="animate-spin h-8 w-8 text-blue-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Don't show login form if header auth is enabled
    if (headerAuthEnabled) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            SSO Authentication
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Please authenticate through your organization&apos;s SSO system.
                        </p>
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                You are not authorized to access this system. Please contact your administrator.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
            data-oid="rcip.t3"
        >
            <div className="sm:mx-auto sm:w-full sm:max-w-md" data-oid="7rtv2ld">
                <div className="text-center" data-oid="_z23w5j">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900" data-oid="4q7bj89">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600" data-oid="80p.f8l">
                        Welcome to the Vector Database Management System
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-oid=":u3wlo0">
                <div
                    className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"
                    data-oid="1acz6_d"
                >
                    <form className="space-y-6" onSubmit={handleLogin} data-oid="ncs66u_">
                        <div data-oid="u:0-byh">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="qj7x:2e"
                            >
                                Email address
                            </label>
                            <div className="mt-1" data-oid="nlvv.r7">
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
                                    data-oid="cz-jkcy"
                                />
                            </div>
                        </div>

                        <div data-oid="cu0c0it">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                                data-oid="jo2uv5j"
                            >
                                Password
                            </label>
                            <div className="mt-1" data-oid="yj2:_mo">
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
                                    data-oid="j-0wz2w"
                                />
                            </div>
                        </div>

                        {error && (
                            <div
                                className="text-red-600 text-sm text-center bg-red-50 p-2 rounded"
                                data-oid=":ymg11e"
                            >
                                {error}
                            </div>
                        )}

                        <div data-oid="_p7w-ew">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-oid="becugod"
                            >
                                {isLoading ? (
                                    <div className="flex items-center" data-oid="-3m0tsp">
                                        <svg
                                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            data-oid="xqzi924"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                data-oid="l30k6-l"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                data-oid="l3qy75u"
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

                    <div className="mt-8" data-oid="-er_cmf">
                        <div className="relative" data-oid="5me6wvp">
                            <div className="absolute inset-0 flex items-center" data-oid="69wyqzk">
                                <div
                                    className="w-full border-t border-gray-300"
                                    data-oid="na08.yg"
                                />
                            </div>
                            <div
                                className="relative flex justify-center text-sm"
                                data-oid="hkh9dwz"
                            >
                                <span className="px-2 bg-white text-gray-500" data-oid="eln6-oq">
                                    Demo Credentials
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-3" data-oid="h32y.s0">
                            {demoCredentials.map((cred, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => fillCredentials(cred.email, cred.password)}
                                    className="w-full text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    data-oid="3z7nw52"
                                >
                                    <div
                                        className="flex justify-between items-center"
                                        data-oid="7_irsc1"
                                    >
                                        <div data-oid="kr6dw28">
                                            <div
                                                className="text-sm font-medium text-gray-900"
                                                data-oid="k3h-qqt"
                                            >
                                                {cred.role}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500"
                                                data-oid="08nr_fg"
                                            >
                                                {cred.email}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400" data-oid="y222v99">
                                            Click to fill
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 text-xs text-gray-500 text-center" data-oid="3_f8peh">
                            <p data-oid="o_u_xgo">
                                Use any of the demo credentials above to sign in
                            </p>
                            {autoLoginEnabled && (
                                <p className="mt-2 text-blue-600">
                                    Auto-login is enabled for development
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
