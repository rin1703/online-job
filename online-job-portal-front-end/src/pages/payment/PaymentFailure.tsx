import { Link } from 'react-router-dom';
import { XCircle, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <XCircle className="h-16 w-16 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Thanh toán thất bại!
          </h1>
          <p className="text-gray-600">
            Giao dịch không thể hoàn tất. Vui lòng thử lại sau.
          </p>
        </div>

        <Link to="/recruiter/packages">
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <MoveLeft className="mr-2 h-4 w-4" />
            Quay về
          </Button>
        </Link>
      </div>
    </div>
  );
}