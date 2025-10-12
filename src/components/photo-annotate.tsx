'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  PencilIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Slider } from '@/components/ui/slider';

interface PhotoAnnotateProps {
  photo: string;
  onSave: (annotatedPhoto: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

type Tool = 'draw' | 'text' | 'arrow';
type DrawingAction = {
  type: 'draw' | 'text' | 'arrow';
  color: string;
  lineWidth?: number;
  points?: { x: number; y: number }[];
  text?: string;
  position?: { x: number; y: number };
  fontSize?: number;
};

const COLORS = [
  { name: 'Red', value: '#FF0000' },
  { name: 'Yellow', value: '#FFFF00' },
  { name: 'Green', value: '#00FF00' },
  { name: 'Blue', value: '#0099FF' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
];

export function PhotoAnnotate({ photo, onSave, onCancel, isOpen }: PhotoAnnotateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('draw');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingHistory, setDrawingHistory] = useState<DrawingAction[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen && photo && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        redrawAll();
      };
      img.src = photo;
    }
  }, [isOpen, photo]);

  const redrawAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Redraw base image
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Redraw all history
      drawingHistory.forEach(action => {
        if (action.type === 'draw' && action.points) {
          ctx.strokeStyle = action.color;
          ctx.lineWidth = action.lineWidth || 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          action.points.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          ctx.stroke();
        } else if (action.type === 'text' && action.text && action.position) {
          ctx.fillStyle = action.color;
          ctx.font = `bold ${action.fontSize || 20}px Arial`;
          ctx.fillText(action.text, action.position.x, action.position.y);
        }
      });
    };
    img.src = photo;
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    if (tool === 'text') {
      setTextPosition(coords);
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    setCurrentPath([coords]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'text') return;

    const coords = getCanvasCoordinates(e);
    const newPath = [...currentPath, coords];
    setCurrentPath(newPath);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentPath.length > 0) {
      const prevPoint = currentPath[currentPath.length - 1];
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
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
        fontSize,
      };
      setDrawingHistory([...drawingHistory, action]);
      redrawAll();
      setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
          ctx.fillStyle = color;
          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillText(textInput, textPosition.x, textPosition.y);
        }
      }, 10);
    }
    setTextInput('');
    setShowTextInput(false);
  };

  const handleUndo = () => {
    if (drawingHistory.length > 0) {
      setDrawingHistory(drawingHistory.slice(0, -1));
      setTimeout(redrawAll, 0);
    }
  };

  const handleClear = () => {
    setDrawingHistory([]);
    setTimeout(redrawAll, 0);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const annotatedPhoto = canvas.toDataURL('image/jpeg', 0.9);
      onSave(annotatedPhoto);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Annotate Photo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tools */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              size="sm"
              variant={tool === 'draw' ? 'default' : 'outline'}
              onClick={() => setTool('draw')}
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Draw
            </Button>
            <Button
              type="button"
              size="sm"
              variant={tool === 'text' ? 'default' : 'outline'}
              onClick={() => setTool('text')}
            >
              T
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${
                  color === c.value ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c.value }}
                onClick={() => setColor(c.value)}
                title={c.name}
              />
            ))}
          </div>

          {/* Size controls */}
          {tool === 'draw' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Line Width: {lineWidth}px</label>
              <Slider
                value={[lineWidth]}
                onValueChange={(values) => setLineWidth(values[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {tool === 'text' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size: {fontSize}px</label>
              <Slider
                value={[fontSize]}
                onValueChange={(values) => setFontSize(values[0])}
                min={12}
                max={72}
                step={2}
                className="w-full"
              />
            </div>
          )}

          {/* Canvas */}
          <div className="relative border rounded-lg overflow-hidden bg-black">
            <canvas
              ref={canvasRef}
              className="w-full h-auto cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            />
          </div>

          {/* Text input dialog */}
          {showTextInput && (
            <div className="flex gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text..."
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                autoFocus
              />
              <Button type="button" size="sm" onClick={handleTextSubmit}>
                <CheckIcon className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={drawingHistory.length === 0}
            >
              <ArrowUturnLeftIcon className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={drawingHistory.length === 0}
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Clear
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
            >
              Save Annotations
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
