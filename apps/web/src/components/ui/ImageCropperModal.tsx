import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import * as Portal from '@radix-ui/react-portal';
import { cn } from '../../lib/utils';
import {
  X,
  User as UserIcon,
  Square as SquareIcon,
  RectangleVertical,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from './Button';

type ImageCropperModalProps = {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void | Promise<void>;
  title?: string;
  subtitle?: string;
  defaultAspectType?: 'circle' | 'square' | 'rect' | 'full';
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

const getRotatedSize = (width: number, height: number, rotation: number) => {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

async function getOriginalImgBlob(imageSrc: string): Promise<Blob> {
  const response = await fetch(imageSrc);
  return await response.blob();
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const rotRad = getRadianAngle(rotation);
  const { width: rotatedWidth, height: rotatedHeight } = getRotatedSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation,
  );

  canvas.width = Math.ceil(rotatedWidth);
  canvas.height = Math.ceil(rotatedHeight);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  ctx.rotate(rotRad);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('No cropped 2d context');
  }

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
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (file) => {
        if (file) {
          resolve(file);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.92,
    );
  });
}

async function getRotatedFullImgBlob(imageSrc: string, rotation = 0): Promise<Blob> {
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  if (normalizedRotation === 0) {
    return getOriginalImgBlob(imageSrc);
  }

  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const { width, height } = getRotatedSize(
    image.naturalWidth,
    image.naturalHeight,
    normalizedRotation,
  );
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(width / 2, height / 2);
  ctx.rotate(getRadianAngle(normalizedRotation));
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (file) => {
        if (file) {
          resolve(file);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.92,
    );
  });
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
  title = 'Crop Profile Photo',
  subtitle = 'Select the best framing for this image',
  defaultAspectType = 'circle',
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspectType, setAspectType] = useState<'circle' | 'square' | 'rect' | 'full'>(defaultAspectType);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!imageUrl) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectType(defaultAspectType);
    setCroppedAreaPixels(null);
    createImage(imageUrl)
      .then((img) => {
        setOriginalAspect(img.naturalWidth / img.naturalHeight);
      })
      .catch((err) => {
        console.error('Failed to load image for aspect ratio:', err);
      });
  }, [imageUrl, defaultAspectType]);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      let croppedImageBlob: Blob;

      if (aspectType === 'full') {
        croppedImageBlob = await getRotatedFullImgBlob(imageUrl, rotation);
      } else {
        if (!croppedAreaPixels) return;
        croppedImageBlob = await getCroppedImg(imageUrl, croppedAreaPixels, rotation);
      }

      console.log('[Cropper] Generated crop blob successfully:', {
        size: croppedImageBlob.size,
        type: croppedImageBlob.type,
      });

      if (croppedImageBlob.size === 0) {
        throw new Error('Cropped image blob is empty (0 bytes).');
      }

      await onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error('[Cropper] Failed during canvas crop export or upload callback:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAspectValue = () => {
    if (aspectType === 'full') return originalAspect;
    if (aspectType === 'circle' || aspectType === 'square') return 1;
    return 3 / 4; // Standard portrait aspect ratio
  };

  const getCropShape = () => {
    return aspectType === 'circle' ? 'round' : 'rect';
  };

  const nudgeRotation = (amount: number) => {
    setRotation((current) => {
      const next = current + amount;
      return ((next % 360) + 360) % 360;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal.Root className="fixed inset-0 z-[100]">
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 font-sans">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-[110] w-full max-w-[550px] rounded-[32px] bg-white p-6 shadow-2xl overflow-hidden shadow-black/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#0B2E6B]">{title}</h2>
                  <p className="text-[13px] text-slate-500 font-medium">{subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="mb-6 flex items-center gap-2 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setAspectType('circle')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                    aspectType === 'circle'
                      ? 'bg-white text-[#00C2A8] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900',
                  )}
                >
                  <UserIcon className="h-4 w-4" />
                  Circle
                </button>
                <button
                  type="button"
                  onClick={() => setAspectType('square')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                    aspectType === 'square'
                      ? 'bg-white text-[#00C2A8] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900',
                  )}
                >
                  <SquareIcon className="h-4 w-4" />
                  Square
                </button>
                <button
                  type="button"
                  onClick={() => setAspectType('rect')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                    aspectType === 'rect'
                      ? 'bg-white text-[#00C2A8] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900',
                  )}
                >
                  <RectangleVertical className="h-4 w-4" />
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setAspectType('full')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all',
                    aspectType === 'full'
                      ? 'bg-white text-[#00C2A8] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900',
                  )}
                >
                  <Maximize2 className="h-4 w-4" />
                  Full Size
                </button>
              </div>

              {/* Cropper Box */}
              <div className="relative h-[320px] sm:h-[420px] w-full rounded-2xl overflow-hidden bg-[#1a1a1a] ring-1 ring-slate-200">
                <Cropper
                  image={imageUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={getAspectValue()}
                  cropShape={getCropShape()}
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={handleCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  style={{
                    containerStyle: {
                      padding: '24px',
                    },
                  }}
                />
              </div>

              {/* Controls & Action Buttons */}
              <div className="mt-8 space-y-6">
                <div className="space-y-4 px-2">
                  <div className="flex items-center gap-4">
                    <Minus className="h-5 w-5 text-slate-400" />
                    <label className="relative flex flex-1 items-center">
                      <span className="sr-only">Zoom</span>
                      <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.01}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#00C2A8] outline-none"
                      />
                    </label>
                    <Plus className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => nudgeRotation(-90)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#00C2A8] hover:text-[#00C2A8]"
                      aria-label="Rotate left 90 degrees"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <label className="relative flex flex-1 items-center gap-3">
                      <span className="text-xs font-bold text-slate-500">Rotate</span>
                      <input
                        type="range"
                        value={rotation}
                        min={0}
                        max={359}
                        step={1}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#00C2A8] outline-none"
                      />
                      <span className="w-10 text-right text-xs font-black text-[#00C2A8]">
                        {Math.round(rotation)}&deg;
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => nudgeRotation(90)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#00C2A8] hover:text-[#00C2A8]"
                      aria-label="Rotate right 90 degrees"
                    >
                      <RotateCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end items-center gap-3 bg-slate-50 -mx-6 -mb-6 p-6 mt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isProcessing}
                    className="px-6 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    variant="accent"
                    isLoading={isProcessing}
                    onClick={handleConfirm}
                    className="px-8 py-2.5 bg-[#00C2A8] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm hover:bg-[#00a892]"
                  >
                    {!isProcessing && <CheckCircle2 className="h-4 w-4" />}
                    {isProcessing ? 'Processing...' : 'Apply & Save'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </Portal.Root>
      )}
    </AnimatePresence>
  );
};
