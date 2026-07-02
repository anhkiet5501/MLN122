import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import type { CorporationState } from '../../../core/domain/types';

interface ScoreChartProps {
  corp: CorporationState;
}

export const ScoreChart: React.FC<ScoreChartProps> = ({ corp }) => {
  const data = corp.scoreHistory.map((h) => ({
    turn: `T${h.turn}`,
    'Sứ Mệnh': h.missionScore,
    'Hiệu Quả': h.efficiencyScore,
    'Tiền': Math.floor(h.money / 10),
  }));

  if (data.length < 2) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-[var(--vn-muted)] text-xs">Biểu đồ sẽ hiển thị sau lượt đầu tiên</p>
      </div>
    );
  }

  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="turn"
            tick={{ fill: '#7B93B0', fontSize: 9 }}
            axisLine={{ stroke: '#1E3A5F' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#7B93B0', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: '#0D1B2A',
              border: '1px solid #1E3A5F',
              borderRadius: '8px',
              fontSize: '10px',
              color: '#E2EAF4',
            }}
          />
          <Line
            type="monotone"
            dataKey="Sứ Mệnh"
            stroke="#22C55E"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Hiệu Quả"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
