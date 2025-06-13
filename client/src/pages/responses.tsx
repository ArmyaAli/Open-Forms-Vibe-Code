import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, 
  Box, 
  List, 
  BarChart, 
  Download,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  Users,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ResponseWithForm {
  id: number;
  formId: number;
  responses: Record<string, any>;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  formTitle: string;
  formDescription: string;
}

interface ResponseStats {
  totalResponses: number;
  todayResponses: number;
  completionRate: number;
  averageTime: string;
}

export default function Responses() {
  const [, setLocation] = useLocation();
  const [selectedResponse, setSelectedResponse] = useState<ResponseWithForm | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  const { data: responses = [], isLoading: responsesLoading } = useQuery<ResponseWithForm[]>({
    queryKey: ["/api/responses"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ResponseStats>({
    queryKey: ["/api/responses/stats"],
  });

  // Group responses by form
  const responsesByForm = responses.reduce((acc, response) => {
    if (!acc[response.formId]) {
      acc[response.formId] = {
        formTitle: response.formTitle,
        formDescription: response.formDescription,
        responses: []
      };
    }
    acc[response.formId].responses.push(response);
    return acc;
  }, {} as Record<number, { formTitle: string; formDescription: string; responses: ResponseWithForm[] }>);

  const handleViewDetails = (response: ResponseWithForm) => {
    setSelectedResponse(response);
    setIsDetailsOpen(true);
  };

  const getFormStats = (formResponses: ResponseWithForm[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = formResponses.filter(r => 
      new Date(r.submittedAt) >= today
    ).length;

    return {
      total: formResponses.length,
      today: todayCount,
      latest: formResponses.length > 0 ? formResponses[formResponses.length - 1].submittedAt : null
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-600 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => setLocation("/")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">OpenForms</h1>
            </button>
            <nav className="hidden md:flex space-x-6 border-l border-slate-200 dark:border-slate-600 pl-6">
              <button
                onClick={() => setLocation("/builder")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <Plus size={16} />
                Builder
              </button>
              <button
                onClick={() => setLocation("/forms")}
                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 pb-2 flex items-center gap-2"
              >
                <List size={16} />
                My Forms
              </button>
              <button
                onClick={() => setLocation("/responses")}
                className="text-sm font-medium text-primary border-b-2 border-primary pb-2 flex items-center gap-2"
              >
                <BarChart size={16} />
                Responses
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Download className="mr-2" size={16} />
              Export CSV
            </Button>
            <div className="w-8 h-8 bg-slate-300 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Form Responses</h2>
            <p className="text-slate-600 dark:text-slate-400">View and analyze form submissions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-slate-200 dark:border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Responses</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {statsLoading ? "..." : stats?.totalResponses || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Today</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {statsLoading ? "..." : stats?.todayResponses || 0}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {statsLoading ? "..." : `${stats?.completionRate || 0}%`}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-600">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600 dark:text-orange-400" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Forms</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {Object.keys(responsesByForm).length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Categories */}
        {responsesLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse border border-slate-200 dark:border-slate-600">
                <CardHeader>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center space-x-4 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(responsesByForm).length === 0 ? (
          <Card className="text-center py-12 border border-slate-200 dark:border-slate-600">
            <CardContent>
              <Users className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No responses yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Responses will appear here once people start submitting your forms
              </p>
              <Button onClick={() => setLocation("/forms")}>
                View My Forms
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(responsesByForm).map(([formId, formData]) => {
              const formStats = getFormStats(formData.responses);
              return (
                <Card key={formId} className="border border-slate-200 dark:border-slate-600">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                            <FileText className="text-white" size={20} />
                          </div>
                          {formData.formTitle}
                        </CardTitle>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          {formData.formDescription || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="text-center">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">{formStats.total}</div>
                          <div>Total</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600 dark:text-green-400">{formStats.today}</div>
                          <div>Today</div>
                        </div>
                        {formStats.latest && (
                          <div className="text-center">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {formatDistanceToNow(new Date(formStats.latest), { addSuffix: true })}
                            </div>
                            <div>Latest</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600">
                          <tr>
                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Response Data
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Submitted
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
                          {formData.responses.map((response) => (
                            <tr key={response.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                              <td className="py-3 px-4 max-w-xs">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {Object.entries(response.responses).map(([key, value], index) => (
                                    <div key={key}>
                                      {index < 2 && (
                                        <span className="block truncate">
                                          <strong>{key}:</strong> {String(value)}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  {Object.keys(response.responses).length > 2 && (
                                    <span className="text-slate-400 dark:text-slate-500">
                                      +{Object.keys(response.responses).length - 2} more fields
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                                {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Complete
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary-700"
                                  onClick={() => handleViewDetails(response)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Response Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Response Details</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg">{selectedResponse.formTitle}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Submitted {formatDistanceToNow(new Date(selectedResponse.submittedAt), { addSuffix: true })}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Form Data:</h4>
                {Object.entries(selectedResponse.responses).map(([key, value]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                        {key}
                      </span>
                      <span className="text-sm text-slate-900 dark:text-slate-100 ml-4">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {selectedResponse.ipAddress && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Submission Info:</h4>
                  <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <p><strong>IP Address:</strong> {selectedResponse.ipAddress}</p>
                    {selectedResponse.userAgent && (
                      <p><strong>User Agent:</strong> {selectedResponse.userAgent}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
