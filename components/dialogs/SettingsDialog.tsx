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
            data-oid="5bcj9gv"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="9tko8x:">
                <div className="flex justify-between items-center mb-4" data-oid="-0sc2yo">
                    <h2 className="text-xl font-semibold" data-oid="qutghb4">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="-9nktrd"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid=":bzzno."
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid=".dgp.c:"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="vu:grp.">
                    {/* Theme Setting */}
                    <div data-oid="nga5qul">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="6a8qb9e"
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
                            data-oid="me:ymqp"
                        >
                            <option value="light" data-oid="vta4hwh">
                                Light
                            </option>
                            <option value="dark" data-oid="uom.-g-">
                                Dark
                            </option>
                            <option value="system" data-oid="si_djcv">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="9j268m:">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="gctpwao"
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
                            data-oid="rj7-3wm"
                        >
                            <option value="en" data-oid="pcol75t">
                                English
                            </option>
                            <option value="es" data-oid="zx:ezus">
                                Spanish
                            </option>
                            <option value="fr" data-oid="hv3qa4e">
                                French
                            </option>
                            <option value="de" data-oid="0qxjr2w">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="snarqsq">
                        <label className="text-sm font-medium text-gray-700" data-oid="66bwypj">
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
                            data-oid="-r-oqn4"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="_r6htm:">
                        <label className="text-sm font-medium text-gray-700" data-oid="tqn-6tg">
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
                            data-oid="1w9gvdy"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="uq5t:p4">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="lc-bhmd"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="i8ga2hq"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
