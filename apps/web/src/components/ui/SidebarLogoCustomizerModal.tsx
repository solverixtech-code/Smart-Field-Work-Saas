import React, { useState, useCallback, useEffect, useRef } from "react";
import Cropper, { Area } from "react-easy-crop";
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
  RotateCw,
  Save,
  Maximize2,
  Building2,
  Sliders,
  Check,
  ZoomIn,
  ZoomOut,
  Crop as CropIcon,
  Loader2,
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

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImgDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  const rotRad = (rotation * Math.PI) / 180;
  const rotatedWidth =
    Math.abs(Math.cos(rotRad) * image.naturalWidth) +
    Math.abs(Math.sin(rotRad) * image.naturalHeight);
  const rotatedHeight =
    Math.abs(Math.sin(rotRad) * image.naturalWidth) +
    Math.abs(Math.cos(rotRad) * image.naturalHeight);

  canvas.width = Math.ceil(rotatedWidth);
  canvas.height = Math.ceil(rotatedHeight);

  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(rotRad);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) throw new Error("No cropped 2d context");

  croppedCanvas.width = Math.ceil(pixelCrop.width);
  croppedCanvas.height = Math.ceil(pixelCrop.height);

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return croppedCanvas.toDataURL("image/png", 0.95);
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

const ASPECT_RATIO_OPTIONS = [
  { id: "free", label: "Free / Auto", value: undefined },
  { id: "square", label: "1:1 Square", value: 1 },
  { id: "banner", label: "3:1 Banner", value: 3 },
  { id: "wide", label: "4:1 Wide", value: 4 },
];

export function SidebarLogoCustomizerModal({
  isOpen,
  imageUrl,
  initialSettings,
  onClose,
  onApply,
}: SidebarLogoCustomizerModalProps) {
  // Cropper Canvas State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string>(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);

  // Timer ref for debouncing canvas live preview rendering during crop dragging
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sidebar Styling State
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
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setAspect(undefined);
      setCroppedAreaPixels(null);
      setCroppedPreviewUrl(imageUrl);
      setShowLogoInSidebar(initialSettings?.showLogoInSidebar ?? true);
      setLogoHeight(initialSettings?.sidebarLogoHeight ?? 42);
      setLogoFit(initialSettings?.sidebarLogoObjectFit ?? "contain");
      setLogoBg(initialSettings?.sidebarLogoBg ?? "transparent");
      setLogoRadius(initialSettings?.sidebarLogoRadius ?? 6);
    }
  }, [isOpen, imageUrl, initialSettings]);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  const onCropChange = useCallback((newCrop: { x: number; y: number }) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, pixelCrop: Area) => {
      setCroppedAreaPixels(pixelCrop);

      // Debounce base64 canvas decoding to keep mouse dragging at 60fps buttery smooth
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
      }

      previewTimerRef.current = setTimeout(async () => {
        try {
          const livePreview = await getCroppedImgDataUrl(imageUrl, pixelCrop, rotation);
          setCroppedPreviewUrl(livePreview);
        } catch {
          /* ignore */
        }
      }, 150);
    },
    [imageUrl, rotation]
  );

  if (!isOpen) return null;

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(undefined);
    setCroppedPreviewUrl(imageUrl);
    setShowLogoInSidebar(true);
    setLogoHeight(42);
    setLogoFit("contain");
    setLogoBg("transparent");
    setLogoRadius(6);
  };

  const handleConfirmSave = async () => {
    try {
      setIsProcessing(true);
      let finalDataUrl = imageUrl;
      if (croppedAreaPixels) {
        finalDataUrl = await getCroppedImgDataUrl(imageUrl, croppedAreaPixels, rotation);
      }
      onApply({
        logoUrl: finalDataUrl,
        showLogoInSidebar,
        sidebarLogoHeight: logoHeight,
        sidebarLogoObjectFit: logoFit,
        sidebarLogoBg: logoBg,
        sidebarLogoRadius: logoRadius,
      });
    } catch {
      onApply({
        logoUrl: imageUrl,
        showLogoInSidebar,
        sidebarLogoHeight: logoHeight,
        sidebarLogoObjectFit: logoFit,
        sidebarLogoBg: logoBg,
        sidebarLogoRadius: logoRadius,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Portal.Root>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 font-sans">
          {/* Backdrop without blur for maximum performance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 shadow-2xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#0D1F3D]">
                    Resize, Crop & Preview Sidebar Logo
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Adjust image crop bounds, zoom, scale, and test live sidebar header preview.
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

            {/* Modal Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto min-h-0">
              {/* Left Column: Interactive Image Cropper & Resizer Canvas */}
              <div className="lg:col-span-6 p-5 border-b lg:border-b-0 lg:border-r border-slate-200 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0D1F3D] flex items-center gap-1.5">
                      <CropIcon className="h-4 w-4 text-indigo-600" />
                      1. Image Resizer & Crop Canvas
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Drag to pan • Scroll to zoom
                    </span>
                  </div>

                  {/* Interactive Cropper Canvas Box */}
                  <div className="relative h-60 sm:h-64 w-full rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shadow-inner">
                    {imageUrl ? (
                      <Cropper
                        image={imageUrl}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onZoomChange={onZoomChange}
                        onCropComplete={onCropCompleteCallback}
                        showGrid={true}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400 text-xs">
                        No image loaded
                      </div>
                    )}
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Crop Aspect Ratio
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAspect(opt.value)}
                          className={`py-1 text-[11px] font-bold rounded border text-center transition ${
                            aspect === opt.value
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zoom & Rotation Sliders */}
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    {/* Zoom Control */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <ZoomIn className="h-3 w-3 text-indigo-600" /> Zoom
                        </span>
                        <span className="font-mono font-bold text-indigo-700">{zoom.toFixed(1)}x</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setZoom(Math.max(1, zoom - 0.2))}
                          className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.1"
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                          className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Rotation Control */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <RotateCw className="h-3 w-3 text-indigo-600" /> Rotation
                        </span>
                        <span className="font-mono font-bold text-indigo-700">{rotation}°</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                          className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCcw className="h-3 w-3" /> -90°
                        </button>
                        <button
                          type="button"
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="flex-1 flex items-center justify-center gap-1 py-1 text-[10px] font-bold rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          <RotateCw className="h-3 w-3" /> +90°
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-medium text-center bg-slate-50 p-2 rounded border border-slate-200">
                  Cropper outputs a high-resolution transparent PNG image asset.
                </p>
              </div>

              {/* Right Column: Live Sidebar Preview & Scaling Controls */}
              <div className="lg:col-span-6 p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0D1F3D] flex items-center gap-1.5">
                      <Maximize2 className="h-4 w-4 text-indigo-600" />
                      2. Live Sidebar Preview
                    </span>
                    <div className="inline-flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("expanded")}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                          previewMode === "expanded"
                            ? "bg-[#0D1F3D] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Expanded
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("collapsed")}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                          previewMode === "collapsed"
                            ? "bg-[#0D1F3D] text-white shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Collapsed
                      </button>
                    </div>
                  </div>

                  {/* Mock Sidebar Canvas */}
                  <div className="flex justify-center bg-slate-100/70 p-3 rounded-lg border border-slate-200">
                    <div
                      className={`bg-white border border-slate-200 rounded-lg shadow-md transition-all duration-300 overflow-hidden ${
                        previewMode === "expanded" ? "w-[270px]" : "w-[76px]"
                      }`}
                    >
                      {/* Mini Sidebar Brand Header */}
                      <div
                        className={`flex h-16 items-center border-b border-slate-100 transition-all ${
                          previewMode === "expanded"
                            ? "justify-between px-3"
                            : "justify-center px-1.5"
                        }`}
                      >
                        {showLogoInSidebar && croppedPreviewUrl ? (
                          <div
                            className="flex items-center justify-center transition-all"
                            style={{
                              backgroundColor: logoBg,
                              borderRadius: `${logoRadius}px`,
                              padding:
                                logoBg !== "transparent" ? "3px 6px" : "0px",
                            }}
                          >
                            <img
                              src={croppedPreviewUrl}
                              alt="Company Logo Preview"
                              style={{
                                height: `${Math.min(logoHeight, 48)}px`,
                                maxHeight: "48px",
                                maxWidth: previewMode === "expanded" ? "190px" : "44px",
                                objectFit: logoFit,
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-slate-400" />
                            {previewMode === "expanded" && (
                              <span className="text-xs font-bold text-slate-700">
                                Default Logo
                              </span>
                            )}
                          </div>
                        )}

                        {previewMode === "expanded" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-50 text-slate-400 border border-slate-200">
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Mini Sidebar Navigation Menu Items */}
                      <div className="p-2 space-y-1 min-h-[140px]">
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-[#0D1F3D] text-white text-[11px] font-bold">
                          <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                          {previewMode === "expanded" && <span>Dashboard</span>}
                        </div>
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-slate-600 text-[11px] font-medium">
                          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {previewMode === "expanded" && <span>Sales Pipeline</span>}
                        </div>
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-slate-600 text-[11px] font-medium">
                          <Settings className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {previewMode === "expanded" && <span>Workspace Settings</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Logo Height Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-[#0D1F3D]">
                        Sidebar Logo Height Scale
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
                  </div>

                  {/* Logo Container Background Options */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0D1F3D] block">
                      Container Background Fill
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {BG_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLogoBg(opt.value)}
                          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded border text-center transition ${
                            logoBg === opt.value
                              ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600/30"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`h-3.5 w-3.5 rounded-full border ${opt.border}`}
                            style={{
                              backgroundColor:
                                opt.value === "transparent" ? "#ffffff" : opt.value,
                            }}
                          />
                          <span className="text-[10px] font-bold text-slate-700 truncate">
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Container Corner Radius */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0D1F3D] block">
                      Container Radius
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {RADIUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setLogoRadius(opt.value)}
                          className={`py-1 text-[11px] font-bold rounded border text-center transition ${
                            logoRadius === opt.value
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar Header Toggle */}
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0D1F3D]">
                    Show Logo in Sidebar Header
                  </span>
                  <Checkbox
                    checked={showLogoInSidebar}
                    onChange={setShowLogoInSidebar}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isProcessing}
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
                  disabled={isProcessing}
                  className="font-bold text-xs border-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={handleConfirmSave}
                  disabled={isProcessing}
                  className="gap-1.5 font-bold text-xs shadow-md bg-indigo-600 hover:bg-indigo-700 text-white min-w-[170px] justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Cropping Logo...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Crop & Apply Logo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </Portal.Root>
  );
}
