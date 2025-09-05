'use client';

import { DashboardLayout } from '@/components/layout';
import { mockUser, mockNavigation } from '@/components/layout/mockData';

export default function DashboardLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      user={mockUser}
      navigation={mockNavigation}
      currentRealm={mockUser.realms[0] || null}
      onRealmChange={(realm: any) => {
        console.log('Realm changed to:', realm.name);
      }}
    >
      {children}
    </DashboardLayout>
  );
}