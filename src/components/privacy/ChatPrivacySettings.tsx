import { useState, useEffect, useCallback } from 'react';
import {
  FaDownload,
  FaTrash,
  FaShieldAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { cn } from '@/src/lib/utils';
import useAuth from '@/src/lib/hooks/useAuth';
import useAlert from '@/src/lib/hooks/useAlert';
import {
  ChatPrivacyService,
  type ChatPrivacySettings,
  type ChatDataSummary,
} from '@/src/lib/privacy/chat-privacy';

interface ChatPrivacySettingsProps {
  className?: string;
}

export default function ChatPrivacySettings({
  className,
}: ChatPrivacySettingsProps) {
  const [settings, setSettings] = useState<ChatPrivacySettings | null>(null);
  const [dataSummary, setDataSummary] = useState<ChatDataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();

  const loadData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [privacySettings, summary] = await Promise.all([
        ChatPrivacyService.getPrivacySettings(user.id),
        ChatPrivacyService.getChatDataSummary(user.id),
      ]);

      setSettings(privacySettings);
      setDataSummary(summary);
    } catch (error) {
      console.error('Failed to load privacy data:', error);
      showError('Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    if (!user || !settings) return;

    setSaving(true);
    try {
      await ChatPrivacyService.updatePrivacySettings(user.id, settings);
      showSuccess('Privacy settings updated successfully');
      // Reload data to reflect any cleanup that may have occurred
      await loadData();
    } catch (error) {
      console.error('Failed to save settings:', error);
      showError('Failed to update privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const exportData = await ChatPrivacyService.exportUserChatData(user.id);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Chat data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      showError('Failed to export chat data');
    }
  };

  const handleDeleteAllData = async () => {
    if (!user) return;

    try {
      await ChatPrivacyService.deleteAllUserChatData(user.id);
      showSuccess('All chat data deleted successfully');
      setShowDeleteConfirm(false);
      await loadData(); // Refresh the summary
    } catch (error) {
      console.error('Failed to delete data:', error);
      showError('Failed to delete chat data');
    }
  };

  const updateSetting = <K extends keyof ChatPrivacySettings>(
    key: K,
    value: ChatPrivacySettings[K]
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings || !dataSummary) {
    return (
      <div className={cn('bg-white rounded-lg shadow p-6', className)}>
        <div className="text-center text-gray-600">
          Failed to load privacy settings. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className="flex items-center gap-2 mb-6">
        <FaShieldAlt className="text-blue-600" />
        <h2 className="text-xl font-semibold">Chat Privacy Settings</h2>
      </div>

      {/* Data Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-3">Your Chat Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Conversations</div>
            <div className="font-medium">{dataSummary.totalConversations}</div>
          </div>
          <div>
            <div className="text-gray-600">Messages</div>
            <div className="font-medium">{dataSummary.totalMessages}</div>
          </div>
          <div>
            <div className="text-gray-600">Data Size</div>
            <div className="font-medium">{dataSummary.dataSize}</div>
          </div>
          <div>
            <div className="text-gray-600">Oldest Message</div>
            <div className="font-medium">
              {dataSummary.oldestMessageDate
                ? dataSummary.oldestMessageDate.toLocaleDateString()
                : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        {/* Data Retention */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Data Retention Period
          </label>
          <select
            value={settings.retentionPeriodDays}
            onChange={(e) =>
              updateSetting('retentionPeriodDays', Number(e.target.value))
            }
            className="border rounded px-3 py-2 w-full max-w-xs"
          >
            {ChatPrivacyService.RETENTION_OPTIONS.map((option) => (
              <option key={option.days} value={option.days}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-1">
            How long to keep your chat history before automatic deletion.
          </p>
        </div>

        {/* Automatic Cleanup */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.automaticCleanup}
              onChange={(e) =>
                updateSetting('automaticCleanup', e.target.checked)
              }
              className="rounded"
            />
            <span className="text-sm font-medium">
              Enable automatic cleanup
            </span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Automatically delete old chat data based on your retention period.
          </p>
        </div>

        {/* Analytics Opt-in */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.analyticsOptIn}
              onChange={(e) =>
                updateSetting('analyticsOptIn', e.target.checked)
              }
              className="rounded"
            />
            <span className="text-sm font-medium">
              Include my data in analytics
            </span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Help improve Rob by allowing anonymized analysis of chat patterns.
            Your personal information is never included.
          </p>
        </div>

        {/* Export Enabled */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.exportEnabled}
              onChange={(e) => updateSetting('exportEnabled', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Allow data export</span>
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Enable the ability to export your chat data as a JSON file.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>

        {settings.exportEnabled && dataSummary.totalMessages > 0 && (
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <FaDownload className="w-4 h-4" />
            Export Data
          </button>
        )}

        {dataSummary.totalMessages > 0 && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
          >
            <FaTrash className="w-4 h-4" />
            Delete All Data
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <FaExclamationTriangle className="text-red-500 text-xl" />
              <h3 className="text-lg font-semibold">Delete All Chat Data</h3>
            </div>

            <p className="text-gray-700 mb-4">
              Are you sure you want to permanently delete all your chat history?
              This action cannot be undone.
            </p>

            <div className="text-sm text-gray-600 mb-6">
              This will delete:
              <ul className="list-disc list-inside mt-2">
                <li>{dataSummary.totalConversations} conversations</li>
                <li>{dataSummary.totalMessages} messages</li>
                <li>All associated metadata</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
