import React, { useState } from 'react';
import type { IncomeSummary } from '../../../core/domain/types';

interface Props {
  summaries: IncomeSummary[];
  onDismiss: () => void;
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Cấp 1',
  2: 'Cấp 2',
  3: 'Cấp 3',
};

const LEVEL_COLORS: Record<number, string> = {
  1: '#6B7280',
  2: '#3B82F6',
  3: '#F59E0B',
};

export const IncomeSummaryModal: React.FC<Props> = ({ summaries, onDismiss }) => {
  const [activeTab, setActiveTab] = useState(0);

  const summary = summaries[activeTab];
  if (!summary) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #1a1f2e, #0f1420)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a5f, #0d2137)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ fontSize: '28px' }}>💰</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: '#F0C040', fontSize: '18px', fontWeight: 700 }}>
              Tổng Kết Thu Nhập Vòng
            </h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              Doanh thu từ các khu vực sở hữu được thu vào cuối vòng
            </p>
          </div>
        </div>

        {/* Tabs for each corporation */}
        {summaries.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '12px 16px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {summaries.map((s, i) => (
              <button
                key={s.corporationId}
                onClick={() => setActiveTab(i)}
                style={{
                  background: activeTab === i
                    ? 'rgba(240,192,64,0.15)'
                    : 'transparent',
                  border: activeTab === i
                    ? '1px solid rgba(240,192,64,0.4)'
                    : '1px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  color: activeTab === i ? '#F0C040' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: activeTab === i ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {s.corporationName}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {summary.lines.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏭</div>
              <p style={{ margin: 0, fontSize: '15px' }}>
                {summary.corporationName} chưa sở hữu khu vực nào.
              </p>
              <p style={{ margin: '8px 0 0', fontSize: '12px' }}>
                Xây dựng hoặc thu mua tài nguyên để sở hữu khu vực và có thu nhập!
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 80px 80px 80px 80px',
                  gap: '8px',
                  padding: '0 8px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '8px',
                }}
              >
                {['Khu Vực', 'Cấp', 'Doanh Thu', 'Gộp', 'Chi Phí', 'Thuần'].map((h) => (
                  <div
                    key={h}
                    style={{
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      textAlign: h !== 'Khu Vực' ? 'right' : 'left',
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              {summary.lines.map((line, idx) => (
                <div
                  key={line.regionId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 80px 80px 80px 80px',
                    gap: '8px',
                    padding: '10px 8px',
                    borderRadius: '8px',
                    background: idx % 2 === 0
                      ? 'rgba(255,255,255,0.03)'
                      : 'transparent',
                    alignItems: 'center',
                    marginBottom: '2px',
                  }}
                >
                  <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>
                    {line.regionName}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        background: LEVEL_COLORS[line.developmentLevel] + '30',
                        color: LEVEL_COLORS[line.developmentLevel],
                        border: `1px solid ${LEVEL_COLORS[line.developmentLevel]}50`,
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {LEVEL_LABELS[line.developmentLevel]}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', textAlign: 'right' }}>
                    ${line.baseRevenue}
                  </div>
                  <div style={{ color: '#60A5FA', fontSize: '13px', textAlign: 'right', fontWeight: 600 }}>
                    ${line.grossIncome}
                  </div>
                  <div style={{ color: '#F87171', fontSize: '13px', textAlign: 'right' }}>
                    -${line.maintenance}
                  </div>
                  <div
                    style={{
                      color: line.netIncome >= 0 ? '#34D399' : '#F87171',
                      fontSize: '13px',
                      textAlign: 'right',
                      fontWeight: 700,
                    }}
                  >
                    {line.netIncome >= 0 ? '+' : ''}${line.netIncome}
                  </div>
                </div>
              ))}

              {/* Passive Gains */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  gap: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '3px' }}>
                    🌿 Giá Trị Sứ Mệnh Thụ Động
                  </div>
                  <div style={{ color: '#34D399', fontSize: '14px', fontWeight: 700 }}>
                    +{summary.totalMissionGain.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '3px' }}>
                    ⚡ Giá Trị Hiệu Suất Thụ Động
                  </div>
                  <div style={{ color: '#60A5FA', fontSize: '14px', fontWeight: 700 }}>
                    +{summary.totalEfficiencyGain.toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer totals */}
        <div
          style={{
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '2px' }}>
                Tổng Thu Nhập Thuần
              </div>
              <div
                style={{
                  color: summary.totalNet >= 0 ? '#34D399' : '#F87171',
                  fontSize: '22px',
                  fontWeight: 800,
                }}
              >
                {summary.totalNet >= 0 ? '+' : ''}${summary.totalNet}
              </div>
            </div>
          </div>

          <button
            onClick={onDismiss}
            id="dismiss-income-summary-btn"
            style={{
              background: 'linear-gradient(135deg, #F0C040, #E0A020)',
              border: 'none',
              borderRadius: '10px',
              color: '#1a1000',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              padding: '12px 28px',
              boxShadow: '0 4px 16px rgba(240,192,64,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(240,192,64,0.45)';
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(240,192,64,0.3)';
            }}
          >
            Tiếp Tục →
          </button>
        </div>
      </div>
    </div>
  );
};
