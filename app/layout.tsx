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
        <html lang="en">
            <body className="">
                <AppProvider>
                    <AuthWrapper>{children}</AuthWrapper>
                </AppProvider>
            </body>
        </html>
    );
}
