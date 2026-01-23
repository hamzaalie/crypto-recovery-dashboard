import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatDate, cn } from '@/lib/utils';
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  Eye,
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    type: 'NOTIFICATION',
    variables: [] as string[],
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['email-templates', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/email/templates?${params.toString()}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/email/templates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: 'Template created', description: 'Email template has been created.' });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create template',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await api.patch(`/email/templates/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: 'Template updated', description: 'Email template has been updated.' });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to update template',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/email/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({ title: 'Template deleted', description: 'Email template has been deleted.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete template',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body: '',
      type: 'NOTIFICATION',
      variables: [],
    });
    setSelectedTemplate(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode('create');
    setIsModalOpen(true);
  };

  const openEditModal = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      variables: template.variables || [],
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openPreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'create') {
      createMutation.mutate(formData);
    } else if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate.id, data: formData });
    }
  };

  const templateTypes = [
    { value: 'WELCOME', label: 'Welcome Email' },
    { value: 'PASSWORD_RESET', label: 'Password Reset' },
    { value: 'EMAIL_VERIFICATION', label: 'Email Verification' },
    { value: 'CASE_STATUS_UPDATE', label: 'Case Status Update' },
    { value: 'TICKET_RESPONSE', label: 'Ticket Response' },
    { value: 'NOTIFICATION', label: 'General Notification' },
  ];

  const filteredTemplates = templates?.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage email templates</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search templates..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        </div>
      ) : filteredTemplates?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">No templates found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.type.replace(/_/g, ' ')}</CardDescription>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      template.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="text-sm font-medium truncate">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Variables</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables?.slice(0, 3).map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {`{{${v}}}`}
                        </span>
                      ))}
                      {template.variables?.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Updated {formatDate(template.updatedAt)}
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => openPreview(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(template)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this template?')) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <Card className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {modalMode === 'create' ? 'Create Template' : 'Edit Template'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      {templateTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Use {{variable}} for dynamic content"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Body (HTML)</Label>
                  <textarea
                    id="body"
                    rows={12}
                    className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 font-mono text-sm"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="<html>...</html>"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Variables (comma-separated)</Label>
                  <Input
                    value={formData.variables.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        variables: e.target.value.split(',').map((v) => v.trim()).filter(Boolean),
                      })
                    }
                    placeholder="firstName, lastName, caseNumber"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {modalMode === 'create' ? 'Create' : 'Save'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsPreviewOpen(false)} />
          <Card className="relative z-10 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>Subject: {selectedTemplate.subject}</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                  className="prose max-w-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
