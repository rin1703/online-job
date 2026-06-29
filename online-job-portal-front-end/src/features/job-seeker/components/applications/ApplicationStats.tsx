import { Card, CardContent } from '@/components/ui/card';
import type { Application } from '@/redux/features/applications/applicationApi';
import { STATUS_CONFIG } from './application.constants';
import { FileText, Clock, CheckCircle, XCircle, Calendar, Ban } from 'lucide-react';

interface ApplicationStatsProps {
  applications: Application[];
}

export function ApplicationStats({ applications }: ApplicationStatsProps) {
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === 'pending').length,
    reviewed: applications.filter((app) => app.status === 'reviewed').length,
    approved: applications.filter((app) => app.status === 'approved').length,
    rejected: applications.filter((app) => app.status === 'rejected').length,
    interview_scheduled: applications.filter((app) => app.status === 'interview_scheduled').length,
    withdrawn: applications.filter((app) => app.status === 'withdrawn').length,
  };

  const statCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: STATUS_CONFIG.pending.label,
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
    },
    {
      label: STATUS_CONFIG.approved.label,
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: STATUS_CONFIG.interview_scheduled.label,
      value: stats.interview_scheduled,
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: STATUS_CONFIG.rejected.label,
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600 bg-red-50',
    },
    {
      label: STATUS_CONFIG.withdrawn.label,
      value: stats.withdrawn,
      icon: Ban,
      color: 'text-gray-600 bg-gray-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
