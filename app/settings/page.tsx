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
        <div className="max-w-4xl mx-auto" data-oid="jbb6x8z">
            <div className="bg-white shadow rounded-lg" data-oid="f0b8:bf">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="vt8wh9_">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="qc6xqp5">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="a4:fe4o">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="sud_pvi">
                    {/* Theme Setting */}
                    <div data-oid="nj_sbyu">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="dt40xts"
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
                            data-oid="n:wyzut"
                        >
                            <option value="light" data-oid="ywi7fu0">
                                Light
                            </option>
                            <option value="dark" data-oid="mfnbt.8">
                                Dark
                            </option>
                            <option value="system" data-oid="s_2s2dr">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="_ou1u97">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="y:_z12p">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="dwjnzxa"
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
                            data-oid="gklhp7_"
                        >
                            <option value="en" data-oid=":4e8yg_">
                                English
                            </option>
                            <option value="es" data-oid="ebb_vqs">
                                Spanish
                            </option>
                            <option value="fr" data-oid="zkzu392">
                                French
                            </option>
                            <option value="de" data-oid="evvzrxd">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="u3pe2b6">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="nq_p23v">
                        <div className="flex items-center h-5" data-oid="ctx63am">
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
                                data-oid="iyuw7_q"
                            />
                        </div>
                        <div className="ml-3" data-oid="ohzs430">
                            <label className="text-sm font-medium text-gray-700" data-oid="7kiglvv">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="yf6:b3-">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="rlm3:ox">
                        <div className="flex items-center h-5" data-oid="5yyps.6">
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
                                data-oid=".ozxd1q"
                            />
                        </div>
                        <div className="ml-3" data-oid="v.ikr:3">
                            <label className="text-sm font-medium text-gray-700" data-oid="obv3jvq">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="fmpc3j8">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="c6_2885">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="sida:0o"
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
                            data-oid="fx528jn"
                        >
                            <option value="" data-oid="n_.71:n">
                                No default
                            </option>
                            <option value="research" data-oid="5m9c78q">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="j:o95:f">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="odp8gp5">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="ymj:i-0"
                >
                    <div data-oid="77hyke5">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="gfs8v6:">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="ap8l9vi">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="gfbfiyx"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="no6tmjy"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
