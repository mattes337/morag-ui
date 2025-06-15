'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';

export function LogoutButton() {
    const { setUser } = useApp();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });

            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect to login even if logout API fails
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            data-oid="3r3m_oq"
        >
            Logout
        </button>
    );
}
