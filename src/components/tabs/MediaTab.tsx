
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Video, Eye, Download, Trash2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type MediaItem = {
  id: string;
  file: File;
  type: "image" | "video";
  uploadedAt: Date;
  url: string; // This would be a server URL in a real app
};

const MediaTab = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);

  const handleFilesAdded = (newFiles: File[]) => {
    const mediaFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    if (mediaFiles.length === 0) return;

    const newMediaItems = mediaFiles.map(file => {
      const fileType = file.type.startsWith("image/") ? "image" as const : "video" as const;
      return {
        id: Date.now() + "-" + file.name,
        file,
        type: fileType,
        uploadedAt: new Date(),
        url: URL.createObjectURL(file) // In a real app, this would be a server URL
      };
    });

    setMedia(prev => [...newMediaItems, ...prev]);
  };

  const handleDelete = (id: string) => {
    const itemToDelete = media.find(item => item.id === id);
    if (itemToDelete) {
      URL.revokeObjectURL(itemToDelete.url);
    }
    setMedia(media.filter(item => item.id !== id));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const images = media.filter(item => item.type === "image");
  const videos = media.filter(item => item.type === "video");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Media</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUploader
            onFilesAdded={handleFilesAdded}
            acceptedFileTypes={["image/jpeg", "image/png", "video/mp4", "video/quicktime"]}
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

          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {renderMediaItems(media, handleDelete)}
            </div>
          </TabsContent>

          <TabsContent value="images">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {renderMediaItems(images, handleDelete)}
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {renderMediaItems(videos, handleDelete)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Helper function to format date
const formatMediaDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

function renderMediaItems(items: MediaItem[], onDelete: (id: string) => void) {
  if (items.length === 0) {
    return (
      <div className="text-center p-6 col-span-full">
        <p className="text-sm text-muted-foreground">No items to display</p>
      </div>
    );
  }

  return items.map((item) => (
    <Card key={item.id} className="overflow-hidden">
      <div className="aspect-video relative bg-muted">
        {item.type === "image" ? (
          <img
            src={item.url}
            alt={item.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={item.url}
            controls
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate">{item.file.name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatMediaDate(item.uploadedAt)}
        </p>
        <div className="flex justify-between mt-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href={item.url}
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
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  ));
}

export default MediaTab;
