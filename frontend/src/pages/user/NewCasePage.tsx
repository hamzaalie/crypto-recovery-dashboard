import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { validateAddress, formatBlockchainName } from '@/lib/blockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

const createCaseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  type: z.string().min(1, 'Please select a case type'),
  priority: z.string().min(1, 'Please select a priority'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  estimatedLoss: z.number().optional(),
  walletAddress: z.string().optional(),
  incidentDate: z.string().optional(),
});

type CreateCaseFormData = z.infer<typeof createCaseSchema>;

const caseTypes = [
  { value: 'lost_access', label: 'Lost Access to Wallet' },
  { value: 'scam', label: 'Scam Recovery' },
  { value: 'theft', label: 'Theft / Hack Recovery' },
  { value: 'exchange_issue', label: 'Exchange Issue' },
  { value: 'wallet_recovery', label: 'Wallet Recovery' },
  { value: 'other', label: 'Other' },
];

export default function NewCasePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [walletValidation, setWalletValidation] = useState<{
    isValid: boolean;
    blockchain: string | null;
    error?: string;
  } | null>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCaseFormData>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  // Watch wallet address for validation
  const walletAddress = watch('walletAddress');
  
  // Validate wallet address when it changes
  useEffect(() => {
    if (walletAddress && walletAddress.trim().length >= 10) {
      const result = validateAddress(walletAddress);
      setWalletValidation(result);
    } else {
      setWalletValidation(null);
    }
  }, [walletAddress]);

  // Upload files to server
  const uploadFiles = async (caseId: string): Promise<void> => {
    if (files.length === 0) return;
    
    setIsUploadingFiles(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use the general file upload endpoint with entity type and ID
        await api.post(`/files/upload?entityType=case&entityId=${caseId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
      // Don't fail the case creation, just show a warning
      toast({
        title: 'File Upload Warning',
        description: 'Some files could not be uploaded. You can add them later.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFiles(false);
    }
  };

  const createCaseMutation = useMutation({
    mutationFn: async (data: CreateCaseFormData) => {
      // Filter out undefined/empty values
      const payload: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null && !Number.isNaN(value)) {
          payload[key] = value;
        }
      });
      
      const response = await api.post('/cases', payload);
      return response.data;
    },
    onSuccess: async (data) => {
      // Upload files after case is created
      if (files.length > 0) {
        await uploadFiles(data.id);
      }
      
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast({
        title: 'Case created',
        description: `Case ${data.caseNumber} has been created successfully.`,
      });
      navigate(`/cases/${data.id}`);
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create case',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateCaseFormData) => {
    createCaseMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Recovery Case
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Provide details about your crypto recovery needs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>
              Please provide as much information as possible to help us assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                placeholder="Brief title for your case"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Case Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Case Type *</Label>
              <select
                id="type"
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                {...register('type')}
              >
                <option value="">Select a case type</option>
                {caseTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
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
                <option value="low">Low - Not urgent</option>
                <option value="medium">Medium - Standard processing</option>
                <option value="high">High - Needs quick attention</option>
                <option value="urgent">Urgent - Critical situation</option>
              </select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority.message}</p>
              )}
            </div>

            {/* Wallet Address with Validation */}
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
              <div className="relative">
                <Input
                  id="walletAddress"
                  placeholder="Enter wallet address (BTC, ETH, etc.)"
                  className={walletValidation ? (
                    walletValidation.isValid 
                      ? 'border-green-500 pr-10' 
                      : 'border-red-500 pr-10'
                  ) : ''}
                  {...register('walletAddress')}
                />
                {walletValidation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {walletValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {walletValidation && (
                <div className={`text-sm ${walletValidation.isValid ? 'text-green-600' : 'text-red-500'}`}>
                  {walletValidation.isValid ? (
                    <span className="flex items-center gap-1">
                      ✓ Valid {formatBlockchainName(walletValidation.blockchain!)} address
                    </span>
                  ) : (
                    walletValidation.error
                  )}
                </div>
              )}
            </div>

            {/* Incident Date */}
            <div className="space-y-2">
              <Label htmlFor="incidentDate">Incident Date (Optional)</Label>
              <Input
                id="incidentDate"
                type="date"
                {...register('incidentDate')}
              />
            </div>

            {/* Estimated Loss */}
            <div className="space-y-2">
              <Label htmlFor="estimatedLoss">
                Estimated Loss (USD) (Optional)
              </Label>
              <Input
                id="estimatedLoss"
                type="number"
                placeholder="0.00"
                {...register('estimatedLoss', { valueAsNumber: true })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                rows={6}
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 resize-none"
                placeholder="Please describe your situation in detail. Include:&#10;- What happened&#10;- When it happened&#10;- Any relevant transaction IDs&#10;- Steps you've already taken"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Supporting Documents (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Browse Files
                </Button>
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createCaseMutation.isPending || isUploadingFiles}>
            {(createCaseMutation.isPending || isUploadingFiles) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isUploadingFiles ? 'Uploading Files...' : createCaseMutation.isPending ? 'Creating...' : 'Create Case'}
          </Button>
        </div>
      </form>
    </div>
  );
}
