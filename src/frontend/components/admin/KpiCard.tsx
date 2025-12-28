import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export default function KpiCard({ title, value, icon, className = "" }: KpiCardProps) {
  return (
    <div 
      className={`bg-white rounded-2xl p-6 ${className}`}
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-slate-500 mb-2 font-medium font-sans">{title}</div>
          <div className="text-3xl font-bold text-slate-900 font-sans tracking-tight">{value}</div>
        </div>
        {icon && (
          <div 
            className="text-4xl opacity-40"
            style={{ filter: 'grayscale(20%)' }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}




