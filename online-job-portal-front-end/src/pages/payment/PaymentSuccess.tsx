import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyPaymentMutation } from '@/features/recruiter/api/recruiter.service';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  
  const [verifyPayment] = useVerifyPaymentMutation();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Đang xác thực giao dịch thanh toán...');

  useEffect(() => {
    const runVerification = async () => {
      if (!orderCode) {
        setVerificationStatus('success');
        setMessage('Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ.');
        return;
      }

      try {
        const result = await verifyPayment({ orderCode }).unwrap();
        if (result.success || result.status === 'paid') {
          setVerificationStatus('success');
          setMessage('Thanh toán thành công! Gói dịch vụ của bạn đã được kích hoạt.');
          toast.success('Gói dịch vụ đã được kích hoạt thành công!');
        } else {
          setVerificationStatus('failed');
          setMessage('Không thể xác nhận trạng thái thanh toán từ PayOS hoặc giao dịch bị hủy.');
          toast.error('Xác thực thanh toán thất bại');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setVerificationStatus('failed');
        setMessage(err?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực giao dịch.');
        toast.error('Lỗi khi xác thực thanh toán');
      }
    };

    runVerification();
  }, [orderCode, verifyPayment]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          {verificationStatus === 'verifying' && (
            <Loader2 className="h-16 w-16 text-sky-400 animate-spin" />
          )}
          {verificationStatus === 'success' && (
            <CheckCircle className="h-16 w-16 text-emerald-400 animate-bounce" />
          )}
          {verificationStatus === 'failed' && (
            <XCircle className="h-16 w-16 text-rose-400 animate-pulse" />
          )}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {verificationStatus === 'verifying' && 'Đang xác thực...'}
            {verificationStatus === 'success' && 'Thanh toán thành công!'}
            {verificationStatus === 'failed' && 'Thanh toán thất bại'}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="pt-2">
          <Link to="/recruiter/packages">
            <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              Quay về quản lý gói
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
