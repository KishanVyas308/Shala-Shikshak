import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Save, BookOpen, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { standardsAPI } from '../../services/standards';
import { subjectsAPI } from '../../services/subjects';
import type { Subject, Standard } from '../../types';

// Sortable Subject Item Component
interface SortableSubjectItemProps {
  subject: Subject;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
}

const SortableSubjectItem: React.FC<SortableSubjectItemProps> = ({ subject, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subject.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-all ${
        isDragging ? 'shadow-2xl opacity-75 scale-105' : 'hover:shadow-lg'
      }`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-indigo-600">
            {subject.standard?.name}
          </div>
          <div className="flex items-center space-x-2">
            <button
              {...listeners}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(subject)}
              className="text-gray-400 hover:text-indigo-600"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(subject.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center mb-2">
          <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            {subject.name}
          </h3>
        </div>
        
        {subject.description && (
          <p className="text-gray-600 text-sm mb-4">{subject.description}</p>
        )}
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{subject._count?.chapters || 0} chapters</span>
          <span className="text-indigo-600 font-medium">ક્રમ: {subject.order}</span>
        </div>
      </div>
    </div>
  );
};

const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  order: z.number().min(1, 'Order must be positive'),
  standardId: z.string().min(1, 'Please select a standard'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

const AdminSubjects: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedStandardId, setSelectedStandardId] = useState<string>('all');

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

  // Filter subjects based on selected standard
  const filteredSubjects = selectedStandardId === 'all' 
    ? subjects 
    : subjects.filter(subject => subject.standard?.id === selectedStandardId);

  // State for sorted subjects and drag-and-drop
  const [sortedSubjects, setSortedSubjects] = useState<Subject[]>([]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update sorted subjects when filtered subjects change
  useEffect(() => {
    setSortedSubjects([...filteredSubjects].sort((a, b) => a.order - b.order));
  }, [filteredSubjects]);

  // Batch reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (newSubjects: Subject[]) => {
      const reorderData = newSubjects.map((subject, index) => ({
        id: subject.id,
        order: index + 1
      }));
      return await subjectsAPI.batchReorder(reorderData);
    },
    onSuccess: () => {
      toast.success('ક્રમ સફળતાપૂર્વક અપડેટ થયો');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
    },
    onError: () => {
      toast.error('ક્રમ અપડેટ કરવામાં નિષ્ફળ');
      // Reset to original order
      setSortedSubjects([...filteredSubjects].sort((a, b) => a.order - b.order));
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortedSubjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderMutation.mutate(newItems);
        return newItems;
      });
    }
  };

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
      toast.success('Subject created successfully');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      setIsCreateModalOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create subject');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubjectFormData> }) =>
      subjectsAPI.update(id, data),
    onSuccess: () => {
      toast.success('Subject updated successfully');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
      setEditingSubject(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update subject');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subjectsAPI.delete,
    onSuccess: () => {
      toast.success('Subject deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['standards'] });
      queryClient.invalidateQueries({ queryKey: ['standards-with-subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete subject');
    },
  });

  const onSubmit = (data: SubjectFormData) => {
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setValue('name', subject.name);
    setValue('description', subject.description || '');
    setValue('order', subject.order);
    setValue('standardId', subject.standardId);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingSubject(null);
    reset();
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
            <p className="mt-2 text-gray-600">
              Create and manage subjects for each standard
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </button>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedStandardId}
            onChange={(e) => setSelectedStandardId(e.target.value)}
            className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Standards</option>
            {standards.map((standard) => (
              <option key={standard.id} value={standard.id}>
                {standard.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
          >
            <SortableContext
              items={sortedSubjects.map(subject => subject.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedSubjects.map((subject) => (
                <SortableSubjectItem
                  key={subject.id}
                  subject={subject}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStandardId === 'all' 
                ? 'Get started by creating a new subject.'
                : 'No subjects found for the selected standard.'
              }
            </p>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(isCreateModalOpen || editingSubject) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {editingSubject ? 'Edit Subject' : 'Create Subject'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Standard</label>
                  <select
                    {...register('standardId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a standard</option>
                    {standards.map((standard) => (
                      <option key={standard.id} value={standard.id}>
                        {standard.name}
                      </option>
                    ))}
                  </select>
                  {errors.standardId && (
                    <p className="mt-1 text-sm text-red-600">{errors.standardId.message}</p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Mathematics"
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
                      : editingSubject
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

export default AdminSubjects;
