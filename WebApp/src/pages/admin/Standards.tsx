import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, GripVertical, BookOpen } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { standardsAPI } from '../../services/standards';
import type { Standard } from '../../types';
import { useNavigate } from 'react-router-dom';

const standardSchema = z.object({
  name: z.string().min(1, 'નામ આવશ્યક છે').max(100, 'નામ ખૂબ લાંબું છે'),
  description: z.string().optional(),
  order: z.number().min(1, 'ક્રમ સકારાત્મક હોવો જોઈએ'),
});

type StandardFormData = z.infer<typeof standardSchema>;

// Sortable Item Component
interface SortableStandardProps {
  standard: Standard;
  onEdit: (standard: Standard) => void;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
}

const SortableStandard: React.FC<SortableStandardProps> = ({ standard, onEdit, onDelete, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: standard.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
    
      style={style}
      className={`bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 transition-all duration-300 ${
        isDragging ? 'shadow-2xl opacity-75 scale-105 rotate-2' : 'hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Mobile Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 cursor-pointer"
            onClick={() => onClick(standard.id)}

        >
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-indigo-600 cursor-grab active:cursor-grabbing p-1 sm:p-2 mt-1 transition-colors duration-200"
            aria-label="ધોરણ ખસેડો"
          >
            <GripVertical className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2 sm:p-3 flex-shrink-0 shadow-lg">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate mb-1">
                {standard.name}
              </h3>
              {standard.description && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
                  {standard.description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                <div className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                  ક્રમ: {standard.order}
                </div>
                <div className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs">
                  {standard._count?.subjects || 0} વિષયો
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 ml-8 sm:ml-0">
          <button
            onClick={() => onEdit(standard)}
            className="p-2 sm:p-3 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-all duration-200 active:scale-95"
            aria-label="સંપાદિત કરો"
          >
            <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => onDelete(standard.id)}
            className="p-2 sm:p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 active:scale-95"
            aria-label="ડિલીટ કરો"
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminStandards: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  const [sortedStandards, setSortedStandards] = useState<Standard[]>([]);

  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: standards = [], isLoading } = useQuery({
    queryKey: ['standards'],
    queryFn: standardsAPI.getAll,
  });

  // Update sorted standards when data changes
  React.useEffect(() => {
    if (standards.length > 0) {
      setSortedStandards([...standards].sort((a, b) => a.order - b.order));
    }
  }, [standards]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StandardFormData>({
    resolver: zodResolver(standardSchema),
  });

  const createMutation = useMutation({
    mutationFn: standardsAPI.create,
    onSuccess: () => {
      toast.success('ધોરણ સફળતાપૂર્વક બનાવાયું');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'ધોરણ બનાવવામાં નિષ્ફળ');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StandardFormData> }) =>
      standardsAPI.update(id, data),
    onSuccess: () => {
      toast.success('ધોરણ સફળતાપૂર્વક અપડેટ થયું');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      setEditingStandard(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'ધોરણ અપડેટ કરવામાં નિષ્ફળ');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: standardsAPI.delete,
    onSuccess: () => {
      toast.success('ધોરણ સફળતાપૂર્વક ડિલીટ થયું');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'ધોરણ ડિલીટ કરવામાં નિષ્ફળ');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (newStandards: Standard[]) => {
      const reorderData = newStandards.map((standard, index) => ({
        id: standard.id,
        order: index + 1
      }));
      return await standardsAPI.batchReorder(reorderData);
    },
    onSuccess: () => {
      toast.success('ક્રમ સફળતાપૂર્વક અપડેટ થયો');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
    },
    onError: () => {
      toast.error('ક્રમ અપડેટ કરવામાં નિષ્ફળ');
      // Reset to original order
      setSortedStandards([...standards].sort((a, b) => a.order - b.order));
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortedStandards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderMutation.mutate(newItems);
        return newItems;
      });
    }
  };

  const onSubmit = (data: StandardFormData) => {
    if (editingStandard) {
      updateMutation.mutate({ id: editingStandard.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (standard: Standard) => {
    setEditingStandard(standard);
    setValue('name', standard.name);
    setValue('description', standard.description || '');
    setValue('order', standard.order);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('શું તમે ખરેખર આ ધોરણને ડિલીટ કરવા માંગો છો?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpen = (id: string) => {
    navigate(`/admin/subjects/${id}`);
  }

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingStandard(null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 px-4">
        <div className="text-center max-w-xs mx-auto">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-2">લોડ થઈ રહ્યું છે...</h3>
          <p className="text-sm text-gray-600">કૃપા કરીને થોડી રાહ જુઓ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Mobile First */}
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                ધોરણો વ્યવસ્થાપન
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                શૈક્ષણિક ધોરણો બનાવો અને વ્યવસ્થિત કરો
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              <span className="hidden sm:inline">નવું ધોરણ ઉમેરો</span>
              <span className="sm:hidden">ધોરણ ઉમેરો</span>
            </button>
          </div>
        </div>

        {/* Instructions - Enhanced for Mobile */}
        {sortedStandards.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <GripVertical className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <p className="text-blue-800 text-xs sm:text-sm font-medium">
                <span className="hidden sm:inline">ટિપ: ધોરણોને ફરીથી ગોઠવવા માટે ડ્રેગ અને ડ્રોપ કરો</span>
                <span className="sm:hidden">ડ્રેગ કરીને ક્રમ બદલો</span>
              </p>
            </div>
          </div>
        )}

        {/* Standards List - Mobile Optimized */}
        {sortedStandards.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="relative mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 sm:p-8 w-20 h-20 sm:w-24 sm:h-24 mx-auto flex items-center justify-center shadow-lg">
                  <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">0</span>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">કોઈ ધોરણ નથી</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                શરૂઆત કરવા માટે તમારું પહેલું ધોરણ બનાવો
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border border-transparent rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                પહેલું ધોરણ ઉમેરો
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedStandards} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 sm:space-y-4">
                  {sortedStandards.map((standard) => (
                    <SortableStandard
                      key={standard.id}
                      standard={standard}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onClick={handleOpen}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden z-40">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
            aria-label="નવું ધોરણ ઉમેરો"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Create/Edit Modal - Mobile Optimized */}
        {(isCreateModalOpen || editingStandard) && (
          <div className="fixed inset-0 bg-black/25  backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-3 sm:p-4">
            <div className="relative top-4 sm:top-10 lg:top-20 mx-auto border border-gray-200 w-full max-w-md sm:max-w-lg shadow-2xl rounded-2xl bg-white">
              {/* Header */}
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingStandard ? 'ધોરણ સંપાદિત કરો' : 'નવું ધોરણ બનાવો'}
                </h3>
                <button 
                  onClick={closeModal} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    નામ <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full border border-gray-300 rounded-xl shadow-sm px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200"
                    placeholder="દા.ત., ધોરણ 1"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">વર્ણન</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl shadow-sm px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200 resize-none"
                    placeholder="વૈકલ્પિક વર્ણન"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ક્રમ <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('order', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-xl shadow-sm px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-all duration-200"
                    placeholder="1"
                  />
                  {errors.order && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.order.message}
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 active:scale-95"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>સાચવી રહ્યા છીએ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span>{editingStandard ? 'અપડેટ કરો' : 'બનાવો'}</span>
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

export default AdminStandards;
