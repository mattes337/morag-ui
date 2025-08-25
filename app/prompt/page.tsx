'use client';

import { useApp } from '../../contexts/AppContext';
import { PromptExecutionView } from '../../components/views/PromptExecutionView';

export default function PromptPage() {
    const { currentRealm } = useApp();

    if (!currentRealm) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No Realm Selected
                    </h2>
                    <p className="text-gray-600">
                        Please select a realm to start searching and querying your knowledge base.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <PromptExecutionView
            realmId={currentRealm.id}
            realmName={currentRealm.name}
        />
    );
}
