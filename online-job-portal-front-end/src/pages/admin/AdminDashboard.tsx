import { Users, UserCheck, Package, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockStats, mockJobPosts } from '@/data/mockAdminData';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/layouts/admin/StatsCard';

export default function AdminDashboard() {
  const recentPosts = mockJobPosts.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Tổng người dùng"
          value={mockStats.totalUsers}
          change={`+${mockStats.monthlyGrowth}% so với tháng trước`}
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Job Seekers"
          value={mockStats.totalJobSeekers}
          change="Đang hoạt động"
          changeType="neutral"
          icon={UserCheck}
        />
        <StatsCard
          title="Recruiters"
          value={mockStats.totalRecruiters}
          change="Đang hoạt động"
          changeType="neutral"
          icon={Users}
        />
        <StatsCard
          title="Doanh thu tháng"
          value={`${(mockStats.totalRevenue / 1000000).toFixed(1)}M VNĐ`}
          change="+15.2% so với tháng trước"
          changeType="positive"
          icon={DollarSign}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Bài đăng chờ duyệt"
          value={mockStats.pendingPosts}
          change="Cần xử lý"
          changeType="negative"
          icon={FileText}
        />
        <StatsCard
          title="Bài đăng đã duyệt"
          value={mockStats.approvedPosts}
          change="Tháng này"
          changeType="positive"
          icon={FileText}
        />
        <StatsCard
          title="Gói đang hoạt động"
          value={mockStats.activePackages}
          change="Tất cả gói"
          changeType="neutral"
          icon={Package}
        />
        <StatsCard
          title="Tăng trưởng"
          value={`${mockStats.monthlyGrowth}%`}
          change="Người dùng mới"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Bài đăng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{post.title}</h4>
                    <p className="text-xs text-gray-500">{post.company} • {post.location}</p>
                    <p className="text-xs text-gray-400">Bởi {post.recruiterName}</p>
                  </div>
                  <Badge 
                    variant={
                      post.status === 'approved' ? 'default' : 
                      post.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                    className={
                      post.status === 'approved' ? 'bg-green-100 text-green-800' :
                      post.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {post.status === 'approved' ? 'Đã duyệt' : 
                     post.status === 'pending' ? 'Chờ duyệt' : 
                     'Từ chối'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-medium text-orange-900">Bài đăng chờ duyệt</h4>
                <p className="text-sm text-orange-700 mt-1">
                  {mockStats.pendingPosts} bài đăng đang chờ được duyệt
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Người dùng mới</h4>
                <p className="text-sm text-blue-700 mt-1">
                  12 người dùng đăng ký trong 24h qua
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">Doanh thu</h4>
                <p className="text-sm text-green-700 mt-1">
                  Đạt 85% mục tiêu tháng này
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}