'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { GlobalDialogs } from './GlobalDialogs';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, isAuthChecking } = useApp();
    const pathname = usePathname();
    const router = useRouter();

    const isLoginPage = pathname === '/login';

    // Handle redirects based on auth state
    useEffect(() => {
        // Only handle redirects after auth check is complete
        if (isAuthChecking) return;

        // If user is authenticated and on login page, redirect to home
        if (user && isLoginPage) {
            console.log('🔄 [AuthWrapper] Authenticated user on login page, redirecting to home');
            router.push('/');
        }

        // If user is not authenticated and not on login page, redirect to login
        if (!user && !isLoginPage) {
            console.log('🔄 [AuthWrapper] Unauthenticated user, redirecting to login');
            router.push('/login');
        }
    }, [user, isAuthChecking, isLoginPage, router]);

    // Show loading while checking auth
    if (isAuthChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-oid="5yrqv.3">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Initializing application...</p>
                </div>
            </div>
        );
    }

    // If user is logged in and on login page, this will be handled by the login page redirect
    // If on login page, show login page without header/nav
    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50" data-oid="iaf3s5z">
                {children}
            </div>
        );
    }

    // Normal authenticated layout
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" data-oid="zanke6-">
            <Header data-oid="oqu6f7g" />
            <Navigation data-oid="7sa8_r5" />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" data-oid="gk_t--6">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200" data-oid="gwmbsdd">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" data-oid="6f0_mjz">
                    <p className="text-center text-sm text-gray-500" data-oid="fla_f28">
                        © 2024 Morag AI. All rights reserved.
                    </p>
                </div>
            </footer>
            <GlobalDialogs data-oid=":tcz2ts" />
        </div>
    );
}
