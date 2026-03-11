'use client';

import React, { forwardRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// PayslipPreviewPanel
//
// Reusable A4-formatted payslip view. Used in:
//   1. GeneratePayslipModal — review step before saving
//   2. PayslipsPage — view / download modal
//   3. Employee self-service payslip view (my-payslips)
//
// Props:
//   payslip  — full payslip object (from API or computed locally in preview)
//   orgName  — organisation display name (string)
//   orgLogo  — optional logo URL (string)
//
// Ref forwarding: pass a ref to capture with html2canvas for jsPDF export.
// The outer div has id="payslip-print-area".
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const PayslipPreviewPanel = forwardRef(function PayslipPreviewPanel({ payslip, orgName, orgLogo }, ref) {
  if (!payslip) return null;

  const {
    payPeriod,
    employeeName,
    employeeCode,
    designation,
    department,
    workingDays = 26,
    daysWorked = 26,
    lopDays = 0,
    lopDeduction = 0,
    earnings = [],
    deductions = [],
    employerContributions = [],
    grossEarnings = 0,
    totalDeductions = 0,
    netPay = 0,
    ytdGross = 0,
    ytdDeductions = 0,
    ytdNetPay = 0,
  } = payslip;

  const taxableGross = earnings
    .filter((e) => e.isTaxable)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div
      ref={ref}
      id="payslip-print-area"
      className="bg-white text-gray-800 font-sans text-sm"
      style={{ width: '794px', minHeight: '1123px', padding: '40px', boxSizing: 'border-box' }}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-5 mb-5" style={{ borderBottom: '3px solid #FF7B30' }}>
        <div className="flex items-center gap-3">
          {orgLogo ? (
            <img src={orgLogo} alt="Company Logo" style={{ height: '48px', objectFit: 'contain' }} />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: '#FF7B30' }}
            >
              {(orgName || 'O')[0]}
            </div>
          )}
          <div>
            <p className="font-bold text-base text-gray-900">{orgName || 'Organisation'}</p>
            <p className="text-xs text-gray-500">Pay Slip</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: '#FF7B30' }}>{payPeriod}</p>
          <p className="text-xs text-gray-400 mt-0.5">Pay Period</p>
        </div>
      </div>

      {/* ── Employee Info ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 rounded-xl p-4 mb-5" style={{ background: '#FFF4EC' }}>
        <InfoRow label="Employee Name"  value={employeeName} />
        <InfoRow label="Employee ID"    value={employeeCode || '—'} />
        <InfoRow label="Designation"    value={designation || '—'} />
        <InfoRow label="Department"     value={department || '—'} />
        <InfoRow label="Working Days"   value={workingDays} />
        <InfoRow label="Days Worked"    value={daysWorked} />
      </div>

      {/* ── Attendance Summary ────────────────────────────────────── */}
      {lopDays > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-5 text-xs text-amber-800">
          <span>Loss of Pay (LOP): <strong>{lopDays} day{lopDays !== 1 ? 's' : ''}</strong></span>
          <span className="ml-auto">LOP Deduction: <strong>{fmt(lopDeduction)}</strong></span>
        </div>
      )}

      {/* ── Earnings & Deductions ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Earnings */}
        <div>
          <p
            className="font-bold text-xs uppercase tracking-wide mb-2 pb-1"
            style={{ color: '#FF7B30', borderBottom: '2px solid #FF7B30' }}
          >
            Earnings
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ background: '#FFF4EC' }}>
                <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Component</th>
                <th className="text-right py-1.5 px-2 font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="py-1.5 px-2 text-gray-700">
                    {e.name}
                    {e.isTaxable && <span className="ml-1 text-gray-400 text-[10px]">(T)</span>}
                  </td>
                  <td className="py-1.5 px-2 text-right text-gray-800 font-medium">{fmt(e.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#FFF4EC', borderTop: '1px solid #FF7B30' }}>
                <td className="py-1.5 px-2 font-bold text-gray-800">Gross Earnings</td>
                <td className="py-1.5 px-2 text-right font-bold" style={{ color: '#FF7B30' }}>{fmt(grossEarnings)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <p className="font-bold text-xs uppercase tracking-wide mb-2 pb-1 text-red-500" style={{ borderBottom: '2px solid #ef4444' }}>
            Deductions
          </p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-red-50">
                <th className="text-left py-1.5 px-2 font-semibold text-gray-600">Component</th>
                <th className="text-right py-1.5 px-2 font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deductions.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="py-1.5 px-2 text-gray-700">{d.name}</td>
                  <td className="py-1.5 px-2 text-right text-gray-800 font-medium">{fmt(d.amount)}</td>
                </tr>
              ))}
              {lopDays > 0 && (
                <tr className="bg-amber-50">
                  <td className="py-1.5 px-2 text-amber-700">Loss of Pay ({lopDays}d)</td>
                  <td className="py-1.5 px-2 text-right text-amber-700 font-medium">{fmt(lopDeduction)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-red-50" style={{ borderTop: '1px solid #ef4444' }}>
                <td className="py-1.5 px-2 font-bold text-gray-800">Total Deductions</td>
                <td className="py-1.5 px-2 text-right font-bold text-red-600">{fmt(totalDeductions)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Net Pay Box ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl text-white px-6 py-5 flex items-center justify-between mb-5"
        style={{ background: 'linear-gradient(135deg, #FF7B30 0%, #FF9A5C 100%)' }}
      >
        <div>
          <p className="text-xs opacity-80 uppercase tracking-wide">Net Pay (Take Home)</p>
          <p className="text-3xl font-bold mt-1">{fmt(netPay)}</p>
        </div>
        <div className="text-right text-xs opacity-80 space-y-1">
          <p>Gross Earnings: {fmt(grossEarnings)}</p>
          <p>Total Deductions: {fmt(totalDeductions)}</p>
          <p>Taxable Amount: {fmt(taxableGross)}</p>
        </div>
      </div>

      {/* ── Employer Contributions (informational) ────────────────── */}
      {employerContributions.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
            Employer Contributions
            <span className="font-normal normal-case text-gray-400 ml-1">(informational — not deducted from salary)</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {employerContributions.map((c, i) => (
              <div key={i} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-gray-500">{c.name}:</span>{' '}
                <span className="font-semibold text-gray-700">{fmt(c.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── YTD ─────────────────────────────────────────────────── */}
      {(ytdGross > 0 || ytdNetPay > 0) && (
        <div className="border-t border-gray-200 pt-4 mt-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Year-to-Date Summary</p>
          <div className="grid grid-cols-3 gap-3">
            <YTDCard label="YTD Gross" value={fmt(ytdGross)} />
            <YTDCard label="YTD Deductions" value={fmt(ytdDeductions)} />
            <YTDCard label="YTD Net Pay" value={fmt(ytdNetPay)} />
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="mt-10 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
        This is a system-generated payslip and does not require a physical signature.
        <span className="ml-2">(T) = Taxable component</span>
      </div>
    </div>
  );
});

export default PayslipPreviewPanel;

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{value || '—'}</p>
    </div>
  );
}

function YTDCard({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  );
}
