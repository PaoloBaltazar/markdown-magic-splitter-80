import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const StatCard = ({ title, value, icon, description, className = "" }: StatCardProps) => {
  return (
    <Card className={`p-4 md:p-6 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
            {value}
          </h3>
          {description && (
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="p-2 md:p-3 bg-primary/10 rounded-full text-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
};