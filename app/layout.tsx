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
        <html lang="en" data-oid=":t_lltt">
            <body className="" data-oid="8_zkwc6">
                <AppProvider data-oid="bdjg7:m">
                    <AuthWrapper data-oid="l0ge8bu">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
