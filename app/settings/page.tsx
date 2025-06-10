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
        <div className="max-w-4xl mx-auto" data-oid="xo-8q8a">
            <div className="bg-white shadow rounded-lg" data-oid="e26sn43">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="cnchdbh">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="5bx4iwz">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="d4z5nau">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid="lq83_aw">
                    {/* Theme Setting */}
                    <div data-oid="xwk8323">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="aa78k0h"
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
                            data-oid="0yck5pv"
                        >
                            <option value="light" data-oid="td3z4qe">
                                Light
                            </option>
                            <option value="dark" data-oid="07lrgji">
                                Dark
                            </option>
                            <option value="system" data-oid="t:w6tnc">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="03np1rl">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="xkv1cep">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="c.ugu9s"
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
                            data-oid="q7k2t4l"
                        >
                            <option value="en" data-oid="ger-0bk">
                                English
                            </option>
                            <option value="es" data-oid="4fyw0tr">
                                Spanish
                            </option>
                            <option value="fr" data-oid="f8gkhq9">
                                French
                            </option>
                            <option value="de" data-oid="52o26eq">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="ahy_vx0">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="xpyvkcb">
                        <div className="flex items-center h-5" data-oid="5ssvjb-">
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
                                data-oid="mtuixge"
                            />
                        </div>
                        <div className="ml-3" data-oid=".iqy_fy">
                            <label className="text-sm font-medium text-gray-700" data-oid="s8zhoej">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="if15p5h">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="9ontivm">
                        <div className="flex items-center h-5" data-oid="wvjtqp5">
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
                                data-oid="9u.::14"
                            />
                        </div>
                        <div className="ml-3" data-oid="zna3.in">
                            <label className="text-sm font-medium text-gray-700" data-oid="ny3im-a">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="qq_1ktx">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="a..bzqn">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="fbrn3va"
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
                            data-oid="103m7.d"
                        >
                            <option value="" data-oid=".xa8bc3">
                                No default
                            </option>
                            <option value="research" data-oid="01nahg-">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="46dfcui">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="afc9u4h">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="w:54a18"
                >
                    <div data-oid="x958vi3">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="kezgv7a">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="mvdf91w">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid="3:-e5o4"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="3vzpmv."
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
