import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Video, 
  FileText, 
  Book, 
  Users, 
  Settings,
  Eye,
  Upload,
  Link as LinkIcon,
  X,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { chaptersAPI } from '../../services/chapters';
import { chapterResourcesAPI } from '../../services/chapterResources';
import PDFViewer from '../../components/PDFViewer';
import type { ChapterResource } from '../../types';

const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['svadhyay', 'svadhyay_pothi', 'other']),
  resourceType: z.enum(['video', 'pdf']),
  url: z.string().optional(),
  fileName: z.string().optional(),
}).refine((data) => {
  // For videos, URL is required and must be a valid YouTube URL
  if (data.resourceType === 'video') {
    if (!data.url) {
      return false;
    }
    // Updated regex to handle all YouTube URL formats including youtu.be with query parameters
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+(\?[\w=&-]*)?$/;
    return youtubeRegex.test(data.url);
  }
  
  // For PDFs, either URL or fileName should be present (handled in form logic)
  return true;
}, {
  message: 'Please provide a valid YouTube URL for video resources',
  path: ['url'],
});

type ResourceFormData = z.infer<typeof resourceSchema>;

const ResourceTypeIcon = ({ type }: { type: 'svadhyay' | 'svadhyay_pothi' | 'other' }) => {
  switch (type) {
    case 'svadhyay':
      return <Book className="w-5 h-5 text-blue-500" />;
    case 'svadhyay_pothi':
      return <Users className="w-5 h-5 text-green-500" />;
    case 'other':
      return <Settings className="w-5 h-5 text-gray-500" />;
    default:
      return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const ResourceCard = ({ 
  resource, 
  onEdit, 
  onDelete,
  onPreview,
  onRemoveFile
}: { 
  resource: ChapterResource; 
  onEdit: (resource: ChapterResource) => void;
  onDelete: (id: string) => void;
  onPreview: (resource: ChapterResource) => void;
  onRemoveFile: (resource: ChapterResource) => void;
}) => {
  const hasUploadedFile = resource.fileName && resource.url;
  const hasExternalUrl = resource.url && !resource.fileName;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Header with Type Icons */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <ResourceTypeIcon type={resource.type} />
            {resource.resourceType === 'video' ? (
              <div className="flex items-center space-x-1">
                <Video className="w-4 h-4 text-red-500" />
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">વિડિયો</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">PDF</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Resource Title and Description */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
        {resource.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{resource.description}</p>
        )}
      </div>
      
      {/* Resource Status and File Info */}
      <div className="space-y-3">
        {/* Category Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
            {resource.type.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(resource.createdAt).toLocaleDateString('gu-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        
        {/* File Status */}
        <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {hasUploadedFile ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">અપલોડ કરેલ ફાઇલ</span>
                  <button
                    onClick={() => onRemoveFile(resource)}
                    className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                    title="ફાઇલ દૂર કરો"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : hasExternalUrl ? (
                <>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-700">બાહ્ય લિંક</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-amber-700">સામગ્રી નથી</span>
                </>
              )}
            </div>
            
            {(hasUploadedFile || hasExternalUrl) && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>ખોલો</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="space-y-2">
          <button
            onClick={() => onPreview(resource)}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>પૂર્વાવલોકન</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(resource)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>સંપાદિત કરો</span>
            </button>
            
            <button
              onClick={() => onDelete(resource.id)}
              className="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>દૂર કરો</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChapterResourcesPage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ChapterResource | null>(null);
  const [previewResource, setPreviewResource] = useState<ChapterResource | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chapter } = useQuery({
    queryKey: ['chapter', chapterId],
    queryFn: () => chaptersAPI.getById(chapterId!),
    enabled: !!chapterId,
  });

  const { data: resourcesData } = useQuery({
    queryKey: ['chapter-resources-grouped', chapterId],
    queryFn: () => chapterResourcesAPI.getByChapterGrouped(chapterId!),
    enabled: !!chapterId,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: any; file?: File }) => 
      chapterResourcesAPI.create(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-resources-grouped', chapterId] });
      setIsModalOpen(false);
      reset();
      toast.success('Resource created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create resource');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, file }: { id: string; data: Partial<ResourceFormData>; file?: File }) =>
      chapterResourcesAPI.update(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-resources-grouped', chapterId] });
      setIsModalOpen(false);
      setEditingResource(null);
      reset();
      toast.success('Resource updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update resource');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: chapterResourcesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-resources-grouped', chapterId] });
      toast.success('Resource deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete resource');
    },
  });

  const removeFileMutation = useMutation({
    mutationFn: chapterResourcesAPI.removeFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-resources-grouped', chapterId] });
      toast.success('File removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to remove file');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
  });

  const onSubmit = (data: ResourceFormData) => {
    // Additional validation for videos - must have YouTube URL
    if (data.resourceType === 'video' && !data.url) {
      toast.error('YouTube URL is required for video resources');
      return;
    }

    // Additional validation for PDFs - must have either URL or uploaded file
    if (data.resourceType === 'pdf') {
      if (uploadMode === 'url' && !data.url) {
        toast.error('Please provide a PDF URL');
        return;
      }
      if (uploadMode === 'file' && (!data.url || !data.fileName)) {
        toast.error('Please upload a PDF file');
        return;
      }
    }

    // Get the actual file if one was selected
    const selectedFile = fileInputRef.current?.files?.[0];
    
    const submitData = {
      ...data,
      chapterId: chapterId!,
      url: data.url || '',
    };

    if (editingResource) {
      // For updates, pass the file if a new one was selected
      updateMutation.mutate({ 
        id: editingResource.id, 
        data: submitData,
        file: selectedFile 
      });
    } else {
      // For creation, pass the file if one was selected
      createMutation.mutate({
        data: submitData,
        file: selectedFile
      });
    }
  };

  const handleEdit = (resource: ChapterResource) => {
    setEditingResource(resource);
    setValue('title', resource.title);
    setValue('description', resource.description || '');
    setValue('type', resource.type);
    setValue('resourceType', resource.resourceType);
    setValue('url', resource.url);
    setValue('fileName', resource.fileName || '');
    
    // Set upload mode based on resource type and whether it has fileName
    if (resource.resourceType === 'video') {
      setUploadMode('url'); // Videos are always URL mode (YouTube)
    } else {
      // For PDFs, check if it's an uploaded file or URL
      setUploadMode(resource.fileName ? 'file' : 'url');
    }
    
    // Close preview modal and open edit modal
    setPreviewResource(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRemoveFile = (resource: ChapterResource) => {
    if (!resource.fileName) {
      toast.error('This resource has no uploaded file to remove');
      return;
    }
    
    if (window.confirm(`Are you sure you want to remove the uploaded file from "${resource.title}"? The resource will remain but without the file content.`)) {
      removeFileMutation.mutate(resource.id);
    }
  };

  const handlePreview = (resource: ChapterResource) => {
    setPreviewResource(resource);
  };

  const openCreateModal = () => {
    setEditingResource(null);
    reset();
    setUploadMode('url');
    setIsModalOpen(true);
  };

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 px-4">
        <div className="text-center max-w-xs mx-auto">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-purple-700 mb-2">લોડ થઈ રહ્યું છે...</h3>
          <p className="text-sm text-gray-600">કૃપા કરીને થોડી રાહ જુઓ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            પાછા જાઓ
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {chapter.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                પ્રકરણ માટે અધ્યયન સામગ્રી સંચાલિત કરો અને નવા સંસાધનો ઉમેરો
              </p>
              {resourcesData && (
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Book className="w-3 h-3 mr-1" />
                    સ્વાધ્યાય: {resourcesData.resources?.svadhyay?.length || 0}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Users className="w-3 h-3 mr-1" />
                    સ્વાધ્યાય પોથી: {resourcesData.resources?.svadhyay_pothi?.length || 0}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Settings className="w-3 h-3 mr-1" />
                    અન્ય: {resourcesData.resources?.other?.length || 0}
                  </span>
                </div>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="sm:hidden">
              <button
                onClick={openCreateModal}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center z-40"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-3">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                નવું સંસાધન ઉમેરો
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {resourcesData && (
          <div className="space-y-6 sm:space-y-8">
            {/* Svadhyay Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Book className="w-5 h-5 text-blue-600" />
                </div>
                <span>સ્વાધ્યાય ({resourcesData.resources?.svadhyay?.length || 0})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {resourcesData.resources?.svadhyay?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    onRemoveFile={handleRemoveFile}
                  />
                )) || []}
                {(!resourcesData.resources?.svadhyay || resourcesData.resources.svadhyay.length === 0) && (
                  <div className="col-span-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 text-center border border-blue-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Book className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">સ્વાધ્યાય સંસાધનો નથી</h3>
                    <p className="text-gray-600 mb-4">આ પ્રકરણ માટે સ્વાધ્યાય સંસાધનો ઉમેરો</p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      પહેલું સંસાધન ઉમેરો
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Svadhyay Pothi Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <span>સ્વાધ્યાય પોથી ({resourcesData.resources?.svadhyay_pothi?.length || 0})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {resourcesData.resources?.svadhyay_pothi?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    onRemoveFile={handleRemoveFile}
                  />
                )) || []}
                {(!resourcesData.resources?.svadhyay_pothi || resourcesData.resources.svadhyay_pothi.length === 0) && (
                  <div className="col-span-full bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 text-center border border-green-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">સ્વાધ્યાય પોથી સંસાધનો નથી</h3>
                    <p className="text-gray-600 mb-4">આ પ્રકરણ માટે સ્વાધ્યાય પોથી સંસાધનો ઉમેરો</p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      પહેલું સંસાધન ઉમેરો
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Other Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <span>અન્ય ({resourcesData.resources?.other?.length || 0})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {resourcesData.resources?.other?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    onRemoveFile={handleRemoveFile}
                  />
                )) || []}
                {(!resourcesData.resources?.other || resourcesData.resources.other.length === 0) && (
                  <div className="col-span-full bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">અન્ય સંસાધનો નથી</h3>
                    <p className="text-gray-600 mb-4">આ પ્રકરણ માટે અન્ય સંસાધનો ઉમેરો</p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      પહેલું સંસાધન ઉમેરો
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overall Empty State */}
        {resourcesData && !resourcesData.resources && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              કોઈ સંસાધનો નથી
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              આ પ્રકરણ માટે પહેલું સંસાધન ઉમેરીને શરૂઆત કરો અને વિદ્યાર્થીઓ માટે અધ્યયન સામગ્રી ઉપલબ્ધ કરાવો.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              પહેલું સંસાધન ઉમેરો
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Preview Modal with Edit/Delete Actions */}
      {previewResource && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <ResourceTypeIcon type={previewResource.type} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{previewResource.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                      {previewResource.resourceType === 'video' ? 'વિડિયો' : 'PDF'}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      {previewResource.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Edit Button */}
                <button
                  onClick={() => {
                    handleEdit(previewResource);
                    setPreviewResource(null);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  title="સંસાધન સંપાદિત કરો"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">સંપાદિત કરો</span>
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (window.confirm('શું તમે ખરેખર આ સંસાધન દૂર કરવા માગો છો?')) {
                      handleDelete(previewResource.id);
                      setPreviewResource(null);
                    }
                  }}
                  className="flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  title="સંસાધન દૂર કરો"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">દૂર કરો</span>
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="બંધ કરો"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Resource Description */}
            {previewResource.description && (
              <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b">
                <p className="text-sm text-gray-700 leading-relaxed">{previewResource.description}</p>
              </div>
            )}
            
            {/* Preview Content */}
            <div className="p-4 sm:p-6 h-[70vh]">
              {previewResource.resourceType === 'video' ? (
                <div className="h-full">
                  {previewResource.url.includes('youtube.com') || previewResource.url.includes('youtu.be') ? (
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden h-full shadow-lg">
                      <iframe
                        width="100%"
                        height="100%"
                        src={previewResource.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={previewResource.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="rounded-xl"
                        referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                      <div className="text-center">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium mb-4">વિડિયો પૂર્વાવલોકન ઉપલબ્ધ નથી</p>
                        <a
                          href={previewResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          વિડિયો ખોલો
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full bg-white rounded-xl shadow-inner">
                  <PDFViewer fileurl={previewResource.url} />
                </div>
              )}
            </div>
            
            {/* Resource Details Footer */}
            <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-blue-50 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>પ્રકાર: <span className="capitalize font-medium text-gray-900">{previewResource.type.replace('_', ' ')}</span></span>
                  {previewResource.fileName && (
                    <span>ફાઇલ: <span className="font-medium text-gray-900">{previewResource.fileName}</span></span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span>બનાવવામાં આવ્યું: <span className="font-medium">{new Date(previewResource.createdAt).toLocaleDateString('gu-IN')}</span></span>
                  <a
                    href={previewResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    નવી ટેબમાં ખોલો
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal with File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {editingResource ? 'સંસાધન સંપાદિત કરો' : 'નવું સંસાધન ઉમેરો'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    પ્રકરણ માટે વિડિયો અથવા PDF સંસાધન ઉમેરો
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingResource(null);
                    setUploadMode('url');
                    setUploadingFile(false);
                    reset();
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    શીર્ષક <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('title')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="સંસાધનનું શીર્ષક દાખલ કરો"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    વર્ણન
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    placeholder="સંસાધનનું વર્ણન દાખલ કરો (વૈકલ્પિક)"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      વર્ગ <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">વર્ગ પસંદ કરો</option>
                      <option value="svadhyay">સ્વાધ્યાય</option>
                      <option value="svadhyay_pothi">સ્વાધ્યાય પોથી</option>
                      <option value="other">અન્ય</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-600 text-sm mt-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      સંસાધનનો પ્રકાર <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('resourceType')}
                      onChange={(e) => {
                        // Auto-set upload mode based on resource type
                        if (e.target.value === 'video') {
                          setUploadMode('url'); // Videos are always URL mode
                        } else if (e.target.value === 'pdf') {
                          setUploadMode('url'); // Default to URL mode for PDFs
                        }
                        // Trigger the register onChange as well
                        register('resourceType').onChange(e);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">પ્રકાર પસંદ કરો</option>
                      <option value="video">વિડિયો</option>
                      <option value="pdf">PDF</option>
                    </select>
                    {errors.resourceType && (
                      <p className="text-red-600 text-sm mt-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.resourceType.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Upload Mode Toggle - Only for PDF */}
                {watch('resourceType') === 'pdf' && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 sm:p-6 border border-blue-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      PDF કેવી રીતે ઉમેરવું છે? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                          uploadMode === 'url'
                            ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <LinkIcon className="w-5 h-5 mr-2" />
                        Google Drive લિંક
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                          uploadMode === 'file'
                            ? 'border-purple-500 bg-purple-500 text-white shadow-lg transform scale-105'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        PDF અપલોડ કરો
                      </button>
                    </div>
                  </div>
                )}

                {/* URL Input - Different labels for Video vs PDF */}
                {(uploadMode === 'url' || watch('resourceType') === 'video') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {watch('resourceType') === 'video' ? 'YouTube URL' : 'PDF URL (Google Drive અથવા સીધી લિંક)'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {watch('resourceType') === 'video' ? (
                          <Video className="h-5 w-5 text-red-400" />
                        ) : (
                          <LinkIcon className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <input
                        {...register('url')}
                        type="url"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder={
                          watch('resourceType') === 'video' 
                            ? "https://www.youtube.com/watch?v=... અથવા https://youtu.be/..."
                            : "https://drive.google.com/... અથવા સીધી PDF લિંક"
                        }
                      />
                    </div>
                    {errors.url && (
                      <p className="text-red-600 text-sm mt-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {errors.url.message?.toString()}
                      </p>
                    )}
                  </div>
                )}

                {/* File Upload - Only for PDF */}
                {uploadMode === 'file' && watch('resourceType') === 'pdf' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload PDF File <span className="text-red-500">*</span>
                    </label>
                    
                    {/* Show current file if exists */}
                    {(editingResource?.fileName || watch('fileName')) && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="p-2 bg-green-100 rounded-full">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-green-800 mb-1">Current Uploaded File</h4>
                              <p className="text-sm text-green-700 truncate mb-2">
                                {editingResource?.fileName || watch('fileName')}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-green-600">
                                <span>📄 PDF Document</span>
                                {editingResource?.url && (
                                  <a
                                    href={editingResource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 hover:text-green-800 hover:underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>View File</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Remove current file? You will need to upload a new one or provide a URL.')) {
                                  if (editingResource) {
                                    // If editing, remove the file from the resource
                                    handleRemoveFile(editingResource);
                                  } else {
                                    // If creating, just clear the form values
                                    setValue('fileName', '');
                                    setValue('url', '');
                                    if (fileInputRef.current) {
                                      fileInputRef.current.value = '';
                                    }
                                    toast.success('File removed from form');
                                  }
                                }
                              }}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Remove current file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {editingResource && (
                          <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Uploading a new file will automatically replace this one
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size
                          if (file.size > 30 * 1024 * 1024) {
                            toast.error('File size must be less than 30MB');
                            e.target.value = ''; // Reset input
                            return;
                          }
                          
                          // Validate file type
                          if (file.type !== 'application/pdf') {
                            toast.error('Only PDF files are allowed');
                            e.target.value = ''; // Reset input
                            return;
                          }
                          
                          // If editing and there's an existing file, confirm replacement
                          if (editingResource?.fileName && editingResource.url) {
                            const confirmReplace = window.confirm(
                              `Replace existing file "${editingResource.fileName}" with "${file.name}"? The old file will be automatically deleted.`
                            );
                            if (!confirmReplace) {
                              e.target.value = ''; // Reset input
                              return;
                            }
                          }
                          
                          setUploadingFile(true);
                          try {
                            // Just prepare the file for submission
                            // The actual upload will happen in onSubmit
                            setValue('fileName', file.name);
                            // Set a placeholder URL to indicate file is ready
                            setValue('url', `file://${file.name}`);
                            
                            toast.success(`PDF "${file.name}" ready for upload`);
                          } catch (error: any) {
                            toast.error('File preparation failed');
                            console.error('File error:', error);
                            e.target.value = ''; // Reset input on error
                          } finally {
                            setUploadingFile(false);
                          }
                        }
                      }}
                      className="hidden"
                    />
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
                         onClick={() => !uploadingFile && fileInputRef.current?.click()}>
                      
                      {uploadingFile ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
                          <p className="text-sm font-medium text-blue-600 mb-1">Uploading PDF...</p>
                          <p className="text-xs text-gray-500">Please wait while we process your file</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-full mb-4 transition-colors duration-200">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">
                            {(editingResource?.fileName || watch('fileName')) ? 
                              'Click to replace PDF file' : 
                              'Click to upload PDF file'
                            }
                          </p>
                          <p className="text-xs text-gray-500 mb-3">
                            or drag and drop your PDF here
                          </p>
                          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              PDF files only
                            </span>
                            <span>•</span>
                            <span>Max 30MB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Live Preview Section */}
                {(watch('url') || editingResource) && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Resource Preview
                    </h4>
                    
                    {editingResource && editingResource.fileName && !watch('url') ? (
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Uploaded File</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this uploaded file? This will remove the file and you will need to upload a new one or provide a URL.')) {
                                setValue('fileName', '');
                                setValue('url', '');
                                toast.success('File removed. Please upload a new file or provide a URL.');
                              }
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete uploaded file"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{editingResource.fileName}</p>
                        <div className="h-32 bg-gray-100 rounded border-2 border-dashed flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                            <p className="text-xs text-gray-500">PDF Preview</p>
                          </div>
                        </div>
                      </div>
                    ) : watch('url') ? (
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center space-x-2 mb-2">
                          {watch('resourceType') === 'video' ? (
                            <Video className="w-4 h-4 text-red-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-sm font-medium">
                            {watch('resourceType') === 'video' ? 'Video URL' : 'PDF URL'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 break-all">{watch('url')}</p>
                        
                        {watch('resourceType') === 'video' && watch('url') ? (
                          <div className="h-32 bg-gray-900 rounded overflow-hidden">
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center text-white">
                                <Video className="w-8 h-8 mx-auto mb-1" />
                                <p className="text-xs">YouTube Video</p>
                              </div>
                            </div>
                          </div>
                        ) : watch('resourceType') === 'pdf' && watch('url') ? (
                          <div className="h-32 bg-gray-100 rounded border-2 border-dashed flex items-center justify-center">
                            <div className="text-center">
                              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                              <p className="text-xs text-gray-500">PDF Document</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-3 border border-dashed">
                        <div className="text-center text-gray-500">
                          <Settings className="w-6 h-6 mx-auto mb-2" />
                          <p className="text-sm">Add a URL or upload a file to see preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingResource(null);
                      setUploadMode('url');
                      setUploadingFile(false);
                      reset();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingFile}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none flex items-center justify-center"
                  >
                    {isSubmitting || uploadingFile ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        {uploadingFile ? 'અપલોડ થઈ રહ્યું છે...' : 'સેવ થઈ રહ્યું છે...'}
                      </>
                    ) : (
                      editingResource ? 'અપડેટ કરો' : 'બનાવો'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterResourcesPage;
