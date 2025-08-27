'use client';

import { PromptExecutionView } from '../../components/views/PromptExecutionView';
import { usePromptController } from '../../lib/controllers/PromptController';

export default function PromptPage() {
    const { state } = usePromptController();

    if (!state.hasRealm) {
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
            realmId={state.currentRealm.id}
            realmName={state.currentRealm.name}
        />
    );
}
