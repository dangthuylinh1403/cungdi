import React, { useState } from 'react';
import {
  X, BookOpen, Clock, Play, CheckCircle2, XCircle, AlertCircle, Timer,
  Search, Navigation, Zap, Sparkles, Car, Ticket, Shield, Users,
  User, Settings, LayoutDashboard, ClipboardList, ShoppingBag, ArrowRight, Layers, HelpCircle, ListChecks
} from 'lucide-react';
import { Profile, UserRole } from '../types';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

// Reusable UI components for the guide
interface StatusBadgeProps {
  icon: React.ElementType;
  label: string;
  style: string;
  description: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ icon: Icon, label, style, description }) => (
  <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 group">
    <div className="mb-3 flex justify-between items-center">
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-bold ${style}`}>
        <Icon size={10} />
        {label}
      </div>
      <ArrowRight size={12} className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
    </div>
    <p className="text-[10px] text-slate-600 leading-relaxed font-normal">{description}</p>
  </div>
);

const GuideSection = ({ title, description, icon: Icon, children, borderColor = 'border-emerald-500' }: {title: string, description: string, icon: React.ElementType, children?: React.ReactNode, borderColor?: string}) => (
  <section className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
    <div className={`flex items-start gap-4 border-l-4 ${borderColor} pl-5`}>
      <div className={`mt-1 p-2 rounded-xl bg-slate-100 ${borderColor.replace('border-', 'text-')}`}>
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
        {description && <p className="text-xs font-normal text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
    <div className="pl-14 space-y-4">
      {children}
    </div>
  </section>
);

const Step = ({ number, title, children }: {number: string | number, title: string, children?: React.ReactNode}) => (
  <div className="flex items-start gap-4">
    <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg">{number}</div>
    <div className="flex-1 pt-0.5">
      <h4 className="font-bold text-slate-800 text-sm mb-1">{title}</h4>
      <div className="text-xs text-slate-600 font-normal leading-relaxed space-y-2">{children}</div>
    </div>
  </div>
);

const TripStatusGuide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { label: 'Chờ', icon: Clock, style: 'bg-amber-50 text-amber-600 border-amber-100', description: 'Chuyến xe vừa được đăng, còn nhiều thời gian (> 6 tiếng) để nhận khách.' },
        { label: 'Chuẩn bị', icon: Timer, style: 'bg-amber-50 text-amber-600 border-amber-100', description: 'Tự động kích hoạt khi còn 6 tiếng nữa khởi hành. Thẻ chuyến đi sẽ có viền Vàng.' },
        { label: 'Sát giờ', icon: AlertCircle, style: 'bg-rose-50 text-rose-600 border-rose-100', description: 'Tự động kích hoạt khi còn 1 tiếng nữa khởi hành. Thẻ chuyến đi có viền Đỏ khẩn cấp.' },
        { label: 'Đang chạy', icon: Play, style: 'bg-blue-50 text-blue-600 border-blue-100', description: 'Tự động kích hoạt khi đến giờ khởi hành. Chuyến xe bắt đầu di chuyển.' },
        { label: 'Hoàn thành', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-600 border-emerald-100', description: 'Tự động kích hoạt sau giờ dự kiến đến. Chuyến đi kết thúc, không nhận khách nữa.' },
        { label: 'Huỷ', icon: XCircle, style: 'bg-rose-50 text-rose-500 border-rose-100', description: 'Do tài xế hoặc quản trị viên chủ động hủy vì lý do khách quan.' },
      ].map((status, idx) => (
        <StatusBadge
          key={idx}
          icon={status.icon}
          label={status.label}
          style={status.style}
          description={status.description}
        />
      ))}
    </div>
);

const BookingStatusGuide = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { label: 'Chờ duyệt', icon: Clock, style: 'bg-amber-50 text-amber-600 border-amber-100', description: 'Hành khách vừa đặt chỗ. Tài xế cần xem xét và phản hồi.' },
        { label: 'Xác nhận', icon: CheckCircle2, style: 'bg-emerald-50 text-emerald-600 border-emerald-100', description: 'Tài xế đã đồng ý đón. Hệ thống tự động trừ số ghế trống trên chuyến.' },
        { label: 'Huỷ', icon: XCircle, style: 'bg-rose-50 text-rose-500 border-rose-100', description: 'Hành khách hoặc tài xế đã hủy đơn. Nếu đơn đã xác nhận, ghế sẽ được hoàn lại.' },
      ].map((status, idx) => (
        <StatusBadge
          key={idx}
          icon={status.icon}
          label={status.label}
          style={status.style}
          description={status.description}
        />
      ))}
    </div>
);

// --- Role-specific Content ---
const UserContent = () => (
  <div className="space-y-10">
    <GuideSection title="Tìm kiếm & Đặt chỗ" description="Khám phá các chuyến đi phù hợp hoặc tạo yêu cầu của riêng bạn." icon={Search} borderColor="border-sky-500">
      <Step number={1} title="Tìm kiếm chuyến xe có sẵn">
        <p>Tại tab <b className="text-emerald-600">"Chuyến xe có sẵn"</b>, bạn có thể tìm các chuyến do tài xế đăng. Sử dụng thanh tìm kiếm (hỗ trợ không dấu) và các bộ lọc (Loại xe, Điểm đi, Điểm đến) để tìm chuyến đi phù hợp nhất.</p>
      </Step>
      <Step number={2} title="Tạo yêu cầu tìm xe">
        <p>Nếu không tìm thấy chuyến phù hợp, chuyển qua tab <b className="text-orange-600">"Yêu cầu chuyến xe"</b> và nhấn nút <b className="text-orange-600">"Đăng yêu cầu mới"</b>. Các tài xế có lộ trình tương tự sẽ thấy và liên hệ với bạn.</p>
      </Step>
      <Step number={3} title="Đặt chỗ & Theo dõi">
        <p>Sau khi chọn chuyến, nhấn <b className="text-blue-600">"Đặt chỗ ngay"</b>, điền thông tin điểm đón/trả chi tiết. Đơn hàng của bạn sẽ ở trạng thái <b className="text-amber-600">"Chờ duyệt"</b>. Theo dõi trạng thái đơn hàng tại tab <b className="text-indigo-600">"Yêu cầu"</b>.</p>
      </Step>
    </GuideSection>
    <GuideSection title="Giải thích Trạng thái Đơn hàng" description="Hiểu rõ các trạng thái của yêu cầu đặt chỗ bạn đã tạo." icon={Ticket} borderColor="border-sky-500">
        <BookingStatusGuide />
    </GuideSection>
  </div>
);

const DriverContent = () => (
    <div className="space-y-10">
    <GuideSection title="Đăng & Quản lý chuyến xe" description="Tạo và quản lý các chuyến đi của bạn một cách hiệu quả." icon={Car} borderColor="border-emerald-500">
      <Step number={1} title="Quản lý đội xe">
        <p>Trước tiên, vào <b className="text-slate-700">Hồ sơ &gt; Quản lý đội xe</b> để thêm các phương tiện bạn sở hữu. Thông tin này sẽ được sử dụng khi đăng chuyến.</p>
      </Step>
      <Step number={2} title="Đăng chuyến mới">
        <p>Vào tab <b className="text-slate-700">"Đăng chuyến"</b>, chọn <b className="text-indigo-600">"Tôi có xe trống"</b>. Điền đầy đủ thông tin lộ trình, thời gian, giá vé và chọn xe. Sử dụng tính năng <b className="text-slate-700">"Lịch đi định kỳ"</b> cho các tuyến cố định hàng tuần.</p>
      </Step>
      <Step number={3} title="Nhận yêu cầu từ khách">
         <p>Kiểm tra tab <b className="text-orange-600">"Yêu cầu chuyến xe"</b>. Nếu có yêu cầu phù hợp với lộ trình của bạn, bạn có thể nhấn "Xác nhận đón" để tạo một đơn hàng mới cho yêu cầu đó.</p>
      </Step>
    </GuideSection>
    <GuideSection title="Xử lý Đơn hàng & Logic hệ thống" description="Hiểu cách hệ thống tự động cập nhật và cách duyệt đơn của khách." icon={ListChecks} borderColor="border-emerald-500">
       <Step number="💡" title="Duyệt đơn hàng">
          <p>Tất cả các yêu cầu đặt chỗ từ hành khách sẽ hiển thị ở tab <b className="text-slate-700">Quản lý &gt; Quản lý Yêu cầu</b>. Bạn có thể <b className="text-emerald-600">Xác nhận</b> hoặc <b className="text-rose-600">Từ chối</b>.</p>
          <p className="font-bold text-emerald-700">Logic quan trọng: Khi bạn "Xác nhận", số ghế trống trên chuyến xe sẽ tự động bị trừ đi. Nếu số ghế về 0, chuyến xe sẽ chuyển sang trạng thái "Đầy chỗ".</p>
       </Step>
       <Step number="⚙️" title="Vòng đời chuyến xe tự động">
           <p>Hệ thống sẽ tự động thay đổi trạng thái chuyến xe của bạn dựa trên thời gian thực để thu hút khách hàng hiệu quả hơn:</p>
            <TripStatusGuide />
       </Step>
    </GuideSection>
  </div>
);

const StaffContent = ({ role }: { role: 'manager' | 'admin' }) => (
    <div className="space-y-10">
    <GuideSection title="Tổng quan & Giám sát" description="Theo dõi sức khỏe toàn bộ hệ thống và các chỉ số quan trọng." icon={LayoutDashboard} borderColor={role === 'admin' ? 'border-rose-500' : 'border-indigo-500'}>
      <p className="text-xs text-slate-600">Tab <b className={role === 'admin' ? 'text-rose-600' : 'text-indigo-600'}>"Thống kê"</b> cung cấp cho bạn cái nhìn toàn cảnh về doanh thu, số lượng chuyến xe, và tỷ lệ lấp đầy. Đây là công cụ chính để đánh giá hiệu quả hoạt động.</p>
    </GuideSection>
    <GuideSection title="Quản lý Vận hành" description="Bạn có toàn quyền xem và điều chỉnh mọi hoạt động trên hệ thống." icon={ClipboardList} borderColor={role === 'admin' ? 'border-rose-500' : 'border-indigo-500'}>
        <Step number={1} title="Quản lý Chuyến xe">
            <p>Tại <b className={role === 'admin' ? 'text-rose-600' : 'text-indigo-600'}>Quản lý &gt; Quản lý Chuyến xe</b>, bạn có thể xem, chỉnh sửa hoặc hủy bất kỳ chuyến xe nào của tài xế. Chức năng này hữu ích trong việc hỗ trợ tài xế hoặc xử lý các trường hợp khẩn cấp.</p>
        </Step>
        <Step number={2} title="Quản lý Yêu cầu">
            <p>Tại <b className={role === 'admin' ? 'text-rose-600' : 'text-indigo-600'}>Quản lý &gt; Quản lý Yêu cầu</b>, bạn có thể xem và thay đổi trạng thái của mọi đơn hàng trong hệ thống, giúp giải quyết các khiếu nại hoặc sai sót.</p>
        </Step>
    </GuideSection>
    {role === 'admin' && (
      <GuideSection title="Quản trị Hệ thống (Admin)" description="Quản lý người dùng và các thiết lập cấp cao." icon={Shield} borderColor="border-rose-500">
          <p className="text-xs text-slate-600">Tab <b className="text-rose-600">"Hệ thống"</b> cho phép bạn xem danh sách tất cả người dùng, thay đổi vai trò của họ (ví dụ: nâng cấp một 'Thành viên' lên 'Tài xế'), hoặc xóa người dùng khỏi hệ thống.</p>
      </GuideSection>
    )}
  </div>
);


const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, profile }) => {
  const [activeTab, setActiveTab] = useState(profile?.role || 'user');

  const visibleRoles: UserRole[] = ['user', 'driver'];
  if (profile?.role === 'manager' || profile?.role === 'admin') visibleRoles.push('manager');
  if (profile?.role === 'admin') visibleRoles.push('admin');
  
  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'user': return <UserContent />;
      case 'driver': return <DriverContent />;
      case 'manager': return <StaffContent role="manager" />;
      case 'admin': return <StaffContent role="admin" />;
      default: return <UserContent />;
    }
  };

  const getRoleInfo = (role: UserRole) => {
    switch(role) {
      case 'user': return { label: 'Hành khách', icon: Users, color: 'text-sky-600' };
      case 'driver': return { label: 'Tài xế', icon: Car, color: 'text-emerald-600' };
      case 'manager': return { label: 'Điều phối', icon: Settings, color: 'text-indigo-600' };
      case 'admin': return { label: 'Quản trị', icon: Shield, color: 'text-rose-600' };
      default: return { label: 'Hành khách', icon: Users, color: 'text-sky-600' };
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-50 w-full max-w-6xl h-[90vh] rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row border border-white/20 relative">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md text-slate-500 rounded-full flex items-center justify-center shadow-lg hover:text-rose-500 hover:bg-white transition-all duration-300 z-[210] border border-slate-200"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Hướng dẫn</h2>
              <p className="text-xs text-slate-400">Theo vai trò</p>
            </div>
          </div>
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {visibleRoles.map(role => {
              const { label, icon: Icon, color } = getRoleInfo(role);
              const isActive = activeTab === role;
              return (
                <button 
                  key={role} 
                  onClick={() => setActiveTab(role)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left text-xs font-bold whitespace-nowrap ${isActive ? `bg-emerald-50 text-emerald-600 shadow-sm` : `text-slate-500 hover:bg-slate-100 hover:text-slate-800`}`}
                >
                  <Icon size={16} className={isActive ? color : 'text-slate-400'} />
                  {label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default UserGuideModal;