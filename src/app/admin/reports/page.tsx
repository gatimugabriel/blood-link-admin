'use client';

import { useState, useEffect } from 'react';

interface ReportStats {
  totalDonations: number;
  // ... other stats properties
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/reports/stats');
        if (!response.ok) throw new Error('Failed to fetch reports');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const response = await fetch('/api/reports/export');
      if (!response.ok) throw new Error('Failed to export donations');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'donations_report.csv'; // Adjust the filename
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting donations:', error);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>
      {stats && (
        <div className="bg-white p-4 rounded shadow">
          <p>Total Donations: {stats.totalDonations}</p>
          {/* ... other stats */}
        </div>
      )}
      <button
        onClick={handleExport}
        className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Export Donations
      </button>
    </div>
  );
}