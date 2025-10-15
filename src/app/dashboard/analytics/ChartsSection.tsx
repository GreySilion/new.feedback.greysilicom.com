'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// Mock data for ratings trend (last 7 days)
const generateRatingsTrendData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => ({
    name: day,
    rating: Math.random() * 2 + 3, // Random rating between 3-5
  }));
};

// Mock data for feedback volume by rating
const feedbackVolumeData = [
  { name: '1 Star', value: Math.floor(Math.random() * 20) + 5 },
  { name: '2 Stars', value: Math.floor(Math.random() * 30) + 10 },
  { name: '3 Stars', value: Math.floor(Math.random() * 40) + 15 },
  { name: '4 Stars', value: Math.floor(Math.random() * 50) + 20 },
  { name: '5 Stars', value: Math.floor(Math.random() * 60) + 30 },
];

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

export default function ChartsSection() {
  const ratingsData = generateRatingsTrendData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ratings Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ratings Trend (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ratingsData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => value.toFixed(1)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }}
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
                data={feedbackVolumeData}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`${value} reviews`, 'Count']}
                  labelStyle={{ color: '#4B5563', fontWeight: 500 }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                  animationBegin={0}
                  animationDuration={1500}
                >
                  <LabelList 
                    dataKey="value" 
                    position="top" 
                    content={renderCustomBarLabel} 
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
