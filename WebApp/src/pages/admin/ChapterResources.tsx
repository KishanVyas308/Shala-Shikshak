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
  ExternalLink
} from 'lucide-react';
import { chaptersAPI } from '../../services/chapters';
import { chapterResourcesAPI } from '../../services/chapterResources';
import { uploadAPI } from '../../services/upload';
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
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;
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
  onPreview
}: { 
  resource: ChapterResource; 
  onEdit: (resource: ChapterResource) => void;
  onDelete: (id: string) => void;
  onPreview: (resource: ChapterResource) => void;
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ResourceTypeIcon type={resource.type} />
          {resource.resourceType === 'video' ? (
            <Video className="w-4 h-4 text-red-500" />
          ) : (
            <FileText className="w-4 h-4 text-blue-500" />
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPreview(resource)}
            className="p-1 text-gray-400 hover:text-green-500 transition-colors"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(resource)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(resource.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <h3 className="font-medium text-gray-900 mb-1">{resource.title}</h3>
      {resource.description && (
        <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">
          {resource.type.replace('_', ' ')}
        </span>
        <div className="flex items-center space-x-2">
          <span>{resource.resourceType}</span>
          {resource.fileName ? (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Uploaded</span>
          ) : (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">URL</span>
          )}
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
    mutationFn: chapterResourcesAPI.create,
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
    mutationFn: ({ id, data }: { id: string; data: Partial<ResourceFormData> }) =>
      chapterResourcesAPI.update(id, data),
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
      if (uploadMode === 'file' && !data.url) {
        toast.error('Please upload a PDF file');
        return;
      }
    }

    const submitData = {
      ...data,
      chapterId: chapterId!,
      url: data.url || '',
    };

    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
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
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteMutation.mutate(id);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{chapter.name}</h1>
              <p className="text-gray-600">
                Manage resources for this chapter
              </p>
            </div>
          </div>
          
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>

        {/* Resources Grid */}
        {resourcesData && (
          <div className="space-y-8">
            {/* Svadhyay Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Book className="w-5 h-5 text-blue-500" />
                <span>Svadhyay ({resourcesData.resources?.svadhyay?.length || 0})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesData.resources?.svadhyay?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                  />
                )) || []}
                {(!resourcesData.resources?.svadhyay || resourcesData.resources.svadhyay.length === 0) && (
                  <p className="text-gray-500 col-span-full">No svadhyay resources yet.</p>
                )}
              </div>
            </div>

            {/* Svadhyay Pothi Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-500" />
                <span>Svadhyay Pothi ({resourcesData.resources?.svadhyay_pothi?.length || 0})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesData.resources?.svadhyay_pothi?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                  />
                )) || []}
                {(!resourcesData.resources?.svadhyay_pothi || resourcesData.resources.svadhyay_pothi.length === 0) && (
                  <p className="text-gray-500 col-span-full">No svadhyay pothi resources yet.</p>
                )}
              </div>
            </div>

            {/* Other Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-500" />
                <span>Other ({resourcesData.resources?.other?.length || 0})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resourcesData.resources?.other?.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                  />
                )) || []}
                {(!resourcesData.resources?.other || resourcesData.resources.other.length === 0) && (
                  <p className="text-gray-500 col-span-full">No other resources yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Preview Modal with Edit/Delete Actions */}
      {previewResource && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold">{previewResource.title}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {previewResource.resourceType === 'video' ? 'Video' : 'PDF'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {/* Edit Button */}
                <button
                  onClick={() => {
                    handleEdit(previewResource);
                    setPreviewResource(null);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Edit Resource"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this resource?')) {
                      handleDelete(previewResource.id);
                      setPreviewResource(null);
                    }
                  }}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Delete Resource"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setPreviewResource(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Resource Description */}
            {previewResource.description && (
              <div className="px-4 py-2 bg-gray-50 border-b">
                <p className="text-sm text-gray-600">{previewResource.description}</p>
              </div>
            )}
            
            {/* Preview Content */}
            <div className="p-4 h-[70vh]">
              {previewResource.resourceType === 'video' ? (
                <div className="h-full">
                  {previewResource.url.includes('youtube.com') || previewResource.url.includes('youtu.be') ? (
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden h-full">
                      <iframe
                        width="100%"
                        height="100%"
                        src={previewResource.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={previewResource.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="rounded-lg"
                        referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                      <div className="text-center">
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Video preview not available</p>
                        <a
                          href={previewResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Video
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full">
                  <PDFViewer fileurl={previewResource.url} />
                </div>
              )}
            </div>
            
            {/* Resource Details Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Type: <span className="capitalize font-medium">{previewResource.type}</span></span>
                  {previewResource.fileName && (
                    <span>File: <span className="font-medium">{previewResource.fileName}</span></span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <span>Created: {new Date(previewResource.createdAt).toLocaleDateString()}</span>
                  <a
                    href={previewResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal with File Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingResource ? 'Edit Resource' : 'Create Resource'}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('title')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter resource title"
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter resource description (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      <option value="svadhyay">Svadhyay</option>
                      <option value="svadhyay_pothi">Svadhyay Pothi</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-600 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Type <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select type</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                    {errors.resourceType && (
                      <p className="text-red-600 text-sm mt-1">{errors.resourceType.message}</p>
                    )}
                  </div>
                </div>

                {/* Upload Mode Toggle - Only for PDF */}
                {watch('resourceType') === 'pdf' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      How would you like to add the PDF? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                          uploadMode === 'url'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Google Drive Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                          uploadMode === 'file'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF
                      </button>
                    </div>
                  </div>
                )}

                {/* URL Input - Different labels for Video vs PDF */}
                {(uploadMode === 'url' || watch('resourceType') === 'video') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {watch('resourceType') === 'video' ? 'YouTube URL' : 'PDF URL (Google Drive or Direct Link)'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('url')}
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        watch('resourceType') === 'video' 
                          ? "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          : "https://drive.google.com/... or direct PDF link"
                      }
                    />
                    {errors.url && (
                      <p className="text-red-600 text-sm mt-1">{errors.url.message?.toString()}</p>
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
                      <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Current File:</span>
                            <span className="text-sm text-green-700">
                              {editingResource?.fileName || watch('fileName')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('Remove current file? You will need to upload a new one.')) {
                                setValue('fileName', '');
                                setValue('url', '');
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                                toast.success('File removed');
                              }
                            }}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Remove current file"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 30 * 1024 * 1024) {
                              toast.error('File size must be less than 30MB');
                              return;
                            }
                            setUploadingFile(true);
                            try {
                              const formData = new FormData();
                              formData.append('pdf', file);
                              const response = await uploadAPI.uploadPdf(file);
                              setValue('url', response.url);
                              setValue('fileName', response.fileName);
                              toast.success('PDF uploaded successfully');
                            } catch (error) {
                              toast.error('PDF upload failed');
                              console.error('Upload error:', error);
                            } finally {
                              setUploadingFile(false);
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {uploadingFile ? 'Uploading PDF...' : 
                           (editingResource?.fileName || watch('fileName')) ? 'Click to replace PDF file' : 'Click to upload PDF or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF files only (max 30MB)
                        </p>
                      </div>
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

                <div className="flex justify-end space-x-3 pt-4 border-t">
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
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting || uploadingFile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        {uploadingFile ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      editingResource ? 'Update' : 'Create'
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
