'use client';

import { useApp } from '../../contexts/AppContext';
import { useRef, useEffect } from 'react';

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

    const handleLogout = () => {
        setUser(null);
        setShowUserMenu(false);
    };

    return (
        <header className="bg-white border-b border-gray-200" data-oid="c0xtqz6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="bktovsg">
                <div className="flex justify-between items-center py-6" data-oid="jamwoor">
                    <div className="flex items-center space-x-4" data-oid="_4h00tc">
                        <img
                            className="w-[50px] h-full"
                            src="/images/Generated image 2-logo.png"
                            alt="Generated image 2-logo.png"
                            data-oid=".6bzmzi"
                        />

                        <h1 className="text-3xl font-bold text-gray-900" data-oid="8:x_3q:">
                            MoRAG
                        </h1>

                        <span className="text-sm text-gray-500" data-oid="caf17b6">
                            Management Interface
                        </span>
                    </div>
                    <div className="flex items-center space-x-4" data-oid="9wubd.o">
                        <span className="text-sm text-gray-600" data-oid="5m7a5-q">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid="1m-swjb">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="hczt-pj"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="atx3mg5">
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
                                data-oid="yxg8-xm"
                            >
                                Configure
                            </button>
                        </div>

                        <div className="relative" ref={userMenuRef} data-oid="uwpfhpn">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                                data-oid="eu9x6vd"
                            >
                                <div
                                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium"
                                    data-oid="6cq-1r6"
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="hidden md:block" data-oid="12-uml7">
                                    {user?.name || 'User'}
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    data-oid="gjkhq3t"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                        data-oid="0r867te"
                                    />
                                </svg>
                            </button>

                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                                    data-oid="5kuu02n"
                                >
                                    <div
                                        className="px-4 py-2 border-b border-gray-100"
                                        data-oid="96kunks"
                                    >
                                        <p
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="_7siwy:"
                                        >
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500" data-oid="-uuhcfl">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowSettingsDialog(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        data-oid="cbi_jpb"
                                    >
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="eyhovrv"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                data-oid="pce839s"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                    data-oid="25aubna"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    data-oid="fyh4xlg"
                                                />
                                            </svg>
                                            <span data-oid="6u0_jzq">Settings</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowServersDialog(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        data-oid="gl8z8nq"
                                    >
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="39vjbr6"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                data-oid="6i5pcra"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                                    data-oid="e7vmi.q"
                                                />
                                            </svg>
                                            <span data-oid="vg:5_4s">Servers</span>
                                        </div>
                                    </button>

                                    <div
                                        className="border-t border-gray-100 mt-1"
                                        data-oid="4tn2z9q"
                                    >
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            data-oid="aave67l"
                                        >
                                            <div
                                                className="flex items-center space-x-2"
                                                data-oid="76zfbvq"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="2aas5.k"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        data-oid="6nvhws:"
                                                    />
                                                </svg>
                                                <span data-oid="ax6p54:">Logout</span>
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
