import type { GovernmentPolicy } from '../domain/types';

export const GOVERNMENT_POLICIES: GovernmentPolicy[] = [
  {
    id: 'POLICY_SUBSIDY',
    title: 'Trợ Cấp Cơ Sở Hạ Tầng Quốc Gia',
    description: 'Chính phủ đang trợ cấp tất cả các dự án cơ sở hạ tầng để thúc đẩy phát triển quốc gia. Chi phí xây dựng giảm 20%.',
    icon: '🏗️',
    activeForTurns: 3,
    effects: [
      {
        type: 'COST_MODIFIER',
        target: 'BUILD_COST',
        value: 0.8, // 20% discount
      }
    ]
  },
  {
    id: 'POLICY_GREEN',
    title: 'Sáng Kiến Năng Lượng Xanh',
    description: 'Các quy định môi trường nghiêm ngặt được áp dụng. Các hành động Sứ mệnh mang lại nhiều điểm hơn, nhưng điểm Hiệu suất bị giảm.',
    icon: '🌱',
    activeForTurns: 4,
    effects: [
      {
        type: 'SCORE_MULTIPLIER',
        target: 'MISSION',
        value: 1.5, // 50% more mission score
      },
      {
        type: 'SCORE_MULTIPLIER',
        target: 'EFFICIENCY',
        value: 0.8, // 20% less efficiency score
      }
    ]
  },
  {
    id: 'POLICY_AUSTERITY',
    title: 'Biện Pháp Thắt Lưng Buộc Bụng',
    description: 'Suy thoái kinh tế buộc phải thắt lưng buộc bụng. Tất cả các tập đoàn mất $50 mỗi lượt.',
    icon: '📉',
    activeForTurns: 2,
    effects: [
      {
        type: 'FIXED_BONUS',
        target: 'MONEY',
        value: -50,
      }
    ]
  },
  {
    id: 'POLICY_TECH_BOOM',
    title: 'Bùng Nổ Công Nghệ',
    description: 'Nỗ lực số hoá quốc gia. Điểm Hiệu suất tăng gấp đôi.',
    icon: '💻',
    activeForTurns: 3,
    effects: [
      {
        type: 'SCORE_MULTIPLIER',
        target: 'EFFICIENCY',
        value: 2.0,
      }
    ]
  }
];

export const shufflePolicies = (policies: GovernmentPolicy[]): GovernmentPolicy[] => {
  const shuffled = [...policies];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
