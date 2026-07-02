import React, { useState, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { REGION_ORDER } from '../../../core/data/regions';
import type { RegionId } from '../../../core/domain/types';

const PLAYER_CORP_COLORS: Record<string, string> = {
  EVN: '#F4D03F',
  PETROVIETNAM: '#3B82F6',
  VIETTEL: '#E63946',
  VINACOMIN: '#22C55E',
};

interface VietnamMapProps {
  onRegionClick?: (regionId: RegionId) => void;
  selectedRegion?: RegionId | null;
}

export const VietnamMap: React.FC<VietnamMapProps> = ({ onRegionClick, selectedRegion }) => {
  const game = useGameStore((s) => s.game);
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  if (!game) return null;

  const handleMouseMove = (e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const getRegionFill = (regionId: RegionId): string => {
    const region = game.regions[regionId];
    if (!region.owner) return 'rgba(30, 58, 95, 0.6)';
    const owner = game.corporations.find((p) => p.id === region.owner);
    if (!owner) return 'rgba(30, 58, 95, 0.6)';
    return PLAYER_CORP_COLORS[owner.corporation.id] + 'CC';
  };

  const getRegionStroke = (regionId: RegionId): string => {
    if (selectedRegion === regionId) return '#FFFFFF';
    const region = game.regions[regionId];
    if (!region.owner) return 'rgba(30, 100, 160, 0.4)';
    const owner = game.corporations.find((p) => p.id === region.owner);
    if (!owner) return 'rgba(30, 100, 160, 0.4)';
    return PLAYER_CORP_COLORS[owner.corporation.id];
  };

  const activeCorp = game.corporations[game.activeCorporationIndex];
  const activeRegionId = REGION_ORDER[activeCorp.position % REGION_ORDER.length];

  // Vietnam SVG paths (stylized board game representation)
  const regionShapes = [
    {
      id: 'NORTHERN_MOUNTAINS' as RegionId,
      label: 'Núi Phía Bắc',
      d: 'M 40 30 L 80 20 L 115 35 L 120 65 L 95 80 L 60 75 L 38 55 Z',
      cx: 79, cy: 50,
    },
    {
      id: 'HANOI' as RegionId,
      label: 'Hà Nội',
      d: 'M 95 80 L 120 65 L 150 72 L 155 100 L 130 118 L 100 110 Z',
      cx: 125, cy: 92,
    },
    {
      id: 'DA_NANG' as RegionId,
      label: 'Đà Nẵng',
      d: 'M 145 145 L 175 138 L 195 155 L 188 180 L 160 185 L 142 168 Z',
      cx: 168, cy: 162,
    },
    {
      id: 'CENTRAL_HIGHLANDS' as RegionId,
      label: 'Tây Nguyên',
      d: 'M 115 185 L 148 175 L 162 195 L 155 225 L 125 230 L 108 210 Z',
      cx: 135, cy: 203,
    },
    {
      id: 'COASTAL_REGION' as RegionId,
      label: 'Duyên Hải',
      d: 'M 162 200 L 195 190 L 215 210 L 205 240 L 175 245 L 158 222 Z',
      cx: 186, cy: 218,
    },
    {
      id: 'MEKONG_DELTA' as RegionId,
      label: 'ĐB. Sông Cửu Long',
      d: 'M 95 290 L 135 280 L 155 300 L 148 330 L 110 338 L 88 318 Z',
      cx: 122, cy: 309,
    },
    {
      id: 'HO_CHI_MINH' as RegionId,
      label: 'TP. Hồ Chí Minh',
      d: 'M 143 265 L 178 255 L 198 275 L 190 305 L 155 312 L 138 290 Z',
      cx: 168, cy: 284,
    },
    {
      id: 'ISLANDS' as RegionId,
      label: 'Biển Đảo',
      d: 'M 240 310 L 270 302 L 285 322 L 275 345 L 245 350 L 232 332 Z',
      cx: 258, cy: 326,
    },
  ];

  const renderTooltip = () => {
    if (!hoveredRegion) return null;
    const region = game.regions[hoveredRegion];
    const owner = region.owner ? game.corporations.find((p) => p.id === region.owner) : null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed pointer-events-none z-50 glass rounded-xl border border-[var(--vn-border)] p-3 shadow-2xl backdrop-blur-md bg-black/60 min-w-[180px]"
          style={{
            left: mousePos.x + 20,
            top: mousePos.y + 20,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-sm tracking-wide">{region.name}</h3>
            {owner && (
              <span className="text-xl" style={{ textShadow: `0 0 10px ${PLAYER_CORP_COLORS[owner.id]}` }}>
                {owner.corporation.icon}
              </span>
            )}
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--vn-muted)]">Doanh Thu</span>
              <span className="text-[var(--vn-gold)] font-mono font-bold">${region.revenueValue}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--vn-muted)]">Giá Trị Sứ Mệnh</span>
              <span className="text-blue-400 font-mono font-bold">Sứ mệnh: {region.missionValue}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--vn-muted)]">Phát Triển</span>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className={i < region.developmentLevel ? "text-yellow-400" : "text-gray-600"}>★</span>
                ))}
              </div>
            </div>
            <div className="pt-2 mt-2 border-t border-[var(--vn-border)] flex justify-between items-center text-xs">
              <span className="text-[var(--vn-muted)]">Sở Hữu</span>
              <span className="font-bold text-white drop-shadow-md" style={{ color: owner ? PLAYER_CORP_COLORS[owner.id] : 'var(--vn-muted)' }}>
                {owner ? owner.corporation.name : 'Chưa sở hữu'}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-transparent overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredRegion(null)}
    >
      <svg
        viewBox="0 0 320 380"
        className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ transform: 'scale(1.1)' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background sea */}
        <defs>
          <radialGradient id="seaGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0a0f18" />
            <stop offset="100%" stopColor="#04070b" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="320" height="380" fill="url(#seaGrad)" rx="0" />

        {/* Sea waves dots */}
        {[...Array(20)].map((_, i) => (
          <circle
            key={i}
            cx={10 + (i % 5) * 60 + Math.sin(i) * 20}
            cy={20 + Math.floor(i / 5) * 80 + Math.cos(i) * 15}
            r="1"
            fill="rgba(59, 130, 246, 0.1)"
          />
        ))}

        {/* Region shapes */}
        <g transform="translate(0, 10)">
          {regionShapes.map(({ id, label, d, cx, cy }) => {
            const isActive = id === activeRegionId;
            const isSelected = selectedRegion === id;
            const isHovered = hoveredRegion === id;
            const region = game.regions[id];
            const owner = region.owner
              ? game.corporations.find((p) => p.id === region.owner)
              : null;

            return (
              <g
                key={id}
                className="region-hover outline-none"
                onClick={() => onRegionClick?.(id)}
                onMouseEnter={() => setHoveredRegion(id)}
                style={{ cursor: onRegionClick ? 'pointer' : 'default' }}
              >
                {/* Active pulse ring */}
                {isActive && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#E63946"
                    strokeWidth="4"
                    opacity="0.5"
                    filter="url(#glow)"
                  />
                )}

                {/* Region fill */}
                <path
                  d={d}
                  fill={getRegionFill(id)}
                  stroke={getRegionStroke(id)}
                  strokeWidth={isSelected ? 3 : isActive ? 2 : (isHovered ? 2 : 1)}
                  style={{
                    transition: 'all 0.3s ease',
                    filter: (isActive || isHovered) ? 'brightness(1.4) drop-shadow(0 0 8px rgba(255,255,255,0.2))' : undefined,
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                />

                {/* Development dots */}
                {[...Array(region.developmentLevel)].map((_, di) => (
                  <circle
                    key={di}
                    cx={cx - 6 + di * 6}
                    cy={cy + 9}
                    r="2"
                    fill={owner ? PLAYER_CORP_COLORS[owner.corporation.id] : 'rgba(200,200,200,0.6)'}
                    filter="drop-shadow(0 0 2px rgba(0,0,0,0.5))"
                  />
                ))}

                {/* Region label */}
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  fill="rgba(255,255,255,1)"
                  fontSize="6"
                  fontFamily="Be Vietnam Pro"
                  fontWeight="700"
                  style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {label}
                </text>

                {/* Revenue label */}
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fill="rgba(244,208,63,0.9)"
                  fontSize="5"
                  fontFamily="Inter"
                  fontWeight="600"
                  style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  ${region.revenueValue}
                </text>

                {/* Active player marker */}
                {isActive && (
                  <circle
                    cx={cx + 16}
                    cy={cy - 8}
                    r="5"
                    fill={activeCorp.color}
                    stroke="white"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                  />
                )}

                {/* Owner corp icon */}
                {owner && !isActive && (
                  <text
                    x={cx + 16}
                    y={cy - 4}
                    textAnchor="middle"
                    fontSize="9"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    {owner.corporation.icon}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {renderTooltip()}
    </div>
  );
};
