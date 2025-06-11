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
        <div className="max-w-4xl mx-auto" data-oid="_29vaca">
            <div className="bg-white shadow rounded-lg" data-oid="be0qx79">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="6g2urn0">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="fmv62ix">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="7.99yvw">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="fymu-08">
                    {/* Theme Setting */}
                    <div data-oid="_qm:5fe">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="bhsjnar"
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
                            data-oid="kxc36tp"
                        >
                            <option value="light" data-oid="8-7w58b">
                                Light
                            </option>
                            <option value="dark" data-oid="hl3izuf">
                                Dark
                            </option>
                            <option value="system" data-oid="5su:-w9">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="t-z6_a_">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="4tq5n4f">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="vm:4i5w"
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
                            data-oid="v:ca.n8"
                        >
                            <option value="en" data-oid="ow6om.l">
                                English
                            </option>
                            <option value="es" data-oid="tiuou4p">
                                Spanish
                            </option>
                            <option value="fr" data-oid="z59.l.3">
                                French
                            </option>
                            <option value="de" data-oid="c:l6t1o">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="k31wxy8">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="8tsmruy">
                        <div className="flex items-center h-5" data-oid="tbhignm">
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
                                data-oid="lpafw6b"
                            />
                        </div>
                        <div className="ml-3" data-oid="w:ch5mf">
                            <label className="text-sm font-medium text-gray-700" data-oid="c_c6cqh">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="lncn8os">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="9cxxq07">
                        <div className="flex items-center h-5" data-oid="ftq38j6">
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
                                data-oid="qzlz5wz"
                            />
                        </div>
                        <div className="ml-3" data-oid="lf1bq13">
                            <label className="text-sm font-medium text-gray-700" data-oid="_taug2s">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="m5h0dzt">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="4:snpvu">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="ioa9.xk"
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
                            data-oid="-.ako12"
                        >
                            <option value="" data-oid="e.im37g">
                                No default
                            </option>
                            <option value="research" data-oid="k0ruis8">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="i1-p2.r">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="lv5i60m">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="hhwi3s7"
                >
                    <div data-oid="v-0n9c.">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="bp9e9ts">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="c0ifqrt">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="3z8gve0"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="6t4pzs8"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
