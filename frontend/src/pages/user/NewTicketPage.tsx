import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.string().min(1, 'Please select a priority'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  caseId: z.string().optional(),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

const ticketCategories = [
  { value: 'GENERAL_INQUIRY', label: 'General Inquiry' },
  { value: 'CASE_SUPPORT', label: 'Case Support' },
  { value: 'TECHNICAL_ISSUE', label: 'Technical Issue' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'FEEDBACK', label: 'Feedback' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewTicketPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      priority: 'MEDIUM',
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: CreateTicketFormData) => {
      const response = await api.post('/tickets', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast({
        title: 'Ticket created',
        description: `Ticket ${data.ticketNumber} has been created successfully.`,
      });
      navigate(`/tickets/${data.id}`);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create ticket',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateTicketFormData) => {
    createTicketMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Support Ticket
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Get help from our support team
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>
              Please provide details about your issue or question
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-red-500">{errors.subject.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                {...register('category')}
              >
                <option value="">Select a category</option>
                {ticketCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <select
                id="priority"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                {...register('priority')}
              >
                <option value="LOW">Low - Not urgent</option>
                <option value="MEDIUM">Medium - Standard</option>
                <option value="HIGH">High - Needs attention</option>
                <option value="URGENT">Urgent - Critical issue</option>
              </select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 resize-none"
                placeholder="Please describe your issue in detail..."
                {...register('message')}
              />
              {errors.message && (
                <p className="text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTicketMutation.isPending}>
            {createTicketMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}
