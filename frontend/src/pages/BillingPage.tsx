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
      setPlans(plansRes.data.data || plansRes.data.plans || plansRes.data);
      setUsage(usageRes.data.data || usageRes.data.usage || usageRes.data);
    } catch (error) {
      addToast('Failed to load billing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(true);

      // Step 1: Create checkout order
      const checkoutRes = await client.post('/billing/checkout', { planId });
      const { orderId, amount, currency } = checkoutRes.data.data;

      // Step 2: Initialize Razorpay payment
      const options = {
        key: 'rzp_test_1DP5MMOk9HrQ63', // Test key for MVP
        amount,
        currency,
        name: 'WATI Broadcaster',
        description: `Plan upgrade for ${plans.find(p => p.id === planId)?.name}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            await client.post('/billing/verify', {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              planId,
            });
            addToast('Plan upgraded successfully!', 'success');
            fetchData();
          } catch (error) {
            addToast('Payment verification failed', 'error');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#2563eb',
        },
      };

      // Load Razorpay script if not already loaded
      if (!(window as any).Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };
        script.onerror = () => {
          addToast('Failed to load payment gateway', 'error');
        };
        document.body.appendChild(script);
      } else {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      addToast('Failed to initiate payment', 'error');
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
