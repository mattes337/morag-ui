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
        <div className="max-w-4xl mx-auto" data-oid="5l4amkh">
            <div className="bg-white shadow rounded-lg" data-oid="pew63g7">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="k7u1rz1">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="bg2obfi">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="gmyu7-8">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="z24m_lr">
                    {/* Theme Setting */}
                    <div data-oid="7akg0gt">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="s.ij686"
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
                            data-oid="sn9yyk:"
                        >
                            <option value="light" data-oid="59oeu_c">
                                Light
                            </option>
                            <option value="dark" data-oid="4cpqagx">
                                Dark
                            </option>
                            <option value="system" data-oid="lzfyf.9">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="_oj.8f-">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="8tvnwjz">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="bk4l565"
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
                            data-oid="rzt0r9g"
                        >
                            <option value="en" data-oid="i9od01q">
                                English
                            </option>
                            <option value="es" data-oid="::l8_3n">
                                Spanish
                            </option>
                            <option value="fr" data-oid="2gzicpf">
                                French
                            </option>
                            <option value="de" data-oid="x9xvugo">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="e9c9v3a">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="3jxeeoo">
                        <div className="flex items-center h-5" data-oid=".n3p-lw">
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
                                data-oid="4eejzi:"
                            />
                        </div>
                        <div className="ml-3" data-oid="liqannk">
                            <label className="text-sm font-medium text-gray-700" data-oid="eedgg71">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="zxindop">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="l91fm7d">
                        <div className="flex items-center h-5" data-oid="tc:s4iu">
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
                                data-oid="fcm:pny"
                            />
                        </div>
                        <div className="ml-3" data-oid="ivgobpt">
                            <label className="text-sm font-medium text-gray-700" data-oid="gzzwns5">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="tnod-wx">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="26d252a">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="2d0ok.e"
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
                            data-oid="yfo46c5"
                        >
                            <option value="" data-oid="pqpwml:">
                                No default
                            </option>
                            <option value="research" data-oid="mrxk:ot">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="wb2n8xq">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="d9no02r">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="3x6ux1q"
                >
                    <div data-oid="bq9o5i:">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="9ys9:xf">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="iz8t7w:">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="xzj:i3l"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid=":61_h.:"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
