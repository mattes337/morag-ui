'use client';

import { usePathname } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { GlobalDialogs } from './GlobalDialogs';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useApp();
    const pathname = usePathname();

    const isLoginPage = pathname === '/login';

    // If user is not logged in and not on login page, show login page content
    if (!user && !isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50" data-oid="h:jj7xd">
                {children}
            </div>
        );
    }

    // If user is logged in and on login page, this will be handled by the login page redirect
    // If on login page, show login page without header/nav
    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50" data-oid="30f81hn">
                {children}
            </div>
        );
    }

    // Normal authenticated layout
    return (
        <div className="min-h-screen bg-gray-50" data-oid="hyte-wc">
            <Header data-oid="wt_lyep" />
            <Navigation data-oid="tyg2l4r" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-oid="wd12ea1">
                {children}
            </main>
            <GlobalDialogs data-oid="km9wujf" />
        </div>
    );
}
