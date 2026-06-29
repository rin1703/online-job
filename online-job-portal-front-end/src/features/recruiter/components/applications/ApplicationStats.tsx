import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/icons/icons';
import type { Application } from '@/redux/features/applications/applicationApi';
import { ApplicationStatus } from '@/features/recruiter/application.type';

interface ApplicationStatsProps {
  applications: Application[];
}

export const ApplicationStats: React.FC<ApplicationStatsProps> = ({ applications }) => {
  const stats = [
    {
      label: 'Total Candidates',
      value: applications.length,
      icon: Icons.users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Pending',
      value: applications.filter((a) => a.status === ApplicationStatus.PENDING).length,
      icon: Icons.clock,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Approved',
      value: applications.filter((a) => a.status === ApplicationStatus.APPROVED).length,
      icon: Icons.checkCircle,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      label: 'Rejected',
      value: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
      icon: Icons.x,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};