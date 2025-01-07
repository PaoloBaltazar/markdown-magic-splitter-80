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

const performanceData = [
  { name: "Jan", value: 85 },
  { name: "Feb", value: 88 },
  { name: "Mar", value: 82 },
  { name: "Apr", value: 91 },
  { name: "May", value: 87 },
  { name: "Jun", value: 93 },
];

const Performance = () => {
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
            value="87%"
            icon={<BarChartIcon className="w-8 h-8" />}
            description="Last 6 months"
          />
          <StatCard
            title="Growth Rate"
            value="+12%"
            icon={<TrendingUp className="w-8 h-8" />}
            description="Year over year"
          />
          <StatCard
            title="Team Size"
            value="24"
            icon={<Users className="w-8 h-8" />}
            description="Active employees"
          />
          <StatCard
            title="Goals Achieved"
            value="92%"
            icon={<Target className="w-8 h-8" />}
            description="This quarter"
          />
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Performance Trends</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Top Performers</h2>
            <div className="space-y-4">
              {[
                { name: "Jane Smith", score: 95, department: "Engineering" },
                { name: "John Doe", score: 92, department: "Product" },
                { name: "Alice Brown", score: 90, department: "Marketing" },
              ].map((performer) => (
                <div
                  key={performer.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{performer.name}</h3>
                    <p className="text-sm text-gray-500">{performer.department}</p>
                  </div>
                  <div className="text-primary font-semibold">{performer.score}%</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Areas for Improvement</h2>
            <div className="space-y-4">
              {[
                { area: "Communication Skills", priority: "High" },
                { area: "Technical Training", priority: "Medium" },
                { area: "Project Management", priority: "Medium" },
              ].map((area) => (
                <div
                  key={area.area}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{area.area}</h3>
                    <p className="text-sm text-gray-500">Priority: {area.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Performance;