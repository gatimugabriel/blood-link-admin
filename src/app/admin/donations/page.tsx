// src/app/admin/donations/page.tsx
'use client';
import { useState, useEffect } from 'react';

interface Donation {
  id: string;
  status: string;
  // ... other properties based on your Donation model
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch('/api/donations');
        if (!response.ok) throw new Error('Failed to fetch donations');
        const data = await response.json();
        setDonations(data); // Assuming the API returns an array of donations
      } catch (error) {
        console.error('Error fetching donations:', error);
      }
    };

    fetchDonations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
        const response = await fetch(`/api/donations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include auth headers if needed
        },
        body: JSON.stringify({ status: newStatus }), // Adjust according to your API
      });

      if (!response.ok) {
        throw new Error('Failed to update donation status');
      }

      // Update the UI with the new status
      setDonations(prevDonations =>
        prevDonations.map(donation =>
          donation.id === id ? { ...donation, status: newStatus } : donation
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Donations</h2>
      <ul className="space-y-4">
        {donations.map((donation) => (
          <li key={donation.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <p>Donation ID: {donation.id}</p>
              <p>Status: {donation.status}</p>
            </div>
            <div>
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mt-2 mr-2" onClick={() => handleUpdateStatus(donation.id, 'completed')}>Mark Completed</button>
              <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mt-2" onClick={() => handleUpdateStatus(donation.id, 'scheduled')}>Mark Scheduled</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}