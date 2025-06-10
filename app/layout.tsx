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
        <html lang="en" data-oid="352mp56">
            <body className="" data-oid="ghsembp">
                <AppProvider data-oid="4dzu2th">
                    <AuthWrapper data-oid="kkkdtyi">{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
