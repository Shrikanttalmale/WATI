import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { messageAPI } from "../api/client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

export default function AnalyticsDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [stats, setStats] = useState<QueueStats>({
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await messageAPI.getQueueStats();
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  const deliveryData = [
    { name: "Mon", delivered: 400, failed: 24 },
    { name: "Tue", delivered: 300, failed: 13 },
    { name: "Wed", delivered: 200, failed: 9 },
    { name: "Thu", delivered: 279, failed: 39 },
    { name: "Fri", delivered: 189, failed: 21 },
    { name: "Sat", delivered: 239, failed: 37 },
    { name: "Sun", delivered: 349, failed: 43 },
  ];

  const methodData = [
    { name: "Baileys", value: 85, color: "#10b981" },
    { name: "Web JS", value: 15, color: "#3b82f6" },
  ];

  const total = stats.completed + stats.failed;
  const successRate = total > 0 ? ((stats.completed / total) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
             Back
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Completed</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-gray-500 text-xs mt-2">messages sent</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Failed</div>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-gray-500 text-xs mt-2">messages</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">In Queue</div>
            <div className="text-3xl font-bold text-blue-600">{stats.waiting + stats.active}</div>
            <div className="text-gray-500 text-xs mt-2">pending</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">Success Rate</div>
            <div className="text-3xl font-bold text-purple-600">{successRate}%</div>
            <div className="text-gray-500 text-xs mt-2">delivery rate</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Delivery Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Trend (7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliveryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Delivery Method Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Delivery Method</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Baileys (Primary): 85%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Web JS (Fallback): 15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Queue Status (Real-time)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Waiting</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Active</div>
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Failed</div>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </main>
    </div>
  );
}
