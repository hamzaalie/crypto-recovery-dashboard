import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusColor, formatCurrency, cn } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  Clock,
  User,
  Calendar,
  DollarSign,
  Paperclip,
  Download,
  AlertCircle,
  CheckCircle2,
  Wallet,
  Hash,
} from 'lucide-react';

interface CaseDetail {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  estimatedLoss: number;
  recoveredAmount: number;
  walletAddress?: string;
  transactionHash?: string;
  attachments?: string[];
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: caseDetail, isLoading } = useQuery<CaseDetail>({
    queryKey: ['case', id],
    queryFn: async () => {
      const response = await api.get(`/cases/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Clock className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">Loading case details...</p>
      </div>
    );
  }

  if (!caseDetail) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
        <p className="mt-2 text-gray-500">Case not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/cases')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {caseDetail.title}
              </h1>
              <span className={cn('px-3 py-1 text-sm font-medium rounded-full', getStatusColor(caseDetail.status))}>
                {caseDetail.status.replace(/_/g, ' ')}
              </span>
              <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', priorityColors[caseDetail.priority.toUpperCase()])}>
                {caseDetail.priority}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {caseDetail.type.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Case Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {caseDetail.description}
              </p>
            </CardContent>
          </Card>

          {/* Wallet & Transaction Info */}
          {(caseDetail.walletAddress || caseDetail.transactionHash) && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {caseDetail.walletAddress && (
                  <div className="flex items-start space-x-3">
                    <Wallet className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Wallet Address</p>
                      <p className="font-mono text-sm break-all">{caseDetail.walletAddress}</p>
                    </div>
                  </div>
                )}
                {caseDetail.transactionHash && (
                  <div className="flex items-start space-x-3">
                    <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">Transaction Hash</p>
                      <p className="font-mono text-sm break-all">{caseDetail.transactionHash}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Info */}
          <Card>
            <CardHeader>
              <CardTitle>Case Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(caseDetail.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(caseDetail.updatedAt)}</p>
                </div>
              </div>

              {caseDetail.closedAt && (
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Closed</p>
                    <p className="font-medium">{formatDate(caseDetail.closedAt)}</p>
                  </div>
                </div>
              )}

              {caseDetail.assignedTo && (
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Agent</p>
                    <p className="font-medium">
                      {caseDetail.assignedTo.firstName} {caseDetail.assignedTo.lastName}
                    </p>
                  </div>
                </div>
              )}

              {caseDetail.estimatedLoss > 0 && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Estimated Loss</p>
                    <p className="font-medium">{formatCurrency(caseDetail.estimatedLoss)}</p>
                  </div>
                </div>
              )}

              {caseDetail.recoveredAmount > 0 && (
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Recovered Amount</p>
                    <p className="font-medium text-green-600">{formatCurrency(caseDetail.recoveredAmount)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Paperclip className="h-5 w-5 mr-2" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caseDetail.attachments && caseDetail.attachments.length > 0 ? (
                <div className="space-y-2">
                  {caseDetail.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm truncate">{attachment}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/api/files/download?path=${encodeURIComponent(attachment)}`} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No attachments</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
