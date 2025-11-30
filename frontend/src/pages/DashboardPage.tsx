import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/authStore";
import { useCampaignStore } from "../store/campaignStore";
import { authAPI, campaignAPI, messageAPI } from "../api/client";

interface DashboardStats {
  sentToday: number;
  deliveryRate: number;
  plan: string;
}

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "sending" | "sent";
  contactCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { campaigns, setCampaigns } = useCampaignStore();

  const [stats, setStats] = useState<DashboardStats>({
    sentToday: 0,
    deliveryRate: 94.5,
    plan: "Pro",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [campaignRes] = await Promise.all([
        campaignAPI.list(),
      ]);

      setCampaigns(campaignRes.data);
      setStats({
        sentToday: campaignRes.data.reduce(
          (sum: number, c: Campaign) =>
            c.status === "sent" ? sum + c.contactCount : sum,
          0
        ),
        deliveryRate: 94.5,
        plan: "Pro",
      });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("dashboard.welcome")}, {user?.name}
          </h1>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 font-semibold"
          >
            {t("nav.logout")}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              {t("dashboard.sentToday")}
            </div>
            <div className="text-3xl font-bold text-green-600">
              {stats.sentToday.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs mt-2">messages</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              {t("dashboard.deliveryRate")}
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.deliveryRate}%
            </div>
            <div className="text-gray-500 text-xs mt-2">success rate</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm font-medium mb-2">
              {t("dashboard.yourPlan")}
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.plan}
            </div>
            <div className="text-gray-500 text-xs mt-2">subscription</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate("/campaign/new")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
             {t("dashboard.newCampaign")}
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
             {t("dashboard.uploadContacts")}
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
             {t("dashboard.viewAnalytics")}
          </button>
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">
              {t("dashboard.recentCampaigns")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map((campaign: Campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "sending"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.contactCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {campaigns.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No campaigns yet. Create one to get started!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
