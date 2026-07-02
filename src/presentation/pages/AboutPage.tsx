import React from 'react';
import { motion } from 'framer-motion';
import { Info, BookOpen, Globe, Award } from 'lucide-react';

const CORPS = [
  { icon: '⚡', name: 'EVN', full: 'Tập đoàn Điện lực Việt Nam', founded: '1994', employees: '90.000+', desc: 'Tập đoàn điện lực quốc gia chịu trách nhiệm phát điện, truyền tải và phân phối điện trên toàn quốc. EVN quản lý hơn 70% công suất phát điện của Việt Nam và phục vụ 27 triệu khách hàng.' },
  { icon: '🛢️', name: 'Petrovietnam', full: 'Tập đoàn Dầu khí Việt Nam', founded: '1977', employees: '60.000+', desc: 'Công ty năng lượng nhà nước Việt Nam tham gia vào hoạt động thăm dò, khai thác, sản xuất và phân phối dầu khí. Đây là một trong những đơn vị đóng góp lớn nhất vào GDP và ngân sách nhà nước Việt Nam.' },
  { icon: '📡', name: 'Viettel', full: 'Tập đoàn Công nghiệp - Viễn thông Quân đội', founded: '1989', employees: '40.000+', desc: 'Doanh nghiệp viễn thông lớn nhất Việt Nam, do Bộ Quốc phòng sáng lập. Viettel hoạt động tại 11 quốc gia và là một trong những công ty viễn thông phát triển nhanh nhất Đông Nam Á.' },
  { icon: '⛏️', name: 'Vinacomin', full: 'Tập đoàn Công nghiệp Than - Khoáng sản Việt Nam', founded: '1994', employees: '120.000+', desc: 'Doanh nghiệp khai thác than và khoáng sản hàng đầu Việt Nam, chịu trách nhiệm khai thác các nguồn tài nguyên phục vụ cho ngành năng lượng và công nghiệp cả nước.' },
];

export const AboutPage: React.FC = () => {
  return (
    <main className="min-h-[calc(100vh-56px)] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Globe size={48} className="text-[var(--vn-red)] mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-3">Giới Thiệu Trò Chơi</h1>
          <p className="text-[var(--vn-muted)] text-base max-w-2xl mx-auto leading-relaxed">
            Cán Cân Vĩ Mô là một trò chơi chiến thuật giáo dục được thiết kế để khám phá những
            thách thức phức tạp mà các Doanh nghiệp Nhà nước (SOE) Việt Nam phải đối mặt — những tổ chức phải
            đồng thời thực hiện sứ mệnh xã hội và đạt được hiệu quả kinh tế.
          </p>
        </motion.div>

        {/* Educational Context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6 border border-[var(--vn-border)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <Info size={18} className="text-[var(--vn-gold)]" />
              <h2 className="text-white font-black text-base">Doanh nghiệp Nhà nước (SOE) là gì?</h2>
            </div>
            <p className="text-[var(--vn-muted)] text-sm leading-relaxed">
              Doanh nghiệp Nhà nước (SOE) là các tập đoàn mà chính phủ nắm giữ cổ phần chi phối đáng kể.
              Tại Việt Nam, các SOE đóng vai trò then chốt trong phát triển đất nước, quản lý các ngành công nghiệp
              trọng điểm như năng lượng, viễn thông và tài nguyên thiên nhiên.
            </p>
            <p className="text-[var(--vn-muted)] text-sm leading-relaxed mt-3">
              Khác với các công ty tư nhân, SOE phải cân bằng giữa việc tạo ra lợi nhuận với trách nhiệm xã hội:
              cung cấp dịch vụ giá rẻ cho vùng sâu vùng xa, duy trì việc làm và hỗ trợ các mục tiêu phát triển quốc gia.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-xl p-6 border border-[var(--vn-border)]"
          >
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[var(--vn-gold)]" />
              <h2 className="text-white font-black text-base">Nhiệm Vụ Kép</h2>
            </div>
            <p className="text-[var(--vn-muted)] text-sm leading-relaxed">
              Mâu thuẫn cốt lõi trong Cán Cân Vĩ Mô phản ánh việc quản lý SOE ngoài đời thực: làm thế nào để
              tối đa hóa lợi nhuận VÀ hoàn thành nghĩa vụ xã hội?
            </p>
            <ul className="mt-3 space-y-2">
              {[
                'Cung cấp điện cho các bản làng miền núi xa xôi (tốn kém nhưng thiết yếu)',
                'Duy trì giá nhiên liệu hợp lý trong thời kỳ khủng hoảng toàn cầu',
                'Đầu tư vào công nghệ xanh bất chấp chi phí cao và lợi nhuận ngắn hạn giảm',
                'Hỗ trợ việc làm tại địa phương thay vì thuê ngoài giá rẻ',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[var(--vn-gold)] mt-0.5">•</span>
                  <span className="text-[var(--vn-muted)] text-xs">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Real Corporations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-white font-black text-xl mb-6 text-center flex items-center justify-center gap-2">
            <Award size={20} className="text-[var(--vn-gold)]" />
            Các Tập Đoàn Thực Tế
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CORPS.map((corp, i) => (
              <motion.div
                key={corp.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5 border border-[var(--vn-border)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{corp.icon}</span>
                  <div>
                    <p className="text-white font-black text-sm">{corp.name}</p>
                    <p className="text-[var(--vn-muted)] text-[10px]">{corp.full}</p>
                  </div>
                </div>
                <div className="flex gap-4 mb-3">
                  <div>
                    <p className="text-[var(--vn-muted)] text-[9px]">Thành Lập</p>
                    <p className="text-[var(--vn-gold)] text-xs font-bold">{corp.founded}</p>
                  </div>
                  <div>
                    <p className="text-[var(--vn-muted)] text-[9px]">Nhân Viên</p>
                    <p className="text-[var(--vn-gold)] text-xs font-bold">{corp.employees}</p>
                  </div>
                </div>
                <p className="text-[var(--vn-muted)] text-xs leading-relaxed">{corp.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-xl p-5 border border-[var(--vn-border)] text-center"
        >
          <p className="text-[var(--vn-muted)] text-xs leading-relaxed">
            Cán Cân Vĩ Mô là một trò chơi mô phỏng mang tính giáo dục. Tất cả cơ chế, số liệu thống kê
            và kịch bản trong trò chơi đã được đơn giản hóa nhằm phục vụ mục đích học tập. Các tập đoàn
            được mô tả là các thực thể có thật; tuy nhiên toàn bộ khả năng và tình huống trong game là hư cấu
            và chỉ phục vụ cho trải nghiệm chơi game.
          </p>
        </motion.div>
      </div>
    </main>
  );
};
