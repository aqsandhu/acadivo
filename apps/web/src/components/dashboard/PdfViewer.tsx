"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface PdfViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function PdfViewer({ url, title, onClose }: PdfViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">{title}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.open(url, "_blank")}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <iframe src={url} className="w-full h-full border-0" title={title} />
        </CardContent>
      </Card>
    </div>
  );
}
