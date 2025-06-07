'use client';

interface NavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const tabs = [
        { id: 'databases', label: 'Databases' },
        { id: 'documents', label: 'Documents' },
        { id: 'prompt', label: 'Prompt' },
        { id: 'apikeys', label: 'API Keys' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200" data-oid="0p0hcui">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-oid="89j7ba8">
                <div className="flex space-x-8" data-oid="v8ce7um">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                            data-oid="pk3ubv."
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
