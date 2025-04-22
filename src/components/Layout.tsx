
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotesTab from "@/components/tabs/NotesTab";
import LinksTab from "@/components/tabs/LinksTab";
import FilesTab from "@/components/tabs/FilesTab";
import MediaTab from "@/components/tabs/MediaTab";
import ToDoTab from "@/components/tabs/ToDoTab";
import { FileText, Link, Image, StickyNote, LogOut, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">CloudKeepShare</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="notes">
            <StickyNote className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="links">
            <Link className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Links</span>
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Files</span>
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
          <TabsTrigger value="todo">
            <ListTodo className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">To-Do List</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notes" className="space-y-4">
          <NotesTab />
        </TabsContent>
        
        <TabsContent value="links" className="space-y-4">
          <LinksTab />
        </TabsContent>
        
        <TabsContent value="files" className="space-y-4">
          <FilesTab />
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4">
          <MediaTab />
        </TabsContent>

        <TabsContent value="todo" className="space-y-4">
          <ToDoTab />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>CloudKeepShare - Access your content from any device</p>
      </div>
    </div>
  );
};

export default Layout;
