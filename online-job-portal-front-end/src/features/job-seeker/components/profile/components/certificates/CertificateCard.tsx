import { Award, Calendar, ExternalLink, Edit2 } from 'lucide-react';

import type { Certificate } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

interface CertificateCardProps {
  certificate: Certificate;
  onEdit?: () => void;
}

export function CertificateCard({ certificate, onEdit }: CertificateCardProps) {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="relative rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-orange-100">
              <Award className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {certificate.title || 'Untitled Certificate'}
            </h3>
          </div>

          <p className="text-sm font-medium text-muted-foreground mb-2">
            {certificate.organization || 'Organization not specified'}
          </p>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Issued: {formatDate(certificate.issueDate)}</span>
          </div>

          {certificate.credentialUrl && (
            <a
              href={certificate.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View Credential
            </a>
          )}
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20"
            aria-label="Edit certificate"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
