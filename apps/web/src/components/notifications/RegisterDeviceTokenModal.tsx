import React, { useState } from "react";
import { toast } from "sonner";
import {
  Smartphone,
  Sparkles,
  Key,
  Clipboard,
  RefreshCw,
  CheckCircle2,
  Radio,
  Layers,
} from "lucide-react";
import { Modal, Button, Input, Checkbox } from "../ui";
import { notificationApi } from "../../features/notifications/notification.api";

function AndroidIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9997.9993-.9997c.5516 0 .9998.4486.9998.9997s-.4482.9997-.9998.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9997.9993-.9997c.5516 0 .9998.4486.9998.9997s-.4482.9997-.9998.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 0 0-.1522-.5676.416.416 0 0 0-.5676.1522l-2.0223 3.503C15.59 8.2396 13.8533 7.844 12 7.844c-1.8533 0-3.59.3956-5.1367 1.1058L4.841 5.4468a.416.416 0 0 0-.5676-.1522.416.416 0 0 0-.1522.5676l1.9973 3.4592C3.1256 10.988 1.1625 13.7844 1 17.0667h22c-.1625-3.2823-2.1256-6.0787-5.1185-7.7453" />
    </svg>
  );
}

function AppleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.34c.67-.82 1.12-1.96.99-3.1-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.87-.99 2.99 1.07.08 2.15-.51 2.82-1.33z" />
    </svg>
  );
}

export interface RegisterDeviceTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterDeviceTokenModal({
  isOpen,
  onClose,
  onSuccess,
}: RegisterDeviceTokenModalProps) {
  const [mode, setMode] = useState<"simulated" | "custom">("simulated");
  const [customToken, setCustomToken] = useState("");
  const [platform, setPlatform] = useState<"ANDROID" | "IOS" | "WEB">("ANDROID");
  const [deviceModel, setDeviceModel] = useState("Google Pixel 8 Pro");
  const [appVersion, setAppVersion] = useState("1.0.0");
  const [isTestToken, setIsTestToken] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const generateSimulatedToken = () => {
    return `fcm_sim_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setCustomToken(text.trim());
        setMode("custom");
        toast.info("FCM Token pasted from clipboard.");
      } else {
        toast.error("Clipboard is empty or does not contain text.");
      }
    } catch {
      toast.error("Unable to read clipboard. Please paste manually.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalToken =
      mode === "custom"
        ? customToken.trim()
        : generateSimulatedToken();

    if (mode === "custom" && !finalToken) {
      toast.error("Please enter or paste a valid FCM registration token.");
      return;
    }

    try {
      setSubmitting(true);
      await notificationApi.registerDeviceToken({
        token: finalToken,
        platform,
        deviceModel: deviceModel || "Mobile Field Device",
        appVersion: appVersion || "1.0.0",
      });

      toast.success(
        mode === "custom"
          ? "Custom FCM Device Token registered successfully!"
          : "Simulated Test Device Token registered!"
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to register device token."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 text-[#0D1F3D]">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <span className="font-extrabold text-[#0D1F3D] text-sm block">
              Register Device Push Token
            </span>
            <span className="text-[11px] text-slate-500 font-normal block">
              Add simulated or live FCM tokens for push testing
            </span>
          </div>
        </div>
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Token Mode Switcher */}
        <div className="space-y-1">
          <label className="font-bold text-[#0D1F3D] text-xs block">
            Token Registration Mode *
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("simulated")}
              className={`p-2.5 rounded-sm border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === "simulated"
                  ? "border-[#E20613] bg-red-50/50 text-[#0D1F3D] shadow-xs"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Simulated Token</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`p-2.5 rounded-sm border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === "custom"
                  ? "border-[#E20613] bg-red-50/50 text-[#0D1F3D] shadow-xs"
                  : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
              }`}
            >
              <Key className="h-3.5 w-3.5 text-blue-600" />
              <span>Custom FCM Token</span>
            </button>
          </div>
        </div>

        {/* Custom FCM Token Input */}
        {mode === "custom" ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#0D1F3D] text-xs">
                FCM Push Token *
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="h-3 w-3" /> Paste Clipboard
              </button>
            </div>
            <textarea
              rows={3}
              value={customToken}
              onChange={(e) => setCustomToken(e.target.value)}
              placeholder="Paste actual FCM registration token string here (e.g. dXMrMOuFSruaWuU2wFEb6x:APA91bEN...)"
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 p-2.5 font-mono text-[11px] font-medium text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>
        ) : (
          <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 space-y-1">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <span className="flex items-center gap-1.5 text-xs text-[#0D1F3D]">
                <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                Auto-Generated Token Preview
              </span>
              <button
                type="button"
                onClick={() => setCustomToken(generateSimulatedToken())}
                className="text-[10px] text-slate-500 hover:text-[#0D1F3D] flex items-center gap-1 font-bold"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-600 break-all bg-white p-2 rounded border border-slate-200">
              {customToken || generateSimulatedToken()}
            </p>
          </div>
        )}

        {/* Platform Selector */}
        <div className="space-y-1">
          <label className="font-bold text-[#0D1F3D] text-xs block">
            Target Device Platform *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "ANDROID", label: "Android", icon: AndroidIcon, color: "text-emerald-600" },
                { id: "IOS", label: "iOS", icon: AppleIcon, color: "text-slate-800" },
                { id: "WEB", label: "Web", icon: Layers, color: "text-purple-600" },
              ] as const
            ).map((p) => {
              const IconComp = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={`p-2 rounded-sm border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    platform === p.id
                      ? "border-[#E20613] bg-red-50/50 text-[#0D1F3D] shadow-xs"
                      : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                  }`}
                >
                  <IconComp className={`h-3.5 w-3.5 ${p.color}`} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Device Model & App Version */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Device Model / Name"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            placeholder="e.g. Xiaomi 2312DRAABI"
          />
          <Input
            label="App Version"
            value={appVersion}
            onChange={(e) => setAppVersion(e.target.value)}
            placeholder="1.0.0"
          />
        </div>

        {/* Test Mode / Live FCM Toggle */}
        <div className="rounded-sm border border-slate-200 bg-slate-50/80 p-3 space-y-2">
          <Checkbox
            checked={isTestToken}
            onChange={(checked) => setIsTestToken(checked)}
            label="Register as Active Test Device"
          />
          <p className="text-[10px] text-slate-500 pl-6 leading-relaxed">
            When enabled, this device token will immediately appear in active notification targets and test push broadcasts.
          </p>
        </div>

        {/* Form Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            type="submit"
            disabled={submitting}
            className="font-bold shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {submitting ? "Registering..." : "Register Token Now"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
