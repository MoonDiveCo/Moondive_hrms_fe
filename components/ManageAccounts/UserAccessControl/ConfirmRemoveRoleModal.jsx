'use client';

import { X } from 'lucide-react';

export default function ConfirmRemoveRoleModal({
  mode = 'remove-role',
  user,
  role,
  onClose,
  onConfirm,
  loading,
}) {
  const isRevoke = mode === 'revoke-permission';
  const isDeleteRole = mode === 'delete-role';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[420px] mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-primaryText">
            {isRevoke
              ? 'Revoke Permissions'
              : isDeleteRole
              ? 'Delete Role'
              : 'Confirm Remove'}
          </h4>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="text-center space-y-2">
          {isRevoke && (
            <p className="text-sm text-gray-600">
              Are you sure you want to revoke{' '}
              <span className="font-medium">all permissions</span> of{' '}
              <span className="font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              ?
            </p>
          )}

          {mode === 'remove-role' && (
            <>
              <p className="text-sm text-gray-600">
                Are you sure you want to remove{' '}
                <span className="font-medium">{user?.name}</span> from{' '}
                <span className="font-medium">{role?.name}</span>?
              </p>
              <p className="text-sm text-red-500">
                This action cannot be undone
              </p>
            </>
          )}

          {isDeleteRole && (
            <>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the role{' '}
                <span className="font-medium">{role?.name}</span>?
              </p>
              <p className="text-sm text-red-500">
                All user assignments to this role will be removed.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
