import React, { useState, useEffect } from 'react';

const ChangePassword = () => {
  // State for password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for toast notification
  const [toast, setToast] = useState(null);
  // State for confirmation dialog
  const [confirmationDialog, setConfirmationDialog] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle password change submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation checks
    if (!currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setConfirmationDialog({
        message: 'Are you sure you want to change your password?',
        onConfirm: () => {
          // Simulate API call
          console.log('Password changed:', { currentPassword, newPassword });
          showToast('Password changed successfully!', 'success');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
          setConfirmationDialog(null);
        },
        onCancel: () => {
          showToast('Password change cancelled', 'info');
          setConfirmationDialog(null);
        }
      });
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrors({});
    showToast('Changes discarded', 'info');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-md shadow-lg max-w-md w-full 
          ${toast.type === 'success' ? 'bg-green-500' : ''}
          ${toast.type === 'error' ? 'bg-red-500' : ''}
          ${toast.type === 'info' ? 'bg-blue-500' : ''}
          text-white animate-fade-in`}
        >
          {toast.type === 'success' && <i className="bi bi-check-circle-fill text-xl mr-3"></i>}
          {toast.type === 'error' && <i className="bi bi-exclamation-circle-fill text-xl mr-3"></i>}
          {toast.type === 'info' && <i className="bi bi-info-circle-fill text-xl mr-3"></i>}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className="ml-auto text-white hover:text-gray-200"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <i className="bi bi-shield-lock text-3xl text-blue-500 mr-3"></i>
              <h3 className="text-xl font-semibold">Confirm Password Change</h3>
            </div>
            <p className="text-gray-600 mb-6">{confirmationDialog.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={confirmationDialog.onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              >
                <i className="bi bi-x-lg mr-2"></i>
                Cancel
              </button>
              <button
                onClick={confirmationDialog.onConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <i className="bi bi-check-lg mr-2"></i>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-md p-6 sm:p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <i className="bi bi-shield-lock text-3xl text-blue-500 mr-3"></i>
            <h1 className="text-2xl font-bold text-gray-600">Change Password</h1>
          </div>
          <p className="text-gray-600">Create a new strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="bi bi-lock text-gray-400"></i>
              </div>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter current password"
              />
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="bi bi-exclamation-circle mr-1"></i>
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="bi bi-key text-gray-400"></i>
              </div>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new password"
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="bi bi-exclamation-circle mr-1"></i>
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="bi bi-key-fill text-gray-400"></i>
              </div>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm new password"
              />
            </div>
            {errors.confirmNewPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <i className="bi bi-exclamation-circle mr-1"></i>
                {errors.confirmNewPassword}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-600">
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li className={newPassword.length >= 6 ? 'text-green-600' : ''}>
                {newPassword.length >= 6 ? (
                  <i className="bi bi-check-circle-fill mr-1 text-green-600"></i>
                ) : (
                  <i className="bi bi-dash-circle mr-1"></i>
                )}
                Minimum 6 characters
              </li>
              <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                {/[A-Z]/.test(newPassword) ? (
                  <i className="bi bi-check-circle-fill mr-1 text-green-600"></i>
                ) : (
                  <i className="bi bi-dash-circle mr-1"></i>
                )}
                At least one uppercase letter
              </li>
              <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>
                {/[0-9]/.test(newPassword) ? (
                  <i className="bi bi-check-circle-fill mr-1 text-green-600"></i>
                ) : (
                  <i className="bi bi-dash-circle mr-1"></i>
                )}
                At least one number
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <i className="bi bi-x-lg mr-2"></i>
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <i className="bi bi-check-lg mr-2"></i>
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;