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
        <html lang="en" data-oid="g5noz8_">
            <body className="" data-oid="0a5:omj">
                <AppProvider data-oid="9uj6h9d">
                    <AuthWrapper data-oid="9e9g1om">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
