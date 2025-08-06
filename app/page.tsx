'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../contexts/AppContext';
import { RealmsView } from '../components/views/RealmsView';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useEffect } from 'react';

export default function RealmsPage() {
    const router = useRouter();
    const {
        user,
        realms,
        isDataLoading,
        setCurrentRealm,
        setSelectedDocument,
        setShowCreateRealmDialog,
    } = useApp();

    useEffect(() => {
        if (!user && !isDataLoading) {
            router.push('/login');
        }
    }, [user, isDataLoading, router]);

    if (isDataLoading) {
        return <LoadingSpinner data-oid="a1hr43t" />;
    }

    if (!user) {
        return null; // or a loading spinner
    }

    const handleSelectRealm = (realm: any) => {
        setCurrentRealm(realm);
        router.push('/documents');
    };

    const handlePromptRealm = (realm: any) => {
        setCurrentRealm(realm);
        setSelectedDocument(null);
        router.push('/prompt');
    };

    const handleViewRealm = (realm: any) => {
        router.push(`/realms/${realm.id}`);
    };

    return (
        <RealmsView
            realms={realms}
            onCreateRealm={() => setShowCreateRealmDialog(true)}
            onSelectRealm={handleSelectRealm}
            onPromptRealm={handlePromptRealm}
            onViewRealm={handleViewRealm}
            data-oid="bs7d6n9"
        />
    );
}
