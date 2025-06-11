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
            <div className="min-h-screen bg-gray-50" data-oid="crrinds">
                {children}
            </div>
        );
    }

    // If user is logged in and on login page, this will be handled by the login page redirect
    // If on login page, show login page without header/nav
    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50" data-oid="rzb125w">
                {children}
            </div>
        );
    }

    // Normal authenticated layout
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" data-oid="_9hbgpf">
            <Header data-oid="o_svno9" />
            <Navigation data-oid="gyzwi_h" />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-oid="lm8v2ni">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-200" data-oid="bff6yee">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" data-oid="tplj769">
                    <p className="text-center text-sm text-gray-500" data-oid="uuedfnd">
                        © 2024 Morag AI. All rights reserved.
                    </p>
                </div>
            </footer>
            <GlobalDialogs data-oid="ied_b.6" />
        </div>
    );
}
