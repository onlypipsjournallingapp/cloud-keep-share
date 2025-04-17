
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, FileSymlink } from "lucide-react";
import FileUploader from "@/components/FileUploader";

type FileItem = {
  id: string;
  file: File;
  uploadedAt: Date;
  url: string; // This would be populated by backend in a real app
};

const FilesTab = () => {
  const [files, setFiles] = useState<FileItem[]>([]);

  const handleFilesAdded = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(file => 
      file.type === "application/pdf" || 
      file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) return;

    const newFileItems = pdfFiles.map(file => ({
      id: Date.now() + "-" + file.name,
      file,
      uploadedAt: new Date(),
      url: URL.createObjectURL(file) // In a real app, this would be a server URL
    }));

    setFiles(prev => [...newFileItems, ...prev]);
  };

  const handleDelete = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF Files</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            onFilesAdded={handleFilesAdded}
            acceptedFileTypes={["application/pdf"]}
            dropzoneText="Drag and drop PDFs here, or click to select files"
          />
        </CardContent>
      </Card>

      {files.length === 0 ? (
        <div className="text-center p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No files uploaded</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Upload your first PDF to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((fileItem) => (
            <Card key={fileItem.id} className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center p-4 flex-1">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{fileItem.file.name}</h3>
                  <div className="flex text-xs text-muted-foreground mt-1 space-x-2">
                    <span>{formatFileSize(fileItem.file.size)}</span>
                    <span>•</span>
                    <span>{formatDate(fileItem.uploadedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center p-4 border-t md:border-t-0 md:border-l border-border">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={fileItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileSymlink className="h-4 w-4" />
                    <span className="sr-only">View file</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={fileItem.url}
                    download={fileItem.file.name}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download file</span>
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(fileItem.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete file</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilesTab;
