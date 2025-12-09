import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../firebase/firestore';

interface ChangeAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoURL?: string;
  onSuccess?: () => void;
}

export function ChangeAvatarDialog({ open, onOpenChange, currentPhotoURL, onSuccess }: ChangeAvatarDialogProps) {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
      
      console.log('🔵 Uploading avatar to:', `avatars/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      
      // Get download URL
      console.log('🔵 Getting download URL...');
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Download URL:', downloadURL);
      
      // Update user profile
      console.log('🔵 Updating user profile...');
      await updateUserProfile(currentUser.uid, {
        photoURL: downloadURL
      });

      toast.success('Avatar updated successfully!');
      onSuccess?.();
      onOpenChange(false);
      
      // Reset state
      setSelectedFile(null);
      setPreview(null);
    } catch (error: any) {
      console.error('❌ Error uploading avatar:', error);
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
        toast.error('Failed to update avatar. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setPreview(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-[#151923] border-[#151923]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#22C55E]" />
            Change Profile Picture
          </DialogTitle>
          <DialogDescription>
            Upload a new profile picture. Maximum file size: 5MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[#0B0B0F] border-2 border-[#22C55E]/20">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : currentPhotoURL ? (
                  <img src={currentPhotoURL} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>
              {preview && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>

          {/* File Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#22C55E]/30 rounded-lg hover:border-[#22C55E]/50 transition-colors bg-[#0B0B0F]/30">
                <Upload className="w-5 h-5 text-[#22C55E]" />
                <span className="text-sm text-gray-400">
                  {selectedFile ? selectedFile.name : 'Click to select an image'}
                </span>
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Supported formats: JPG, PNG, GIF, WebP</p>
            <p>• Recommended size: 400x400px</p>
            <p>• Maximum file size: 5MB</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
            className="bg-transparent border-gray-700 hover:bg-[#0B0B0F]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="bg-[#22C55E] hover:bg-[#22C55E]/90"
          >
            {uploading ? 'Uploading...' : 'Upload Avatar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}