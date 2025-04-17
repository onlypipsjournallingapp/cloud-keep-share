
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, Edit, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

type SavedLink = {
  id: string;
  url: string;
  description: string | null;
  created_at: string;
};

const LinksTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(error.message);
        return [];
      }
      return data;
    },
  });

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const createLink = useMutation({
    mutationFn: async () => {
      if (!user || !isValidUrl(url)) throw new Error("Invalid URL or user not authenticated");
      
      const { error } = await supabase.from('links').insert({
        url: url.trim(),
        description: description.trim() || null,
        user_id: user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setUrl("");
      setDescription("");
      toast.success("Link saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateLink = useMutation({
    mutationFn: async () => {
      if (!editingId || !user || !isValidUrl(url)) 
        throw new Error("Invalid operation");
      
      const { error } = await supabase
        .from('links')
        .update({
          url: url.trim(),
          description: description.trim() || null,
        })
        .eq('id', editingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      setUrl("");
      setDescription("");
      setEditingId(null);
      toast.success("Link updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      if (editingId) {
        setUrl("");
        setDescription("");
        setEditingId(null);
      }
      toast.success("Link deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEditLink = (link: SavedLink) => {
    setUrl(link.url);
    setDescription(link.description || "");
    setEditingId(link.id);
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p>Loading links...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Link" : "Add New Link"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Description (optional)"
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setUrl("");
              setDescription("");
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => editingId ? updateLink.mutate() : createLink.mutate()}
            disabled={!url.trim() || !isValidUrl(url)}
          >
            {editingId ? "Update Link" : "Add Link"}
          </Button>
        </CardFooter>
      </Card>

      {links.length === 0 ? (
        <div className="text-center p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Link className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No links saved</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Add your first link to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Card key={link.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <span className="truncate flex-1">{getHostname(link.url)}</span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open link</span>
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {link.url}
                </a>
                {link.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {link.description}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditLink(link)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteLink.mutate(link.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LinksTab;
