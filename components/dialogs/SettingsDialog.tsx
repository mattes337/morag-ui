'use client';

import { useApp } from '../../contexts/AppContext';
import { UserSettings } from '../../types';
import { useState } from 'react';

export function SettingsDialog() {
    const { showSettingsDialog, setShowSettingsDialog, userSettings, setUserSettings } = useApp();

    const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);

    if (!showSettingsDialog) return null;

    const handleSave = () => {
        setUserSettings(localSettings);
        setShowSettingsDialog(false);
    };

    const handleCancel = () => {
        setLocalSettings(userSettings);
        setShowSettingsDialog(false);
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            data-oid="n0ztide"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="9fk4mj4">
                <div className="flex justify-between items-center mb-4" data-oid="h.k66kc">
                    <h2 className="text-xl font-semibold" data-oid="w550-eq">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="v:b5kli"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="h6h45l-"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="gdw5l4w"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="aiqgmyb">
                    {/* Theme Setting */}
                    <div data-oid="hj7_.4q">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid=":oezf20"
                        >
                            Theme
                        </label>
                        <select
                            value={localSettings.theme}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    theme: e.target.value as 'light' | 'dark' | 'system',
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="vion.fu"
                        >
                            <option value="light" data-oid="98-_ep5">
                                Light
                            </option>
                            <option value="dark" data-oid="_c112rs">
                                Dark
                            </option>
                            <option value="system" data-oid="9ep5o0t">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="ds3j.97">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="7.0148d"
                        >
                            Language
                        </label>
                        <select
                            value={localSettings.language}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    language: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="mz_57sh"
                        >
                            <option value="en" data-oid="tx3dt7z">
                                English
                            </option>
                            <option value="es" data-oid="_vzbam6">
                                Spanish
                            </option>
                            <option value="fr" data-oid="mzo9fb:">
                                French
                            </option>
                            <option value="de" data-oid="6i3t.yq">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="fsfgxz.">
                        <label className="text-sm font-medium text-gray-700" data-oid="w6mkbet">
                            Enable Notifications
                        </label>
                        <input
                            type="checkbox"
                            checked={localSettings.notifications}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    notifications: e.target.checked,
                                })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            data-oid="z2gync."
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="ddlzk13">
                        <label className="text-sm font-medium text-gray-700" data-oid="rw5q7_f">
                            Auto Save
                        </label>
                        <input
                            type="checkbox"
                            checked={localSettings.autoSave}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    autoSave: e.target.checked,
                                })
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            data-oid="cl4dzhy"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="zpk11ti">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="_.e25zx"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="-g4-5gf"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
