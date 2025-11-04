'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import React from 'react';

interface DashboardChartsProps {
  stats: {
    averageRating: string;
    totalFeedback: number;
    pendingReplies: number;
    repliedFeedback: number;
  };
}

const COLORS = {
  pending: '#F97316', // orange-500
  replied: '#10B981', // emerald-500
  rating: '#3B82F6', // blue-500
  feedback: '#8B5CF6', // violet-500
};

// Type for the pie chart label props
type PieLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
};

// Simple label renderer for the pie chart
const renderCustomizedLabel = (props: PieLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardCharts({ stats }: DashboardChartsProps) {
  const responseData = [
    { name: 'Pending', value: stats.pendingReplies, color: COLORS.pending },
    { name: 'Replied', value: stats.repliedFeedback, color: COLORS.replied },
  ];

  const ratingData = [
    { name: 'Avg. Rating', value: parseFloat(stats.averageRating), color: COLORS.rating },
    { name: 'Total Feedback', value: stats.totalFeedback, color: COLORS.feedback },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Response Summary - Donut Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Response Summary</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={responseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props) => {
                  // Ensure all required props are present and properly typed
                  const labelProps: PieLabelProps = {
                    cx: Number(props.cx) || 0,
                    cy: Number(props.cy) || 0,
                    midAngle: Number(props.midAngle) || 0,
                    innerRadius: Number(props.innerRadius) || 0,
                    outerRadius: Number(props.outerRadius) || 0,
                    percent: Number(props.percent) || 0,
                    index: props.index || 0,
                  };
                  return renderCustomizedLabel(labelProps);
                }}
                outerRadius={80}
                dataKey="value"
                className="focus:outline-none"
              >
                {responseData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="outline-none"
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: '1rem',
                }}
                formatter={(value) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rating Overview - Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ratingData}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
                width={30}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {ratingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
