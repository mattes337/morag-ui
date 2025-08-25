'use client';

import { useApp } from '../../contexts/AppContext';
import { UserSettings } from '../../types';
import { useState } from 'react';

export default function SettingsPage() {
    const { userSettings, setUserSettings } = useApp();
    const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        setUserSettings(localSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleReset = () => {
        setLocalSettings(userSettings);
    };

    return (
        <div className="max-w-4xl mx-auto" data-oid="-2nltf1">
            <div className="bg-white shadow rounded-lg" data-oid="4yv0oh6">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="mn1xoyv">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="4_lilhm">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="9klrxi-">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="_dv5ekm">
                    {/* Theme Setting */}
                    <div data-oid="x4wva.n">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="lcv1glt"
                        >
                            Theme
                        </label>
                        <select
                            value={localSettings.theme}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    theme: e.target.value as 'LIGHT' | 'DARK' | 'SYSTEM',
                                })
                            }
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="faf5:kf"
                        >
                            <option value="LIGHT" data-oid="0ld:t82">
                                Light
                            </option>
                            <option value="DARK" data-oid="bo7ry80">
                                Dark
                            </option>
                            <option value="SYSTEM" data-oid=".026lan">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="sulzqre">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="xmtrx_0">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="x71km2z"
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
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="dj4:i:l"
                        >
                            <option value="en" data-oid="7b_qj1j">
                                English
                            </option>
                            <option value="es" data-oid="w4-kd_e">
                                Spanish
                            </option>
                            <option value="fr" data-oid="ypgb.0y">
                                French
                            </option>
                            <option value="de" data-oid="tlsqcaw">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="spvs8q0">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="v4aclea">
                        <div className="flex items-center h-5" data-oid="jqfft-7">
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
                                data-oid="hfx_b4x"
                            />
                        </div>
                        <div className="ml-3" data-oid=".a.r4x.">
                            <label className="text-sm font-medium text-gray-700" data-oid="0x5_ce5">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="dplo67o">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="0n61u3x">
                        <div className="flex items-center h-5" data-oid="rps54p:">
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
                                data-oid="bh9f:tb"
                            />
                        </div>
                        <div className="ml-3" data-oid="_btcvbx">
                            <label className="text-sm font-medium text-gray-700" data-oid="quq6:ms">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="nxz_3nh">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="s.ugu84">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="udk4ldy"
                        >
                            Default Database
                        </label>
                        <select
                            value={localSettings.defaultDatabase || ''}
                            onChange={(e) =>
                                setLocalSettings({
                                    ...localSettings,
                                    defaultDatabase: e.target.value || undefined,
                                })
                            }
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="rh7w_0e"
                        >
                            <option value="" data-oid="6cqsh:z">
                                No default
                            </option>
                            <option value="research" data-oid="xtr5okf">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="jc3346r">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="pe-gj6n">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="ocik7q:"
                >
                    <div data-oid="6-1-fm2">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="xw:ijts">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="ll4x5va">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="rudl-jn"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="czih4r9"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
