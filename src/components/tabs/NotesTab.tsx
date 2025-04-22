
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Maximize } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
};

const NotesTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for the view full note dialog
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error(error.message);
        return [];
      }
      return data;
    },
  });

  const createNote = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from('notes').insert({
        title: title.trim(),
        content: content.trim(),
        user_id: user.id
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTitle("");
      setContent("");
      toast.success("Note created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateNote = useMutation({
    mutationFn: async () => {
      if (!editingId || !user) throw new Error("Invalid operation");
      
      const { error } = await supabase
        .from('notes')
        .update({
          title: title.trim(),
          content: content.trim(),
        })
        .eq('id', editingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setTitle("");
      setContent("");
      setEditingId(null);
      toast.success("Note updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (editingId) {
        setTitle("");
        setContent("");
        setEditingId(null);
      }
      toast.success("Note deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEditNote = (note: Note) => {
    setTitle(note.title);
    setContent(note.content || "");
    setEditingId(note.id);
  };
  
  const handleViewFullNote = (note: Note) => {
    setViewingNote(note);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <p>Loading notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Note" : "Create New Note"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Note content"
              className="min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoExpand={true}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setTitle("");
              setContent("");
              setEditingId(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => editingId ? updateNote.mutate() : createNote.mutate()}
            disabled={!title.trim()}
          >
            {editingId ? "Update Note" : "Add Note"}
          </Button>
        </CardFooter>
      </Card>

      {notes.length === 0 ? (
        <div className="text-center p-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium">No notes yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first note to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <CardTitle className="line-clamp-1">{note.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {note.content || "No content"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewFullNote(note)}
                >
                  <Maximize className="h-4 w-4 mr-2" />
                  View Full
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditNote(note)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteNote.mutate(note.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Full Note View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">{viewingNote?.title}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="flex-1 my-4">
            <div className="p-2 whitespace-pre-wrap">
              {viewingNote?.content || "No content"}
            </div>
          </ScrollArea>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                if (viewingNote) {
                  handleEditNote(viewingNote);
                  setIsViewDialogOpen(false);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesTab;
