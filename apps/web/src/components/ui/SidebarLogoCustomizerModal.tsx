import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Portal from "@radix-ui/react-portal";
import {
  X,
  Sparkles,
  LayoutDashboard,
  TrendingUp,
  Users,
  Settings,
  ChevronLeft,
  RotateCcw,
  Save,
  Maximize2,
  Building2,
  Sliders,
  Check,
} from "lucide-react";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";

export interface SidebarLogoCustomizerModalProps {
  isOpen: boolean;
  imageUrl: string;
  initialSettings?: {
    showLogoInSidebar?: boolean;
    sidebarLogoHeight?: number;
    sidebarLogoObjectFit?: "contain" | "cover";
    sidebarLogoBg?: string;
    sidebarLogoRadius?: number;
  };
  onClose: () => void;
  onApply: (settings: {
    logoUrl: string;
    showLogoInSidebar: boolean;
    sidebarLogoHeight: number;
    sidebarLogoObjectFit: "contain" | "cover";
    sidebarLogoBg: string;
    sidebarLogoRadius: number;
  }) => void;
}

const BG_OPTIONS = [
  { id: "transparent", label: "Transparent", value: "transparent", border: "border-slate-300" },
  { id: "white", label: "White Card", value: "#ffffff", border: "border-slate-200 shadow-2xs" },
  { id: "slate", label: "Slate Soft", value: "#f1f5f9", border: "border-slate-200" },
  { id: "navy", label: "Dark Navy", value: "#0d1f3d", border: "border-[#0d1f3d]" },
];

const RADIUS_OPTIONS = [
  { id: "sharp", label: "0px", value: 0 },
  { id: "subtle", label: "6px", value: 6 },
  { id: "rounded", label: "12px", value: 12 },
  { id: "pill", label: "Pill", value: 9999 },
];

export function SidebarLogoCustomizerModal({
  isOpen,
  imageUrl,
  initialSettings,
  onClose,
  onApply,
}: SidebarLogoCustomizerModalProps) {
  const [showLogoInSidebar, setShowLogoInSidebar] = useState(
    initialSettings?.showLogoInSidebar ?? true
  );
  const [logoHeight, setLogoHeight] = useState(
    initialSettings?.sidebarLogoHeight ?? 42
  );
  const [logoFit, setLogoFit] = useState<"contain" | "cover">(
    initialSettings?.sidebarLogoObjectFit ?? "contain"
  );
  const [logoBg, setLogoBg] = useState(
    initialSettings?.sidebarLogoBg ?? "transparent"
  );
  const [logoRadius, setLogoRadius] = useState(
    initialSettings?.sidebarLogoRadius ?? 6
  );
  const [previewMode, setPreviewMode] = useState<"expanded" | "collapsed">(
    "expanded"
  );

  useEffect(() => {
    if (isOpen) {
      setShowLogoInSidebar(initialSettings?.showLogoInSidebar ?? true);
      setLogoHeight(initialSettings?.sidebarLogoHeight ?? 42);
      setLogoFit(initialSettings?.sidebarLogoObjectFit ?? "contain");
      setLogoBg(initialSettings?.sidebarLogoBg ?? "transparent");
      setLogoRadius(initialSettings?.sidebarLogoRadius ?? 6);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  const handleReset = () => {
    setShowLogoInSidebar(true);
    setLogoHeight(42);
    setLogoFit("contain");
    setLogoBg("transparent");
    setLogoRadius(6);
  };

  const handleApply = () => {
    onApply({
      logoUrl: imageUrl,
      showLogoInSidebar,
      sidebarLogoHeight: logoHeight,
      sidebarLogoObjectFit: logoFit,
      sidebarLogoBg: logoBg,
      sidebarLogoRadius: logoRadius,
    });
  };

  return (
    <Portal.Root>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 shadow-2xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0D1F3D]">
                    Customize & Preview Sidebar Logo
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Scale, align, and test how your logo renders live on the sidebar header.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* Left Column: Interactive Live Preview */}
              <div className="lg:col-span-6 bg-slate-100/70 p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#0D1F3D] flex items-center gap-1.5">
                      <Maximize2 className="h-3.5 w-3.5 text-indigo-600" />
                      Live Sidebar Preview
                    </span>
                    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("expanded")}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                          previewMode === "expanded"
                            ? "bg-[#0D1F3D] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Expanded (295px)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("collapsed")}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${
                          previewMode === "collapsed"
                            ? "bg-[#0D1F3D] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Collapsed (80px)
                      </button>
                    </div>
                  </div>

                  {/* Mock Sidebar Canvas */}
                  <div className="flex justify-center py-2">
                    <div
                      className={`bg-white border border-slate-200 rounded-lg shadow-md transition-all duration-300 overflow-hidden ${
                        previewMode === "expanded" ? "w-[295px]" : "w-[80px]"
                      }`}
                    >
                      {/* Mini Sidebar Brand Header */}
                      <div
                        className={`flex h-20 items-center border-b border-slate-100 transition-all ${
                          previewMode === "expanded"
                            ? "justify-between px-4"
                            : "justify-center px-2"
                        }`}
                      >
                        {showLogoInSidebar && imageUrl ? (
                          <div
                            className="flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: logoBg,
                              borderRadius: `${logoRadius}px`,
                              padding:
                                logoBg !== "transparent" ? "4px 8px" : "0px",
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt="Company Logo Preview"
                              style={{
                                height: `${logoHeight}px`,
                                maxHeight: "56px",
                                maxWidth: previewMode === "expanded" ? "210px" : "48px",
                                objectFit: logoFit,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-slate-400" />
                            {previewMode === "expanded" && (
                              <span className="text-xs font-bold text-slate-700">
                                Default Logo
                              </span>
                            )}
                          </div>
                        )}

                        {previewMode === "expanded" && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50 text-slate-400 border border-slate-200">
                            <ChevronLeft className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Mini Sidebar Navigation Menu Items */}
                      <div className="p-3 space-y-1.5 min-h-[220px]">
                        {previewMode === "expanded" && (
                          <p className="text-[10px] font-semibold text-slate-400 px-2 pt-1">
                            MAIN MENU
                          </p>
                        )}
                        <div className="flex items-center gap-3 px-2.5 py-2 rounded-md bg-[#0D1F3D] text-white shadow-2xs text-xs font-bold">
                          <LayoutDashboard className="h-4 w-4 shrink-0" />
                          {previewMode === "expanded" && <span>Dashboard</span>}
                        </div>
                        <div className="flex items-center gap-3 px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-50 text-xs font-medium">
                          <TrendingUp className="h-4 w-4 shrink-0 text-slate-400" />
                          {previewMode === "expanded" && <span>Sales Pipeline</span>}
                        </div>
                        <div className="flex items-center gap-3 px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-50 text-xs font-medium">
                          <Users className="h-4 w-4 shrink-0 text-slate-400" />
                          {previewMode === "expanded" && <span>Field Executives</span>}
                        </div>
                        <div className="flex items-center gap-3 px-2.5 py-2 rounded-md text-slate-600 hover:bg-slate-50 text-xs font-medium">
                          <Settings className="h-4 w-4 shrink-0 text-slate-400" />
                          {previewMode === "expanded" && <span>Workspace Settings</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-md bg-white border border-slate-200 shadow-2xs space-y-1 text-center">
                  <span className="text-[11px] font-bold text-[#0D1F3D] block">
                    Real-Time Sidebar Sync
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Changes applied here will immediately scale and format your company logo across all workspace users.
                  </p>
                </div>
              </div>

              {/* Right Column: Controls & Styling Sliders */}
              <div className="lg:col-span-6 p-6 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sliders className="h-4 w-4 text-indigo-600 shrink-0" />
                  <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                    Logo Scaling & Styling
                  </h3>
                </div>

                {/* Visibility Toggle */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#0D1F3D]">
                      Show Logo in Sidebar Header
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Enable rendering on top navigation bar
                    </p>
                  </div>
                  <Checkbox
                    checked={showLogoInSidebar}
                    onChange={setShowLogoInSidebar}
                  />
                </div>

                {/* Slider: Logo Height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-[#0D1F3D]">
                      Logo Height / Scale
                    </label>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 text-xs">
                      {logoHeight}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="56"
                    step="2"
                    value={logoHeight}
                    onChange={(e) => setLogoHeight(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                    <span>Compact (24px)</span>
                    <span>Standard (42px)</span>
                    <span>Maximum (56px)</span>
                  </div>
                </div>

                {/* Object Fit Control */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0D1F3D] block">
                    Logo Display Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLogoFit("contain")}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition ${
                        logoFit === "contain"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Contain (Fit Entire Image)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoFit("cover")}
                      className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition ${
                        logoFit === "cover"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Cover (Fill Container)
                    </button>
                  </div>
                </div>

                {/* Background Styling */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0D1F3D] block">
                    Logo Container Background
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BG_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLogoBg(opt.value)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition ${
                          logoBg === opt.value
                            ? "border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full border mb-1 flex items-center justify-center ${opt.border}`}
                          style={{
                            backgroundColor:
                              opt.value === "transparent" ? "#ffffff" : opt.value,
                          }}
                        >
                          {logoBg === opt.value && (
                            <Check
                              className={`h-3 w-3 stroke-[3] ${
                                opt.value === "#0d1f3d" ? "text-white" : "text-indigo-600"
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Corner Radius Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0D1F3D] block">
                    Container Corner Radius
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {RADIUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLogoRadius(opt.value)}
                        className={`py-1.5 text-xs font-bold rounded-lg border text-center transition ${
                          logoRadius === opt.value
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 font-bold text-xs text-slate-600 border-slate-300 hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                Reset Defaults
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="font-bold text-xs border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={handleApply}
                  className="gap-1.5 font-bold text-xs shadow-md bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Save className="h-3.5 w-3.5" />
                  Apply & Publish Logo
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal.Root>
  );
}
