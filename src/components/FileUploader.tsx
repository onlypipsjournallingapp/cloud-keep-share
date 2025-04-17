
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Cloud, FileText, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  dropzoneText?: string;
}

export default function FileUploader({
  onFilesAdded,
  acceptedFileTypes,
  maxFileSize = 10485760, // 10MB default
  dropzoneText = "Drag and drop files here, or click to select files"
}: FileUploaderProps) {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes ? 
      acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : 
      undefined,
    maxSize: maxFileSize,
  });

  const getIcon = () => {
    if (!acceptedFileTypes) return <Cloud size={40} className="opacity-50" />;
    if (acceptedFileTypes.some(type => type.includes('image'))) return <Image size={40} className="opacity-50" />;
    if (acceptedFileTypes.some(type => type.includes('video'))) return <Video size={40} className="opacity-50" />;
    return <FileText size={40} className="opacity-50" />;
  };

  return (
    <div 
      {...getRootProps()} 
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
        flex flex-col items-center justify-center h-40
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
        ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
      `}
    >
      <input {...getInputProps()} />
      {getIcon()}
      <div className="mt-4 text-sm text-muted-foreground">
        {isDragActive ? 
          "Drop files here..." : 
          isDragReject ? 
            "File type not accepted" : 
            dropzoneText
        }
      </div>
      <Button variant="ghost" size="sm" className="mt-2">
        Browse files
      </Button>
    </div>
  );
}
