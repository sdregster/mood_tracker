
import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine, Tooltip, Cell } from 'recharts';
import { MoodData } from '@/services/api';

interface MoodChartProps {
  data: MoodData[];
}

const MoodChart: React.FC<MoodChartProps> = ({ data }) => {
  // chartData теперь просто исходные данные
  const chartData = React.useMemo(() => data, [data]);

  // Кастомный tooltip для одной записи
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const allEntries = entry.allEntries || [entry];
      
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="font-semibold">{entry.date}</div>
          <div className="text-sm text-muted-foreground mb-2">
            Среднее: {entry.mood > 0 ? '+' : ''}{entry.mood.toFixed(1)}
          </div>
          
          {allEntries.length > 1 ? (
            <>
              <div className="text-xs text-muted-foreground mb-1">Записи за день:</div>
              {allEntries.map((item: any, index: number) => {
                const moodSign = item.mood > 0 ? '+' : '';
                return (
                  <div key={index} className="text-xs">
                    {item.time}: {moodSign}{item.mood}
                    {item.activities && ` (${item.activities})`}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-xs">
              {entry.time}: {entry.mood > 0 ? '+' : ''}{entry.mood}
              {entry.activities && ` (${entry.activities})`}
              {entry.note && (
                <div className="text-xs italic mt-1">{entry.note}</div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="category"
            dataKey="date"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis
            type="number"
            domain={[-3, 3]}
            tickCount={7}
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            label={{
              value: 'Эмоциональное отклонение',
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={0}
            stroke="hsl(var(--center-line))"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{ value: "Баланс", position: "insideTopRight", fill: "hsl(var(--muted-foreground))" }}
          />
          {/* Точки данных с цветовой кодировкой */}
          <Scatter data={chartData} dataKey="mood">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={
                Math.abs(entry.mood) < 1 ? 'hsl(var(--balanced))' :
                Math.abs(entry.mood) < 2 ? 'hsl(var(--moderate))' :
                'hsl(var(--extreme))'
              } />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
