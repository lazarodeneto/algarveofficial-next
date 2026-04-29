import { useState, useRef } from "react";
import { DashboardBreadcrumb } from "@/components/ui/dashboard-breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  Search, 
  Image, 
  Video, 
  Trash2, 
  MoreVertical,
  Eye,
  Copy,
  Download,
  FolderOpen,
  Grid3X3,
  List,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMediaLibrary, type MediaItem } from "@/hooks/useMediaLibrary";
import { resolveSupabaseBucketImageUrl } from "@/lib/imageUrls";

type ViewMode = 'grid' | 'list';
type MediaCategory = 'all' | 'hero' | 'region' | 'city' | 'listing' | 'page' | 'general';

export default function AdminMediaLibrary() {
  const { media, isLoading, uploadMedia, isUploading, deleteMedia, isDeleting } = useMediaLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<string>("general");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.folder === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const imageCount = media.filter(m => m.file_type === 'image').length;
  const videoCount = media.filter(m => m.file_type === 'video').length;
  const totalSize = media.reduce((acc, m) => acc + (m.file_size || 0), 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resolveMediaPreviewUrl = (value?: string | null) =>
    resolveSupabaseBucketImageUrl(value, "media") ?? value ?? undefined;

  const handleUploadClick = () => {
    setIsUploadOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    for (const file of selectedFiles) {
      uploadMedia({ file, folder: uploadFolder });
    }

    setSelectedFiles([]);
    setIsUploadOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: string) => {
    deleteMedia(id);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleViewDetails = (item: MediaItem) => {
    setSelectedMedia(item);
    setIsDetailOpen(true);
  };

  const categories: { value: MediaCategory; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'hero', label: 'Hero' },
    { value: 'region', label: 'Regions' },
    { value: 'city', label: 'Cities' },
    { value: 'listing', label: 'Listings' },
    { value: 'page', label: 'Pages' },
    { value: 'general', label: 'General' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-2xl font-serif font-normal text-foreground mt-2">Media Library</h1>
          <p className="text-muted-foreground">Manage images and videos</p>
        </div>
        <Button onClick={handleUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{imageCount}</p>
              <p className="text-sm text-muted-foreground">Images</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{videoCount}</p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatFileSize(totalSize)}</p>
              <p className="text-sm text-muted-foreground">Total Size</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {/* Category Filter */}
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "h-7 px-2 text-xs",
                  selectedCategory === cat.value && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", viewMode === 'grid' && "bg-muted")}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-7 w-7", viewMode === 'list' && "bg-muted")}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <Card 
              key={item.id} 
              className="border-border bg-card/50 overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => handleViewDetails(item)}
            >
              <div className="aspect-square bg-muted relative">
                {item.file_type === 'image' ? (
                  <img
                    src={resolveMediaPreviewUrl(item.file_url)}
                    alt={item.alt_text || item.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Video className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.file_url); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleViewDetails(item); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                {/* Type Badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 left-2 text-xs capitalize"
                >
                  {item.folder || 'general'}
                </Badge>
              </div>
              <CardContent className="p-2">
                <p className="text-xs text-foreground truncate">{item.file_name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(item.file_size || 0)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border bg-card/50">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(item)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.file_type === 'image' ? (
                      <img
                        src={resolveMediaPreviewUrl(item.file_url)}
                        alt={item.alt_text || item.file_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.file_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">{item.file_type}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{item.folder || 'general'}</Badge>
                      <span className="text-xs text-muted-foreground">{formatFileSize(item.file_size || 0)}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </p>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.file_url); }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.file_url, '_blank'); }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="text-destructive focus:text-destructive"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No media found</h3>
          <p className="text-muted-foreground mb-4">Upload your first file to get started</p>
          <Button onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
            <DialogDescription>
              Upload images or videos to the media library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select value={uploadFolder} onValueChange={setUploadFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="region">Regions</SelectItem>
                  <SelectItem value="city">Cities</SelectItem>
                  <SelectItem value="listing">Listings</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Files</Label>
              <Input
                id="files"
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {selectedFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadFiles} disabled={isUploading || selectedFiles.length === 0}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
            <DialogDescription>
              View and manage media file information
            </DialogDescription>
          </DialogHeader>

          {selectedMedia && (
            <div className="space-y-4 py-4">
              {/* Preview */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {selectedMedia.file_type === 'image' ? (
                  <img
                    src={resolveMediaPreviewUrl(selectedMedia.file_url)}
                    alt={selectedMedia.alt_text || selectedMedia.file_name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video 
                    src={selectedMedia.file_url} 
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">File Name</p>
                  <p className="font-medium text-foreground">{selectedMedia.file_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium text-foreground capitalize">{selectedMedia.file_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium text-foreground">{formatFileSize(selectedMedia.file_size || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Folder</p>
                  <p className="font-medium text-foreground capitalize">{selectedMedia.folder || 'general'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(selectedMedia.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {selectedMedia.alt_text && (
                  <div>
                    <p className="text-sm text-muted-foreground">Alt Text</p>
                    <p className="font-medium text-foreground">{selectedMedia.alt_text}</p>
                  </div>
                )}
              </div>

              {/* URL */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">URL</p>
                <div className="flex gap-2">
                  <Input 
                    value={selectedMedia.file_url} 
                    readOnly 
                    className="bg-background text-sm"
                  />
                  <Button variant="outline" onClick={() => handleCopyUrl(selectedMedia.file_url)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedMedia && (
              <>
                <Button variant="outline" onClick={() => window.open(selectedMedia.file_url, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => { handleDelete(selectedMedia.id); setIsDetailOpen(false); }}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
