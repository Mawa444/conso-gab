import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Paperclip, 
  Image, 
  FileText, 
  Video, 
  Music,
  X,
  Upload,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFileSize?: number; // en MB
  allowedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  preview?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxFileSize = 10,
  allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', '.doc', '.docx'],
  multiple = true,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('audio/')) return Music;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    // Vérifier la taille
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Le fichier ${file.name} est trop volumineux (max ${maxFileSize}MB)`;
    }

    // Vérifier le type
    const isAllowed = allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isAllowed) {
      return `Le type de fichier ${file.name} n'est pas supporté`;
    }

    return null;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      // Afficher les erreurs (vous pouvez utiliser un toast ici)
      console.error('Erreurs de validation:', errors);
    }

    if (validFiles.length > 0) {
      startUploads(validFiles);
      onFileSelect(validFiles);
    }
  };

  const startUploads = (files: File[]) => {
    const newUploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Simuler l'upload (remplacer par la vraie logique d'upload)
    newUploads.forEach((upload, index) => {
      simulateUpload(upload, index);
    });
  };

  const simulateUpload = (upload: UploadProgress, index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, progress: 100, status: 'success' }
            : u
        ));
      } else {
        setUploads(prev => prev.map(u => 
          u.file === upload.file 
            ? { ...u, progress }
            : u
        ));
      }
    }, 200);
  };

  const removeUpload = (file: File) => {
    setUploads(prev => {
      const upload = prev.find(u => u.file === file);
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter(u => u.file !== file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Zone de drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
          isDragging 
            ? "border-primary-500 bg-primary-50" 
            : "border-mimo-gray-300 hover:border-mimo-gray-400"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className={cn(
          "w-8 h-8 mx-auto mb-2",
          isDragging ? "text-primary-500" : "text-mimo-gray-400"
        )} />
        
        <p className="text-sm font-medium text-mimo-gray-700">
          {isDragging ? "Déposez vos fichiers ici" : "Cliquez ou glissez vos fichiers"}
        </p>
        
        <p className="text-xs text-mimo-gray-500 mt-1">
          Max {maxFileSize}MB • {allowedTypes.includes('image/*') && 'Images, '}
          {allowedTypes.includes('video/*') && 'Vidéos, '}
          {allowedTypes.includes('audio/*') && 'Audio, '}
          Documents
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Liste des uploads en cours */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => {
            const IconComponent = getFileIcon(upload.file);
            
            return (
              <div 
                key={`${upload.file.name}-${index}`}
                className="flex items-center gap-3 p-3 bg-mimo-gray-50 rounded-lg"
              >
                {/* Prévisualisation ou icône */}
                <div className="flex-shrink-0">
                  {upload.preview ? (
                    <img 
                      src={upload.preview}
                      alt={upload.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-mimo-gray-200 rounded flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-mimo-gray-500" />
                    </div>
                  )}
                </div>
                
                {/* Informations du fichier */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-mimo-gray-900 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-mimo-gray-500">
                    {formatFileSize(upload.file.size)}
                  </p>
                  
                  {upload.status === 'uploading' && (
                    <div className="mt-1">
                      <Progress value={upload.progress} className="h-1" />
                      <p className="text-xs text-mimo-gray-500 mt-1">
                        {Math.round(upload.progress)}%
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Statut et actions */}
                <div className="flex items-center gap-2">
                  {upload.status === 'success' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeUpload(upload.file)}
                    className="w-6 h-6 p-0 hover:bg-mimo-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Composant bouton rapide pour l'upload
export const QuickFileButton: React.FC<{
  onFileSelect: (files: File[]) => void;
  type?: 'image' | 'document' | 'all';
  className?: string;
}> = ({ onFileSelect, type = 'all', className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getAcceptTypes = () => {
    switch (type) {
      case 'image': return 'image/*';
      case 'document': return '.pdf,.doc,.docx,.txt';
      default: return 'image/*,video/*,audio/*,.pdf,.doc,.docx';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'image': return Image;
      case 'document': return FileText;
      default: return Paperclip;
    }
  };

  const IconComponent = getIcon();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className={cn("p-2", className)}
      >
        <IconComponent className="w-4 h-4" />
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptTypes()}
        onChange={(e) => {
          if (e.target.files) {
            onFileSelect(Array.from(e.target.files));
          }
        }}
        className="hidden"
      />
    </>
  );
};