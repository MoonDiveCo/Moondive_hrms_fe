'use client';
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast } from 'sonner';
import { AuthContext } from '@/context/authContext';
import SubModuleProtectedRoute from '@/lib/routeProtection/SubModuleProtectedRoute';
import {
  FileText,
  ShieldCheck,
  ScrollText,
  Search,
  Trash2,
  ArrowRight,
} from 'lucide-react';
const CATEGORY_META = {
  'Company Docs': {
    icon: FileText,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    pill: 'bg-blue-100 text-blue-700',
  },
  'HR Policies': {
    icon: ShieldCheck,
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    pill: 'bg-orange-100 text-orange-700',
  },
  Internal: {
    icon: ScrollText,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    pill: 'bg-slate-200 text-slate-700',
  },
};
const FILTERS = ['All Files', 'Company Docs', 'HR Policies'];

export default function OrganizationPolicy() {
  const [openModal, setOpenModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { allUserPermissions } = useContext(AuthContext);
  const [activeFilter, setActiveFilter] = useState('All Files');
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    fileName: '',
    description: '',
    folder: '',
    entryDate: '',
  });

  const [file, setFile] = useState(null);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async () => {
    if (!file || !form.fileName || !form.folder) {
      toast.error('File name, folder and file are required');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', form.fileName);
      formData.append('description', form.description);
      formData.append('folder', form.folder);

      await axios.post(
        'http://localhost:2000/api/v1/hrms/organization/organization-files',
        formData
      );

      toast.success('File uploaded successfully');

      setOpenModal(false);
      setForm({
        fileName: '',
        description: '',
        folder: '',
      });
      setFile(null);

      // ✅ THIS IS THE KEY FIX
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:2000/api/v1/hrms/organization/deleteOrganizationFile/${id}`
      );

      toast.error('File Delete Successfully');
      fetchFiles();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const fetchFiles = async () => {
    try {
      setPageLoading(true);
      const res = await axios.get('/hrms/organization/getOrganizationFile');
      setFiles(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch files', error);
    } finally {
      setPageLoading(false);
    }
  };
  const filteredFiles = files.filter((f) => {
    const matchFilter =
      activeFilter === 'All Files' || f.folder === activeFilter;

    const matchSearch = f.fileName.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  useEffect(() => {
    fetchFiles();
  }, []);
  if (pageLoading) {
    return (
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    );
  }

  return (
    <SubModuleProtectedRoute>
      <div className='p-6 bg-[#F7F8FA] min-h-screen space-y-6'>
        {/* ---------------- HEADER ---------------- */}
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Organization Files
            </h3>
            <p className='text-sm text-gray-500'>
              Manage and access organizational documents
            </p>
          </div>

          <div className='flex items-center gap-3'>
            <div className='relative w-72'>
              <Search className='absolute left-3 top-2.5 w-4 h-4 text-gray-400' />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search files...'
                className='w-full pl-10 pr-4 py-2 text-sm rounded-lg border bg-white'
              />
            </div>

            {allUserPermissions.includes('HRMS:COMPANY_POLICY:WRITE') && (
              <button
                onClick={() => setOpenModal(true)}
                className='px-4 py-2 rounded-lg bg-[#FF7B30] text-white text-sm font-medium'
              >
                Manage
              </button>
            )}
          </div>
        </div>

        {/* ---------------- FILTER TABS ---------------- */}
        <div className='flex gap-3'>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeFilter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ---------------- FILE LIST ---------------- */}
        <div className='bg-white rounded-xl shadow-sm'>
          <div className='grid grid-cols-12 px-6 py-3 text-xs font-semibold text-gray-500 border-b'>
            <div className='col-span-6'>DOCUMENT</div>
            <div className='col-span-3'>CATEGORY</div>
            <div className='col-span-2'>DATE</div>
            <div className='col-span-1 text-right'>ACTION</div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className='py-12 text-center text-sm text-gray-500'>
              No shared files to display
            </div>
          ) : (
            filteredFiles.map((file) => {
              const meta = CATEGORY_META[file.folder] || CATEGORY_META.Internal;
              const Icon = meta.icon;

              return (
                <div
                  key={file._id}
                  className='grid grid-cols-12 px-6 py-4 items-center border-b last:border-b-0 hover:bg-gray-50'
                >
                  <div className='col-span-6 flex items-center gap-4'>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg}`}
                    >
                      <Icon className={`w-5 h-5 ${meta.text}`} />
                      
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {file.fileName}
                      </p>
                      {file.description && (
                        <p className='text-xs text-gray-500'>
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className='col-span-3'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${meta.pill}`}
                    >
                      {file.folder}
                    </span>
                  </div>

                  <div className='col-span-2 text-sm text-gray-500'>
                    {new Date(file.createdAt).toLocaleDateString('en-IN')}
                  </div>

                  <div className='col-span-1 flex justify-end items-center gap-3'>
                    <a
                      href={file.fileUrl}
                      target='_blank'
                      className='text-orange-500 text-sm flex items-center gap-1'
                    >
                      View <ArrowRight size={14} />
                    </a>

                    {allUserPermissions.includes(
                      'HRMS:COMPANY_POLICY:DELETE'
                    ) && (
                      <button
                        onClick={() => handleDelete(file._id)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {openModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-end bg-black/40'>
            <div className='bg-white w-full max-w-xl rounded-xl shadow-xl p-6 relative max-h-[90vh] flex flex-col'>
              <button
                onClick={() => setOpenModal(false)}
                className='absolute top-4 right-4 text-gray-400'
              >
                ✕
              </button>

              <h3 className='text-lg font-semibold mb-4'>
                Add organization file
              </h3>

              <div className='overflow-y-auto flex-1 pr-2'>
                {/* Upload */}
                <div className='border-2 border-dashed rounded-lg p-6 text-center mb-4'>
                  <input
                    type='file'
                    onChange={(e) => setFile(e.target.files[0])}
                    className='hidden'
                    id='fileUpload'
                  />
                  <label
                    htmlFor='fileUpload'
                    className='cursor-pointer text-blue-600 text-sm font-medium'
                  >
                    Choose file from Desktop / Others
                  </label>

                  {file && (
                    <p className='mt-2 text-sm text-gray-600'>{file.name}</p>
                  )}
                </div>

                {/* Form */}
                <div className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium'>
                      File name <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type='text'
                      value={form.fileName}
                      onChange={(e) => update('fileName', e.target.value)}
                      className='mt-1 w-full border rounded-md px-3 py-2 text-sm'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      className='mt-1 w-full border rounded-md px-3 py-2 text-sm'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium'>
                      Folder <span className='text-red-500'>*</span>
                    </label>
                    <select
                      value={form.folder}
                      onChange={(e) => update('folder', e.target.value)}
                      className='mt-1 w-full border rounded-md px-3 py-2 text-sm'
                    >
                      <option value=''>Select</option>
                      <option value='HR Policies'>HR Policies</option>
                      <option value='Company Docs'>Company Docs</option>
                    </select>
                  </div>

                  {/* <div>
                  <label className="text-sm font-medium">
                    File Entry date
                  </label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => update("entryDate", e.target.value)}
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  />
                </div> */}
                </div>
              </div>

              {/* Footer */}
              <div className='mt-6 flex justify-end gap-3 border-t pt-4'>
                <button
                  onClick={() => setOpenModal(false)}
                  className='px-4 py-2 text-sm border rounded-md'
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={uploading}
                  className='px-4 py-2 text-sm rounded-md bg-blue-600 text-white disabled:opacity-50'
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SubModuleProtectedRoute>
  );
}
