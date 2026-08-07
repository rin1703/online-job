import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/admin/select-custom';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Package, Loader2, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Btn';
import type { Package as PackageType } from '@/data/mockAdminData';
import { useGetSubscriptionPackagesQuery, useLazyGetSubscriptionPackageDetailQuery, useDeleteSubscriptionPackageMutation, useUpdateSubscriptionPackageMutation, useCreateSubscriptionPackageMutation } from '@/features/admin/api/admin.service';
import type { UpdatePackageRequest, CreatePackageRequest, SubscriptionPackage } from '@/features/admin/api/admin.type';

const getDefaultPackageFormValues = (): CreatePackageRequest => ({
  name: '',
  price: 0,
  type: 'basic',
  duration: { value: 1, unit: 'month' },
  features: {
    jobPostings: { limit: 3, featured: 0, visibleDuration: 15 },
    candidateSearch: { enabled: false, viewsPerMonth: 0, downloadCV: false },
    messaging: { enabled: false, messagesPerMonth: 0 },
    support: { priority: 'none', analytics: false, advancedReports: false },
    advertising: { homepageBanner: false, emailCampaign: 0, socialMediaPromotion: false },
    extras: [],
  },
  description: '',
});

const mapPackageDetailToForm = (pkg: SubscriptionPackage): CreatePackageRequest => ({
  name: pkg.name,
  price: pkg.price,
  type: pkg.type || 'basic',
  duration: {
    value: pkg.duration?.value || 1,
    unit: (pkg.duration?.unit as 'day' | 'month' | 'year') || 'month',
  },
  features: {
    jobPostings: {
      limit: pkg.features?.jobPostings?.limit ?? 0,
      featured: pkg.features?.jobPostings?.featured ?? 0,
      visibleDuration: pkg.features?.jobPostings?.visibleDuration ?? 15,
    },
    candidateSearch: {
      enabled: pkg.features?.candidateSearch?.enabled ?? false,
      viewsPerMonth: pkg.features?.candidateSearch?.viewsPerMonth ?? 0,
      downloadCV: pkg.features?.candidateSearch?.downloadCV ?? false,
    },
    messaging: {
      enabled: pkg.features?.messaging?.enabled ?? false,
      messagesPerMonth: pkg.features?.messaging?.messagesPerMonth ?? 0,
    },
    support: {
      priority: pkg.features?.support?.priority ?? 'none',
      analytics: pkg.features?.support?.analytics ?? false,
      advancedReports: pkg.features?.support?.advancedReports ?? false,
    },
    advertising: {
      homepageBanner: pkg.features?.advertising?.homepageBanner ?? false,
      emailCampaign: pkg.features?.advertising?.emailCampaign ?? 0,
      socialMediaPromotion: pkg.features?.advertising?.socialMediaPromotion ?? false,
    },
    extras: pkg.features?.extras || [],
  },
  description: pkg.description || '',
});

export default function PackagesManagement() {
  const { data: packagesRes, isLoading, refetch } = useGetSubscriptionPackagesQuery();
  const [getSubscriptionPackageDetail] = useLazyGetSubscriptionPackageDetailQuery();
  const [deleteSubscriptionPackage, { isLoading: isDeleting }] = useDeleteSubscriptionPackageMutation();
  const [updateSubscriptionPackage, { isLoading: isUpdating }] = useUpdateSubscriptionPackageMutation();
  const [createSubscriptionPackage, { isLoading: isCreating }] = useCreateSubscriptionPackageMutation();
  const [localPackages, setLocalPackages] = useState<PackageType[]>([]);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(null);
  const [updatingPackageId, setUpdatingPackageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPackageDetail, setSelectedPackageDetail] = useState<SubscriptionPackage | null>(null);
  const [packageDetailError, setPackageDetailError] = useState('');
  const [loadingPackageAction, setLoadingPackageAction] = useState<{
    id: string;
    action: 'view' | 'edit';
  } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreatePackageRequest>({
    defaultValues: getDefaultPackageFormValues(),
  });

  const packagesFromApi: PackageType[] = (packagesRes?.data || []).map((p: any) => ({
    id: p._id || p.id || String(Math.random()),
    name: p.name,
    price: p.price || 0,
    duration: p.duration?.value || 0,
    durationUnit: p.duration?.unit || 'day',
    postLimit: p.features?.jobPostings?.limit ?? 0,
    features: [
      p.features?.jobPostings ? `${p.features.jobPostings.limit === -1 ? 'Unlimited postings' : `Post up to ${p.features.jobPostings.limit} tin`}` : '',
      p.features?.jobPostings ? `Display for ${p.features.jobPostings.visibleDuration || ''} days` : '',
      p.badge || '',
    ].filter(Boolean),
    status: p.isActive ? 'active' : 'inactive',
    createdAt: p.createdAt || new Date().toISOString().split('T')[0],
  }));

  const packages = packagesFromApi.length ? packagesFromApi : localPackages;

  const onSubmit = async (data: CreatePackageRequest) => {
    if (editingPackage) {
      // Update existing package
      try {
        setUpdatingPackageId(editingPackage.id);
        const updatePayload: UpdatePackageRequest = {
          packageId: editingPackage.id,
          name: data.name,
          type: data.type,
          price: data.price,
          duration: {
            value: data.duration.value,
            unit: data.duration.unit as 'day' | 'month' | 'year',
          },
          features: data.features,
          description: data.description,
          isActive: editingPackage.status === 'active',
        };

        await updateSubscriptionPackage(updatePayload).unwrap();
        await refetch();
        toast.success('Package updated successfully');
        setIsDialogOpen(false);
        reset();
        setEditingPackage(null);
      } catch (error: unknown) {
        let errorMsg = 'Unknown error';
        if (error && typeof error === 'object') {
          const errorObj = error as any;
          errorMsg = errorObj.data?.message || errorObj.message || errorMsg;
        }
        toast.error(`Failed to update package: ${errorMsg}`);
      } finally {
        setUpdatingPackageId(null);
      }
    } else {
      // Create new package
      try {
        const createPayload: CreatePackageRequest = {
          name: data.name,
          type: data.type,
          price: data.price,
          duration: {
            value: data.duration.value,
            unit: data.duration.unit as 'day' | 'month' | 'year',
          },
          features: {
            jobPostings: {
              limit: data.features.jobPostings.limit,
              featured: data.features.jobPostings.featured,
              visibleDuration: data.features.jobPostings.visibleDuration,
            },
            candidateSearch: {
              enabled: data.features.candidateSearch.enabled,
              viewsPerMonth: data.features.candidateSearch.viewsPerMonth,
              downloadCV: data.features.candidateSearch.downloadCV,
            },
            messaging: {
              enabled: data.features.messaging.enabled,
              messagesPerMonth: data.features.messaging.messagesPerMonth,
            },
            support: {
              priority: data.features.support.priority,
              analytics: data.features.support.analytics,
              advancedReports: data.features.support.advancedReports,
            },
            advertising: {
              homepageBanner: data.features.advertising.homepageBanner,
              emailCampaign: data.features.advertising.emailCampaign,
              socialMediaPromotion: data.features.advertising.socialMediaPromotion,
            },
            extras: data.features.extras || [],
          },
          description: data.description,
        };

        await createSubscriptionPackage(createPayload).unwrap();
        await refetch();
        toast.success('Package created successfully');
        setIsDialogOpen(false);
        reset();
      } catch (error: unknown) {
        let errorMsg = 'Unknown error';
        if (error && typeof error === 'object') {
          const errorObj = error as any;
          errorMsg = errorObj.data?.message || errorObj.message || errorMsg;
        }
        toast.error(`Failed to create package: ${errorMsg}`);
      }
    }
  };

  const getErrorMessage = (error: unknown) => {
    if (error && typeof error === 'object') {
      const errorObj = error as { data?: { message?: string }; message?: string };
      return errorObj.data?.message || errorObj.message || 'Unknown error';
    }
    return 'Unknown error';
  };

  const handleViewDetails = async (pkg: PackageType) => {
    setSelectedPackageDetail(null);
    setPackageDetailError('');
    setIsDetailDialogOpen(true);
    setLoadingPackageAction({ id: pkg.id, action: 'view' });

    try {
      const detail = await getSubscriptionPackageDetail(pkg.id).unwrap();
      setSelectedPackageDetail(detail);
    } catch (error: unknown) {
      setPackageDetailError(getErrorMessage(error));
    } finally {
      setLoadingPackageAction(null);
    }
  };

  const handleEdit = async (pkg: PackageType) => {
    setLoadingPackageAction({ id: pkg.id, action: 'edit' });

    try {
      const detail = await getSubscriptionPackageDetail(pkg.id).unwrap();
      setEditingPackage(pkg);
      reset(mapPackageDetailToForm(detail));
      setIsDialogOpen(true);
    } catch (error: unknown) {
      toast.error(`Failed to load package details: ${getErrorMessage(error)}`);
    } finally {
      setLoadingPackageAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) {
      return;
    }

    try {
      setDeletingPackageId(id);
      await deleteSubscriptionPackage({
        packageId: id,
        permanent: true,
      }).unwrap();

      setLocalPackages(localPackages.filter(pkg => pkg.id !== id));
      toast.success('Package deleted successfully');
    } catch (error: unknown) {
      let errorMsg = 'Unknown error';
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        errorMsg = errorObj.data?.message || errorObj.message || errorMsg;
      }
      toast.error(`Failed to delete package: ${errorMsg}`);
    } finally {
      setDeletingPackageId(null);
    }
  };

  const toggleStatus = async (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    const newStatus = pkg.status === 'active' ? 'inactive' : 'active';

    try {
      setUpdatingPackageId(id);
      await updateSubscriptionPackage({
        packageId: id,
        isActive: newStatus === 'active',
      }).unwrap();

      setLocalPackages(localPackages.map(p =>
        p.id === id ? { ...p, status: newStatus } : p
      ));
      toast.success(`Package status changed to ${newStatus}`);
    } catch (error: unknown) {
      let errorMsg = 'Unknown error';
      if (error && typeof error === 'object') {
        const errorObj = error as any;
        errorMsg = errorObj.data?.message || errorObj.message || errorMsg;
      }
      toast.error(`Failed to update package status: ${errorMsg}`);
    } finally {
      setUpdatingPackageId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Create and manage subscription packages for recruiters</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingPackage(null);
              reset();
            }}>
              <div className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create New Package
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Edit Package' : 'Create New Package'}
              </DialogTitle>
              <DialogDescription>
                Fill in detailed information for the subscription package
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm">
                      Package Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Basic Plan"
                      {...register('name', {
                        required: 'Package name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      })}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-sm">
                      Type
                    </Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value || 'basic'} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm">
                      Price (VND) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      {...register('price', {
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be 0 or greater' },
                      })}
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Package description"
                    {...register('description')}
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Duration</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="durationValue" className="text-sm">
                      Value *
                    </Label>
                    <Input
                      id="durationValue"
                      type="number"
                      placeholder="1"
                      {...register('duration.value', {
                        required: 'Duration value is required',
                        min: { value: 1, message: 'Duration must be at least 1' },
                      })}
                      className={errors.duration?.value ? 'border-red-500' : ''}
                    />
                    {errors.duration?.value && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.duration.value.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="durationUnit" className="text-sm">
                      Unit *
                    </Label>
                    <Controller
                      name="duration.unit"
                      control={control}
                      rules={{ required: 'Duration unit is required' }}
                      render={({ field }) => (
                        <Select value={field.value || 'month'} onValueChange={field.onChange}>
                          <SelectTrigger className={errors.duration?.unit ? 'border-red-500' : ''}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.duration?.unit && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.duration.unit.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Postings Features */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Job Postings Features</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="jobPostLimit" className="text-sm">
                      Post Limit *
                    </Label>
                    <Input
                      id="jobPostLimit"
                      type="number"
                      placeholder="3"
                      {...register('features.jobPostings.limit', {
                        required: 'Post limit is required',
                        min: { value: -1, message: 'Limit must be -1 or greater (-1 for unlimited)' },
                      })}
                      className={errors.features?.jobPostings?.limit ? 'border-red-500' : ''}
                    />
                    {errors.features?.jobPostings?.limit && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.features.jobPostings.limit.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="jobPostFeatured" className="text-sm">
                      Featured Posts
                    </Label>
                    <Input
                      id="jobPostFeatured"
                      type="number"
                      placeholder="0"
                      {...register('features.jobPostings.featured', {
                        min: { value: 0, message: 'Must be 0 or greater' },
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobPostDuration" className="text-sm">
                      Visible Duration (days)
                    </Label>
                    <Input
                      id="jobPostDuration"
                      type="number"
                      placeholder="15"
                      {...register('features.jobPostings.visibleDuration', {
                        min: { value: 0, message: 'Must be 0 or greater' },
                      })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    reset();
                    setEditingPackage(null);
                  }}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingPackage ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingPackage ? (
                    'Update Package'
                  ) : (
                    'Create Package'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Package List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Post Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && packagesFromApi.length === 0 ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={`loading-${i}`}>
                    <TableCell colSpan={7}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No packages found. Create your first package to get started.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-orange-500" />
                        <span>{pkg.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pkg.price.toLocaleString()} VND</TableCell>
                    <TableCell>{pkg.duration} {pkg.durationUnit}</TableCell>
                    <TableCell>{pkg.postLimit === -1 ? 'Unlimited' : pkg.postLimit}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={pkg.status === 'active'}
                          onCheckedChange={() => toggleStatus(pkg.id)}
                          disabled={updatingPackageId === pkg.id || isUpdating}
                        />
                        <Badge
                          variant={pkg.status === 'active' ? 'default' : 'secondary'}
                          className={pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {pkg.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`View details for ${pkg.name}`}
                          title="View package details"
                          onClick={() => handleViewDetails(pkg)}
                          disabled={Boolean(loadingPackageAction) || isDeleting || isUpdating || isCreating}
                        >
                          {loadingPackageAction?.id === pkg.id && loadingPackageAction.action === 'view' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          aria-label={`Edit ${pkg.name}`}
                          title="Edit package"
                          onClick={() => handleEdit(pkg)}
                          disabled={Boolean(loadingPackageAction) || isDeleting || isUpdating || isCreating}
                        >
                          {loadingPackageAction?.id === pkg.id && loadingPackageAction.action === 'edit' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDelete(pkg.id)}
                          disabled={deletingPackageId === pkg.id || isDeleting}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingPackageId === pkg.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) {
            setSelectedPackageDetail(null);
            setPackageDetailError('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Package Details</DialogTitle>
            <DialogDescription>
              Review all package information before making changes.
            </DialogDescription>
          </DialogHeader>

          {loadingPackageAction?.action === 'view' && !selectedPackageDetail ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading package details...
            </div>
          ) : packageDetailError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              Unable to load package details: {packageDetailError}
            </div>
          ) : selectedPackageDetail ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-lg border bg-gray-50 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedPackageDetail.name}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {selectedPackageDetail.type || 'basic'}
                    </Badge>
                    {selectedPackageDetail.badge && (
                      <Badge className="bg-orange-100 text-orange-800 capitalize">
                        {selectedPackageDetail.badge}
                      </Badge>
                    )}
                    <Badge className={selectedPackageDetail.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedPackageDetail.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedPackageDetail.description || selectedPackageDetail.shortDescription || 'No description provided.'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedPackageDetail.price.toLocaleString()} VND
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPackageDetail.duration?.value || 0} {selectedPackageDetail.duration?.unit || 'day'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900">Job postings</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Post limit</dt><dd className="font-medium">{selectedPackageDetail.features?.jobPostings?.limit === -1 ? 'Unlimited' : selectedPackageDetail.features?.jobPostings?.limit ?? 0}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Featured posts</dt><dd className="font-medium">{selectedPackageDetail.features?.jobPostings?.featured ?? 0}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Visible duration</dt><dd className="font-medium">{selectedPackageDetail.features?.jobPostings?.visibleDuration ?? 0} days</dd></div>
                  </dl>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900">Candidate search</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Enabled</dt><dd className="font-medium">{selectedPackageDetail.features?.candidateSearch?.enabled ? 'Yes' : 'No'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">CV views/month</dt><dd className="font-medium">{selectedPackageDetail.features?.candidateSearch?.viewsPerMonth ?? 0}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Download CV</dt><dd className="font-medium">{selectedPackageDetail.features?.candidateSearch?.downloadCV ? 'Yes' : 'No'}</dd></div>
                  </dl>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900">Messaging & support</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Messaging</dt><dd className="font-medium">{selectedPackageDetail.features?.messaging?.enabled ? 'Enabled' : 'Disabled'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Messages/month</dt><dd className="font-medium">{selectedPackageDetail.features?.messaging?.messagesPerMonth === -1 ? 'Unlimited' : selectedPackageDetail.features?.messaging?.messagesPerMonth ?? 0}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Support</dt><dd className="font-medium capitalize">{selectedPackageDetail.features?.support?.priority || 'none'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Analytics</dt><dd className="font-medium">{selectedPackageDetail.features?.support?.analytics ? 'Yes' : 'No'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Advanced reports</dt><dd className="font-medium">{selectedPackageDetail.features?.support?.advancedReports ? 'Yes' : 'No'}</dd></div>
                  </dl>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900">Advertising</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Homepage banner</dt><dd className="font-medium">{selectedPackageDetail.features?.advertising?.homepageBanner ? 'Yes' : 'No'}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Email campaigns</dt><dd className="font-medium">{selectedPackageDetail.features?.advertising?.emailCampaign ?? 0}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-gray-500">Social promotion</dt><dd className="font-medium">{selectedPackageDetail.features?.advertising?.socialMediaPromotion ? 'Yes' : 'No'}</dd></div>
                  </dl>
                </div>
              </div>

              {selectedPackageDetail.features?.extras?.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900">Additional features</h4>
                  <ul className="mt-3 space-y-2 text-sm">
                    {selectedPackageDetail.features.extras.map((extra: { name?: string; description?: string; enabled?: boolean }, index: number) => (
                      <li key={`${extra.name || 'extra'}-${index}`} className="flex items-start justify-between gap-4 rounded-md bg-gray-50 px-3 py-2">
                        <div>
                          <p className="font-medium text-gray-900">{extra.name || 'Additional feature'}</p>
                          {extra.description && <p className="text-gray-500">{extra.description}</p>}
                        </div>
                        <Badge className={extra.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}>
                          {extra.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                <span>Display order: {selectedPackageDetail.displayOrder ?? 0}</span>
                {selectedPackageDetail.createdAt && (
                  <span>Created: {new Date(selectedPackageDetail.createdAt).toLocaleDateString('vi-VN')}</span>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const row = packages.find((pkg) => pkg.id === (selectedPackageDetail._id || selectedPackageDetail.id));
                    setIsDetailDialogOpen(false);
                    if (row) void handleEdit(row);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Package
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
