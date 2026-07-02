import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { CORPORATIONS } from '../../core/data/corporations';
import { GAME_ACTIONS } from '../../core/data/actions';

const SECTIONS = [
  {
    title: '🎯 Mục Tiêu',
    content: `Chiến thắng bằng cách đạt được điểm CÂN BẰNG cao nhất giữa Sứ mệnh Xã hội và Hiệu quả Kinh tế. Người giàu nhất KHÔNG tự động giành chiến thắng. Một CEO chỉ theo đuổi lợi nhuận hoặc chỉ vì mục đích xã hội sẽ bị phạt điểm.

Công thức tính điểm:
Điểm Chung Cuộc = (Tiền / 10) × Điểm Sứ Mệnh × Điểm Hiệu Quả − |Điểm Sứ Mệnh − Điểm Hiệu Quả| × 100

Hình phạt cho sự mất cân bằng sẽ tăng tỷ lệ thuận với mức độ chênh lệch giữa hai cột điểm.`,
  },
  {
    title: '🏢 Các Tập Đoàn',
    content: CORPORATIONS.map((corp) => {
      const priorities = corp.actionPriorities
        .map((actionType, i) => {
          const action = GAME_ACTIONS.find((a) => a.type === actionType);
          if (!action) return '';
          const mission = action.missionDelta !== 0 ? `${action.missionDelta > 0 ? '+' : ''}${action.missionDelta}M` : '';
          const efficiency = action.efficiencyDelta !== 0 ? `${action.efficiencyDelta > 0 ? '+' : ''}${action.efficiencyDelta}E` : '0E';
          return `Ưu tiên ${i + 1} - ${action.label}: Chi -$${action.moneyCost}, Sứ mệnh ${mission || '0M'}, Hiệu quả ${efficiency}`;
        })
        .join('\n');

      return `${corp.icon} ${corp.name} (${corp.fullName.replace('Tập đoàn ', '')})
${corp.strategyFocus}
Khả năng: ${corp.abilityDescription}

${priorities}`;
    }).join('\n\n'),
  },
  {
    title: '🗺️ Bản Đồ Trò Chơi',
    content: `Bản đồ đại diện cho Việt Nam, được chia thành 8 khu vực:

• Hà Nội (Đô thị) — Doanh thu: $80, Sứ mệnh: 70
• TP. Hồ Chí Minh (Đô thị) — Doanh thu: $100, Sứ mệnh: 60
• Đà Nẵng (Duyên hải) — Doanh thu: $60, Sứ mệnh: 65
• Đồng Bằng Sông Cửu Long (Nông thôn) — Doanh thu: $55, Sứ mệnh: 85
• Tây Nguyên (Miền núi) — Doanh thu: $45, Sứ mệnh: 80
• Núi Phía Bắc (Miền núi) — Doanh thu: $40, Sứ mệnh: 90
• Duyên Hải (Duyên hải) — Doanh thu: $65, Sứ mệnh: 70
• Biển Đảo (Hải đảo) — Doanh thu: $50, Sứ mệnh: 75

Sở hữu các khu vực để thu hoạch doanh thu và khẳng định lợi thế chiến thuật của mình.`,
  },
  {
    title: '🎲 Vòng Chơi',
    content: `Mỗi lượt chơi tuân theo trình tự sau:

1. ĐỔ XÚC XẮC — Tung xúc xắc để xác định số bước di chuyển (1–6 ô)
2. DI CHUYỂN — Tập đoàn di chuyển đến khu vực mới tương ứng
3. CHỌN HÀNH ĐỘNG — Chọn một trong 6 hành động có sẵn
4. RÚT THẺ SỰ KIỆN — Rút và giải quyết thẻ sự kiện với 2 lựa chọn A hoặc B
5. KẾT THÚC LƯỢT — Chuyển lượt cho tập đoàn tiếp theo

Thứ tự lượt chơi xoay vòng. Sau khi tất cả người chơi hoàn thành lượt của mình, lượt chơi chung của cả nước sẽ tăng lên.`,
  },
  {
    title: '⚡ Các Hành Động',
    content: `Bạn có thể thực hiện MỘT hành động mỗi lượt:

💹 Đầu tư ($50) — Xác lập quyền sở hữu khu vực hiện tại (+5 Sứ Mệnh, +10 Hiệu Quả)
🏗️ Nâng cấp khu vực ($80) — Cải thiện mức độ phát triển của khu vực sở hữu (+8 Sứ Mệnh, +12 Hiệu Quả)
🏛️ Xây dựng cơ sở hạ tầng ($80) — Xây dựng công trình tại khu vực (+15 Sứ Mệnh, +8 Hiệu Quả)
🤲 Hỗ trợ vùng sâu vùng xa ($40) — Tài trợ cho các cộng đồng khó khăn (+25 Sứ Mệnh, -5 Hiệu Quả)
⚙️ Tối ưu hóa vận hành ($30) — Cải tiến quy trình nội bộ (-5 Sứ Mệnh, +20 Hiệu Quả)
🔑 Thu mua tài nguyên ($60) — Đảm bảo hợp đồng tài nguyên (+15 Sứ Mệnh, 0 Hiệu Quả)

Số tiền khởi điểm: $500 | Điểm khởi điểm: Sứ mệnh 50, Hiệu quả 50`,
  },
  {
    title: '🃏 Thẻ Sự Kiện',
    content: `Sau khi thực hiện hành động, bạn rút một Thẻ Sự Kiện với hai lựa chọn chiến thuật (A hoặc B):

Mỗi lựa chọn có tác động khác nhau đến Tiền, Điểm Sứ Mệnh và Điểm Hiệu Quả. Hãy suy nghĩ cẩn thận — một số lựa chọn có lợi cho điểm này nhưng lại làm giảm điểm kia.

Các danh mục thẻ: Kinh tế, Xã hội, Thiên tai, Chính trị, Công nghệ.

Ví dụ:
• Khủng hoảng năng lượng: Ổn định giá cả (+15 Sứ Mệnh, -10 Hiệu Quả) HOẶC Định giá theo thị trường (+15 Hiệu Quả, -10 Sứ Mệnh)
• Lũ lụt ở miền Trung: Hỗ trợ khẩn cấp (+25 Sứ Mệnh, -$25) HOẶC Không hỗ trợ (-20 Sứ Mệnh, +$10)
• Đầu tư công nghệ: Đầu tư mạnh mẽ (+30 Hiệu Quả, -$30) HOẶC Trì hoãn (không ảnh hưởng)`,
  },
  {
    title: '⚠️ Nguy Cơ Độc Quyền',
    content: `Nếu bạn sở hữu TRÊN 40% số khu vực (nhiều hơn 3 trên 8 khu vực), bạn sẽ kích hoạt Thẻ Nguy Cơ Độc Quyền!

Thẻ Nguy Cơ Độc Quyền mang lại những hậu quả bất lợi:
• Phình to bộ máy: -15 Hiệu Quả
• Thất thoát vốn: Mất 20% số Tiền hiện có
• Điều tra tham nhũng: Mất lượt tiếp theo
• Trì hoãn vận hành: Mọi hoạt động nâng cấp mất thêm 1 lượt
• Làn sóng phản đối: -20 Điểm Sứ Mệnh
• Và hơn thế nữa...

Sở hữu quá nhiều khu vực trên bản đồ là điều nguy hiểm! Hãy tập trung vào các khu vực chiến lược, thay vì độc chiếm bản đồ.`,
  },
  {
    title: '🏆 Chiến Thắng',
    content: `Trò chơi kết thúc sau số lượt chơi quy định (mặc định: 5).

Điểm chung cuộc của các tập đoàn được tính theo công thức:
Điểm Chung Cuộc = (Tiền / 10) × Sứ Mệnh × Hiệu Quả − |Sứ Mệnh − Hiệu Quả| × 100

Ví dụ:
• Tập đoàn có $600, Sứ mệnh 70, Hiệu quả 75:
  Điểm = (600/10) × 70 × 75 − |70−75|×100 = 60 × 5.250 − 500 = 314.500

• Tập đoàn có $800, Sứ mệnh 90, Hiệu quả 30:
  Điểm = (800/10) × 90 × 30 − |90−30|×100 = 80 × 2.700 − 6.000 = 210.000

Tập đoàn thứ hai dù có nhiều tiền hơn nhưng điểm chung cuộc lại thấp hơn do chênh lệch điểm quá lớn!`,
  },
];

export const RulesPage: React.FC = () => {
  const [openSection, setOpenSection] = useState<number | null>(0);

  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <BookOpen size={40} className="text-[var(--vn-gold)] mx-auto mb-3" />
          <h1 className="text-3xl font-black text-white mb-2">Luật Chơi</h1>
          <p className="text-[var(--vn-muted)] text-sm">Toàn bộ luật chơi của Quốc Gia Cân Bằng</p>
        </motion.div>

        {/* Quick start */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 border border-[var(--vn-gold)]/30 mb-6 text-center"
        >
          <p className="text-[var(--vn-gold)] font-black text-lg mb-2">⭐ Ghi Nhớ</p>
          <p className="text-white text-sm">
            Tập đoàn nhiều tiền nhất KHÔNG chắc chắn thắng cuộc. Tập đoàn có cột điểm phát triển <span className="text-green-400 font-bold">cân bằng nhất</span> mới là người chiến thắng.
          </p>
          <div className="font-mono text-xs text-[var(--vn-muted)] mt-3">
            Điểm = <span className="text-[var(--vn-gold)]">(Tiền/10)</span> × <span className="text-green-400">Sứ Mệnh</span> × <span className="text-blue-400">Hiệu Quả</span> − |Sứ Mệnh−Hiệu Quả| × 100
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-2">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="glass rounded-xl overflow-hidden border border-[var(--vn-border)]"
            >
              <button
                onClick={() => setOpenSection(openSection === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/3 transition-colors"
              >
                <span className="text-white font-bold text-sm">{section.title}</span>
                {openSection === i ? (
                  <ChevronUp size={16} className="text-[var(--vn-muted)]" />
                ) : (
                  <ChevronDown size={16} className="text-[var(--vn-muted)]" />
                )}
              </button>

              {openSection === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 border-t border-[var(--vn-border)]"
                >
                  <pre className="text-[var(--vn-muted)] text-xs leading-relaxed whitespace-pre-wrap font-sans mt-3">
                    {section.content}
                  </pre>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};
