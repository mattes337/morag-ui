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
            data-oid="fhcw.1e"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="0nncxun">
                <div className="flex justify-between items-center mb-4" data-oid="657eiwu">
                    <h2 className="text-xl font-semibold" data-oid="zp0gkae">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="wav9to8"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="yj-t1p2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="0vds12c"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="o.65y_e">
                    {/* Theme Setting */}
                    <div data-oid="-q119jd">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="7bf4iuv"
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
                            data-oid="ts3ktfc"
                        >
                            <option value="light" data-oid="endus87">
                                Light
                            </option>
                            <option value="dark" data-oid="klrr0bk">
                                Dark
                            </option>
                            <option value="system" data-oid="f2k1wwr">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="33pjz29">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="s1nmhcp"
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
                            data-oid="iyi3t4w"
                        >
                            <option value="en" data-oid="4jm8qvr">
                                English
                            </option>
                            <option value="es" data-oid="b9hvd_f">
                                Spanish
                            </option>
                            <option value="fr" data-oid="dj_iqny">
                                French
                            </option>
                            <option value="de" data-oid="aqpmsur">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="m5bc3-a">
                        <label className="text-sm font-medium text-gray-700" data-oid="3imefmn">
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
                            data-oid="9bwag6-"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="u0wq6ey">
                        <label className="text-sm font-medium text-gray-700" data-oid="9w4_is8">
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
                            data-oid="h_dqwju"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="fhzfdyx">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="oq9gdmm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="0ocgjho"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
