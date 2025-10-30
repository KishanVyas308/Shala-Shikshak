import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, BookOpen, Filter, GraduationCap, AlertTriangle, Search, ArrowLeft } from 'lucide-react';
import { standardsAPI } from '../../services/standards';
import { subjectsAPI } from '../../services/subjects';
import type { Subject } from '../../types';
import { useParams, useNavigate } from 'react-router-dom';

// Subject Item Component
interface SubjectItemProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}


const SubjectItem: React.FC<SubjectItemProps> = ({ subject, onEdit, onDelete, onClick }) => {

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95">
      {/* Mobile Layout */}
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {/* Header with Standard Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r  from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-700"

          >
            <GraduationCap className="h-3 w-3 mr-1" />
            {subject.standard?.name}
          </div>
          <div className="flex items-center space-x-2 ">
            <button
              onClick={() => onEdit(subject)}
              className="p-2 cursor-pointer text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-95"
              aria-label="સંપાદિત કરો"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(subject.id)}
              className="p-2 cursor-pointer text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-95"
              aria-label="ડિલીટ કરો"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Subject Name with Icon */}
        <div className="flex items-start space-x-3 cursor-pointer" onClick={() => onClick(subject.id)}>
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2 sm:p-3 flex-shrink-0 shadow-lg">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate mb-1">
              {subject.name}
            </h3>
            {subject.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer with Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium">
              {subject.chapters?.length || 0} અધ્યાયો
            </div>
            
            <div className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold">
              સક્રિય
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const subjectSchema = z.object({
  name: z.string().min(1, 'નામ આવશ્યક છે').max(100, 'નામ ખૂબ લાંબું છે'),
  description: z.string().optional(),
  standardId: z.string().min(1, 'કૃપા કરીને ધોરણ પસંદ કરો'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

const AdminSubjects: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { id: standardParmsId } = useParams<{ id?: string }>();

  // Set selected standard based on URL parameter
  useEffect(() => {
    if (standardParmsId && standardParmsId !== selectedStandardId) {
      setSelectedStandardId(standardParmsId);
    }
  }, [standardParmsId]);

  const { data: standards = [] } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  const { data: allSubjects = [], isLoading } = useQuery({
    queryKey: ['standards-with-subjects'],
    queryFn: standardsAPI.getAll,
  });

  // Get the selected standard name for display
  const selectedStandard = standards.find(s => s.id === selectedStandardId);

  // Get all subjects from all standards
  const subjects = allSubjects.flatMap(standard =>
    (standard.subjects || []).map(subject => ({
      ...subject,
      standard: { id: standard.id, name: standard.name }
    }))
  );

  // Filter subjects based on selected standard, search query and sort by created date
  const filteredSubjects = subjects
    .filter(subject => {
      const matchesStandard = selectedStandardId === 'all' || subject.standard?.id === selectedStandardId;
      const matchesSearch = searchQuery === '' ||
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStandard && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  const createMutation = useMutation({
    mutationFn: subjectsAPI.create,
    onSuccess: () => {
      toast.success('વિષય સફળતાપૂર્વક બનાવાયો');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'વિષય બનાવવામાં નિષ્ફળ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubjectFormData> }) =>
      subjectsAPI.update(id, data),
    onSuccess: () => {
      toast.success('વિષય સફળતાપૂર્વક અપડેટ થયો');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      setEditingSubject(null);
      reset();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || 'વિષય અપડેટ કરવામાં નિષ્ફળ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectsAPI.delete,
    onSuccess: () => {
      toast.success('વિષય સફળતાપૂર્વક ડિલીટ થયો');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'વિષય ડિલીટ કરવામાં નિષ્ફળ');
    },
  });

  const onSubmit = async (data: SubjectFormData) => {
    try {
      if (editingSubject) {
        await updateMutation.mutateAsync({ id: editingSubject.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setValue('name', subject.name);
    setValue('description', subject.description || '');
    setValue('standardId', subject.standardId);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('શું તમે ખરેખર આ વિષયને ડિલીટ કરવા માંગો છો?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingSubject(null);
    reset();
  };

  const openCreateModal = () => {
    setEditingSubject(null);
    reset();
    // Pre-select the standard if we have a specific standard selected
    if (selectedStandardId && selectedStandardId !== 'all') {
      setValue('standardId', selectedStandardId);
    }
    setIsCreateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 px-4">
        <div className="text-center max-w-xs mx-auto">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-emerald-700 mb-2">લોડ થઈ રહ્યું છે...</h3>
          <p className="text-sm text-gray-600">કૃપા કરીને થોડી રાહ જુઓ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb Navigation - Show when viewing specific standard */}
        {standardParmsId && selectedStandard && (
          <div className="mb-4">
            <button
              onClick={() => navigate('/admin/subjects')}
              className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              બધા વિષયો પર પાછા જાઓ
            </button>
          </div>
        )}

        {/* Mobile-First Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {selectedStandardId === 'all' ? 'વિષયો સંચાલન' : `${selectedStandard?.name} - વિષયો સંચાલન`}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                {selectedStandardId === 'all'
                  ? 'દરેક ધોરણ માટે વિષયો બનાવો અને સંચાલિત કરો'
                  : `${selectedStandard?.name} ધોરણ માટે વિષયો બનાવો અને સંચાલિત કરો`
                }
              </p>
              {filteredSubjects.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    <BookOpen className="w-3 h-3 mr-1" />
                    કુલ: {filteredSubjects.length}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    ધોરણ: {selectedStandardId === 'all' ? standards.length : 1}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Floating Action Button */}
            <div className="sm:hidden">
              <button
                onClick={openCreateModal}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center z-40"
              >
                <Plus className="h-6 w-6" />
              </button>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                ફિલ્ટર {showFilters ? 'છુપાવો' : 'બતાવો'}
              </button>
            </div>

            {/* Desktop Add Button */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-3">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                નવો વિષય ઉમેરો
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className={`sm:hidden transition-all duration-300 ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                વિષય શોધો
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="વિષય શોધો..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Standard Filter - Only show if not viewing specific standard */}
            {!standardParmsId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ધોરણ પસંદ કરો
                </label>
                <select
                  value={selectedStandardId}
                  onChange={(e) => setSelectedStandardId(e.target.value)}
                  className="block w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
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

            {/* Reset Button */}
            {((!standardParmsId && selectedStandardId !== 'all') || searchQuery) && (
              <button
                onClick={() => {
                  if (!standardParmsId) {
                    setSelectedStandardId('all');
                  }
                  setSearchQuery('');
                  setShowFilters(false);
                }}
                className="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2"
              >
                {!standardParmsId && selectedStandardId !== 'all' ? 'રીસેટ કરો' : 'શોધ રીસેટ કરો'}
              </button>
            )}
          </div>
        </div>

        {/* Desktop Filter */}
        <div className="hidden sm:block mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="વિષય શોધો..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Standard Filter - Only show if not viewing specific standard */}
              {!standardParmsId && (
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700 shrink-0">
                    ધોરણ:
                  </label>
                  <select
                    value={selectedStandardId}
                    onChange={(e) => setSelectedStandardId(e.target.value)}
                    className="block w-full sm:max-w-xs border border-gray-300 rounded-xl shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">બધા ધોરણો</option>
                    {standards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.name}
                      </option>
                    ))}
                  </select>
                  {(selectedStandardId !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedStandardId('all');
                        setSearchQuery('');
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                    >
                      રીસેટ કરો
                    </button>
                  )}
                </div>
              )}

              {/* Search only reset when viewing specific standard */}
              {standardParmsId && searchQuery && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap"
                  >
                    શોધ રીસેટ કરો
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectItem
              key={subject.id}
              subject={subject}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={(id) => navigate(`/admin/chapters/${id}`)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredSubjects.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              {selectedStandardId === 'all' ? 'કોઈ વિષય નથી' : 'આ ધોરણ માટે કોઈ વિષય નથી'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedStandardId === 'all'
                ? 'નવો વિષય બનાવીને શરૂઆત કરો અને વિદ્યાર્થીઓ માટે અધ્યયન સામગ્રી ઉમેરો.'
                : 'આ ધોરણ માટે પહેલો વિષય ઉમેરો.'
              }
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              પહેલો વિષય ઉમેરો
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreateModalOpen || editingSubject) && (
          <div className="fixed inset-0 bg-black/25  backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-md mx-auto rounded-2xl shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingSubject ? 'વિષય સંપાદન' : 'નવો વિષય ઉમેરો'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingSubject ? 'વિષયની માહિતી અપડેટ કરો' : 'નવા વિષયની વિગતો ભરો'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                {/* Standard Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    ધોરણ પસંદ કરો <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('standardId')}
                    className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-200"
                  >
                    <option value="">ધોરણ પસંદ કરો</option>
                    {standards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.name}
                      </option>
                    ))}
                  </select>
                  {errors.standardId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.standardId.message}
                    </p>
                  )}
                </div>

                {/* Subject Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    વિષયનું નામ <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-200"
                    placeholder="જેમ કે: ગણિત, ભાષા, વિજ્ઞાન"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    વર્ણન (વૈકલ્પિક)
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl shadow-sm px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 transition-all duration-200 resize-none"
                    placeholder="વિષય વિશે ટૂંકી માહિતી લખો..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        સેવ થઈ રહ્યું છે...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {editingSubject ? 'અપડેટ કરો' : 'ઉમેરો'}
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

export default AdminSubjects;
