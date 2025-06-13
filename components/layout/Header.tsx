'use client';

import { useApp } from '../../contexts/AppContext';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Header() {
    const {
        apiHealthy,
        user,
        setUser,
        setShowApiConfigDialog,
        showUserMenu,
        setShowUserMenu,
        setShowSettingsDialog,
        setShowServersDialog,
    } = useApp();

    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setShowUserMenu]);

    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });

            setUser(null);
            setShowUserMenu(false);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect to login even if logout API fails
            setUser(null);
            setShowUserMenu(false);
            router.push('/login');
        }
    };

    return (
        <header className="bg-white border-b border-gray-200" data-oid="3q.s_ev">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="do05maw">
                <div className="flex justify-between items-center py-6" data-oid="ltt8xak">
                    <div className="flex items-center space-x-4" data-oid="1s88k9e">
                        <Image
                            className="w-[50px] h-auto"
                            src="/images/Generated image 2-logo.png"
                            alt="MoRAG Logo"
                            width={50}
                            height={50}
                            data-oid="8c-k3wy"
                        />

                        <h1 className="text-3xl font-bold text-gray-900" data-oid="189fkw7">
                            MoRAG
                        </h1>

                        <span className="text-sm text-gray-500" data-oid="-rmf2i9">
                            Management Interface
                        </span>
                    </div>
                    <div className="flex items-center space-x-4" data-oid="vh:0.3.">
                        <span className="text-sm text-gray-600" data-oid="ffb2n.5">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid="e79s5k_">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="w.eag3c"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="2-5blfk">
                                API{' '}
                                {apiHealthy === true
                                    ? 'Connected'
                                    : apiHealthy === false
                                      ? 'Disconnected'
                                      : 'Checking...'}
                            </span>
                            <button
                                onClick={() => setShowApiConfigDialog(true)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                                data-oid="9gu05:u"
                            >
                                Configure
                            </button>
                        </div>

                        <div className="relative" ref={userMenuRef} data-oid="igugnen">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                                data-oid="0nyeuux"
                            >
                                <div
                                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium"
                                    data-oid="-7wrf-."
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="hidden md:block" data-oid="swlk1-f">
                                    {user?.name || 'User'}
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    data-oid="0dki7g5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                        data-oid="62k9-pm"
                                    />
                                </svg>
                            </button>

                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                                    data-oid="w71ej81"
                                >
                                    <div
                                        className="px-4 py-2 border-b border-gray-100"
                                        data-oid="pgsvkiw"
                                    >
                                        <p
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="5myr6e-"
                                        >
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500" data-oid="-fzva_r">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowSettingsDialog(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        data-oid="wc3h3sv"
                                    >
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="go9_8fm"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                data-oid="_.xrfdv"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                    data-oid="g8hq7t3"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    data-oid="qtmy5vv"
                                                />
                                            </svg>
                                            <span data-oid="roejsm7">Settings</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowServersDialog(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        data-oid="cpk3po."
                                    >
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid=".q0i-he"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                data-oid="d533px0"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                                    data-oid="77zf3h0"
                                                />
                                            </svg>
                                            <span data-oid="07wucvg">Servers</span>
                                        </div>
                                    </button>

                                    <div
                                        className="border-t border-gray-100 mt-1"
                                        data-oid="y4d-_c3"
                                    >
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            data-oid="tytmddu"
                                        >
                                            <div
                                                className="flex items-center space-x-2"
                                                data-oid="hcailzb"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid=":bast51"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        data-oid="fss.g2:"
                                                    />
                                                </svg>
                                                <span data-oid=".c9_gqk">Logout</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
