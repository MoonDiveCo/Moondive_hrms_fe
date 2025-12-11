'use client';

import React from 'react';

export default function EntityTable({
  columns,         
  data,
  onRowClick,
  rowKey = '_id',
  emptyText = 'No records found.',
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={
                    col.className ||
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                  }
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length > 0 ? (
              data.map((item, idx) => {
                const key = item[rowKey] || idx;
                const rowClass = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                return (
                  <tr
                    key={key}
                    className={rowClass}
                    onClick={
                      onRowClick
                        ? (e) => onRowClick(item, e)
                        : undefined
                    }
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={
                          col.tdClassName ||
                          'px-6 py-4 whitespace-nowrap text-sm text-gray-500'
                        }
                      >
                        {col.render
                          ? col.render(item)
                          : item[col.key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-6 text-center text-sm text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
