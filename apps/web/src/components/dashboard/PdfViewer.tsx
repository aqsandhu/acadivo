"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const isExternal = url.startsWith("http");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold truncate pr-4">{title}</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.open(url, "_blank")}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <CardContent className="flex-1 p-0 overflow-hidden bg-gray-100 dark:bg-gray-900">
          <iframe
            src={`${url}#toolbar=0&navpanes=0`}
            className="w-full h-full border-0"
            title={title}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%`, height: `${100 / zoom}%` }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
