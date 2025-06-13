import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Users
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

  const { data: responses = [], isLoading: responsesLoading } = useQuery<ResponseWithForm[]>({
    queryKey: ["/api/responses"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<ResponseStats>({
    queryKey: ["/api/responses/stats"],
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-slate-600 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary-500 rounded-lg flex items-center justify-center">
                <Box className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">FormCraft</h1>
            </div>
            <nav className="hidden md:flex space-x-6 border-l border-slate-200 dark:border-slate-600 pl-6">
              <button
                onClick={() => setLocation("/")}
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
                  <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Time</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {statsLoading ? "..." : stats?.averageTime || "0:00"}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card className="border border-slate-200 dark:border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {responsesLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </div>
                ))}
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No responses yet</h3>
                <p className="text-slate-600 mb-4">
                  Responses will appear here once people start submitting your forms
                </p>
                <Button onClick={() => setLocation("/forms")}>
                  View My Forms
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Form
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Response Data
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {responses.map((response) => (
                      <tr key={response.id} className="hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="text-primary-600" size={16} />
                            </div>
                            <span className="font-medium text-slate-900">
                              {response.formTitle}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <div className="text-sm text-slate-600 truncate">
                            {Object.entries(response.responses).map(([key, value], index) => (
                              <div key={key}>
                                {index < 2 && (
                                  <span className="block">
                                    <strong>{key}:</strong> {String(value)}
                                  </span>
                                )}
                              </div>
                            ))}
                            {Object.keys(response.responses).length > 2 && (
                              <span className="text-slate-400">
                                +{Object.keys(response.responses).length - 2} more fields
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {formatDistanceToNow(new Date(response.submittedAt), { addSuffix: true })}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Complete
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary-700"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
