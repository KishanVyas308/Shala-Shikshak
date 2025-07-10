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
}

const SortableStandard: React.FC<SortableStandardProps> = ({ standard, onEdit, onDelete }) => {
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
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all duration-200 ${
        isDragging ? 'shadow-2xl opacity-75 scale-105' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
          >
            <GripVertical className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 rounded-full p-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{standard.name}</h3>
              {standard.description && (
                <p className="text-sm text-gray-600 mt-1">{standard.description}</p>
              )}
              <p className="text-xs text-indigo-600 font-medium mt-1">ક્રમ: {standard.order}</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(standard)}
            className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(standard.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="h-4 w-4" />
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

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingStandard(null);
    reset();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">લોડ થઈ રહ્યું છે...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">ધોરણો વ્યવસ્થાપન</h1>
              <p className="text-lg text-gray-600">
                શૈક્ષણિક ધોરણો બનાવો અને વ્યવસ્થિત કરો
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              નવું ધોરણ ઉમેરો
            </button>
          </div>
        </div>

        {/* Instructions */}
        {sortedStandards.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-blue-800 text-sm flex items-center">
              <GripVertical className="h-4 w-4 mr-2" />
              ટિપ: ધોરણોને ફરીથી ગોઠવવા માટે ડ્રેગ અને ડ્રોપ કરો
            </p>
          </div>
        )}

        {/* Standards List */}
        {sortedStandards.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">કોઈ ધોરણ નથી</h3>
            <p className="text-gray-600 mb-6">શરૂઆત કરવા માટે તમારું પહેલું ધોરણ બનાવો</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              પહેલું ધોરણ ઉમેરો
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortedStandards} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {sortedStandards.map((standard) => (
                  <SortableStandard
                    key={standard.id}
                    standard={standard}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {standards.map((standard) => (
            <div
              key={standard.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-indigo-600">
                    Order: {standard.order}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(standard)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(standard.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {standard.name}
                </h3>
                
                {standard.description && (
                  <p className="text-gray-600 text-sm mb-4">{standard.description}</p>
                )}
                
                <div className="text-sm text-gray-500">
                  {standard._count?.subjects || 0} subjects
                </div>
              </div>
            </div>
          ))}
        </div> */}

        {standards.length === 0 && (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No standards</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new standard.</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreateModalOpen || editingStandard) && (
          <div className="fixed inset-0 bg-gray-600/40 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {editingStandard ? 'Edit Standard' : 'Create Standard'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Class 1"
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
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving...'
                      : editingStandard
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

export default AdminStandards;
