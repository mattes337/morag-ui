'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
    const pathname = usePathname();

    const tabs = [
        { id: 'databases', label: 'Databases', href: '/' },
        { id: 'documents', label: 'Documents', href: '/documents' },
        { id: 'jobs', label: 'Jobs', href: '/jobs' },
        { id: 'prompt', label: 'Prompt', href: '/prompt' },
        { id: 'apikeys', label: 'API Keys', href: '/api-keys' },
        { id: 'servers', label: 'Servers', href: '/servers' },
        { id: 'settings', label: 'Settings', href: '/settings' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200" data-oid="jb.1fev">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="585mmvu">
                <div className="flex space-x-8" data-oid="zrulje9">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                pathname === tab.href
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            data-oid="f3wevrq"
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}
