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
        <div className="max-w-4xl mx-auto" data-oid="bf--nr-">
            <div className="bg-white shadow rounded-lg" data-oid="7bpj7qn">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="h9_osf7">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="nhlrh2c">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="h-k-m5y">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="nt9l._4">
                    {/* Theme Setting */}
                    <div data-oid="ui8o6h2">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="8-e1h7h"
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
                            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-oid="vrrt7gz"
                        >
                            <option value="light" data-oid="a5.d383">
                                Light
                            </option>
                            <option value="dark" data-oid="6s1q9kt">
                                Dark
                            </option>
                            <option value="system" data-oid="jfkrfmu">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="qjxnq_u">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="yscjta-">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="a4cpuvf"
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
                            data-oid="q9fcjto"
                        >
                            <option value="en" data-oid="7tgx-mv">
                                English
                            </option>
                            <option value="es" data-oid=":2277cl">
                                Spanish
                            </option>
                            <option value="fr" data-oid="jsuvh02">
                                French
                            </option>
                            <option value="de" data-oid="jhypd8.">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="g1hvj58">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="hf5g_:n">
                        <div className="flex items-center h-5" data-oid="ex9d8r2">
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
                                data-oid="y67ti1p"
                            />
                        </div>
                        <div className="ml-3" data-oid="x5enn43">
                            <label className="text-sm font-medium text-gray-700" data-oid="oximnz2">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="w6:.m0l">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="4s2dr.j">
                        <div className="flex items-center h-5" data-oid="9sn2gji">
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
                                data-oid="d9vsyrl"
                            />
                        </div>
                        <div className="ml-3" data-oid="35qx3p7">
                            <label className="text-sm font-medium text-gray-700" data-oid="dyjiuyc">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="9ut3t9z">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="0p5ks4v">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="dbm5:8z"
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
                            data-oid="1l4spq8"
                        >
                            <option value="" data-oid="-pi768m">
                                No default
                            </option>
                            <option value="research" data-oid="oysh2_o">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="6bvfnmj">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="lyqfyab">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid=":wn6.ws"
                >
                    <div data-oid="4uxlmji">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="jr3nx9z">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="pefb.ok">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="e6ckwpu"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="jeit46."
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
