import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { whatsappAPI } from '../../services/whatsappAPI';
import type { WhatsAppLink, CreateWhatsAppLinkData, UpdateWhatsAppLinkData } from '../../services/whatsappAPI';

interface WhatsAppFormData {
  name: string;
  description: string;
  url: string;
}

const WhatsAppManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<WhatsAppLink | null>(null);
  const [formData, setFormData] = useState<WhatsAppFormData>({
    name: '',
    description: '',
    url: ''
  });

  const queryClient = useQueryClient();

  // Fetch all WhatsApp links
  const { data: links = [], isLoading, error } = useQuery({
    queryKey: ['whatsapp-links'],
    queryFn: whatsappAPI.getAllLinks
  });

  // Create link mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateWhatsAppLinkData) => whatsappAPI.createLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-links'] });
      toast.success('WhatsApp link created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create WhatsApp link');
    }
  });

  // Update link mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWhatsAppLinkData }) => 
      whatsappAPI.updateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-links'] });
      toast.success('WhatsApp link updated successfully');
      setIsEditModalOpen(false);
      setEditingLink(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update WhatsApp link');
    }
  });

  // Activate link mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => whatsappAPI.activateLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-links'] });
      toast.success('WhatsApp link activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate WhatsApp link');
    }
  });

  // Deactivate all links mutation
  const deactivateAllMutation = useMutation({
    mutationFn: whatsappAPI.deactivateAllLinks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-links'] });
      toast.success('All WhatsApp links deactivated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate WhatsApp links');
    }
  });

  // Delete link mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => whatsappAPI.deleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-links'] });
      toast.success('WhatsApp link deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete WhatsApp link');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      url: ''
    });
  };

  const handleCreateClick = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (link: WhatsAppLink) => {
    setEditingLink(link);
    setFormData({
      name: link.name,
      description: link.description || '',
      url: link.url
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('Name and URL are required');
      return;
    }

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      url: formData.url.trim()
    };

    if (isEditModalOpen && editingLink) {
      updateMutation.mutate({ id: editingLink.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleActivate = (id: string) => {
    activateMutation.mutate(id);
  };

  const handleDeactivateAll = () => {
    if (window.confirm('Are you sure you want to deactivate all WhatsApp links?')) {
      deactivateAllMutation.mutate();
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const validateWhatsAppUrl = (url: string) => {
    const pattern = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    return pattern.test(url);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Failed to load WhatsApp links</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Link Management</h1>
          <div className="flex gap-2">
            <button
              onClick={handleDeactivateAll}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              disabled={deactivateAllMutation.isPending}
            >
              Deactivate All
            </button>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add New Link
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Manage WhatsApp group invite links. Only one link can be active at a time and will be displayed on the website.
        </p>
      </div>

      {/* Links List */}
      <div className="bg-white rounded-lg shadow">
        {links.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No WhatsApp links found. Create your first link to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">URL</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Created</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className={link.isActive ? 'bg-green-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {link.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {link.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {link.url.length > 30 ? `${link.url.substring(0, 30)}...` : link.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        link.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {!link.isActive && (
                          <button
                            onClick={() => handleActivate(link.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                            disabled={activateMutation.isPending}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleEditClick(link)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(link.id, link.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {isEditModalOpen ? 'Edit WhatsApp Link' : 'Create WhatsApp Link'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Main WhatsApp Group"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Group URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://chat.whatsapp.com/..."
                  required
                />
                {formData.url && !validateWhatsAppUrl(formData.url) && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid WhatsApp group invite URL
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingLink(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !formData.name.trim() || 
                    !formData.url.trim() || 
                    !validateWhatsAppUrl(formData.url) ||
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditModalOpen ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppManagement;
