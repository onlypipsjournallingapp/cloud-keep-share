
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, Edit, Trash2, ExternalLink } from "lucide-react";

type SavedLink = {
  id: string;
  url: string;
  description: string;
  createdAt: Date;
};

const LinksTab = () => {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCreateLink = () => {
    if (!url.trim() || !isValidUrl(url)) return;
    
    const newLink: SavedLink = {
      id: Date.now().toString(),
      url: url.trim(),
      description: description.trim(),
      createdAt: new Date(),
    };
    
    setLinks([newLink, ...links]);
    setUrl("");
    setDescription("");
  };

  const handleEditLink = (link: SavedLink) => {
    setUrl(link.url);
    setDescription(link.description);
    setEditingId(link.id);
  };

  const handleUpdateLink = () => {
    if (!url.trim() || !isValidUrl(url) || !editingId) return;
    
    setLinks(
      links.map((link) =>
        link.id === editingId
          ? { ...link, url: url.trim(), description: description.trim() }
          : link
      )
    );
    
    setUrl("");
    setDescription("");
    setEditingId(null);
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
    
    if (editingId === id) {
      setUrl("");
      setDescription("");
      setEditingId(null);
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

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
            onClick={editingId ? handleUpdateLink : handleCreateLink}
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
                  onClick={() => handleDeleteLink(link.id)}
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
