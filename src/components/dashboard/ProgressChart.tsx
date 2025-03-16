
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Problem, User } from "@/lib/supabase";
import { format, subDays, subMonths, differenceInDays } from "date-fns";

type TimeFrame = "weekly" | "monthly" | "yearly";

interface ProgressChartProps {
  problems: Problem[];
  user: User | null;
  className?: string;
}

interface DataPoint {
  date: string;
  count: number;
  formattedDate: string;
}

export default function ProgressChart({ problems, user, className }: ProgressChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("weekly");
  const [data, setData] = useState<DataPoint[]>([]);
  
  useEffect(() => {
    if (!problems.length) {
      setData([]);
      return;
    }
    
    let startDate: Date;
    let dateFormat: string;
    
    switch (timeFrame) {
      case "weekly":
        startDate = subDays(new Date(), 7);
        dateFormat = "EEE";
        break;
      case "monthly":
        startDate = subDays(new Date(), 30);
        dateFormat = "dd MMM";
        break;
      case "yearly":
        startDate = subMonths(new Date(), 12);
        dateFormat = "MMM yyyy";
        break;
    }
    
    // Group problems by date
    const problemsByDate = problems.reduce((acc, problem) => {
      const date = new Date(problem.completed_at);
      if (date >= startDate) {
        const dateKey = format(date, "yyyy-MM-dd");
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey]++;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Create data points for each day in the range
    const days = timeFrame === "weekly" ? 7 : timeFrame === "monthly" ? 30 : 365;
    const dataPoints: DataPoint[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      const dateKey = format(date, "yyyy-MM-dd");
      const formattedDate = format(date, dateFormat);
      
      dataPoints.push({
        date: dateKey,
        count: problemsByDate[dateKey] || 0,
        formattedDate
      });
    }
    
    setData(dataPoints);
  }, [problems, timeFrame]);
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const dataPoint = data.find(d => d.date === label);
      return (
        <div className="bg-background border border-border rounded-md p-2 shadow-md">
          <p className="font-medium">{dataPoint?.formattedDate}</p>
          <p className="text-primary">
            {payload[0].value} problem{payload[0].value !== 1 ? 's' : ''} completed
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Progress History</CardTitle>
            <CardDescription>
              Your problem solving activity over time
            </CardDescription>
          </div>
          <div className="flex space-x-1 text-sm">
            {(['weekly', 'monthly', 'yearly'] as TimeFrame[]).map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame)}
                className={`px-3 py-1 rounded-full transition-all ${
                  timeFrame === frame
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {frame.charAt(0).toUpperCase() + frame.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const dataPoint = data.find(d => d.date === value);
                    return dataPoint?.formattedDate || '';
                  }}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickCount={5}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No data available for the selected time period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
