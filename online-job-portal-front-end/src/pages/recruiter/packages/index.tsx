import { Button } from '@/components/ui/Btn';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  useGetCurrentSubscriptionWithPackagesQuery,
  useGetWalletBalanceQuery,
  useCreatePaymentMutation,
  useBuySubscriptionWithWalletMutation,
  useCreateRefundMutation,
} from '@/features/recruiter/api/recruiter.service';
import type { RootState } from '@/redux/store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PackageManagementPage() {
  const navigate = useNavigate();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [selectedPackageForRefund, setSelectedPackageForRefund] = useState<any>(null);
  const [refundData, setRefundData] = useState({
    reason: "",
    refundType: "" as "unused" | "system" | ""
  });

  // Get userId from Redux auth state first, fallback to localStorage
  const authUser = useSelector((state: RootState) => state.auth?.user);
  let userId: string | null = authUser?.userId || null;

  // Fallback to localStorage if Redux doesn't have user
  if (!userId && typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userId = u?._id || u?.id || null;
      }
    } catch (_e) {
      // Silent fail
    }
  }

  // Queries and mutations
  const { data } = useGetCurrentSubscriptionWithPackagesQuery(userId ?? '', { skip: !userId });
  const { data: walletData } = useGetWalletBalanceQuery();
  const [createPayment] = useCreatePaymentMutation();
  const [buySubscriptionWithWallet] = useBuySubscriptionWithWalletMutation();
  const [createRefund] = useCreateRefundMutation();


  const packagesToRender = useMemo(() => {
    // Response structure: packages array with buyed field directly on each package
    if (!data) {
      console.log("Data is null/undefined");
      return [];
    }

    // Handle both response structures - direct array or nested in data.data or data
    let apiPackages = [];
    
    // Try different response structures
    if (Array.isArray(data)) {
      apiPackages = data;
    } else {
      const innerData = (data as any)?.data || data;
      if (Array.isArray(innerData?.packages)) {
        apiPackages = innerData.packages;
      } else if (Array.isArray(innerData)) {
        apiPackages = innerData;
      }
    }
    
    console.log("API packages:", apiPackages);

    if (apiPackages && Array.isArray(apiPackages) && apiPackages.length > 0) {
      const packages = apiPackages.map((p: any) => {
        // Extract feature details
        const jobPostings = p.features?.jobPostings || {};
        const candidateSearch = p.features?.candidateSearch || {};
        const messaging = p.features?.messaging || {};
        const support = p.features?.support || {};
        const advertising = p.features?.advertising || {};
        
        // Build comprehensive features list
        const featuresList = [];
        
        // Job postings feature
        if (jobPostings.limit !== undefined) {
          if (jobPostings.limit === -1) {
            featuresList.push('Unlimited Job Postings');
          } else {
            featuresList.push(`Up to ${jobPostings.limit} Job Postings`);
          }
        }
        
        // Featured postings (handle -1 as unlimited)
        if (jobPostings.featured !== undefined) {
          if (jobPostings.featured === -1) {
            featuresList.push('Unlimited Featured Postings');
          } else if (jobPostings.featured > 0) {
            featuresList.push(`${jobPostings.featured} Featured Postings`);
          }
        }
        
        // Visibility duration
        if (jobPostings.visibleDuration) {
          featuresList.push(`Visible for ${jobPostings.visibleDuration} days`);
        }
        
        // Candidate search
        if (candidateSearch.enabled) {
          const viewsText = candidateSearch.viewsPerMonth > 0 
            ? `${candidateSearch.viewsPerMonth} views/month`
            : 'Unlimited views';
          featuresList.push(`Candidate Search (${viewsText})`);
          
          if (candidateSearch.downloadCV) {
            featuresList.push('Download Candidate CVs');
          }
        }
        
        // Messaging
        if (messaging.enabled) {
          const messagesText = messaging.messagesPerMonth > 0 
            ? `${messaging.messagesPerMonth} messages/month`
            : 'Unlimited messages';
          featuresList.push(`Direct Messaging (${messagesText})`);
        }
        
        // Support features
        if (support.priority && support.priority !== 'none') {
          featuresList.push(`${support.priority.charAt(0).toUpperCase() + support.priority.slice(1)} Priority Support`);
        }
        if (support.analytics) {
          featuresList.push('Analytics Dashboard');
        }
        if (support.advancedReports) {
          featuresList.push('Advanced Reports');
        }
        
        // Advertising features
        if (advertising.homepageBanner) {
          featuresList.push('Homepage Banner');
        }
        if (advertising.emailCampaign && advertising.emailCampaign > 0) {
          featuresList.push(`${advertising.emailCampaign} Email Campaigns`);
        }
        if (advertising.socialMediaPromotion) {
          featuresList.push('Social Media Promotion');
        }
        
        // Format duration display
        const durationValue = p.duration?.value || 30;
        const durationUnit = p.duration?.unit || 'month';
        const durationDisplay = `${durationValue} ${durationUnit}${durationValue > 1 ? 's' : ''}`;
        
        // Use buyed field directly from response
        const isBuyed = p.buyed === true;
        
        return {
          packageId: p._id || p.id,
          packageName: p.name || p.title || 'Package',
          packageType: p.type || 'basic', // 'basic' | 'standard' | 'premium' | 'enterprise'
          description: p.shortDescription || p.description || '',
          price: p.price,
          formattedPrice: p.price ? `${p.price.toLocaleString()}đ` : '0đ',
          validityDays: durationValue,
          durationUnit: durationUnit,
          durationDisplay: durationDisplay,
          features: featuresList.length > 0 ? featuresList : ['Basic features included'],
          isPopular: !!p.badge,
          badge: p.badge || null,
          isActive: p.isActive !== false,
          buyed: isBuyed,
        };
      });

      // Sort packages by type: basic -> standard -> premium -> others
      const typeOrder: { [key: string]: number } = {
        'basic': 0,
        'standard': 1,
        'premium': 2,
      };

      return packages.sort((a: any, b: any) => {
        const orderA = typeOrder[a.packageType] ?? 999;
        const orderB = typeOrder[b.packageType] ?? 999;
        return orderA - orderB;
      });
    }

    return [];
  }, [data]);

  const handlePurchase = async (packageId: string) => {
    try {
      setIsPurchasing(true);

      // Find the selected package by ID
      const selectedPkg = packagesToRender.find((pkg: any) => pkg.packageId === packageId);
      if (!selectedPkg) {
        console.error('Package not found by ID:', packageId);
        return;
      }

      if (!packageId) {
        console.error('Package ID is invalid');
        return;
      }

      // Get wallet balance
      const walletBalance = walletData?.balance || 0;

      // Extract numeric price from the price number (not formatted string)
      const packagePrice = selectedPkg.price || 0;

      console.log('Wallet balance:', walletBalance);
      console.log('Package price:', packagePrice);

      if (walletBalance >= packagePrice) {
        // Balance is enough - use wallet to purchase
        console.log('Sufficient balance, purchasing with wallet...');
        const result = await buySubscriptionWithWallet({ packageId }).unwrap();
        console.log('Purchase successful:', result);

        // Show success toast
        toast.success(`✓ Purchase successful! New balance: ${result.walletBalance}`);

        // Refresh the packages list to show updated status
        navigate(0); // Reload page or refetch data
      } else {
        // Balance is not enough - redirect to payment
        console.log('Insufficient balance, redirecting to payment...');
        const result = await createPayment({ jobPackageId: packageId }).unwrap();
        console.log('Payment link created:', result);

        // Redirect to payment URL
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        }
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      toast.error(`Error: ${err?.data?.message || 'Purchase failed'}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleViewDetails = (packageId: string) => {
    console.log('View details for package ID:', packageId);
  };

  const handleOpenRefund = (pkg: any) => {
    // Since buyed status comes directly from API, we can proceed with refund
    console.log("Selected package for refund:", pkg);
    
    if (!pkg.buyed) {
      toast.error('You cannot refund a package you do not have active subscription for.');
      return;
    }
    
    // Use packageId directly as subscriptionId - it's the package being refunded
    setSelectedPackageForRefund({ ...pkg, subscriptionId: pkg.packageId });
    setRefundData({ reason: "", refundType: "" });
    setIsRefundOpen(true);
  };

  const handleSubmitRefund = async () => {
    if (!selectedPackageForRefund?.subscriptionId) {
      toast.error("Subscription ID not found");
      return;
    }

    try {
      setIsRefunding(true);
      
      const payload = {
        subscriptionId: selectedPackageForRefund.subscriptionId,
        reason: refundData.reason,
        refundType: refundData.refundType as 'unused' | 'system',
      };

      console.log('Submitting refund request:', payload);
      const result = await createRefund(payload).unwrap();
      console.log('Refund request created:', result);
      
      toast.success(`Refund request created successfully!`);
      setIsRefundOpen(false);
      
      // Optional: refetch subscription data
      // navigate(0);
    } catch (err: any) {
      console.error('Refund error:', err);
      toast.error(`Error: ${err?.data?.message || 'Refund request failed'}`);
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Package Management</h1>
      <p className="text-text-blur mb-8">
        Choose the right plan to find talented candidates for your company.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packagesToRender.map((pkg: any) => {
          // Determine card styling based on package type
          const isStandard = pkg.packageType === 'standard';
          const isPremium = pkg.packageType === 'premium';
          const cardBorderClass = isStandard 
            ? 'border-amber-400 border-2'
            : isPremium
              ? 'border-purple-500 border-2'
              : 'border-stroke';
          
          return (
            <Card
              key={pkg.packageId}
              className={`flex flex-col ${cardBorderClass} shadow-sm hover:shadow-lg transition-all relative`}
            >
              {/* Package Type Badge (top-right) */}
              {pkg.packageType && pkg.packageType !== 'basic' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {pkg.packageType.charAt(0).toUpperCase() + pkg.packageType.slice(1)}
                </div>
              )}
              
              {/* Current Subscription Indicator */}
              {pkg.buyed && (
                <div className="bg-green-50 text-green-700 text-xs font-semibold text-center py-2 rounded-t-lg border-b border-green-200">
                  ✓ Current Package
                </div>
              )}
              
              <CardHeader className={pkg.buyed ? 'pb-2 pt-2' : 'pb-4'}>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl font-bold text-primary flex-1">{pkg.packageName}</CardTitle>
                  {pkg.badge && (
                    <Badge variant="outline" className="ml-2">{pkg.badge}</Badge>
                  )}
                </div>
                <CardDescription className="pt-2">{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                {/* Price Section */}
                <p className="text-4xl font-extrabold mb-4">
                  {pkg.formattedPrice}
                  <span className="text-sm font-normal text-text-blur">
                    / {pkg.durationDisplay || `${pkg.validityDays} days`}
                  </span>
                </p>
                
                {/* Features List */}
                <ul className="space-y-3">
                  {pkg.features.map((feature: string, idx: number) => (
                    <li key={`${pkg.packageId}-feature-${idx}`} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
                {!pkg.buyed && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handlePurchase(pkg.packageId)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? 'Processing...' : 'Purchase Now'}
                  </Button>
                )}
                {pkg.buyed && (
                  <Button
                    variant="filled"
                    className="w-full"
                    onClick={() => handleOpenRefund(pkg)}
                  >
                    Request Refund
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full border-default text-default hover:bg-btn-orange"
                  onClick={() => handleViewDetails(pkg.packageId)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Please provide a reason and choose the refund type.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">

            {/* Reason Input */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="refundReason">Reason</Label>
              <Textarea
                id="refundReason"
                placeholder="Explain why you request a refund..."
                value={refundData.reason}
                onChange={(e) =>
                  setRefundData({ ...refundData, reason: e.target.value })
                }
              />
            </div>

            {/* Refund Type */}
            <div className="flex flex-col gap-2">
              <Label>Refund Type</Label>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="unused"
                  checked={refundData.refundType === "unused"}
                  onCheckedChange={() =>
                    setRefundData({ ...refundData, refundType: "unused" })
                  }
                />
                <Label htmlFor="unused" className="cursor-pointer">Unused</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="system"
                  checked={refundData.refundType === "system"}
                  onCheckedChange={() =>
                    setRefundData({ ...refundData, refundType: "system" })
                  }
                />
                <Label htmlFor="system" className="cursor-pointer">System issue</Label>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => handleSubmitRefund()}
              disabled={!refundData.reason || !refundData.refundType || isRefunding}
            >
              {isRefunding ? 'Submitting...' : 'Submit Refund Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
