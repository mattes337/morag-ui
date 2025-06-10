import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../contexts/AppContext';
import { AuthWrapper } from '../components/layout/AuthWrapper';

export const metadata: Metadata = {
    title: 'Vector Database Manager',
    description: 'Manage your vector databases and documents',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="vtybo.u">
            <body className="" data-oid="2jl:law">
                <AppProvider data-oid="cnvp2re">
                    <AuthWrapper data-oid=".59xqlr">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
