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
        <html lang="en" data-oid="6ca45:e">
            <body className="" data-oid="k9d0ly5">
                <AppProvider data-oid="a.wytrc">
                    <AuthWrapper data-oid="15vj4ii">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
