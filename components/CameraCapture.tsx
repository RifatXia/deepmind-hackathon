"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  RotateCcw,
  Check,
  SwitchCamera,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

type Mode = "choose" | "webcam" | "preview";

export default function CameraCapture({
  onCapture,
  onCancel,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<Mode>("choose");
  const [preview, setPreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startWebcam = useCallback(
    async (facing: "user" | "environment") => {
      stopStream();
      setCameraError(null);
      setMode("webcam");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError(
          "Camera access denied. Use the upload button instead."
        );
        setMode("choose");
      }
    },
    []
  );

  const captureFromWebcam = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    // Square crop from center
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = Math.min(size, 1024);
    canvas.height = Math.min(size, 1024);
    const ctx = canvas.getContext("2d")!;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    // Mirror if front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);

    stopStream();
    setPreview(base64);
    setMode("preview");
  };

  const handleFlipCamera = () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    startWebcam(newFacing);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 1024;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        setPreview(canvas.toDataURL("image/jpeg", 0.85));
        setMode("preview");
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const resetCapture = () => {
    setPreview(null);
    stopStream();
    setMode("choose");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmPhoto = () => {
    if (preview) onCapture(preview);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <AnimatePresence mode="wait">
        {/* CHOOSE MODE */}
        {mode === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="rounded-2xl border-2 border-dashed border-stpat-green/30 bg-[#0f2b0f] p-6 text-center">
              <div className="text-4xl mb-3">📸</div>
              <p className="text-sm font-bold text-stpat-cream mb-1">
                Capture Your Moment
              </p>
              <p className="text-xs text-stpat-green/50 mb-4">
                Take a photo or selfie — AI will transform it into art!
              </p>

              {cameraError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 mb-3">
                  <p className="text-[10px] text-red-400">{cameraError}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {/* Live camera button */}
                <Button
                  onClick={() => startWebcam(facingMode)}
                  className="w-full bg-stpat-green hover:bg-stpat-emerald text-white font-bold h-12"
                >
                  <Video size={18} className="mr-2" /> Open Camera
                </Button>

                {/* Upload button */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full border-stpat-green/30 text-stpat-green hover:bg-stpat-green/10 h-12"
                >
                  <Upload size={18} className="mr-2" /> Upload from Gallery
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full text-xs text-stpat-green/40"
            >
              Skip — generate without my photo
            </Button>
          </motion.div>
        )}

        {/* WEBCAM VIEWFINDER */}
        {mode === "webcam" && (
          <motion.div
            key="webcam"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-stpat-green/30 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full aspect-square object-cover ${
                  facingMode === "user" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* Camera overlay UI */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner brackets */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-stpat-shamrock/60 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-stpat-shamrock/60 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-stpat-shamrock/60 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-stpat-shamrock/60 rounded-br-lg" />
              </div>

              {/* Top bar */}
              <div className="absolute top-2 inset-x-2 flex justify-between">
                <button
                  onClick={() => {
                    stopStream();
                    setMode("choose");
                  }}
                  className="p-2 rounded-full bg-black/50 text-white/80 hover:text-white"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={handleFlipCamera}
                  className="p-2 rounded-full bg-black/50 text-white/80 hover:text-white"
                >
                  <SwitchCamera size={18} />
                </button>
              </div>

              {/* Bottom capture button */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center">
                <button
                  onClick={captureFromWebcam}
                  className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 active:scale-90 transition-all flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] text-stpat-green/40">
              Tap the button to capture · Tap{" "}
              <SwitchCamera size={10} className="inline" /> to flip camera
            </p>
          </motion.div>
        )}

        {/* PREVIEW */}
        {mode === "preview" && preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-stpat-shamrock/40">
              <img
                src={preview}
                alt="Your photo"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={resetCapture}
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-xs font-medium">
                  Looking good! 🍀
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={resetCapture}
                variant="outline"
                className="flex-1 border-stpat-green/30 text-stpat-green"
              >
                <RotateCcw size={16} className="mr-1" /> Retake
              </Button>
              <Button
                onClick={confirmPhoto}
                className="flex-1 bg-stpat-green hover:bg-stpat-emerald text-white font-bold"
              >
                <Check size={16} className="mr-1" /> Use This Photo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
