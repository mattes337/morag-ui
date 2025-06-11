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
            data-oid="me6b00v"
        >
            <div className="bg-white rounded-lg p-6 w-full max-w-md" data-oid="dt2u6y5">
                <div className="flex justify-between items-center mb-4" data-oid="uvv7wg:">
                    <h2 className="text-xl font-semibold" data-oid="j9z_i2g">
                        Settings
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-gray-600"
                        data-oid="sj:jyhc"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="z7q:zs6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                data-oid="jvu97i7"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4" data-oid="hxj74b7">
                    {/* Theme Setting */}
                    <div data-oid="cn6sdqx">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="9bqj682"
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
                            data-oid="4l_sn:w"
                        >
                            <option value="light" data-oid="58l17rk">
                                Light
                            </option>
                            <option value="dark" data-oid="6yd2mac">
                                Dark
                            </option>
                            <option value="system" data-oid="sq_9sjd">
                                System
                            </option>
                        </select>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="oudsps:">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="t7c1p7e"
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
                            data-oid="qrcrzpu"
                        >
                            <option value="en" data-oid="x5w_vgl">
                                English
                            </option>
                            <option value="es" data-oid="gqv-9-i">
                                Spanish
                            </option>
                            <option value="fr" data-oid="a5fu49v">
                                French
                            </option>
                            <option value="de" data-oid="-s9snql">
                                German
                            </option>
                        </select>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-center justify-between" data-oid="0bkohc2">
                        <label className="text-sm font-medium text-gray-700" data-oid="0vizsi4">
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
                            data-oid="4oe8xzf"
                        />
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-center justify-between" data-oid="rg0es7-">
                        <label className="text-sm font-medium text-gray-700" data-oid="5-4y70u">
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
                            data-oid="uj8r082"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6" data-oid="5.wy5hs">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                        data-oid="48tf_ex"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                        data-oid="3vq30o5"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
