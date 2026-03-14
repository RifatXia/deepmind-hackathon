"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, RotateCcw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({
  onCapture,
  onCancel,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith("image/")) return;

    // Resize and convert to base64
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 1024px to keep payload reasonable
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
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        setPreview(base64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const confirmPhoto = () => {
    if (preview) {
      onCapture(preview);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="rounded-2xl border-2 border-dashed border-stpat-green/30 bg-[#0f2b0f] p-8 text-center">
              <div className="text-4xl mb-3">📸</div>
              <p className="text-sm font-bold text-stpat-cream mb-1">
                Take a Photo or Upload
              </p>
              <p className="text-xs text-stpat-green/50 mb-4">
                Snap a selfie or photo at this spot — AI will transform it into
                art!
              </p>

              <div className="flex gap-3 justify-center">
                {/* Camera button */}
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-stpat-green hover:bg-stpat-emerald text-white font-bold"
                >
                  <Camera size={18} className="mr-2" /> Camera
                </Button>

                {/* Upload button */}
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-stpat-green/30 text-stpat-green hover:bg-stpat-green/10"
                >
                  <Upload size={18} className="mr-2" /> Gallery
                </Button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
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
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Photo preview */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-stpat-green/30">
              <img
                src={preview}
                alt="Your photo"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => {
                    setPreview(null);
                    // Reset file inputs
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (cameraInputRef.current)
                      cameraInputRef.current.value = "";
                  }}
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-xs font-medium">
                  Looking good! Pick a style below.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (cameraInputRef.current)
                    cameraInputRef.current.value = "";
                }}
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
