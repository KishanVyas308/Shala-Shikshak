import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  Plus, 
  X, 
  Save, 
  FileText, 
  Video, 
  Eye, 
  Filter,
  Upload,
  Link,
  AlertTriangle,
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { standardsAPI } from '../../services/standards';
import { chaptersAPI } from '../../services/chapters';
import { uploadAPI } from '../../services/upload';
import PDFViewer from '../../components/PDFViewer';

// Enhanced validation schema with size limits
const chapterSchema = z.object({
  name: z.string().min(1, 'પ્રકરણનું નામ આવશ્યક છે').max(200, 'નામ ખૂબ લાંબું છે'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'કૃપા કરીને વિષય પસંદ કરો'),
  videoUrl: z.string().url('માન્ય URL હોવું જોઈએ').optional().or(z.literal('')),
  textbookPdfUrl: z.string().url('માન્ય URL હોવું જોઈએ').optional().or(z.literal('')),
  solutionPdfUrl: z.string().url('માન્ય URL હોવું જોઈએ').optional().or(z.literal('')),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

interface FileUploadState {
  file: File | null;
  uploading: boolean;
  error: string | null;
  preview: boolean;
}

const AdminChapters: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<any>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // File upload states
  const [textbookFile, setTextbookFile] = useState<FileUploadState>({
    file: null, uploading: false, error: null, preview: false
  });
  const [solutionFile, setSolutionFile] = useState<FileUploadState>({
    file: null, uploading: false, error: null, preview: false
  });
  
  // Upload mode states
  const [textbookMode, setTextbookMode] = useState<'url' | 'upload'>('url');
  const [solutionMode, setSolutionMode] = useState<'url' | 'upload'>('url');
  
  // Preview states
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  
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

  // Get subjects for the selected standard in modal
  const modalSubjects = modalSelectedStandardId 
    ? subjects.filter(subject => subject.standard?.id === modalSelectedStandardId)
    : [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
  });

  // Watch URL fields for preview
  const watchedTextbookUrl = watch('textbookPdfUrl');
  const watchedSolutionUrl = watch('solutionPdfUrl');
  const watchedVideoUrl = watch('videoUrl');

  // File validation
  const validateFile = (file: File, type: 'pdf' | 'video'): string | null => {
    if (type === 'pdf') {
      if (file.type !== 'application/pdf') {
        return 'માત્ર PDF ફાઇલો જ અપલોડ કરી શકાય છે';
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB
        return 'PDF ફાઇલ 50MB કરતા મોટી હોવી જોઈએ નહીં';
      }
    }
    return null;
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'textbook' | 'solution') => {
    const validation = validateFile(file, 'pdf');
    if (validation) {
      const setState = type === 'textbook' ? setTextbookFile : setSolutionFile;
      setState(prev => ({ ...prev, error: validation }));
      return;
    }

    const setState = type === 'textbook' ? setTextbookFile : setSolutionFile;
    setState(prev => ({ ...prev, uploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await uploadAPI.uploadPdf(formData.get('pdf') as File);
      const url = response.url;
      
      setValue(type === 'textbook' ? 'textbookPdfUrl' : 'solutionPdfUrl', url);
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        file: file,
        error: null 
      }));
      
      toast.success(`${type === 'textbook' ? 'પાઠ્યપુસ્તક' : 'ઉકેલ'} સફળતાપૂર્વક અપલોડ થયું`);
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        uploading: false, 
        error: error.response?.data?.message || 'અપલોડ નિષ્ફળ' 
      }));
      toast.error(`${type === 'textbook' ? 'પાઠ્યપુસ્તક' : 'ઉકેલ'} અપલોડ નિષ્ફળ`);
    }
  };

  // Preview URL
  const handlePreview = (url: string) => {
    if (!url) {
      toast.error('પ્રીવ્યુ માટે URL આવશ્યક છે');
      return;
    }
    setPreviewUrl(url);
    setShowPreview(true);
  };

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

  const onSubmit = async (data: ChapterFormData) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingChapter(null);
    setModalSelectedStandardId('');
    setModalSelectedSubjectId('');
    setTextbookFile({ file: null, uploading: false, error: null, preview: false });
    setSolutionFile({ file: null, uploading: false, error: null, preview: false });
    setTextbookMode('url');
    setSolutionMode('url');
    reset();
  };

  const openCreateModal = () => {
    setEditingChapter(null);
    setModalSelectedStandardId('');
    setModalSelectedSubjectId('');
    setTextbookFile({ file: null, uploading: false, error: null, preview: false });
    setSolutionFile({ file: null, uploading: false, error: null, preview: false });
    setTextbookMode('url');
    setSolutionMode('url');
    reset();
    setIsCreateModalOpen(true);
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
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                પ્રકરણો સંચાલન
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                દરેક વિષય માટે પ્રકરણો બનાવો અને અધ્યયન સામગ્રી ઉમેરો
              </p>
              {filteredChapters.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <FileText className="w-3 h-3 mr-1" />
                    કુલ: {filteredChapters.length}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    વિડિયો: {filteredChapters.filter(c => c.videoUrl).length}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    PDF: {filteredChapters.filter(c => c.textbookPdfUrl || c.solutionPdfUrl).length}
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
            
            {/* Standard Filter */}
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
            
            {/* Subject Filter */}
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
              
              {/* Standard Filter */}
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
              
              {/* Subject Filter */}
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
            </div>
            
            {/* Reset Filters */}
            {(selectedStandardId !== 'all' || selectedSubjectId !== 'all' || searchQuery) && (
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
              onPreview={handlePreview}
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
              કોઈ પ્રકરણ નથી
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              નવું પ્રકરણ બનાવીને શરૂઆત કરો અને વિદ્યાર્થીઓ માટે અધ્યયન સામગ્રી ઉમેરો.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              પહેલું પ્રકરણ ઉમેરો
            </button>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-6xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">PDF પ્રીવ્યુ</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="h-full">
                <PDFViewer fileurl={previewUrl} />
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Modal - Enhanced with PDF preview */}
        {isCreateModalOpen && (
          <CreateChapterModal
            editingChapter={editingChapter}
            standards={standards}
            modalSelectedStandardId={modalSelectedStandardId}
            setModalSelectedStandardId={setModalSelectedStandardId}
            modalSelectedSubjectId={modalSelectedSubjectId}
            setModalSelectedSubjectId={setModalSelectedSubjectId}
            modalSubjects={modalSubjects}
            textbookMode={textbookMode}
            setTextbookMode={setTextbookMode}
            solutionMode={solutionMode}
            setSolutionMode={setSolutionMode}
            textbookFile={textbookFile}
            solutionFile={solutionFile}
            handleFileUpload={handleFileUpload}
            handlePreview={handlePreview}
            watchedTextbookUrl={watchedTextbookUrl}
            watchedSolutionUrl={watchedSolutionUrl}
            watchedVideoUrl={watchedVideoUrl}
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            errors={errors}
            isSubmitting={isSubmitting}
            createMutation={createMutation}
            setValue={setValue}
            closeModal={closeModal}
          />
        )}
      </div>
    </div>
  );
};

// Chapter Card Component - View-only with Preview
const ChapterCard: React.FC<{
  chapter: any;
  onPreview: (url: string) => void;
}> = ({ chapter, onPreview }) => {
  const resourcesCount = [
    chapter.videoUrl,
    chapter.textbookPdfUrl,
    chapter.solutionPdfUrl
  ].filter(Boolean).length;

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
        {chapter.videoUrl && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center">
              <Video className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-700">વિડિયો</span>
            </div>
            <a
              href={chapter.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800"
            >
              <Eye className="h-4 w-4" />
            </a>
          </div>
        )}

        {chapter.textbookPdfUrl && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">પાઠ્યપુસ્તક</span>
            </div>
            <button
              onClick={() => onPreview(chapter.textbookPdfUrl)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )}

        {chapter.solutionPdfUrl && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-700">ઉકેલ</span>
            </div>
            <button
              onClick={() => onPreview(chapter.solutionPdfUrl)}
              className="text-green-600 hover:text-green-800"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {resourcesCount}/3 સંસાધનો ઉપલબ્ધ
          </span>
          <span className="text-xs text-gray-500">
            {new Date(chapter.createdAt).toLocaleDateString('gu-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

// Create Chapter Modal Component - Complete Implementation
const CreateChapterModal: React.FC<{
  editingChapter: any;
  standards: any[];
  modalSelectedStandardId: string;
  setModalSelectedStandardId: (id: string) => void;
  modalSelectedSubjectId: string;
  setModalSelectedSubjectId: (id: string) => void;
  modalSubjects: any[];
  textbookMode: 'url' | 'upload';
  setTextbookMode: (mode: 'url' | 'upload') => void;
  solutionMode: 'url' | 'upload';
  setSolutionMode: (mode: 'url' | 'upload') => void;
  textbookFile: FileUploadState;
  solutionFile: FileUploadState;
  handleFileUpload: (file: File, type: 'textbook' | 'solution') => void;
  handlePreview: (url: string) => void;
  watchedTextbookUrl: string | undefined;
  watchedSolutionUrl: string | undefined;
  watchedVideoUrl: string | undefined;
  register: any;
  handleSubmit: any;
  onSubmit: any;
  errors: any;
  isSubmitting: boolean;
  createMutation: any;
  setValue: any;
  closeModal: () => void;
}> = ({ 
  standards,
  modalSelectedStandardId,
  setModalSelectedStandardId,
  modalSelectedSubjectId,
  setModalSelectedSubjectId,
  modalSubjects,
  textbookMode,
  setTextbookMode,
  solutionMode,
  setSolutionMode,
  textbookFile,
  solutionFile,
  handleFileUpload,
  handlePreview,
  watchedTextbookUrl,
  watchedSolutionUrl,
  watchedVideoUrl,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
  createMutation,
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
      <div className="relative bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">નવું પ્રકરણ ઉમેરો</h3>
              <p className="text-sm text-gray-600 mt-1">વિદ્યાર્થીઓ માટે અધ્યયન સામગ્રી અને સંસાધનો ઉમેરો</p>
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

          {/* Video URL Section */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center mb-3">
              <Video className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="text-sm font-semibold text-red-700">વિડિયો લિંક (વૈકલ્પિક)</h4>
            </div>
            <div className="space-y-3">
              <input
                {...register('videoUrl')}
                type="url"
                className="w-full border border-red-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="https://www.youtube.com/watch?v=... અથવા કોઈ અન્ય વિડિયો URL"
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.videoUrl.message}
                </p>
              )}
              {watchedVideoUrl && (
                <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-200">
                  <span className="text-sm text-red-700">વિડિયો URL ઉમેરાયેલ છે</span>
                  <a
                    href={watchedVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Textbook PDF Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="text-sm font-semibold text-blue-700">પાઠ્યપુસ્તક PDF (વૈકલ્પિક)</h4>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-blue-200">
                <button
                  type="button"
                  onClick={() => setTextbookMode('url')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    textbookMode === 'url' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <Link className="h-3 w-3 mr-1 inline" />
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setTextbookMode('upload')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    textbookMode === 'upload' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  <Upload className="h-3 w-3 mr-1 inline" />
                  અપલોડ
                </button>
              </div>
            </div>

            {textbookMode === 'url' ? (
              <div className="space-y-3">
                <input
                  {...register('textbookPdfUrl')}
                  type="url"
                  className="w-full border border-blue-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="https://example.com/textbook.pdf અથવા Google Drive લિંક"
                />
                {errors.textbookPdfUrl && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.textbookPdfUrl.message}
                  </p>
                )}
                {watchedTextbookUrl && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-200">
                    <span className="text-sm text-blue-700">પાઠ્યપુસ્તક URL ઉમેરાયેલ છે</span>
                    <button
                      type="button"
                      onClick={() => handlePreview(watchedTextbookUrl || '')}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'textbook');
                    }}
                    className="hidden"
                    id="textbook-upload"
                  />
                  <label htmlFor="textbook-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-blue-700">પાઠ્યપુસ્તક PDF ફાઇલ પસંદ કરો</p>
                    <p className="text-xs text-gray-500 mt-1">મહત્તમ 50MB • માત્ર PDF ફાઇલો</p>
                  </label>
                </div>
                
                {textbookFile.uploading && (
                  <div className="flex items-center justify-center bg-white rounded-lg p-3 border border-blue-200">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                    <span className="text-sm text-blue-700">અપલોડ થઈ રહ્યું છે...</span>
                  </div>
                )}
                
                {textbookFile.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      {textbookFile.error}
                    </p>
                  </div>
                )}
                
                {textbookFile.file && !textbookFile.uploading && !textbookFile.error && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">{textbookFile.file.name}</span>
                    </div>
                    {watchedTextbookUrl && (
                      <button
                        type="button"
                        onClick={() => handlePreview(watchedTextbookUrl || '')}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Solution PDF Section */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="text-sm font-semibold text-green-700">ઉકેલ PDF (વૈકલ્પિક)</h4>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-green-200">
                <button
                  type="button"
                  onClick={() => setSolutionMode('url')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    solutionMode === 'url' 
                      ? 'bg-green-600 text-white' 
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                >
                  <Link className="h-3 w-3 mr-1 inline" />
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionMode('upload')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    solutionMode === 'upload' 
                      ? 'bg-green-600 text-white' 
                      : 'text-green-600 hover:bg-green-100'
                  }`}
                >
                  <Upload className="h-3 w-3 mr-1 inline" />
                  અપલોડ
                </button>
              </div>
            </div>

            {solutionMode === 'url' ? (
              <div className="space-y-3">
                <input
                  {...register('solutionPdfUrl')}
                  type="url"
                  className="w-full border border-green-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  placeholder="https://example.com/solution.pdf અથવા Google Drive લિંક"
                />
                {errors.solutionPdfUrl && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {errors.solutionPdfUrl.message}
                  </p>
                )}
                {watchedSolutionUrl && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                    <span className="text-sm text-green-700">ઉકેલ URL ઉમેરાયેલ છે</span>
                    <button
                      type="button"
                      onClick={() => handlePreview(watchedSolutionUrl || '')}
                      className="text-green-600 hover:text-green-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-green-300 rounded-xl p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'solution');
                    }}
                    className="hidden"
                    id="solution-upload"
                  />
                  <label htmlFor="solution-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-green-700">ઉકેલ PDF ફાઇલ પસંદ કરો</p>
                    <p className="text-xs text-gray-500 mt-1">મહત્તમ 50MB • માત્ર PDF ફાઇલો</p>
                  </label>
                </div>
                
                {solutionFile.uploading && (
                  <div className="flex items-center justify-center bg-white rounded-lg p-3 border border-green-200">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2"></div>
                    <span className="text-sm text-green-700">અપલોડ થઈ રહ્યું છે...</span>
                  </div>
                )}
                
                {solutionFile.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      {solutionFile.error}
                    </p>
                  </div>
                )}
                
                {solutionFile.file && !solutionFile.uploading && !solutionFile.error && (
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">{solutionFile.file.name}</span>
                    </div>
                    {watchedSolutionUrl && (
                      <button
                        type="button"
                        onClick={() => handlePreview(watchedSolutionUrl || '')}
                        className="text-green-600 hover:text-green-800 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
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
              disabled={isSubmitting || createMutation.isPending || !modalSelectedSubjectId}
              className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  સેવ થઈ રહ્યું છે...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  પ્રકરણ ઉમેરો
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChapters;
