'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// Custom tooltip for the line chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Avg. Rating: <span className="font-semibold">{payload[0].value.toFixed(1)}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom bar label
const renderCustomBarLabel = ({ x, y, width, value }: any) => {
  return (
    <text x={x + width / 2} y={y - 5} fill="#4B5563" textAnchor="middle" fontSize={12}>
      {value}
    </text>
  );
};

interface ChartsSectionProps {
  ratingsTrend: Array<{ date: string; averageRating: number }>;
  feedbackByRating: Array<{ rating: number; count: number }>;
}

export default function ChartsSection({ ratingsTrend = [], feedbackByRating = [] }: ChartsSectionProps) {
  // Process feedback by rating data for the bar chart
  const ratingDistribution = [
    { name: '1 Star', value: 0 },
    { name: '2 Stars', value: 0 },
    { name: '3 Stars', value: 0 },
    { name: '4 Stars', value: 0 },
    { name: '5 Stars', value: 0 },
  ];

  // Map the API data to our chart data structure
  feedbackByRating.forEach(({ rating, count }) => {
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating - 1].value = count;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ratings Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Average Rating Trend (Last 30 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={ratingsTrend} 
                margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280' }}
                  minTickGap={20}
                />
                <YAxis 
                  domain={[0, 5]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280' }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="averageRating" 
                  name="Average Rating"
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{
                    fill: '#3B82F6',
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 4,
                    strokeDasharray: ''
                  }}
                  activeDot={{
                    fill: '#1D4ED8',
                    stroke: '#fff',
                    strokeWidth: 2,
                    r: 6
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Volume by Rating */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Volume by Rating</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ratingDistribution}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280' }}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}
                  itemStyle={{ color: '#1F2937' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  formatter={(value: number) => [`${value} feedback`, 'Count']}
                />
                <Bar 
                  dataKey="value" 
                  name="Feedback Count"
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    fill="#4B5563" 
                    fontSize={12}
                    offset={10}
                    formatter={(value: number) => value > 0 ? value : ''}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
