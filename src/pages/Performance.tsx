import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { BarChart as BarChartIcon, TrendingUp, Users, Target } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface PerformanceMetric {
  id: string;
  employee_id: string;
  metric_name: string;
  metric_value: number;
  recorded_at: string;
  notes: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

const Performance = () => {
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_performance')
        .select(`
          *,
          profiles:employee_id (
            full_name,
            email
          )
        `)
        .order('recorded_at', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching metrics",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['employee-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');

      if (error) {
        toast({
          title: "Error fetching profiles",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  // Calculate average performance across all metrics
  const averagePerformance = metrics?.length
    ? Math.round(
        metrics.reduce((acc, curr) => acc + curr.metric_value, 0) / metrics.length
      )
    : 0;

  // Get unique count of employees with metrics
  const activeEmployees = new Set(metrics?.map(m => m.employee_id)).size;

  // Get the most recent metrics for trending
  const recentMetrics = metrics
    ?.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 6)
    .reverse();

  // Calculate performance trend (comparing average of recent vs older metrics)
  const calculateTrend = () => {
    if (!metrics?.length) return 0;
    const sortedMetrics = [...metrics].sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    const midPoint = Math.floor(sortedMetrics.length / 2);
    const recentAvg = sortedMetrics.slice(0, midPoint).reduce((acc, curr) => acc + curr.metric_value, 0) / midPoint;
    const oldAvg = sortedMetrics.slice(midPoint).reduce((acc, curr) => acc + curr.metric_value, 0) / midPoint;
    return Math.round(((recentAvg - oldAvg) / oldAvg) * 100);
  };

  const trend = calculateTrend();

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Performance Metrics</h1>
          <p className="text-gray-600 mt-1">Track and analyze team performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Average Performance"
            value={`${averagePerformance}%`}
            icon={<BarChartIcon className="w-8 h-8" />}
            description="Across all metrics"
          />
          <StatCard
            title="Performance Trend"
            value={`${trend > 0 ? '+' : ''}${trend}%`}
            icon={<TrendingUp className="w-8 h-8" />}
            description="Compared to previous period"
          />
          <StatCard
            title="Active Employees"
            value={activeEmployees}
            icon={<Users className="w-8 h-8" />}
            description="With recorded metrics"
          />
          <StatCard
            title="Total Metrics"
            value={metrics?.length || 0}
            icon={<Target className="w-8 h-8" />}
            description="Performance records"
          />
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Performance Trends</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="recorded_at" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  formatter={(value, name, props) => [`${value}%`, 'Performance']}
                />
                <Bar dataKey="metric_value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
            <div className="space-y-4">
              {metrics
                ?.sort((a, b) => b.metric_value - a.metric_value)
                .slice(0, 3)
                .map((metric) => {
                  const profile = profiles?.find(p => p.id === metric.employee_id);
                  return (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{profile?.full_name || 'Unknown Employee'}</h3>
                        <p className="text-sm text-gray-500">{metric.metric_name}</p>
                      </div>
                      <div className="text-primary font-semibold">{metric.metric_value}%</div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
            <div className="space-y-4">
              {metrics
                ?.sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                .slice(0, 3)
                .map((metric) => {
                  const profile = profiles?.find(p => p.id === metric.employee_id);
                  return (
                    <div
                      key={metric.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{profile?.full_name || 'Unknown Employee'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(metric.recorded_at).toLocaleDateString()} - {metric.metric_name}
                        </p>
                      </div>
                      <div className="text-primary font-semibold">{metric.metric_value}%</div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Performance;