import { useDeferredValue, useEffect, useState } from 'react';
import { ExternalLink, Filter, ReceiptText, Search } from 'lucide-react';

import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetPaymentHistoryQuery } from '@/features/recruiter/api/recruiter.service';
import type {
  PaymentPurpose,
  PaymentStatus,
} from '@/features/recruiter/api/recruiter.type';

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatPurpose = (purpose: PaymentPurpose) =>
  ({
    subscription: 'Subscription',
    wallet_topup: 'Wallet top-up',
    wallet_payment: 'Wallet payment',
  })[purpose];

export default function PaymentHistoryPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PaymentStatus | ''>('');
  const [purpose, setPurpose] = useState<PaymentPurpose | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => setPage(1), [deferredSearch, status, purpose, dateFrom, dateTo, minAmount, maxAmount]);

  const { data, isLoading, isFetching, isError } = useGetPaymentHistoryQuery({
    search: deferredSearch || undefined,
    status: status || undefined,
    purpose: purpose || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    minAmount: minAmount ? Number(minAmount) : undefined,
    maxAmount: maxAmount ? Number(maxAmount) : undefined,
    page,
    limit: 10,
    sortOrder: 'desc',
  });
  const history = data ?? { payments: [], total: 0, totalPages: 0 };

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setPurpose('');
    setDateFrom('');
    setDateTo('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading payment history..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="mt-2 text-gray-600">
          Search, filter and review every payment made for recruiter packages.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5 text-orange-500" />
          <h2 className="font-semibold">Search & filters</h2>
          {isFetching && <span className="text-xs text-gray-500">Updating...</span>}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1 text-sm xl:col-span-2">
            <span className="font-medium text-gray-700">Payment code or description</span>
            <span className="relative block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order code, public code..."
                className="w-full rounded-lg border px-9 py-2 outline-none focus:border-orange-500"
              />
            </span>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as PaymentStatus | '')}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">Payment type</span>
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value as PaymentPurpose | '')}
              className="w-full rounded-lg border px-3 py-2 outline-none focus:border-orange-500"
            >
              <option value="">All types</option>
              <option value="subscription">Subscription</option>
              <option value="wallet_topup">Wallet top-up</option>
              <option value="wallet_payment">Wallet payment</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">From date</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">To date</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">Minimum amount</span>
            <input type="number" min="0" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">Maximum amount</span>
            <input type="number" min="0" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
          </label>
        </div>

        <div className="mt-4 flex justify-end">
          <ButtonLowercase variant="outline" onClick={resetFilters}>Reset filters</ButtonLowercase>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {isError ? (
          <div className="p-8 text-center text-red-600">Unable to load payment history.</div>
        ) : history.payments.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={ReceiptText} message="No payments match the selected filters" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment</TableHead>
                    <TableHead>Package / type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell>
                        <p className="font-medium">{payment.publicCode}</p>
                        <p className="text-xs text-gray-500">Order: {payment.orderCode}</p>
                        <p className="max-w-xs truncate text-xs text-gray-500">{payment.description}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{payment.package?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{formatPurpose(payment.purpose)}</p>
                      </TableCell>
                      <TableCell className="font-semibold">{formatMoney(payment.amount)}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}>
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(payment.createdAt).toLocaleString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'pending' && payment.paymentUrl && (
                          <a href={payment.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline">
                            Continue <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t px-5 py-4">
              <p className="text-sm text-gray-600">{history.total} payment(s)</p>
              <div className="flex items-center gap-2">
                <ButtonLowercase variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</ButtonLowercase>
                <span className="text-sm">Page {page} / {Math.max(history.totalPages, 1)}</span>
                <ButtonLowercase variant="outline" size="sm" disabled={page >= history.totalPages} onClick={() => setPage((value) => value + 1)}>Next</ButtonLowercase>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
