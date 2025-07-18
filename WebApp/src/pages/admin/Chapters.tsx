import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Trash2, X, Save, FileText, Video, Eye, Filter } from 'lucide-react';
import { standardsAPI } from '../../services/standards';
import { chaptersAPI } from '../../services/chapters';
import { uploadAPI } from '../../services/upload';

const chapterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

const AdminChapters: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [uploadingTextbook, setUploadingTextbook] = useState(false);
  const [uploadingSolution, setUploadingSolution] = useState(false);
  const [textbookFile, setTextbookFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal form states
  const [modalSelectedStandardId, setModalSelectedStandardId] = useState<string>('');
  const [modalSelectedSubjectId, setModalSelectedSubjectId] = useState<string>('');

  const { data: standards = [] } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  const { data: allSubjects = [], isLoading } = useQuery({
    queryKey: ['standards-with-subjects'],
    queryFn: standardsAPI.getAll,
  });

  // Get all subjects from all standards
  const subjects = allSubjects.flatMap(standard => 
    (standard.subjects || []).map(subject => ({
      ...subject,
      standard: { id: standard.id, name: standard.name }
    }))
  );

  // Get all chapters from all subjects
  const chapters = subjects.flatMap(subject => 
    (subject.chapters || []).map(chapter => ({
      ...chapter,
      subject: {
        ...subject,
        standard: subject.standard
      }
    }))
  );

  // Filter subjects based on selected standard
  const filteredSubjects = selectedStandardId === 'all' 
    ? subjects 
    : subjects.filter(subject => subject.standard?.id === selectedStandardId);

  // Filter chapters based on selected standard and subject
  let filteredChapters = chapters;
  if (selectedStandardId !== 'all') {
    filteredChapters = filteredChapters.filter(chapter => 
      chapter.subject?.standard?.id === selectedStandardId
    );
  }
  if (selectedSubjectId !== 'all') {
    filteredChapters = filteredChapters.filter(chapter => 
      chapter.subject?.id === selectedSubjectId
    );
  }

  // Get subjects for the selected standard in modal
  const modalSubjects = modalSelectedStandardId 
    ? subjects.filter(subject => subject.standard?.id === modalSelectedStandardId)
    : [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: ChapterFormData & { subjectId: string; textbookPdfUrl?: string; solutionPdfUrl?: string; textbookPdfFileName?: string; solutionPdfFileName?: string }) => {
      return chaptersAPI.create(data);
    },
    onSuccess: () => {
      toast.success('Chapter created successfully');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      setIsCreateModalOpen(false);
      reset();
      setTextbookFile(null);
      setSolutionFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create chapter');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: chaptersAPI.delete,
    onSuccess: () => {
      toast.success('Chapter deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete chapter');
    },
  });

  const onSubmit = async (data: ChapterFormData) => {
    // Validate that subject is selected
    if (!modalSelectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }

    let textbookPdfUrl = '';
    let textbookPdfFileName = '';
    let solutionPdfUrl = '';
    let solutionPdfFileName = '';

    try {
      // Upload textbook PDF if selected
      if (textbookFile) {
        setUploadingTextbook(true);
        const uploadResult = await uploadAPI.uploadPdf(textbookFile);
        textbookPdfUrl = uploadResult.url;
        textbookPdfFileName = uploadResult.originalName;
        setUploadingTextbook(false);
      }

      // Upload solution PDF if selected
      if (solutionFile) {
        setUploadingSolution(true);
        const uploadResult = await uploadAPI.uploadPdf(solutionFile);
        solutionPdfUrl = uploadResult.url;
        solutionPdfFileName = uploadResult.originalName;
        setUploadingSolution(false);
      }

      const chapterData = {
        ...data,
        subjectId: modalSelectedSubjectId, // Use the modal selected subject ID
        textbookPdfUrl,
        textbookPdfFileName,
        solutionPdfUrl,
        solutionPdfFileName,
      };

      createMutation.mutate(chapterData);
    } catch (error) {
      setUploadingTextbook(false);
      setUploadingSolution(false);
      toast.error('Failed to upload files');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    reset();
    setTextbookFile(null);
    setSolutionFile(null);
    setModalSelectedStandardId('');
    setModalSelectedSubjectId('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first responsive container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chapters</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Manage educational content
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Chapter</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Filters - Responsive */}
        <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard</label>
                <select
                  value={selectedStandardId}
                  onChange={(e) => {
                    setSelectedStandardId(e.target.value);
                    setSelectedSubjectId('all');
                  }}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Standards</option>
                  {standards.map((standard) => (
                    <option key={standard.id} value={standard.id}>
                      {standard.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="all">All Subjects</option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List - Mobile-first design */}
        <div className="space-y-3 sm:space-y-4">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              {/* Mobile Layout */}
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-semibold text-sm">
                          {chapter.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {chapter.name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="truncate">{chapter.subject?.standard?.name}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{chapter.subject?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => window.open(`/chapter/${chapter.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Preview Chapter"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(chapter.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Chapter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Description */}
                {chapter.description && (
                  <p className="text-gray-600 text-sm mb-3 pl-13 line-clamp-2">
                    {chapter.description}
                  </p>
                )}
                
                {/* Content Indicators */}
                <div className="flex flex-wrap items-center gap-2 pl-13">
                  {chapter.videoUrl && (
                    <div className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </div>
                  )}
                  {chapter.textbookPdfUrl && (
                    <div className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <FileText className="h-3 w-3 mr-1" />
                      Textbook
                    </div>
                  )}
                  {chapter.solutionPdfUrl && (
                    <div className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      <FileText className="h-3 w-3 mr-1" />
                      Solutions
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredChapters.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters found</h3>
              <p className="text-gray-500 text-sm mb-6">
                {selectedStandardId !== 'all' || selectedSubjectId !== 'all'
                  ? 'No chapters match your current filters.'
                  : 'Get started by creating your first chapter.'}
              </p>
              {(selectedStandardId !== 'all' || selectedSubjectId !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedStandardId('all');
                    setSelectedSubjectId('all');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Chapter
              </button>
            </div>
          </div>
        )}

        {/* Create Modal - Mobile optimized */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
            <div className="relative top-0 sm:top-10 mx-auto border w-full max-w-2xl shadow-lg rounded-xl bg-white">
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Create New Chapter
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Standard Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalSelectedStandardId}
                    onChange={(e) => {
                      setModalSelectedStandardId(e.target.value);
                      setModalSelectedSubjectId('');
                    }}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">Select a standard</option>
                    {standards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalSelectedSubjectId}
                    onChange={(e) => setModalSelectedSubjectId(e.target.value)}
                    disabled={!modalSelectedStandardId}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {modalSelectedStandardId ? 'Select a subject' : 'Please select a standard first'}
                    </option>
                    {modalSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {!modalSelectedSubjectId && modalSelectedStandardId && (
                    <p className="mt-1 text-sm text-red-600">Please select a subject</p>
                  )}
                </div>

                {/* Chapter Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="e.g., Introduction to Algebra"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Optional description of the chapter content"
                  />
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (YouTube)
                  </label>
                  <input
                    {...register('videoUrl')}
                    type="url"
                    className="block w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {errors.videoUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
                  )}
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Textbook PDF
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setTextbookFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-gray-300 rounded-lg"
                      />
                      {uploadingTextbook && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Solution PDF
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 border border-gray-300 rounded-lg"
                      />
                      {uploadingSolution && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || uploadingTextbook || uploadingSolution}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingTextbook || uploadingSolution ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : createMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create Chapter
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChapters;
