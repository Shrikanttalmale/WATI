import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, AlertCircle, Loader, Ban, RotateCcw, Trash2 } from 'lucide-react';
import client from '../api/client';
import { useToastStore } from '../store/toastStore';

interface Dashboard {
  users: { total: number; active: number; suspended: number };
  campaigns: number;
  messages: { total: number; successful: number };
  revenue: number;
  deliveryRate: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes] = await Promise.all([
        client.get('/admin/dashboard'),
        client.get('/admin/users'),
      ]);
      setDashboard(dashRes.data.dashboard);
      setUsers(usersRes.data.users);
    } catch (error) {
      addToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId: string, reason?: string) => {
    try {
      await client.post(/admin/users//suspend, { reason });
      addToast('User suspended', 'success');
      fetchData();
    } catch (error) {
      addToast('Failed to suspend user', 'error');
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await client.post(/admin/users//reactivate, {});
      addToast('User reactivated', 'success');
      fetchData();
    } catch (error) {
      addToast('Failed to reactivate user', 'error');
    }
  };

  if (loading) return <div className='flex items-center justify-center h-screen'><Loader className='animate-spin' /></div>;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl font-bold text-gray-900 mb-8'>Admin Dashboard</h1>

        {dashboard && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white p-6 rounded-lg shadow'><div className='flex items-center gap-4'><Users className='text-blue-600' size={32} /><div><div className='text-gray-600'>Total Users</div><div className='text-3xl font-bold'>{dashboard.users.total}</div></div></div></div>
              <div className='bg-white p-6 rounded-lg shadow'><div className='flex items-center gap-4'><TrendingUp className='text-green-600' size={32} /><div><div className='text-gray-600'>Campaigns</div><div className='text-3xl font-bold'>{dashboard.campaigns}</div></div></div></div>
              <div className='bg-white p-6 rounded-lg shadow'><div className='flex items-center gap-4'><AlertCircle className='text-orange-600' size={32} /><div><div className='text-gray-600'>Delivery Rate</div><div className='text-3xl font-bold'>{dashboard.deliveryRate}%</div></div></div></div>
              <div className='bg-white p-6 rounded-lg shadow'><div className='flex items-center gap-4'><TrendingUp className='text-purple-600' size={32} /><div><div className='text-gray-600'>Revenue</div><div className='text-3xl font-bold'>₹{(dashboard.revenue / 100000).toFixed(1)}L</div></div></div></div>
            </div>

            <div className='bg-white rounded-lg shadow'>
              <div className='p-6 border-b'><h2 className='text-2xl font-bold'>User Management</h2></div>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50'><tr><th className='px-6 py-3 text-left'>Email</th><th className='px-6 py-3 text-left'>Name</th><th className='px-6 py-3 text-left'>Status</th><th className='px-6 py-3 text-left'>Actions</th></tr></thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className='border-t hover:bg-gray-50'>
                        <td className='px-6 py-4'>{user.email}</td>
                        <td className='px-6 py-4'>{user.name}</td>
                        <td className='px-6 py-4'><span className={px-3 py-1 rounded text-sm font-semibold \}>{user.status}</span></td>
                        <td className='px-6 py-4'><div className='flex gap-2'>{user.status === 'active' ? <button onClick={() => handleSuspend(user.id)} className='text-red-600 hover:text-red-800'><Ban size={18} /></button> : <button onClick={() => handleReactivate(user.id)} className='text-green-600 hover:text-green-800'><RotateCcw size={18} /></button>}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
