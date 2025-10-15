'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  PencilIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface PhotoAnnotateProps {
  photo: string;
  onSave: (annotatedPhoto: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

type DrawingAction = {
  type: 'draw' | 'text';
  color: string;
  lineWidth?: number;
  points?: { x: number; y: number }[];
  text?: string;
  position?: { x: number; y: number };
};

const COLORS = ['#FF0000', '#FFFF00', '#00FF00', '#0099FF', '#FFFFFF', '#000000'];
const LINE_WIDTHS = [2, 4, 6, 8];

export function PhotoAnnotate({ photo, onSave, onCancel, isOpen }: PhotoAnnotateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<'draw' | 'text'>('draw');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<DrawingAction[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the base image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Redraw all annotations
      drawingHistory.forEach(action => {
        if (action.type === 'draw' && action.points && action.points.length > 0) {
          ctx.strokeStyle = action.color;
          ctx.lineWidth = action.lineWidth || 4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        } else if (action.type === 'text' && action.text && action.position) {
          ctx.fillStyle = action.color;
          ctx.font = 'bold 24px Arial';
          ctx.fillText(action.text, action.position.x, action.position.y);
        }
      });
    };
    img.src = photo;
  }, [photo, drawingHistory]);

  useEffect(() => {
    if (isOpen && photo && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);
        setImageLoaded(true);
      };
      img.src = photo;
    }
  }, [isOpen, photo]);

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas();
    }
  }, [imageLoaded, redrawCanvas]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    if (tool === 'text') {
      setTextPosition(coords);
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    setCurrentPath([coords]);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'text') return;

    const coords = getCanvasCoordinates(e);
    const newPath = [...currentPath, coords];
    setCurrentPath(newPath);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || currentPath.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const prevPoint = currentPath[currentPath.length - 1];
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleEnd = () => {
    if (isDrawing && currentPath.length > 0) {
      const action: DrawingAction = {
        type: 'draw',
        color,
        lineWidth,
        points: currentPath,
      };
      setDrawingHistory([...drawingHistory, action]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      const action: DrawingAction = {
        type: 'text',
        color,
        text: textInput,
        position: textPosition,
      };
      setDrawingHistory([...drawingHistory, action]);

      // Draw text immediately
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.fillStyle = color;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(textInput, textPosition.x, textPosition.y);
      }
    }
    setTextInput('');
    setShowTextInput(false);
  };

  const handleUndo = () => {
    if (drawingHistory.length > 0) {
      setDrawingHistory(drawingHistory.slice(0, -1));
    }
  };

  const handleClear = () => {
    setDrawingHistory([]);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const annotatedPhoto = canvas.toDataURL('image/jpeg', 0.95);
      onSave(annotatedPhoto);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-2 sm:p-4">
        <DialogHeader className="px-2">
          <DialogTitle>Draw on Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2 px-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant={tool === 'draw' ? 'default' : 'outline'}
              onClick={() => setTool('draw')}
            >
              <PencilIcon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Draw</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === 'text' ? 'default' : 'outline'}
              onClick={() => setTool('text')}
            >
              <span className="font-bold">T</span>
              <span className="hidden sm:inline ml-1">Text</span>
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-2 px-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c ? 'border-primary ring-2 ring-primary' : 'border-gray-400'
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>

          {/* Line Width for Draw Tool */}
          {tool === 'draw' && (
            <div className="flex gap-2 px-2 items-center">
              <span className="text-sm">Size:</span>
              {LINE_WIDTHS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setLineWidth(w)}
                  className={`w-8 h-8 rounded border flex items-center justify-center ${
                    lineWidth === w ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <div
                    className="rounded-full bg-current"
                    style={{ width: w + 2, height: w + 2 }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Canvas Container */}
          <div ref={containerRef} className="relative border rounded-lg overflow-hidden bg-gray-900 touch-none">
            <canvas
              ref={canvasRef}
              className="w-full h-auto touch-none"
              style={{ maxHeight: '60vh' }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>

          {/* Text Input */}
          {showTextInput && (
            <div className="flex gap-2 px-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your text..."
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                autoFocus
                className="flex-1"
              />
              <Button type="button" size="sm" onClick={handleTextSubmit}>
                <CheckIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 px-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={drawingHistory.length === 0}
            >
              <ArrowUturnLeftIcon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={drawingHistory.length === 0}
            >
              <TrashIcon className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} size="sm">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
