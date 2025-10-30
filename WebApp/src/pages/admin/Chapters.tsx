import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  X, 
  Save, 
  FileText, 
  Video, 
  Filter,
  AlertTriangle,
  Search,
  ArrowLeft,
  Settings,
  BookOpen,
  Users,
  Edit,
  Trash2
} from 'lucide-react';
import { standardsAPI } from '../../services/standards';
import { chaptersAPI } from '../../services/chapters';

// Simplified validation schema - only basic chapter info
const chapterSchema = z.object({
  name: z.string().min(1, 'પ્રકરણનું નામ આવશ્યક છે').max(200, 'નામ ખૂબ લાંબું છે'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'કૃપા કરીને વિષય પસંદ કરો'),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

const AdminChapters: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<any>(null);
  
  const { id: subjectParamsId } = useParams<{ id?: string }>();

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

  // Set selected subject based on URL parameter
  useEffect(() => {
    if (subjectParamsId && subjectParamsId !== selectedSubjectId) {
      setSelectedSubjectId(subjectParamsId);
      // Also find and set the standard for this subject
      const subject = subjects.find(s => s.id === subjectParamsId);
      if (subject && subject.standard) {
        setSelectedStandardId(subject.standard.id);
      }
    }
  }, [subjectParamsId, subjects, selectedSubjectId]);

  // Get the selected subject information for display
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

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

  // Filter chapters based on search, standard and subject
  const filteredChapters = chapters.filter(chapter => {
    const matchesSearch = searchQuery === '' || 
      chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chapter.description && chapter.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStandard = selectedStandardId === 'all' || 
      chapter.subject?.standard?.id === selectedStandardId;
    
    const matchesSubject = selectedSubjectId === 'all' || 
      chapter.subject?.id === selectedSubjectId;
    
    return matchesSearch && matchesStandard && matchesSubject;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter subjects based on selected standard
  const filteredSubjects = selectedStandardId === 'all' 
    ? subjects 
    : subjects.filter(subject => subject.standard?.id === selectedStandardId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  // Get subjects for the selected standard in modal
  const modalSubjects = useMemo(() => {
    const standard = standards.find(s => s.id === modalSelectedStandardId);
    return standard?.subjects || [];
  }, [standards, modalSelectedStandardId]);

  const createMutation = useMutation({
    mutationFn: chaptersAPI.create,
    onSuccess: () => {
      toast.success('પ્રકરણ સફળતાપૂર્વક બનાવાયું');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'પ્રકરણ બનાવવામાં નિષ્ફળ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChapterFormData }) => 
      chaptersAPI.update(id, data),
    onSuccess: () => {
      toast.success('પ્રકરણ સફળતાપૂર્વક અપડેટ થયું');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'પ્રકરણ અપડેટ કરવામાં નિષ્ફળ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: chaptersAPI.delete,
    onSuccess: () => {
      toast.success('પ્રકરણ સફળતાપૂર્વક ડિલીટ થયું');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'પ્રકરણ ડિલીટ કરવામાં નિષ્ફળ');
    },
  });

  const onSubmit = async (data: ChapterFormData) => {
    try {
      if (editingChapter) {
        await updateMutation.mutateAsync({ id: editingChapter.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingChapter(null);
    setModalSelectedStandardId('');
    setModalSelectedSubjectId('');
    reset();
  };

  const openCreateModal = () => {
    setEditingChapter(null);
    reset();
    
    // Pre-select the subject and standard if we have a specific subject selected
    if (selectedSubjectId && selectedSubjectId !== 'all') {
      const subject = subjects.find(s => s.id === selectedSubjectId);
      if (subject) {
        setModalSelectedStandardId(subject.standard?.id || '');
        setModalSelectedSubjectId(selectedSubjectId);
        setValue('subjectId', selectedSubjectId);
      }
    } else {
      setModalSelectedStandardId('');
      setModalSelectedSubjectId('');
    }
    
    setIsCreateModalOpen(true);
  };

  const openEditModal = (chapter: any) => {
    setEditingChapter(chapter);
    reset();
    
    // Set form values
    setValue('name', chapter.name);
    setValue('description', chapter.description || '');
    setValue('subjectId', chapter.subject.id);
    
    // Set modal selections
    setModalSelectedStandardId(chapter.subject.standard.id);
    setModalSelectedSubjectId(chapter.subject.id);
    
    setIsCreateModalOpen(true);
  };

  const handleDeleteChapter = async (chapter: any) => {
    const resourcesCount = chapter._count?.resources || 0;
    
    if (resourcesCount > 0) {
      toast.error(`આ પ્રકરણમાં ${resourcesCount} સંસાધનો છે. પહેલા બધા સંસાધનો ડિલીટ કરો અને પછી પ્રકરણ ડિલીટ કરો.`);
      return;
    }

    setChapterToDelete(chapter);
  };

  const confirmDelete = async () => {
    if (!chapterToDelete) return;

    try {
      await deleteMutation.mutateAsync(chapterToDelete.id);
      setChapterToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setChapterToDelete(null);
    }
  };

  const cancelDelete = () => {
    setChapterToDelete(null);
  };

  const handleManageResources = (chapterId: string) => {
    navigate(`/admin/chapter/${chapterId}/resources`);
  };

  if (isLoading) {
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
        {/* Breadcrumb Navigation - Show when viewing specific subject */}
        {subjectParamsId && selectedSubject && (
          <div className="mb-4">
            <button
              onClick={() => navigate('/admin/chapters')}
              className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              બધા પ્રકરણો પર પાછા જાઓ
            </button>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {selectedSubjectId === 'all' ? 'પ્રકરણો સંચાલન' : `${selectedSubject?.name} - પ્રકરણો`}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                {selectedSubjectId === 'all' 
                  ? 'દરેક વિષય માટે પ્રકરણો બનાવો અને અધ્યયન સામગ્રી ઉમેરો'
                  : `${selectedSubject?.name} વિષય માટે પ્રકરણો અને અધ્યયન સામગ્રી`
                }
              </p>
              {selectedSubject && selectedSubject.standard && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {selectedSubject.standard.name} ધોરણ
                  </span>
                </div>
              )}
              {filteredChapters.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <FileText className="w-3 h-3 mr-1" />
                    કુલ: {filteredChapters.length}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    સંસાધનો: {filteredChapters.reduce((acc, c) => acc + (c._count?.resources || 0), 0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Mobile Actions */}
            <div className="sm:hidden space-y-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                ફિલ્ટર {showFilters ? 'છુપાવો' : 'બતાવો'}
              </button>
              
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
                નવું પ્રકરણ ઉમેરો
              </button>

            
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className={`sm:hidden transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">શોધો</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="પ્રકરણ શોધો..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            
            {/* Standard Filter - Only show if not viewing specific subject */}
            {!subjectParamsId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ધોરણ</label>
                <select
                  value={selectedStandardId}
                  onChange={(e) => setSelectedStandardId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">બધા ધોરણો</option>
                  {standards.map((standard) => (
                    <option key={standard.id} value={standard.id}>
                      {standard.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Subject Filter - Only show if not viewing specific subject */}
            {!subjectParamsId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">વિષય</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={selectedStandardId === 'all'}
                >
                  <option value="all">બધા વિષયો</option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Reset Button for specific subject search */}
            {subjectParamsId && searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowFilters(false);
                }}
                className="w-full text-sm text-purple-600 hover:text-purple-800 font-medium py-2"
              >
                શોધ રીસેટ કરો
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden sm:block mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="પ્રકરણ શોધો..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              
              {/* Standard Filter - Only show if not viewing specific subject */}
              {!subjectParamsId && (
                <div>
                  <select
                    value={selectedStandardId}
                    onChange={(e) => setSelectedStandardId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">બધા ધોરણો</option>
                    {standards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Subject Filter - Only show if not viewing specific subject */}
              {!subjectParamsId && (
                <div>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={selectedStandardId === 'all'}
                  >
                    <option value="all">બધા વિષયો</option>
                    {filteredSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Search only reset when viewing specific subject */}
              {subjectParamsId && searchQuery && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap"
                  >
                    શોધ રીસેટ કરો
                  </button>
                </div>
              )}
            </div>
            
            {/* Reset Filters - Only show when not viewing specific subject and filters are applied */}
            {!subjectParamsId && (selectedStandardId !== 'all' || selectedSubjectId !== 'all' || searchQuery) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedStandardId('all');
                    setSelectedSubjectId('all');
                    setSearchQuery('');
                  }}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  બધા ફિલ્ટર રીસેટ કરો
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chapters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredChapters.map((chapter) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              onManageResources={handleManageResources}
              onEdit={openEditModal}
              onDelete={handleDeleteChapter}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredChapters.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              {selectedSubjectId === 'all' ? 'કોઈ પ્રકરણ નથી' : `${selectedSubject?.name} માટે કોઈ પ્રકરણ નથી`}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedSubjectId === 'all' 
                ? 'નવું પ્રકરણ બનાવીને શરૂઆત કરો અને વિદ્યાર્થીઓ માટે અધ્યયન સામગ્રી ઉમેરો.'
                : `${selectedSubject?.name} વિષય માટે પહેલું પ્રકરણ ઉમેરો અને અધ્યયન સામગ્રી ઉપલબ્ધ કરાવો.`
              }
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              {selectedSubjectId === 'all' ? 'પહેલું પ્રકરણ ઉમેરો' : 'નવું પ્રકરણ ઉમેરો'}
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {isCreateModalOpen && (
          <CreateChapterModal
            editingChapter={editingChapter}
            standards={standards}
            modalSelectedStandardId={modalSelectedStandardId}
            setModalSelectedStandardId={setModalSelectedStandardId}
            modalSelectedSubjectId={modalSelectedSubjectId}
            setModalSelectedSubjectId={setModalSelectedSubjectId}
            modalSubjects={modalSubjects}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            isSubmitting={isSubmitting}
            createMutation={createMutation}
            updateMutation={updateMutation}
            setValue={setValue}
            closeModal={closeModal}
          />
        )}

        {/* Add Resource Modal */}
        {showResourceModal && (
          <AddResourceModal
            onClose={() => setShowResourceModal(false)}
            chapters={filteredChapters}
          />
        )}

        {/* Delete Confirmation Modal */}
        {chapterToDelete && (
          <DeleteConfirmationModal
            chapter={chapterToDelete}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

// Chapter Card Component - View-only with Preview
const ChapterCard: React.FC<{
  chapter: any;
  onManageResources: (chapterId: string) => void;
  onEdit: (chapter: any) => void;
  onDelete: (chapter: any) => void;
}> = ({ chapter, onManageResources, onEdit, onDelete }) => {
  const resourcesCount = chapter._count?.resources || 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {chapter.subject?.standard?.name}
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {chapter.subject?.name}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {chapter.name}
          </h3>
          {chapter.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {chapter.description}
            </p>
          )}
        </div>
      </div>

      {/* Resources */}
      <div className="space-y-3">
        {resourcesCount > 0 ? (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">
                {resourcesCount} સંસાધનો ઉપલબ્ધ
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">
                કોઈ સંસાધનો ઉપલબ્ધ નથી
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">
            {resourcesCount} સંસાધનો ઉપલબ્ધ
          </span>
          <span className="text-xs text-gray-500">
            {new Date(chapter.createdAt).toLocaleDateString('gu-IN')}
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onManageResources(chapter.id)}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Resources</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onEdit(chapter)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            
            <button
              onClick={() => onDelete(chapter)}
              className="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Chapter Modal Component - Simplified Implementation
const CreateChapterModal: React.FC<{
  editingChapter: any;
  standards: any[];
  modalSelectedStandardId: string;
  setModalSelectedStandardId: (id: string) => void;
  modalSelectedSubjectId: string;
  setModalSelectedSubjectId: (id: string) => void;
  modalSubjects: any[];
  register: any;
  handleSubmit: any;
  onSubmit: any;
  errors: any;
  isSubmitting: boolean;
  createMutation: any;
  updateMutation: any;
  setValue: any;
  closeModal: () => void;
}> = ({ 
  editingChapter,
  standards,
  modalSelectedStandardId,
  setModalSelectedStandardId,
  modalSelectedSubjectId,
  setModalSelectedSubjectId,
  modalSubjects,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
  createMutation,
  updateMutation,
  setValue,
  closeModal
}) => {
  
  // Sync subject selection with form
  React.useEffect(() => {
    if (modalSelectedSubjectId) {
      setValue('subjectId', modalSelectedSubjectId);
    }
  }, [modalSelectedSubjectId, setValue]);

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl mx-auto rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {editingChapter ? 'પ્રકરણ અપડેટ કરો' : 'નવું પ્રકરણ ઉમેરો'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {editingChapter ? 'પ્રકરણની માહિતી અપડેટ કરો' : 'પ્રકરણની મૂળભૂત માહિતી ઉમેરો'}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Standard and Subject Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ધોરણ પસંદ કરો <span className="text-red-500">*</span>
              </label>
              <select
                value={modalSelectedStandardId}
                onChange={(e) => {
                  setModalSelectedStandardId(e.target.value);
                  setModalSelectedSubjectId('');
                }}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                required
              >
                <option value="">ધોરણ પસંદ કરો</option>
                {standards.map((standard) => (
                  <option key={standard.id} value={standard.id}>
                    {standard.name}
                  </option>
                ))}
              </select>
              {!modalSelectedStandardId && (
                <p className="text-sm text-amber-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  પહેલા ધોરણ પસંદ કરો
                </p>
              )}
            </div>

            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                વિષય પસંદ કરો <span className="text-red-500">*</span>
              </label>
              <select
                value={modalSelectedSubjectId}
                onChange={(e) => setModalSelectedSubjectId(e.target.value)}
                disabled={!modalSelectedStandardId}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                required
              >
                <option value="">વિષય પસંદ કરો</option>
                {modalSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {modalSelectedStandardId && !modalSelectedSubjectId && (
                <p className="text-sm text-amber-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  વિષય પસંદ કરો
                </p>
              )}
            </div>
          </div>

          {/* Chapter Details */}
          <div className="space-y-4">
            {/* Chapter Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                પ્રકરણનું નામ <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="જેમ કે: બીજગણિતનો પરિચય, ભૂગોળ પ્રાથમિક..."
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                વર્ણન (વૈકલ્પિક)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                placeholder="પ્રકરણ વિશે ટૂંકી માહિતી લખો..."
              />
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <BookOpen className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-800 mb-1">સંસાધનો (Resources) વિશે</h4>
                <p className="text-sm text-blue-700">
                  પ્રકરણ બનાવ્યા પછી તમે વિડિયો, PDF અને અન્ય અધ્યયન સામગ્રીઓ ઉમેરી શકશો. સંસાધનો ત્રણ વિભાગમાં વિભાજિત છે: 
                  <span className="font-semibold"> સ્વાધ્યાય, સ્વાધ્યાય પોથી અને અન્ય.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3 -mx-6 -mb-6 rounded-b-2xl">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (editingChapter ? updateMutation.isPending : createMutation.isPending) || !modalSelectedSubjectId}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting || (editingChapter ? updateMutation.isPending : createMutation.isPending) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {editingChapter ? 'અપડેટ થઈ રહ્યું છે...' : 'સેવ થઈ રહ્યું છે...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingChapter ? 'અપડેટ કરો' : 'પ્રકરણ ઉમેરો'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Resource Modal Component
const AddResourceModal: React.FC<{
  onClose: () => void;
  chapters: any[];
}> = ({ onClose, chapters }) => {
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [resourceType, setResourceType] = useState<'svadhyay' | 'svadhyay_pothi' | 'other'>('svadhyay');
  const [resourceFormat, setResourceFormat] = useState<'video' | 'pdf'>('video');
  const [resourceUrl, setResourceUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter || !title || !resourceUrl) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Add resource creation logic here
      console.log('Creating resource:', {
        chapterId: selectedChapter,
        type: resourceType,
        resourceType: resourceFormat,
        url: resourceUrl,
        title,
        description
      });
      
      // Close modal after successful creation
      onClose();
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Chapter Resource</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Chapter Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a chapter...</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title} ({chapter.subject?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setResourceType('svadhyay')}
                className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  resourceType === 'svadhyay'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <BookOpen className="w-5 h-5 mx-auto mb-1" />
                Svadhyay
              </button>
              <button
                type="button"
                onClick={() => setResourceType('svadhyay_pothi')}
                className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  resourceType === 'svadhyay_pothi'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                Pothi
              </button>
              <button
                type="button"
                onClick={() => setResourceType('other')}
                className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  resourceType === 'other'
                    ? 'border-gray-500 bg-gray-50 text-gray-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Settings className="w-5 h-5 mx-auto mb-1" />
                Other
              </button>
            </div>
          </div>

          {/* Resource Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResourceFormat('video')}
                className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  resourceFormat === 'video'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Video className="w-5 h-5 mx-auto mb-1" />
                Video
              </button>
              <button
                type="button"
                onClick={() => setResourceFormat('pdf')}
                className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                  resourceFormat === 'pdf'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <FileText className="w-5 h-5 mx-auto mb-1" />
                PDF
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter resource title..."
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resource URL
            </label>
            <input
              type="url"
              value={resourceUrl}
              onChange={(e) => setResourceUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={resourceFormat === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/document.pdf'}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a description for this resource..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedChapter || !title || !resourceUrl}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  chapter: any;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ chapter, onConfirm, onCancel, isDeleting }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">પ્રકરણ ડિલીટ કરો</h3>
              <p className="text-sm text-gray-600">આ ક્રિયા પાછી કરી શકાશે નહીં</p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-700 mb-4">
            શું તમે ખરેખર <span className="font-semibold text-gray-900">"{chapter.name}"</span> પ્રકરણને ડિલીટ કરવા માંગો છો?
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">ચેતવણી:</p>
                <p>આ પ્રકરણ અને તેના સાથે સંકળાયેલા બધા સંસાધનો કાયમ માટે ડિલીટ થઈ જશે.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            રદ કરો
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ડિલીટ થઈ રહ્યું છે...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                હા, ડિલીટ કરો
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChapters;
