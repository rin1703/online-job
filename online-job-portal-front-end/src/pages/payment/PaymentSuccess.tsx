import { Link } from 'react-router-dom';
import { CheckCircle, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi
          </p>
        </div>

        <Link to="/recruiter/packages">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <MoveLeft className="mr-2 h-4 w-4" />
            Quay về
          </Button>
        </Link>
      </div>
    </div>
  );
}