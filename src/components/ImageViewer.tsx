import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { IssueImage } from '@/redux/slices/issueSlice';

interface ImageViewerProps {
  visible: boolean;
  onClose: () => void;
  images: IssueImage[];
  initialIndex?: number;
  title?: string;
}

export default function ImageViewer({
  visible,
  onClose,
  images,
  initialIndex = 0,
  title = 'Issue Images',
}: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1); // Reset zoom when changing images
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1); // Reset zoom when changing images
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleDownload = () => {
    if (currentImage) {
      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.href = currentImage.path.startsWith('/uploads')
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:8081'}${currentImage.path}`
        : currentImage.path;
      link.download = currentImage.name || `issue-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClose = () => {
    setZoom(1);
    setCurrentIndex(initialIndex);
    onClose();
  };

  if (!currentImage) return null;

  const imageUrl = currentImage.path.startsWith('/uploads')
    ? `${process.env.REACT_APP_API_URL || 'http://localhost:8081'}${currentImage.path}`
    : currentImage.path;

  return (
    <Dialog open={visible} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {title}
              {hasMultipleImages && (
                <Badge variant="secondary">
                  {currentIndex + 1} of {images.length}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.25}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative overflow-hidden">
          {/* Navigation buttons for multiple images */}
          {hasMultipleImages && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Image display */}
          <div className="h-full flex items-center justify-center p-4">
            <div
              className="relative overflow-auto max-h-full max-w-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <img
                src={imageUrl}
                alt={currentImage.name || `Issue image ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                style={{ imageRendering: zoom > 1 ? 'pixelated' : 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-image.png'; // Fallback image
                }}
              />
            </div>
          </div>

          {/* Image info */}
          <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{currentImage.name}</p>
                <p className="text-muted-foreground">
                  Type: {currentImage.documentInforType} | Entity: {currentImage.image_entity}
                </p>
              </div>
              {currentImage.created_date && (
                <div className="text-right">
                  <p className="text-muted-foreground">
                    Created: {new Date(currentImage.created_date).toLocaleDateString()}
                  </p>
                  {currentImage.created_by && (
                    <p className="text-muted-foreground">By: {currentImage.created_by}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail navigation for multiple images */}
        {hasMultipleImages && (
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentIndex
                      ? 'border-primary shadow-sm'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image.path.startsWith('/uploads')
                      ? `${process.env.REACT_APP_API_URL || 'http://localhost:8081'}${image.path}`
                      : image.path}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.png';
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}