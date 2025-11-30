import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Clock, Loader } from 'lucide-react';
import client from '../api/client';
import { useToastStore } from '../store/toastStore';

interface Plan {
  id: string;
  name: string;
  price: number;
  messagesPerMonth: number;
  contactsLimit: number;
}

interface Usage {
  usage: string;
  limit: number;
  used: number;
}

export default function BillingPage() {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, usageRes] = await Promise.all([
        client.get('/billing/plans'),
        client.get('/billing/usage'),
      ]);
      setPlans(plansRes.data.plans);
      setUsage(usageRes.data.usage);
    } catch (error) {
      addToast('Failed to load billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(true);
      await client.post('/billing/upgrade', { planId });
      addToast('Plan upgraded successfully', 'success');
      fetchData();
    } catch (error) {
      addToast('Failed to upgrade plan', 'error');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className='flex items-center justify-center h-screen'><Loader className='animate-spin' /></div>;

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold text-gray-900 mb-8'>Billing & Plans</h1>

        {usage && (
          <div className='bg-white p-6 rounded-lg shadow mb-8'>
            <h2 className='text-2xl font-bold mb-4'>Current Usage</h2>
            <div className='flex items-center gap-4'>
              <div className='flex-1'><div className='text-sm text-gray-600'>{usage.used} / {usage.limit} messages</div><div className='w-full bg-gray-200 rounded-full h-2 mt-2'><div className='bg-blue-600 h-2 rounded-full' style={{width: usage.usage + '%'}}></div></div></div>
              <div className='text-right'><div className='text-3xl font-bold text-blue-600'>{usage.usage}%</div></div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {plans.map((plan) => (
            <div key={plan.id} className='bg-white rounded-lg shadow hover:shadow-lg transition'>
              <div className='p-6 border-b'>
                <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
                <div className='text-3xl font-bold text-blue-600'>₹{plan.price}<span className='text-lg text-gray-600'>/month</span></div>
              </div>
              <div className='p-6'>
                <ul className='space-y-3 mb-6'>
                  <li className='flex items-center gap-2'><CheckCircle size={18} className='text-green-600' />{plan.messagesPerMonth.toLocaleString()} messages/month</li>
                  <li className='flex items-center gap-2'><CheckCircle size={18} className='text-green-600' />{plan.contactsLimit.toLocaleString()} contacts</li>
                </ul>
                <button onClick={() => handleUpgrade(plan.id)} disabled={upgrading} className='w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'>{upgrading ? 'Upgrading...' : 'Choose Plan'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
