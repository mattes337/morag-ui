'use client';

import { RealmsView } from '../components/views/RealmsView';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { useRealmsController } from '../lib/controllers/RealmsController';
import { useApp } from '../contexts/AppContext';

export default function RealmsPage() {
    const { state, actions } = useRealmsController();
    const { setShowCreateRealmDialog } = useApp();

    if (state.isLoading) {
        return <LoadingSpinner data-oid="a1hr43t" />;
    }

    if (!state.user) {
        return null; // or a loading spinner
    }

    return (
        <RealmsView
            realms={state.realms}
            onCreateRealm={() => setShowCreateRealmDialog(true)}
            onSelectRealm={actions.handleSelectRealm}
            onPromptRealm={actions.handlePromptRealm}
            onViewRealm={actions.handleViewRealm}
            data-oid="bs7d6n9"
        />
    );
}
