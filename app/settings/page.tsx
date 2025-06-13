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
        <div className="max-w-4xl mx-auto" data-oid="mzw_cmc">
            <div className="bg-white shadow rounded-lg" data-oid="otr1urb">
                <div className="px-6 py-4 border-b border-gray-200" data-oid="mbr6ybz">
                    <h1 className="text-2xl font-semibold text-gray-900" data-oid="h5-k_kf">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1" data-oid="o-9l586">
                        Manage your application preferences and configuration
                    </p>
                </div>

                <div className="p-6 space-y-6" data-oid=".gyz75t">
                    {/* Theme Setting */}
                    <div data-oid="1gc_6yw">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="_hdgojm"
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
                            data-oid="lp-0x1g"
                        >
                            <option value="light" data-oid="gneaf5_">
                                Light
                            </option>
                            <option value="dark" data-oid="43g_b.u">
                                Dark
                            </option>
                            <option value="system" data-oid="9oseui.">
                                System
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="ospcfj7">
                            Choose your preferred color scheme
                        </p>
                    </div>

                    {/* Language Setting */}
                    <div data-oid="b6r5m:-">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="9m6kcbd"
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
                            data-oid="3olj73-"
                        >
                            <option value="en" data-oid="p4ad45p">
                                English
                            </option>
                            <option value="es" data-oid="k55rr6r">
                                Spanish
                            </option>
                            <option value="fr" data-oid="_b:85dl">
                                French
                            </option>
                            <option value="de" data-oid=".yt3ou.">
                                German
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid=".0cz5gx">
                            Select your preferred language
                        </p>
                    </div>

                    {/* Notifications Setting */}
                    <div className="flex items-start" data-oid="qjv5-n0">
                        <div className="flex items-center h-5" data-oid="0caccz3">
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
                                data-oid="co2a8q8"
                            />
                        </div>
                        <div className="ml-3" data-oid="2j-146z">
                            <label className="text-sm font-medium text-gray-700" data-oid="ag:hyxf">
                                Enable Notifications
                            </label>
                            <p className="text-sm text-gray-500" data-oid="1i5a48s">
                                Receive notifications about system events and updates
                            </p>
                        </div>
                    </div>

                    {/* Auto Save Setting */}
                    <div className="flex items-start" data-oid="jmp53h3">
                        <div className="flex items-center h-5" data-oid="_lkwsbo">
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
                                data-oid="gg6y48y"
                            />
                        </div>
                        <div className="ml-3" data-oid="i...o_3">
                            <label className="text-sm font-medium text-gray-700" data-oid="zx39z4o">
                                Auto Save
                            </label>
                            <p className="text-sm text-gray-500" data-oid="urtkr7y">
                                Automatically save changes as you work
                            </p>
                        </div>
                    </div>

                    {/* Default Database Setting */}
                    <div data-oid="jxhi.yg">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-2"
                            data-oid="_h53xw_"
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
                            data-oid="z.l9cdo"
                        >
                            <option value="" data-oid="v6gmmo1">
                                No default
                            </option>
                            <option value="research" data-oid="j3myzzj">
                                Research Papers
                            </option>
                            <option value="knowledge" data-oid="_9m4g_q">
                                Company Knowledge Base
                            </option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1" data-oid="a9xv05m">
                            Choose a default database for new sessions
                        </p>
                    </div>
                </div>

                <div
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
                    data-oid="clnekpb"
                >
                    <div data-oid="yyerjr-">
                        {isSaved && (
                            <span className="text-green-600 text-sm font-medium" data-oid="8ytmbwr">
                                Settings saved successfully!
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-3" data-oid="mu_pjbf">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
                            data-oid=":hao6dj"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            data-oid="6qzzsdf"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
