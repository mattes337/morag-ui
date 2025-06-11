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
            data-oid="f0-7wbm"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="frd85kr">
                <div className="flex justify-between items-center mb-4" data-oid="5eu9e95">
                    <h2 className="text-xl font-semibold" data-oid="_bmsjlh">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="8jzlpds"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="319_bxr"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="ip07m63"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="zp9kk.8">
                    {/* Theme Setting */}
                    <div data-oid="o-e--58">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="-8tfsy1"
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
                            data-oid="f9l6_gv"
                        >
                            <option value="light" data-oid="kwgxcl5">
                                Light
                            </option>
                            <option value="dark" data-oid="7yg40k2">
                                Dark
                            </option>
                            <option value="system" data-oid="sdopbj7">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="p6145wi">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="o9rjzwi"
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
                            data-oid="mon2.0e"
                        >
                            <option value="en" data-oid="k3-5mc.">
                                English
                            </option>
                            <option value="es" data-oid="nm-k4iu">
                                Spanish
                            </option>
                            <option value="fr" data-oid="j-jbsv2">
                                French
                            </option>
                            <option value="de" data-oid=".gls83u">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="ydlwk9t">
                        <label className="text-sm font-medium text-gray-700" data-oid="secti7r">
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
                            data-oid="8o2dtkl"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="cc60ff9">
                        <label className="text-sm font-medium text-gray-700" data-oid="nrf6ml:">
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
                            data-oid="s2-4ar2"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="w61cwq_">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="j4hb.zr"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="bncni1_"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
