import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { campaignAPI, messageAPI } from "../api/client";

export default function CampaignBuilderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    template: "blank",
    delay: "balanced",
    schedule: "now",
    scheduledTime: "",
  });

  const [contacts, setContacts] = useState<Array<{phone: string; name?: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split("\n");
    const parsedContacts = lines
      .map((line) => {
        const [phone, ...nameParts] = line.trim().split(",");
        return {
          phone: phone.trim(),
          name: nameParts.length > 0 ? nameParts.join(",").trim() : undefined,
        };
      })
      .filter((contact) => contact.phone && /^\+?[1-9]\d{1,14}$/.test(contact.phone));

    setContacts(parsedContacts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create campaign
      const campaignRes = await campaignAPI.create({
        name: formData.name,
        messageBody: formData.message,
      });

      const campaignId = campaignRes.data.data?.id || campaignRes.data.id;

      // Add contacts if any
      if (contacts.length > 0) {
        await campaignAPI.addContacts(campaignId, contacts);
      }

      // Schedule or send immediately
      if (formData.schedule === "now") {
        await campaignAPI.send(campaignId);
      } else {
        const scheduledTime = new Date(formData.scheduledTime).toISOString();
        await messageAPI.schedule(campaignId, scheduledTime);
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const charCount = formData.message.length;
  const maxChars = 1000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {t("campaign.builder")}
          </h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-800"
          >
            
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Builder Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Campaign Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("campaign.name")}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("campaign.message")}
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                maxLength={maxChars}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter your message here..."
              />
              <div className="text-sm text-gray-500 mt-1">
                {charCount} / {maxChars} {t("campaign.charCount")}
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("campaign.template")}
              </label>
              <select
                name="template"
                value={formData.template}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="blank">Blank Template</option>
                <option value="promotion">Promotion</option>
                <option value="reminder">Reminder</option>
                <option value="notification">Notification</option>
              </select>
            </div>

            {/* Contacts */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("campaign.contacts")}
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 transition"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2"></div>
                  <div className="text-sm font-semibold text-gray-700">
                    Click to upload or drag and drop
                  </div>
                  <div className="text-xs text-gray-500">CSV file with phone numbers</div>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              {contacts.length > 0 && (
                <div className="mt-2 text-sm text-green-600 font-semibold">
                   {contacts.length} contacts loaded
                </div>
              )}
            </div>

            {/* Delay Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("campaign.delay")}
              </label>
              <div className="space-y-2">
                {[
                  { value: "fast", label: t("campaign.fast") },
                  { value: "balanced", label: t("campaign.balanced") },
                  { value: "safe", label: t("campaign.safe") },
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="delay"
                      value={option.value}
                      checked={formData.delay === option.value}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t("campaign.schedule")}
              </label>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    value="now"
                    checked={formData.schedule === "now"}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{t("campaign.sendNow")}</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="schedule"
                    value="scheduled"
                    checked={formData.schedule === "scheduled"}
                    onChange={handleChange}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">{t("campaign.scheduleFor")}</span>
                </label>
                {formData.schedule === "scheduled" && (
                  <input
                    type="datetime-local"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ml-6"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
              >
                {t("campaign.saveDraft")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? "Sending..." : t("campaign.send")}
              </button>
            </div>
          </form>

          {/* Right Panel - Preview */}
          <div className="sticky top-8 h-fit">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {t("campaign.preview")}
              </h3>
              <div className="bg-gray-100 rounded-lg p-6 min-h-64">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    {formData.name || "Campaign Name"}
                  </div>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {formData.message || "Your message will appear here..."}
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Message preview ends here
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="font-semibold text-gray-700 mb-2">Summary:</div>
                <ul className="space-y-1">
                  <li> {contacts.length || 0} contacts</li>
                  <li> Delay: {formData.delay}</li>
                  <li> Schedule: {formData.schedule === "now" ? "Immediately" : "Scheduled"}</li>
                  <li> Message: {charCount} characters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
