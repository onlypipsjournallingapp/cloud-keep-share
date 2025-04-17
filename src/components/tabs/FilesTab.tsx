
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type FileItem = {
  id: string;
  filename: string;
  file_type: string;
  size_bytes: number | null;
  created_at: string;
  storage_path: string;
};

const FilesTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(error.message);
        return [];
      }
      return data;
    },
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated");

      const fileExt = file.name.split('.').pop();
      const storagePath = `${user.id}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Save file metadata
      const { error: dbError } = await supabase.from('files').insert({
        filename: file.name,
        file_type: file.type,
        size_bytes: file.size,
        storage_path: storagePath,
        user_id: user.id
      });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success("File uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (file: FileItem) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete metadata
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFilesAdded = (newFiles: File[]) => {
    const pdfFiles = newFiles.filter(file => 
      file.type === "application/pdf" || 
      file.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      toast.error("Only PDF files are accepted");
      return;
    }

    pdfFiles.forEach(file => {
      uploadFile.mutate(file);
    });
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(file.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p>Loading files...</p>
      </div>
    );
  }

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
          {files.map((file) => (
            <Card key={file.id} className="flex flex-col md:flex-row md:items-center">
              <div className="flex items-center p-4 flex-1">
                <div className="bg-primary/10 p-2 rounded mr-3">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{file.filename}</h3>
                  <div className="flex text-xs text-muted-foreground mt-1">
                    <span>{formatFileSize(file.size_bytes)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center p-4 border-t md:border-t-0 md:border-l border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(file)}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download file</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteFile.mutate(file)}
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
