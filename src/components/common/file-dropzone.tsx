"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DropzoneStatus = "idle" | "selected" | "invalid" | "uploading";

export interface SelectedFileMeta {
  file: File;
  name: string;
  sizeBytes: number;
  formattedSize: string;
}

interface FileDropzoneProps {
  maxSizeBytes?: number; // default 15MB
  onFileSelect: (fileMeta: SelectedFileMeta | null) => void;
  className?: string;
}

export function FileDropzone({
  maxSizeBytes = 15 * 1024 * 1024, // 15 MB
  onFileSelect,
  className,
}: FileDropzoneProps) {
  const [status, setStatus] = useState<DropzoneStatus>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFileMeta | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleValidateAndSelect = (file: File) => {
    // Validate PDF MIME or extension
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setStatus("invalid");
      setErrorMessage("Only PDF files (.pdf) are accepted for clinical diet plans.");
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setStatus("invalid");
      setErrorMessage(
        `File exceeds maximum limit of ${formatSize(maxSizeBytes)} (selected file is ${formatSize(file.size)}).`
      );
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    const meta: SelectedFileMeta = {
      file,
      name: file.name,
      sizeBytes: file.size,
      formattedSize: formatSize(file.size),
    };

    setStatus("selected");
    setErrorMessage(null);
    setSelectedFile(meta);
    onFileSelect(meta);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) handleValidateAndSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) handleValidateAndSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus("idle");
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileSelect(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        id="pdf-file-input"
        onChange={handleInputChange}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload PDF Diet Plan. Click or drag and drop a PDF file here."
        className={cn(
          "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          isDragging
            ? "border-primary bg-primary/5"
            : status === "invalid"
              ? "border-destructive/60 bg-destructive/5"
              : status === "selected"
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-border bg-card hover:bg-muted/30"
        )}
      >
        {status === "idle" && (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UploadCloud className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Click or drag & drop diet plan PDF
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Accepts PDF only • Max file size: {formatSize(maxSizeBytes)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="pointer-events-none mt-2"
            >
              Browse Local Files
            </Button>
          </div>
        )}

        {status === "selected" && selectedFile && (
          <div className="w-full space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="max-w-xs break-all text-sm font-semibold text-foreground">
                  {selectedFile.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> Valid PDF
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Size: {selectedFile.formattedSize} • Ready for WhatsApp delivery staging
              </p>
            </div>
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5" /> Remove File
              </Button>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">
                Invalid File Selection
              </p>
              <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
                {errorMessage}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="mt-2"
            >
              Select Another File
            </Button>
          </div>
        )}
      </div>

      {/* Live Status indicator */}
      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
        <span>
          File status:{" "}
          <strong className="font-medium capitalize text-foreground">{status}</strong>
        </span>
        <span>MIME constraint: application/pdf</span>
      </div>
    </div>
  );
}
