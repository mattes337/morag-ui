import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../contexts/AppContext';
import { AuthWrapper } from '../components/layout/AuthWrapper';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
    title: 'Vector Database Manager',
    description: 'Manage your vector databases and documents',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="z30.yex">
            <body className="" data-oid="jts.1:m">
                <AppProvider data-oid="x2u1n34">
                    <AuthWrapper data-oid="u_jbzpc">{children}</AuthWrapper>
                    <Toaster position="top-right" richColors />
                </AppProvider>
            </body>
        </html>
    );
}
