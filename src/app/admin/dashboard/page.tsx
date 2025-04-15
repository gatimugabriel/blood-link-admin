'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear token and redirect to login
    router.push('/admin/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex space-x-4">
        <Link href="/admin/donations" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Donations
        </Link>
        <Link href="/admin/reports" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Reports
        </Link>
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Logout
      </button>
    </div>
  );
}