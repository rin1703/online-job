import { useEffect, useState } from 'react';
import { Award, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { InputField } from '@/features/job-seeker/components/profile/components/form/InputField.tsx';
import { CertificateCard } from '@/features/job-seeker/components/profile/components/certificates/CertificateCard.tsx';
import type { Certificate } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

type CertificatesSectionProps = {
  certificates: Certificate[];
  onUpdate: (updatedCertificates: Certificate[]) => void;
  isPublicView?: boolean;
};

function CertificatesSection({ certificates, onUpdate, isPublicView }: CertificatesSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localCertificates, setLocalCertificates] = useState<Certificate[]>(certificates);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with props when they change from outside (but not while editing)
  useEffect(() => {
    if (editingIndex === null) {
      setLocalCertificates(certificates);
    }
  }, [certificates, editingIndex]);

  // Cleanup on unmount - remove empty new entries
  useEffect(() => {
    return () => {
      if (editingIndex !== null) {
        const certificate = localCertificates[editingIndex];
        if (
          certificate &&
          certificate.title === '' &&
          certificate.organization === ''
        ) {
          const newCertificates = localCertificates.filter((_, i) => i !== editingIndex);
          setLocalCertificates(newCertificates);
        }
      }
    };
  }, [editingIndex]);

  const handleAdd = () => {
    const newCertificate: Certificate = {
      title: '',
      organization: '',
      issueDate: new Date().toISOString().split('T')[0], // Today's date as default
      credentialUrl: '',
    };
    setLocalCertificates((prev) => [newCertificate, ...prev]);
    setEditingIndex(0);
  };

  const handleRemove = (index: number) => {
    toast.warning('Are you sure you want to remove this certificate?', {
      action: {
        label: 'Remove',
        onClick: () => {
          const newCertificates = localCertificates.filter((_, i) => i !== index);
          setLocalCertificates(newCertificates);
          onUpdate(newCertificates);
          if (editingIndex === index) setEditingIndex(null);
          toast.success('Certificate removed');
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleChange = (index: number, field: keyof Certificate, value: string) => {
    setLocalCertificates((prev) => {
      const newCertificates = [...prev];
      newCertificates[index] = { ...newCertificates[index], [field]: value };
      return newCertificates;
    });
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const certificate = localCertificates[editingIndex];

      // Validation
      if (!certificate.title.trim()) {
        toast.error('Certificate title is required');
        return;
      }
      if (!certificate.organization.trim()) {
        toast.error('Organization is required');
        return;
      }
      if (!certificate.issueDate) {
        toast.error('Issue date is required');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onUpdate(localCertificates);
      setEditingIndex(null);
      toast.success('Certificate saved successfully');
    } catch (error) {
      toast.error('Failed to save certificate');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (editingIndex !== null) {
      const certificate = localCertificates[editingIndex];
      // If it's a new unmodified entry, remove it
      if (certificate.title === '' && certificate.organization === '') {
        const newCertificates = localCertificates.filter((_, i) => i !== editingIndex);
        setLocalCertificates(newCertificates);
      } else {
        // Revert to original data
        setLocalCertificates(certificates);
      }
    }
    setEditingIndex(null);
  };

  return (
    <section className="w-full p-6 bg-card rounded-lg shadow-md border border-border">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Certifications</h2>
            <p className="text-sm text-muted-foreground">
              {localCertificates.length} certificate{localCertificates.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {!isPublicView && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        )}
      </div>

      <div className="space-y-4">
        {localCertificates.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
            <Award className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">No Certifications</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven't added any certifications yet.
            </p>
            {!isPublicView && (
              <button
                type="button"
                onClick={handleAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                <Plus className="h-4 w-4" />
                Add Certification
              </button>
            )}
          </div>
        ) : (
          localCertificates.map((certificate, index) => (
            <div key={certificate._id || `cert-${index}`}>
              {editingIndex === index ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      id={`title-${index}`}
                      label="Certificate Title *"
                      value={certificate.title}
                      onChange={(e) => handleChange(index, 'title', e.target.value)}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                    <InputField
                      id={`organization-${index}`}
                      label="Issuing Organization *"
                      value={certificate.organization}
                      onChange={(e) => handleChange(index, 'organization', e.target.value)}
                      placeholder="e.g., Amazon Web Services"
                    />
                    <InputField
                      id={`issueDate-${index}`}
                      label="Issue Date *"
                      type="date"
                      value={
                        typeof certificate.issueDate === 'string'
                          ? certificate.issueDate.split('T')[0]
                          : new Date(certificate.issueDate).toISOString().split('T')[0]
                      }
                      onChange={(e) => handleChange(index, 'issueDate', e.target.value)}
                    />
                    <InputField
                      id={`credentialUrl-${index}`}
                      label="Credential URL (Optional)"
                      value={certificate.credentialUrl || ''}
                      onChange={(e) => handleChange(index, 'credentialUrl', e.target.value)}
                      placeholder="https://www.credly.com/badges/..."
                    />
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <CertificateCard
                  certificate={certificate}
                  onEdit={!isPublicView ? () => setEditingIndex(index) : undefined}
                />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CertificatesSection;
