import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/firestore';

interface ChangeCoverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCover?: string;
  onUpdate: (coverUrl: string) => void;
}

export function ChangeCoverDialog({ open, onOpenChange, currentCover, onUpdate }: ChangeCoverDialogProps) {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;

    setUploading(true);
    try {
      // Create a reference to the storage location
      const fileExtension = selectedFile.name.split('.').pop();
      const fileName = `cover_${currentUser.uid}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `covers/${fileName}`);

      console.log('🔵 Uploading cover photo to:', `covers/${fileName}`);
      
      // Upload the file
      await uploadBytes(storageRef, selectedFile);

      console.log('🔵 Getting download URL...');
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('✅ Download URL:', downloadUrl);

      console.log('🔵 Updating user profile...');
      
      // Update user profile with new cover URL
      await updateUserProfile(currentUser.uid, {
        coverPhoto: downloadUrl
      });

      onUpdate(downloadUrl);
      toast.success('Cover photo updated successfully!');
      onOpenChange(false);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('❌ Error uploading cover photo:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      
      // Specific error messages
      if (error?.code === 'storage/unauthorized') {
        toast.error('Permission denied. Please check Firebase Storage rules.');
      } else if (error?.code === 'storage/canceled') {
        toast.error('Upload canceled.');
      } else if (error?.code === 'storage/unknown') {
        toast.error('Unknown error occurred. Please try again.');
      } else {
        toast.error('Failed to upload cover photo. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Cover Photo</DialogTitle>
          <DialogDescription className="text-gray-400">
            Upload a new cover photo for your profile. Recommended size: 1200x400px
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Area */}
          <div className="relative w-full h-48 bg-[#0B0B0F] rounded-xl border-2 border-dashed border-white/10 overflow-hidden">
            {previewUrl ? (
              <>
                <img 
                  src={previewUrl} 
                  alt="Cover preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-[#151923]/90 hover:bg-[#151923]"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : currentCover ? (
              <img 
                src={currentCover} 
                alt="Current cover" 
                className="w-full h-full object-cover opacity-50"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ImageIcon className="w-12 h-12 mb-2" />
                <p className="text-sm">No cover photo</p>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="cover-upload" className="text-gray-400">
              Select Cover Photo
            </Label>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-white hover:border-[#22C55E]/30"
                onClick={() => document.getElementById('cover-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {selectedFile && (
              <div className="text-sm text-gray-400 bg-[#0B0B0F] p-3 rounded-lg">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-white/10"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Cover'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}