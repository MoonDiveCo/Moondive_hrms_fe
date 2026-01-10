'use client';

import React from 'react';
import { X, FileText, Folder } from 'lucide-react';

export default function ViewFileDetailsModal({
  open,
  onClose,
  file,
}) {
  if (!open || !file) return null;

  const allowedUsers = file.allowedUsers || [];
  const isImage = file.fileType?.startsWith('image/');
  const isPdf = file.fileType === 'application/pdf';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start overflow-y-auto py-10">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl relative">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              File Details
            </h2>
            <p className="text-sm text-gray-500">
              Preview & access information
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">

          {/* PREVIEW CARD */}
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block h-[200px] rounded-xl overflow-hidden border bg-gray-100 group"
          >
            {isImage ? (
              <img
                src={file.fileUrl}
                alt={file.fileName}
                className="w-full h-full object-cover object-top"
              />
            ) : isPdf ? (
              <iframe
                src={`${file.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full pointer-events-none"
                title="PDF preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Preview not available
              </div>
            )}

            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-white px-3 py-1 text-xs rounded-md shadow">
                Click to open full file
              </span>
            </div>
          </a>

          {/* FILE META */}
          <div className="grid grid-cols-3 gap-6">

            {/* FILE NAME */}
            <div className="col-span-2 space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <FileText size={14} />
                File name
              </div>
              <p className="text-sm font-medium text-gray-900 break-all">
                {file.fileName}
              </p>
            </div>

            {/* FOLDER */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Folder size={14} />
                Folder
              </div>
              <span className="inline-block px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                {file.folder}
              </span>
            </div>

            {/* DESCRIPTION */}
            {file.description && (
              <div className="col-span-3 space-y-1">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-700">
                  {file.description}
                </p>
              </div>
            )}
          </div>

          {/* PERMITTED USERS */}
          <div className="border rounded-xl overflow-hidden">

            {/* TABLE HEADER */}
            <div className="grid grid-cols-12 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-600">
              <div className="col-span-6">EMPLOYEE</div>
              <div className="col-span-4">ACKNOWLEDGEMENT</div>
              <div className="col-span-2 text-center">STATUS</div>
            </div>

            {/* TABLE BODY */}
            {allowedUsers.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                No permitted users
              </div>
            ) : (
              allowedUsers.map((entry) => {
                const user = entry.user;
                const acknowledged =
                  entry.acknowledgementStatus === 'ACKNOWLEDGED';

                return (
                  <div
                    key={user?._id}
                    className="grid grid-cols-12 px-4 py-3 items-center border-t text-sm"
                  >
                    <div className="col-span-6">
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      {user?.employeeId && (
                        <p className="text-xs text-gray-500">
                          {user.employeeId}
                        </p>
                      )}
                    </div>

                    <div className="col-span-4">
                      {acknowledged ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Acknowledged
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 text-center text-sm">
                      {acknowledged ? '✔' : '—'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
