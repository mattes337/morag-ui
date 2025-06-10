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
            <div className="min-h-screen bg-gray-50" data-oid="j1532oq">
                {children}
            </div>
        );
    }

    // If user is logged in and on login page, this will be handled by the login page redirect
    // If on login page, show login page without header/nav
    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50" data-oid="ygh90h7">
                {children}
            </div>
        );
    }

    // Normal authenticated layout
    return (
        <div className="min-h-screen bg-gray-50" data-oid="255xqxl">
            <Header data-oid="9-by4iw" />
            <Navigation data-oid="_iw.23t" />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-oid="2.qzlqb">
                {children}
            </main>
            <GlobalDialogs data-oid="uhsp31a" />
        </div>
    );
}
