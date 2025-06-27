'use client';

import { useApp } from '../../contexts/AppContext';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RealmSelector } from './RealmSelector';

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
        <header className="bg-white border-b border-gray-200" data-oid="y-e3plu">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="rangy5h">
                <div className="flex justify-between items-center py-6" data-oid="7p66tub">
                    <div className="flex items-center space-x-4" data-oid="_hejhji">
                        <Image
                            className="w-[50px] h-auto"
                            src="/images/Generated image 2-logo.png"
                            alt="MoRAG Logo"
                            width={50}
                            height={50}
                            data-oid="7i27.dk"
                        />

                        <h1 className="text-3xl font-bold text-gray-900" data-oid="c042e18">
                            MoRAG
                        </h1>

                        <span className="text-sm text-gray-500" data-oid="hu37al6">
                            Management Interface
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-4" data-oid="realm-selector">
                        <RealmSelector />
                    </div>
                    
                    <div className="flex items-center space-x-4" data-oid="99-xicp">
                        <span className="text-sm text-gray-600" data-oid="zinkjfp">
                            Vector Database & RAG Management
                        </span>
                        <div className="flex items-center space-x-2" data-oid="ik:3xiz">
                            <div
                                className={`w-2 h-2 rounded-full ${apiHealthy === true ? 'bg-green-500' : apiHealthy === false ? 'bg-red-500' : 'bg-yellow-500'}`}
                                data-oid="ewwt1_x"
                            ></div>
                            <span className="text-xs text-gray-500" data-oid="29h079h">
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
                                data-oid="di2ll40"
                            >
                                Configure
                            </button>
                        </div>

                        <div className="relative" ref={userMenuRef} data-oid="6j6f0-t">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none"
                                data-oid="29_tg5r"
                            >
                                <div
                                    className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium"
                                    data-oid="m30m346"
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="hidden md:block" data-oid="322c5dz">
                                    {user?.name || 'User'}
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    data-oid="6hj.us9"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                        data-oid="tonl_ym"
                                    />
                                </svg>
                            </button>

                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                                    data-oid="v.g5qzp"
                                >
                                    <div
                                        className="px-4 py-2 border-b border-gray-100"
                                        data-oid="ina3-y-"
                                    >
                                        <p
                                            className="text-sm font-medium text-gray-900"
                                            data-oid="-yl__24"
                                        >
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500" data-oid="wy2y6w1">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setShowSettingsDialog(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        data-oid="4w24g5k"
                                    >
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="gi:19i8"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                data-oid="oml.mv3"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                    data-oid="fwfp4h5"
                                                />

                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    data-oid="y9x_d7e"
                                                />
                                            </svg>
                                            <span data-oid="w8zl4.6">Settings</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowServersDialog(true);
                                            setShowUserMenu(false);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        data-oid="pnsx_1v"
                                    >
                                        <div
                                            className="flex items-center space-x-2"
                                            data-oid="xbelgir"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                data-oid="0kbb877"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                                                    data-oid="et59u92"
                                                />
                                            </svg>
                                            <span data-oid="1gpy-rb">Servers</span>
                                        </div>
                                    </button>

                                    <div
                                        className="border-t border-gray-100 mt-1"
                                        data-oid="-z:iwd7"
                                    >
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            data-oid="ihk9:bd"
                                        >
                                            <div
                                                className="flex items-center space-x-2"
                                                data-oid="wrpks9p"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    data-oid="xsa29m0"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        data-oid="nqfv.s_"
                                                    />
                                                </svg>
                                                <span data-oid="xp3rxo4">Logout</span>
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
