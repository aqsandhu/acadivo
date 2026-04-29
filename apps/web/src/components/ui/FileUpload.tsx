"use client";

import * as React from "react";
import { Upload, X, File, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
  files: File[];
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  onFilesChange,
  files,
  className,
  disabled,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = (newFiles: FileList | null): File[] => {
    if (!newFiles) return [];
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    Array.from(newFiles).forEach((file) => {
      if (file.size > maxSize) {
        newErrors.push(`${file.name} exceeds max size of ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
        return;
      }
      validFiles.push(file);
    });

    if (files.length + validFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      return [];
    }

    setErrors(newErrors);
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const validFiles = validateFiles(e.dataTransfer.files);
    if (validFiles.length) onFilesChange([...files, ...validFiles]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validFiles = validateFiles(e.target.files);
    if (validFiles.length) onFilesChange([...files, ...validFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (file.type.includes("pdf")) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
            : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground">or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Max {(maxSize / 1024 / 1024).toFixed(0)}MB, up to {maxFiles} files
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-danger-500">{err}</p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border p-2 pr-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
