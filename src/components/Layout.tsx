import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotesTab from "@/components/tabs/NotesTab";
import LinksTab from "@/components/tabs/LinksTab";
import FilesTab from "@/components/tabs/FilesTab";
import MediaTab from "@/components/tabs/MediaTab";
import { FileText, Link, Image, StickyNote } from "lucide-react";
const Layout = () => {
  return <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">CloudKeepShare</h1>
        <ThemeToggle />
      </div>
      
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="notes">
            <StickyNote className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="links" className="text-sky-300 text-3xl">
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
      </Tabs>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>CloudKeepShare - Access your content from any device</p>
      </div>
    </div>;
};
export default Layout;