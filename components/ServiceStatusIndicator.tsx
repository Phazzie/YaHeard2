'use client';

interface ServiceStatusIndicatorProps {
  status: 'operational' | 'down';
}

export default function ServiceStatusIndicator({ status }: ServiceStatusIndicatorProps) {
  const statusConfig = {
    operational: {
      color: 'bg-green-500',
      shadowColor: 'shadow-green-500/50',
      text: 'Operational',
    },
    down: {
      color: 'bg-red-500',
      shadowColor: 'shadow-red-500/50',
      text: 'Unavailable',
    },
  };

  const config = statusConfig[status] || statusConfig.down;

  return (
    <div className="flex items-center space-x-2" title={config.text}>
      <span className={`h-3 w-3 rounded-full ${config.color} shadow-lg ${config.shadowColor}`}></span>
      <span className="text-xs text-gray-400">{config.text}</span>
    </div>
  );
}
