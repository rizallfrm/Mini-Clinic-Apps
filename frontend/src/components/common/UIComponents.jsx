import React from 'react';
import { ChevronLeft, ChevronRight, X, AlertTriangle, Package } from 'lucide-react';

// ===================================================
// STATUS BADGE
// ===================================================
const STATUS_MAP = {
  WAITING:     { label: 'Menunggu',     cls: 'badge-waiting'  },
  CHECKED_IN:  { label: 'Check-In',     cls: 'badge-checkin'  },
  EXAMINATION: { label: 'Pemeriksaan',  cls: 'badge-exam'     },
  COMPLETED:   { label: 'Selesai',      cls: 'badge-done'     },
  CANCELLED:   { label: 'Dibatalkan',   cls: 'badge-cancelled'},
  DRAFT:       { label: 'Draft',        cls: 'badge-draft'    },
  CALLED:      { label: 'Dipanggil',    cls: 'badge-checkin'  },
  IN_PROGRESS: { label: 'Berlangsung',  cls: 'badge-exam'     },
  SKIPPED:     { label: 'Dilewati',     cls: 'badge-draft'    },
};

export const StatusBadge = ({ status, paymentStatus }) => {
  let s = STATUS_MAP[status] || { label: status, cls: 'badge-neutral' };

  if (status === 'COMPLETED') {
    if (paymentStatus === 'PAID') {
      s = { label: 'Selesai (Lunas)', cls: 'badge-done' };
    } else {
      s = { label: 'Menunggu Pembayaran', cls: 'bg-amber-100 text-amber-700' };
    }
  }

  return (
    <span className={`badge ${s.cls}`}>
      <span className="badge-dot" />
      {s.label}
    </span>
  );
};

// ===================================================
// ROLE BADGE
// ===================================================
const ROLE_MAP = {
  ADMIN:                { label: 'Admin',    cls: 'bg-slate-800 text-white' },
  DOCTOR:               { label: 'Dokter',   cls: 'bg-emerald-600 text-white' },
  REGISTRATION_OFFICER: { label: 'Petugas',  cls: 'bg-indigo-600 text-white' },
};

export const RoleBadge = ({ role }) => {
  const r = ROLE_MAP[role] || { label: role, cls: 'bg-slate-600 text-white' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${r.cls}`}>
      {r.label}
    </span>
  );
};

// ===================================================
// LOADING SPINNER
// ===================================================
export const LoadingSpinner = ({ label = 'Memuat data...' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-8 h-8 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
    <span className="text-xs text-slate-500 font-medium">{label}</span>
  </div>
);

// ===================================================
// EMPTY STATE
// ===================================================
export const EmptyState = ({
  icon: Icon = Package,
  title = 'Tidak ada data',
  description = 'Belum ada data yang tersedia.',
  action,
}) => (
  <div className="empty-state">
    <div className="empty-icon">
      <Icon className="w-6 h-6" />
    </div>
    <div className="empty-title">{title}</div>
    <div className="empty-desc">{description}</div>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ===================================================
// PAGINATION
// ===================================================
export const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="pagination">
      <span className="pagination-info">
        Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
        {totalItems !== undefined && (
          <span className="hidden sm:inline"> &bull; {totalItems} total data</span>
        )}
      </span>
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary btn-sm btn-icon"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md">
          {currentPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary btn-sm btn-icon"
          aria-label="Halaman selanjutnya"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ===================================================
// MODAL
// ===================================================
export const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'md' }) => {
  if (!open) return null;

  const sizeClass = size === 'lg' ? 'modal-box--lg' : '';

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal-box ${sizeClass}`}>
        <div className="modal-header">
          <div>
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon flex-shrink-0 ml-2"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// ===================================================
// ALERT
// ===================================================
export const Alert = ({ type = 'error', children }) => {
  const typeClass = {
    error:   'alert-error',
    warning: 'alert-warning',
    success: 'alert-success',
    info:    'alert-info',
  }[type] || 'alert-error';

  return (
    <div className={`alert ${typeClass}`}>
      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
};

// ===================================================
// FORM FIELD
// ===================================================
export const FormField = ({ label, required, error, disabled, children }) => (
  <div className="form-group">
    {label && (
      <label className={`form-label ${disabled ? 'form-label--muted' : ''}`}>
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {error && <span className="form-error-text">{error}</span>}
  </div>
);

// ===================================================
// INPUT
// ===================================================
export const Input = React.forwardRef(({ error, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={`form-input ${error ? 'form-input--error' : ''} ${props.className || ''}`}
  />
));
Input.displayName = 'Input';

// ===================================================
// SELECT
// ===================================================
export const Select = React.forwardRef(({ error, children, ...props }, ref) => (
  <select
    ref={ref}
    {...props}
    className={`form-input ${error ? 'form-input--error' : ''} ${props.className || ''}`}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

// ===================================================
// TEXTAREA
// ===================================================
export const Textarea = React.forwardRef(({ error, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    {...props}
    className={`form-input ${error ? 'form-input--error' : ''} ${props.className || ''}`}
  />
));
Textarea.displayName = 'Textarea';

// ===================================================
// STAT CARD
// ===================================================
export const StatCard = ({ label, value, sub, icon: Icon, iconBg = 'bg-slate-100', iconColor = 'text-slate-500', trend }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

// ===================================================
// PAGE HEADER
// ===================================================
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="page-header">
    <div>
      <h2 className="page-header-title">{title}</h2>
      {subtitle && <p className="page-header-sub">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0 w-full sm:w-auto">{action}</div>}
  </div>
);

// ===================================================
// CARD
// ===================================================
export const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`card ${noPadding ? '' : ''} ${className}`}>
    {children}
  </div>
);
