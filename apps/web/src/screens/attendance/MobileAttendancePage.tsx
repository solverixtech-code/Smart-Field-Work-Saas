import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  LocateFixed,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui";
import { AttendanceSelfContext, attendanceApi } from "./attendance.api";
import { attendanceInstallationId } from "./attendance-device";

function browserMetadata() {
  return {
    label: `${navigator.platform || "Browser"} installation`,
    platform: navigator.platform || "Web",
    userAgent: navigator.userAgent.slice(0, 500),
  };
}

function currentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20_000,
    });
  });
}

async function sha256Base64(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await blob.arrayBuffer(),
  );
  let binary = "";
  new Uint8Array(digest).forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

export default function MobileAttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [context, setContext] = useState<AttendanceSelfContext | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (id: string) => {
    await attendanceApi.enrollDevice({
      installationId: id,
      ...browserMetadata(),
    });
    setContext(await attendanceApi.context(id));
  };

  useEffect(() => {
    let active = true;
    void attendanceInstallationId()
      .then(async (id) => {
        if (!active) return;
        setInstallationId(id);
        await refresh(id);
      })
      .catch(
        () => active && setError("Unable to enroll this browser installation."),
      );
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setError("Camera permission is required for a fresh attendance selfie.");
    }
  };

  const capture = async (): Promise<Blob> => {
    const video = videoRef.current;
    if (!video || !cameraReady || video.videoWidth === 0)
      throw new Error("Start the front camera first.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    return new Promise((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Unable to capture selfie.")),
        "image/jpeg",
        0.88,
      ),
    );
  };

  const punch = async () => {
    if (!installationId || !context || context.permittedAction === "COMPLETED")
      return;
    setBusy(true);
    setError(null);
    try {
      if (context.device?.status !== "ACTIVE")
        throw new Error(
          "This browser installation is awaiting administrator approval.",
        );
      const [blob, position] = await Promise.all([
        capture(),
        currentPosition(),
      ]);
      if (position.coords.accuracy > context.policy.maximumAccuracyMeters) {
        throw new Error(
          `GPS accuracy must be within ${context.policy.maximumAccuracyMeters} metres. Move to an open area and retry.`,
        );
      }
      const checksumSha256 = await sha256Base64(blob);
      const intent = await attendanceApi.selfieIntent({
        displayName: `attendance-${context.permittedAction.toLowerCase()}-${Date.now()}.jpg`,
        mimeType: "image/jpeg",
        expectedBytes: blob.size,
        checksumSha256,
      });
      const headers = Object.fromEntries(
        Object.entries(intent.upload.headers).filter(
          ([key]) => key.toLowerCase() !== "content-length",
        ),
      );
      const upload = await fetch(intent.upload.url, {
        method: "PUT",
        headers,
        body: blob,
      });
      if (!upload.ok)
        throw new Error("Selfie upload failed. No attendance was recorded.");
      await attendanceApi.completeSelfie(intent.id);
      await attendanceApi.punch(context.permittedAction, {
        clientCommandId: crypto.randomUUID(),
        capturedAt: new Date(position.timestamp).toISOString(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        selfieAssetId: intent.id,
        installationId,
        ...browserMetadata(),
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setCameraReady(false);
      await refresh(installationId);
      window.dispatchEvent(new Event("visiblo:attendance-changed"));
      toast.success(
        context.permittedAction === "PUNCH_IN"
          ? "Punched in successfully"
          : "Punched out successfully",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Attendance punch failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 font-sans">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
            Mobile Attendance
          </h1>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
            <Smartphone className="h-3.5 w-3.5" /> Online
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500">
          Capture a fresh selfie and current GPS position to record attendance.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-semibold text-slate-500">Next action</p>
            <p className="mt-1 font-extrabold text-[#0D1F3D]">
              {context?.permittedAction.replace("_", " ") ?? "Loading..."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="font-semibold text-slate-500">Location policy</p>
            <p className="mt-1 font-extrabold text-[#0D1F3D]">
              {context?.mobilityMode.replace("_", " ") ?? "Loading..."}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 aspect-[4/3]">
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full object-cover scale-x-[-1]"
          />
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
              <Camera className="h-8 w-8" />
              <span className="text-xs font-semibold">
                Start the front camera for a fresh selfie
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Installation: {context?.device?.status ?? "Enrolling"}</span>
          </div>
          <div className="flex items-center gap-2">
            <LocateFixed className="h-4 w-4 text-blue-600" />
            <span>
              GPS accuracy required:{" "}
              {context?.policy.maximumAccuracyMeters ?? 100} metres
            </span>
          </div>
          {context?.effectiveShift && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E20613]" />
              <span>
                {context.effectiveShift.name}:{" "}
                {context.effectiveShift.startTime}–
                {context.effectiveShift.endTime}
              </span>
            </div>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
          >
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => void startCamera()}
            disabled={busy || context?.permittedAction === "COMPLETED"}
          >
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
          <Button
            variant="accent"
            onClick={() => void punch()}
            isLoading={busy}
            disabled={
              !cameraReady ||
              !context ||
              context.device?.status !== "ACTIVE" ||
              context.permittedAction === "COMPLETED"
            }
          >
            {context?.permittedAction === "PUNCH_OUT"
              ? "Punch Out"
              : context?.permittedAction === "COMPLETED"
                ? "Completed"
                : "Punch In"}
          </Button>
        </div>
      </div>
    </div>
  );
}
