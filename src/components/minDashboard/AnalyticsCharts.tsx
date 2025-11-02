'use client';

import { useState, useEffect, useContext } from 'react';
import { useCompany } from '@/contexts/CompanyContext';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts';

interface ChartData {
  weekly: Array<{
    day: string;
    avg_rating: number;
    fullDay: string;
  }>;
  monthly: Array<{
    month: string;
    total_reviews: number;
    color: string;
  }>;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#A4DE6C', '#D0ED57', '#8884D8', '#82CA9D'
];

const RADIAN = Math.PI / 180;

export default function AnalyticsCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedCompany } = useCompany();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = new URL('/api/minDashboard/analytics', window.location.origin);
        if (selectedCompany) {
          url.searchParams.append('companyId', selectedCompany);
        }

        const response = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          let errorMessage = 'Failed to fetch analytics data';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If we can't parse the error as JSON, use the raw text
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();
        if (data.success) {
          setChartData(data.data);
        } else {
          throw new Error(data.error || 'Failed to load analytics');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedCompany]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // Format the weekly data to include full day names
  const formatWeeklyData = (data: ChartData['weekly']) => {
    const dayMap: Record<string, string> = {
      'Sun': 'Sunday',
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday'
    };
    
    return data.map(item => ({
      ...item,
      fullDay: dayMap[item.day] || item.day
    }));
  };

  // Format the monthly data with colors
  const formatMonthlyData = (data: ChartData['monthly']) => {
    return data.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const formattedWeeklyData = formatWeeklyData(chartData.weekly);
  const formattedMonthlyData = formatMonthlyData(chartData.monthly);
  const totalReviews = chartData.monthly.reduce((sum, item) => sum + item.total_reviews, 0);

  // Custom tooltip for the line chart
  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
          <p className="font-medium">{data.fullDay}</p>
          <p>Average Rating: <span className="font-medium">{data.avg_rating.toFixed(2)}</span></p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
          <p className="font-medium">{data.month}</p>
          <p>Reviews: <span className="font-medium">{data.total_reviews}</span></p>
          <p>{((data.total_reviews / chartData.monthly.reduce((sum, item) => sum + item.total_reviews, 0)) * 100).toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN) * 1.2;
    const y = cy + radius * Math.sin(-midAngle * RADIAN) * 1.2;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium pointer-events-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };


  return (
    <div className="space-y-8">
      {/* Weekly Ratings Line Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Weekly Average Ratings</h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={formattedWeeklyData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis 
                domain={[0, 5]} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toFixed(1)}
                width={30}
              />
              <Tooltip content={<LineTooltip />} />
              <Line
                type="monotone"
                dataKey="avg_rating"
                name="Rating"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{
                  r: 4,
                  stroke: '#fff',
                  strokeWidth: 2,
                  fill: '#3b82f6',
                }}
                activeDot={{
                  r: 6,
                  stroke: '#fff',
                  strokeWidth: 2,
                  fill: '#2563eb',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Reviews Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Monthly Reviews Distribution</h3>
          <div className="mt-2 md:mt-0 text-sm text-gray-500">
            Total: <span className="font-medium text-gray-900">{totalReviews} reviews</span>
          </div>
        </div>
        <div className="h-[400px] w-full flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 h-64 md:h-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={formattedMonthlyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="total_reviews"
                  nameKey="month"
                >
                  {formattedMonthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 mt-6 md:mt-0 md:pl-6">
            <div className="space-y-3">
              {formattedMonthlyData.map((item, index) => {
                const percentage = ((item.total_reviews / totalReviews) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 w-24 truncate">{item.month}</span>
                    <div className="flex-1 mx-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: item.color,
                          opacity: 0.7
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
