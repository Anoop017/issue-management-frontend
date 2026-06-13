'use client';

interface DeleteConfirmProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  loadingText?: string;
  isDanger?: boolean;
}

export default function DeleteConfirm({
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmText = 'Delete',
  loadingText = 'Deleting...',
  isDanger = true,
}: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-danger hover:bg-danger-hover'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {loading ? loadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
