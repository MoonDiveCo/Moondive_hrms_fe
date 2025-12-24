// components/Card.js
export default function AttendanceCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md px-6 py-5 ${className}`}
    >
      {children}
    </div>
  );
}
