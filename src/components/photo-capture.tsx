'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CameraIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string) => void;
  existingPhoto?: string;
}

export function PhotoCapture({ onPhotoCapture, existingPhoto }: PhotoCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(existingPhoto || null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot({
      width: 1920,
      height: 1080,
    });
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleSave = () => {
    if (capturedImage) {
      onPhotoCapture(capturedImage);
      setIsOpen(false);
    }
  };

  const handleRemove = () => {
    setCapturedImage(null);
    onPhotoCapture('');
    setIsOpen(false);
  };

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Route Photo</label>
        {capturedImage ? (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Route preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(true)}
              >
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsOpen(true)}
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Take Photo
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Capture Route Photo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {capturedImage ? (
              <>
                <img
                  src={capturedImage}
                  alt="Captured route"
                  className="w-full h-auto rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={retake}
                    className="flex-1"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    className="flex-1"
                  >
                    Use Photo
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-[3/4] bg-black rounded-lg overflow-hidden">
                  <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      facingMode: facingMode,
                      aspectRatio: 9 / 16,
                    }}
                    className="w-full h-full object-cover"
                    screenshotQuality={0.95}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={switchCamera}
                    className="flex-1"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Switch Camera
                  </Button>
                  <Button
                    type="button"
                    onClick={capture}
                    className="flex-1"
                  >
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Capture
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
