// components/Card.js
export default function AttendanceCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl  py-2 ${className}`}
    >
      {children}
    </div>
  );
}
