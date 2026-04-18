import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, RefreshCcw, CameraOff } from "lucide-react";

type FacingMode = "user" | "environment";

interface LiveCameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File, previewDataUrl: string) => void;
  initialFacingMode?: FacingMode;
  title?: string;
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop());
}

export function LiveCameraCapture({
  open,
  onOpenChange,
  onCapture,
  initialFacingMode = "environment",
  title = "Camera",
}: LiveCameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacingMode);

  const supportsMediaDevices = useMemo(
    () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    []
  );

  const start = async (mode: FacingMode) => {
    if (!supportsMediaDevices) {
      setError("Camera is not supported in this browser.");
      return;
    }

    setIsStarting(true);
    setError(null);
    stopStream(stream);

    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode } },
        audio: false,
      });
      setStream(nextStream);
      const v = videoRef.current;
      if (v) {
        v.srcObject = nextStream;
        await v.play();
      }
    } catch (e: any) {
      // Common causes: non-HTTPS in production, blocked permissions, no device.
      setError(e?.message || "Unable to access camera. Please allow permissions.");
      setStream(null);
    } finally {
      setIsStarting(false);
    }
  };

  const capture = async () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;

    const width = Math.max(1, v.videoWidth || 0);
    const height = Math.max(1, v.videoHeight || 0);
    if (!width || !height) return;

    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, width, height);

    const dataUrl = c.toDataURL("image/jpeg", 0.92);
    const blob: Blob | null = await new Promise((resolve) =>
      c.toBlob((b) => resolve(b), "image/jpeg", 0.92)
    );
    if (!blob) return;

    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
    onCapture(file, dataUrl);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) return;
    void start(facingMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facingMode]);

  useEffect(() => {
    if (open) return;
    stopStream(stream);
    setStream(null);
    setError(null);
    setIsStarting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-xl border bg-black">
          {isStarting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {error ? (
            <div className="p-6 text-center bg-muted">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-background flex items-center justify-center">
                <CameraOff className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Camera unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="outline" onClick={() => start(facingMode)}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full max-h-[60vh] object-cover"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex gap-2 w-full sm:w-auto sm:mr-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFacingMode((m) => (m === "environment" ? "user" : "environment"))
              }
              disabled={!!error || isStarting}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Flip
            </Button>
          </div>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={capture} disabled={!!error || isStarting}>
            Capture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

