"use client";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Settings, Shield, Bell, Key, Save } from "lucide-react";

export default function SettingsPage() {
    return (
        <PagePlaceholder
            title="System & Environment Configuration"
            description="Manage outbound rate limits, workspace members, notification webhooks, and security settings."
            icon={Settings}
            tag="System Config"
        >
            <div className="grid grid-cols-1 gap-5 max-w-4xl">
                <Card className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Outbound Safety Limits</h3>
                    <p className="text-xs text-[#6e84a3]">
                        Throttling parameters to prevent spam flags across Google Workspace, Outlook, and LinkedIn.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase text-[#6e84a3]">
                                Max Emails / Day / Inbox (Reply.io)
                            </label>
                            <input
                                defaultValue="45"
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase text-[#6e84a3]">
                                Max LinkedIn Connects / Day (LinkedHelper)
                            </label>
                            <input
                                defaultValue="25"
                                className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[#1f2d3d]">Notification Alerts</h3>
                    <p className="text-xs text-[#6e84a3]">
                        Where to send high-priority alerts when reply rates surge or a connector drops.
                    </p>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-[11px] font-bold uppercase text-[#6e84a3]">
                            Slack / Telegram Webhook URL
                        </label>
                        <input
                            defaultValue="https://hooks.slack.com/services/T000/B000/XXXXX"
                            className="w-full rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-xs text-[#1f2d3d] outline-none focus:border-[#354f52] focus:bg-white"
                        />
                    </div>
                </Card>

                <div className="flex justify-end">
                    <button className="flex items-center gap-1.5 rounded-lg bg-[#354f52] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#2f3e46] transition-colors shadow-sm">
                        <Save className="h-4 w-4" /> Save Configuration
                    </button>
                </div>
            </div>
        </PagePlaceholder>
    );
}
