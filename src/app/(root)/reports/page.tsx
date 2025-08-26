'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, Users, Heart, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import {
  useReportsDashboard,
  useBloodTypeReports,
  useUrgencyReports,
  useTrendReports,
  useExportReports
} from '@/hooks/use-reports';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('blood-types');
  const { data: dashboardStats, isLoading: isDashboardLoading } = useReportsDashboard();
  const { data: bloodTypeReport = [], isLoading: isBloodTypeLoading } = useBloodTypeReports();
  const { data: urgencyReport = [], isLoading: isUrgencyLoading } = useUrgencyReports();
  const { data: trendData = [], isLoading: isTrendLoading } = useTrendReports(30);
  const exportMutation = useExportReports();

  const loading = isDashboardLoading || isBloodTypeLoading || isUrgencyLoading || isTrendLoading;

  const getReportTypeFromTab = () => {
    switch (activeTab) {
      case 'blood-types':
        return 'blood-types' as const;
      case 'urgency':
        return 'urgency' as const;
      case 'trends':
        return 'trends' as const;
      default:
        return 'blood-types' as const;
    }
  };

  const getFilenamePrefix = () => {
    switch (activeTab) {
      case 'blood-types':
        return 'blood_types_report';
      case 'urgency':
        return 'urgency_analysis_report';
      case 'trends':
        return 'trends_report';
      default:
        return 'report';
    }
  };

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const reportType = getReportTypeFromTab();
      const blob = await exportMutation.mutateAsync({ format, type: reportType, days: 30 });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${getFilenamePrefix()}_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('csv')}
            variant="outline"
            disabled={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => handleExport('json')}
            variant="outline"
            disabled={exportMutation.isPending}
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalDonationRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.activeRequests} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Donations</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.completedDonations.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="blood-types" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="blood-types">Blood Types</TabsTrigger>
          <TabsTrigger value="urgency">Urgency Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="blood-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blood Type Demand & Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {bloodTypeReport.map((report) => (
                  <div key={report.bloodType} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg">{report.bloodType}</h3>
                      <Badge variant={report.fulfillmentRate > 70 ? 'default' : report.fulfillmentRate > 40 ? 'secondary' : 'destructive'}>
                        {report.fulfillmentRate}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Requests: {report.requestCount}</div>
                      <div>Donations: {report.donationCount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urgency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Urgency Level Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {urgencyReport.map((report) => (
                  <div key={report.urgency} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold capitalize">{report.urgency} Priority</h3>
                      <Badge variant={report.urgency === 'high' ? 'destructive' : report.urgency === 'medium' ? 'secondary' : 'default'}>
                        {report.fulfillmentRate}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Total: {report.total}</div>
                      <div>Fulfilled: {report.fulfilled}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {trendData.reduce((sum, day) => sum + day.requests, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Requests</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {trendData.reduce((sum, day) => sum + day.donations, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Donations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {trendData.reduce((sum, day) => sum + day.newUsers, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">New Users</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Data from {trendData[0]?.period} to {trendData[trendData.length - 1]?.period}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}