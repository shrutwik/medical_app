import { useEffect } from 'react';
import { Stack } from 'expo-router';
import AdminConsole from '../../components/admin/AdminConsole';
import { useBreadcrumbs } from '../../contexts/BreadcrumbContext';

export default function AdminScreen() {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', href: '/' },
      { label: 'Admin' },
    ]);
    return () => setBreadcrumbs([]);
  }, [setBreadcrumbs]);

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Workspace' }} />
      <AdminConsole />
    </>
  );
}
