
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Video, Eye, Trash2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type MediaItem = {
  id: string;
  filename: string;
  file_type: string;
  storage_path: string;
  created_at: string;
};

const MediaTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .or('file_type.ilike.image/%,file_type.ilike.video/%')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(error.message);
        return [];
      }
      return data;
    },
  });

  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated");

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
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success("Media uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMedia = useMutation({
    mutationFn: async (file: MediaItem) => {
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
      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast.success("Media deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFilesAdded = (newFiles: File[]) => {
    const mediaFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    if (mediaFiles.length === 0) {
      toast.error("Only image and video files are accepted");
      return;
    }

    mediaFiles.forEach(file => {
      uploadMedia.mutate(file);
    });
  };

  const getMediaUrl = async (path: string) => {
    const { data } = await supabase.storage
      .from('user-files')
      .getPublicUrl(path);
    
    return data.publicUrl;
  };

  const images = media.filter(item => item.file_type.startsWith("image/"));
  const videos = media.filter(item => item.file_type.startsWith("video/"));

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p>Loading media...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            onFilesAdded={handleFilesAdded}
            acceptedFileTypes={["image/*", "video/*"]}
            dropzoneText="Drag and drop images or videos here, or click to select files"
          />
        </CardContent>
      </Card>

      {media.length === 0 ? (
        <div className="text-center p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Image className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No media uploaded</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Upload your images and videos to get started
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({media.length})</TabsTrigger>
            <TabsTrigger value="images">Images ({images.length})</TabsTrigger>
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <MediaCard key={item.id} item={item} onDelete={deleteMedia.mutate} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="images" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {images.map((item) => (
                <MediaCard key={item.id} item={item} onDelete={deleteMedia.mutate} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((item) => (
                <MediaCard key={item.id} item={item} onDelete={deleteMedia.mutate} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const MediaCard = ({ item, onDelete }: { item: MediaItem; onDelete: (item: MediaItem) => void }) => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  React.useEffect(() => {
    const loadMediaUrl = async () => {
      const url = await supabase.storage
        .from('user-files')
        .getPublicUrl(item.storage_path);
      setMediaUrl(url.data.publicUrl);
    };
    loadMediaUrl();
  }, [item.storage_path]);

  const isImage = item.file_type.startsWith("image/");

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        {mediaUrl && (
          isImage ? (
            <img
              src={mediaUrl}
              alt={item.filename}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              className="w-full h-full object-contain"
            />
          )
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{item.filename}</p>
        <div className="flex justify-between mt-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href={mediaUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </a>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MediaTab;
