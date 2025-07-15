import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, FileText, Video, Upload, ExternalLink } from 'lucide-react';
import { standardsAPI } from '../../services/standards';
import { subjectsAPI } from '../../services/subjects';
import { chaptersAPI } from '../../services/chapters';
import { uploadAPI } from '../../services/upload';
import type { Chapter, Subject, Standard } from '../../types';

const chapterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  description: z.string().optional(),
  order: z.number().min(1, 'Order must be positive'),
  subjectId: z.string().min(1, 'Please select a subject'),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

const AdminChapters: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [uploadingTextbook, setUploadingTextbook] = useState(false);
  const [uploadingSolution, setUploadingSolution] = useState(false);
  const [textbookFile, setTextbookFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);

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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  const watchedSubjectId = watch('subjectId');

  const createMutation = useMutation({
    mutationFn: async (data: ChapterFormData & { textbookPdfUrl?: string; solutionPdfUrl?: string }) => {
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ChapterFormData & { textbookPdfUrl?: string; solutionPdfUrl?: string }> }) =>
      chaptersAPI.update(id, data),
    onSuccess: () => {
      toast.success('Chapter updated successfully');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      setEditingChapter(null);
      reset();
      setTextbookFile(null);
      setSolutionFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update chapter');
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
    let textbookPdfUrl = editingChapter?.textbookPdfUrl;
    let textbookPdfFileId = editingChapter?.textbookPdfFileId;
    let textbookPdfFileName = editingChapter?.textbookPdfFileName;
    let solutionPdfUrl = editingChapter?.solutionPdfUrl;
    let solutionPdfFileId = editingChapter?.solutionPdfFileId;
    let solutionPdfFileName = editingChapter?.solutionPdfFileName;

    try {
      // Upload textbook PDF if selected
      if (textbookFile) {
        setUploadingTextbook(true);
        const uploadResult = await uploadAPI.uploadPdf(textbookFile);
        textbookPdfUrl = uploadResult.viewingUrl;
        textbookPdfFileId = uploadResult.fileId;
        textbookPdfFileName = uploadResult.originalName;
        setUploadingTextbook(false);
      }

      // Upload solution PDF if selected
      if (solutionFile) {
        setUploadingSolution(true);
        const uploadResult = await uploadAPI.uploadPdf(solutionFile);
        solutionPdfUrl = uploadResult.viewingUrl;
        solutionPdfFileId = uploadResult.fileId;
        solutionPdfFileName = uploadResult.originalName;
        setUploadingSolution(false);
      }

      const chapterData = {
        ...data,
        textbookPdfUrl,
        textbookPdfFileId,
        textbookPdfFileName,
        solutionPdfUrl,
        solutionPdfFileId,
        solutionPdfFileName,
      };

      if (editingChapter) {
        updateMutation.mutate({ id: editingChapter.id, data: chapterData });
      } else {
        createMutation.mutate(chapterData);
      }
    } catch (error) {
      setUploadingTextbook(false);
      setUploadingSolution(false);
      toast.error('Failed to upload files');
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setValue('name', chapter.name);
    setValue('description', chapter.description || '');
    setValue('order', chapter.order);
    setValue('subjectId', chapter.subjectId);
    setValue('videoUrl', chapter.videoUrl || '');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingChapter(null);
    reset();
    setTextbookFile(null);
    setSolutionFile(null);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Chapters</h1>
            <p className="mt-2 text-gray-600">
              Create and manage chapters with videos and PDFs
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedStandardId}
            onChange={(e) => {
              setSelectedStandardId(e.target.value);
              setSelectedSubjectId('all');
            }}
            className="block border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Standards</option>
            {standards.map((standard) => (
              <option key={standard.id} value={standard.id}>
                {standard.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="block border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Subjects</option>
            {filteredSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mr-3">
                      {chapter.order}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{chapter.name}</h3>
                      <div className="text-sm text-gray-500">
                        {chapter.subject?.standard?.name} • {chapter.subject?.name}
                      </div>
                    </div>
                  </div>
                  
                  {chapter.description && (
                    <p className="text-gray-600 text-sm mb-3 ml-11">{chapter.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 ml-11">
                    {chapter.videoUrl && (
                      <div className="flex items-center text-sm text-green-600">
                        <Video className="h-4 w-4 mr-1" />
                        <span>Video</span>
                      </div>
                    )}
                    {chapter.textbookPdfUrl && (
                      <div className="flex items-center text-sm text-blue-600">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>Textbook</span>
                      </div>
                    )}
                    {chapter.solutionPdfUrl && (
                      <div className="flex items-center text-sm text-purple-600">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>Solutions</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(chapter)}
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredChapters.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No chapters</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new chapter.
            </p>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreateModalOpen || editingChapter) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {editingChapter ? 'Edit Chapter' : 'Create Chapter'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select
                      {...register('subjectId')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.standard?.name} - {subject.name}
                        </option>
                      ))}
                    </select>
                    {errors.subjectId && (
                      <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order</label>
                    <input
                      {...register('order', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1"
                    />
                    {errors.order && (
                      <p className="mt-1 text-sm text-red-600">{errors.order.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Introduction to Algebra"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Video URL (YouTube)</label>
                  <input
                    {...register('videoUrl')}
                    type="url"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  {errors.videoUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.videoUrl.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Textbook PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setTextbookFile(e.target.files?.[0] || null)}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {editingChapter?.textbookPdfUrl && (
                      <div className="mt-1 text-sm text-green-600">
                        Current file available
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Solution PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {editingChapter?.solutionPdfUrl && (
                      <div className="mt-1 text-sm text-green-600">
                        Current file available
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || uploadingTextbook || uploadingSolution}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {uploadingTextbook || uploadingSolution
                      ? 'Uploading...'
                      : createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editingChapter
                      ? 'Update'
                      : 'Create'}
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
