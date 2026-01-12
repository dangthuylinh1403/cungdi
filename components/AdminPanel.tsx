
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Shield, Search, Phone, Loader2, ArrowUpDown, Trash2, ChevronDown, Check, Car, Ticket, 
  Trophy, Star, Medal, Zap, CalendarDays, User, Settings, ShieldAlert, Edit3, X, Save, Clock, Crown, LayoutList, LayoutGrid, Key, Mail
} from 'lucide-react';
import { Profile, UserRole } from '../types.ts';
import { supabase } from '../lib/supabase.ts';
import CopyableCode from './CopyableCode.tsx';
import { UnifiedDropdown } from './SearchTrips.tsx';

const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
};

type SortConfig = { key: string; direction: 'asc' | 'desc' | null };

interface UserWithStats extends Profile {
  trips_count: number;
  bookings_count: number;
  last_activity_at?: string;
  created_at?: string; 
  email?: string;
}

// 1. Hàm lấy Style cho Avatar dựa trên Quyền hạn
const getRoleAvatarStyle = (role: UserRole) => {
  switch (role) {
    case 'admin': 
      return { style: 'bg-rose-50 text-rose-600 border-rose-100', icon: Shield };
    case 'manager': 
      return { style: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Settings };
    case 'driver': 
      return { style: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Car };
    default: 
      return { style: 'bg-sky-50 text-sky-600 border-sky-100', icon: User };
  }
};

// 2. Hàm phân cấp màu sắc cho số lượng (Heatmap levels)
const getCountLevelStyle = (count: number) => {
  if (count === 0) return 'bg-slate-50 text-slate-300 border-slate-100'; // Inactive
  if (count < 5) return 'bg-sky-50 text-sky-600 border-sky-100'; // Starter (1-4)
  if (count < 10) return 'bg-emerald-50 text-emerald-600 border-emerald-100'; // Active (5-9)
  if (count < 20) return 'bg-amber-50 text-amber-600 border-amber-100'; // Frequent (10-19)
  if (count < 50) return 'bg-rose-50 text-rose-600 border-rose-100'; // High (20-49)
  return 'bg-purple-50 text-purple-600 border-purple-100'; // Elite (50+)
};

// Style cho badge trên Avatar
const getBookingBadgeStyle = (count: number) => {
  if (count >= 20) return 'bg-rose-500 text-white ring-rose-200 shadow-rose-200';
  if (count >= 10) return 'bg-amber-500 text-white ring-amber-200 shadow-amber-200';
  if (count >= 5) return 'bg-emerald-500 text-white ring-emerald-200 shadow-emerald-200';
  if (count >= 1) return 'bg-sky-500 text-white ring-sky-200 shadow-sky-200';
  return 'bg-slate-300 text-white ring-slate-100 shadow-slate-200';
};

const RoleSelector = ({ value, onChange, disabled }: { value: UserRole, onChange: (role: UserRole) => void, disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const roles: { label: string, value: UserRole, icon: any, color: string, style: string }[] = [
    { label: 'Quản trị', value: 'admin', icon: Shield, color: 'text-rose-600', style: 'bg-rose-50 text-rose-600 border-rose-100' },
    { label: 'Điều phối', value: 'manager', icon: Settings, color: 'text-indigo-600', style: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Tài xế', value: 'driver', icon: Car, color: 'text-emerald-600', style: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Thành viên', value: 'user', icon: User, color: 'text-sky-600', style: 'bg-sky-50 text-sky-600 border-sky-100' },
  ];
  
  const currentRole = roles.find(r => r.value === value) || roles[3];
  const filteredRoles = roles.filter(r => removeAccents(r.label).includes(removeAccents(roleSearch)));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setRoleSearch('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        type="button" 
        disabled={disabled} 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`w-full flex items-center justify-between px-3 py-1.5 border rounded-xl transition-all duration-300 relative z-10 ${currentRole.style} ${isOpen ? 'ring-2 ring-indigo-100 border-indigo-400 shadow-sm' : 'hover:brightness-95'} ${disabled ? 'opacity-80 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <currentRole.icon size={12} className={currentRole.color.split(' ')[0]} />
          <span className="text-[10px] font-bold truncate">{currentRole.label}</span>
        </div>
        <ChevronDown size={12} className={`opacity-50 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-1 right-0 w-48 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-100 z-[999] p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-2 px-1 pt-1">
            <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" autoFocus placeholder="Tìm quyền..." value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-8 pr-2 py-2 bg-slate-50 border-none rounded-lg text-[10px] font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-0.5 p-0.5 max-h-48 overflow-y-auto custom-scrollbar">
            {filteredRoles.map((role) => (
              <button key={role.value} type="button" 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(role.value); setIsOpen(false); setRoleSearch(''); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${value === role.value ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}>
                <div className="flex items-center gap-3">
                  <role.icon size={12} className={value === role.value ? 'text-white' : role.color.split(' ')[0]} />
                  <span className="text-[11px] font-bold">{role.label}</span>
                </div>
                {value === role.value && <Check size={12} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminPanelProps {
    showAlert: (config: any) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ showAlert }) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ full_name: '', phone: '' });
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string[]>(['ALL']);
  const [activityTimeFilter, setActivityTimeFilter] = useState<string[]>(['ALL']); 
  const [sortOrder, setSortOrder] = useState('NAME_ASC');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'full_name', direction: 'asc' });

  // Password Reset UI State
  const [passwordResetUser, setPasswordResetUser] = useState<UserWithStats | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').neq('status', 'deleted').order('full_name', { ascending: true });
      if (profileError) throw profileError;

      const { data: tripsData } = await supabase.from('trips').select('driver_id, created_at').order('created_at', { ascending: false });
      const { data: bookingsData } = await supabase.from('bookings').select('passenger_id, created_at').order('created_at', { ascending: false });

      const userStats = (profiles || []).map(p => {
        const userTrips = tripsData?.filter(t => t.driver_id === p.id) || [];
        const userBookings = bookingsData?.filter(b => b.passenger_id === p.id) || [];
        
        const lastTripAt = userTrips[0]?.created_at;
        const lastBookingAt = userBookings[0]?.created_at;
        
        let lastActivity = undefined;
        if (lastTripAt && lastBookingAt) {
          lastActivity = new Date(lastTripAt) > new Date(lastBookingAt) ? lastTripAt : lastBookingAt;
        } else {
          lastActivity = lastTripAt || lastBookingAt;
        }

        return {
          ...p,
          trips_count: userTrips.length,
          bookings_count: userBookings.length,
          last_activity_at: lastActivity,
          created_at: p.created_at 
        };
      });
      setUsers(userStats);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSort = (key: string) => {
    let direction: SortConfig['direction'] = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const filteredUsers = useMemo(() => {
    const searchNormalized = removeAccents(searchTerm);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); 
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7); 

    let filtered = users.filter(u => {
      const nameMatch = removeAccents(u.full_name || '').includes(searchNormalized);
      const phoneMatch = u.phone?.includes(searchTerm);
      const emailMatch = u.email && removeAccents(u.email).includes(searchNormalized);
      const matchesSearch = nameMatch || phoneMatch || emailMatch;
      
      const matchesRole = roleFilter.includes('ALL') || roleFilter.includes(u.role);

      let matchesActivityTime = activityTimeFilter.includes('ALL');
      if (!matchesActivityTime && u.last_activity_at) {
        const lastActivityDate = new Date(u.last_activity_at);
        if (activityTimeFilter.includes('TODAY') && lastActivityDate >= today) matchesActivityTime = true;
        if (activityTimeFilter.includes('YESTERDAY') && (lastActivityDate >= yesterday && lastActivityDate < today)) matchesActivityTime = true;
        if (activityTimeFilter.includes('WEEK') && lastActivityDate >= weekAgo) matchesActivityTime = true;
      } else if (!matchesActivityTime && !u.last_activity_at) { 
          matchesActivityTime = false;
      }
      
      return matchesSearch && matchesRole && matchesActivityTime;
    });

    filtered.sort((a: any, b: any) => {
      if (sortOrder === 'NEWEST') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortOrder === 'OLDEST') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
      if (sortOrder === 'NAME_ASC') return (a.full_name || '').localeCompare(b.full_name || '');
      if (sortOrder === 'NAME_DESC') return (b.full_name || '').localeCompare(a.full_name || '');
      if (sortOrder === 'JOIN_DATE_ASC') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      }
      if (sortOrder === 'LAST_ACTIVITY_DESC') {
        const dateA = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
        const dateB = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
        return dateB - dateA;
      }
      if (sortOrder === 'TRIPS_COUNT_DESC') return b.trips_count - a.trips_count;
      if (sortOrder === 'BOOKINGS_COUNT_DESC') return b.bookings_count - a.bookings_count;
      return 0;
    });

    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a: any, b: any) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'created_at' || sortConfig.key === 'last_activity_at') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [users, searchTerm, roleFilter, activityTimeFilter, sortOrder, sortConfig]);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) { alert(err.message); } finally { setUpdatingId(null); }
  };

  const handleStartEdit = (user: UserWithStats) => {
    setEditingId(user.id);
    setEditData({ full_name: user.full_name, phone: user.phone || '' });
  };

  const handleSaveInfo = async (userId: string) => {
    setUpdatingId(userId);
    try {
      const { error } = await supabase.from('profiles').update({ 
        full_name: editData.full_name, 
        phone: editData.phone 
      }).eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...editData } : u));
      setEditingId(null);
    } catch (err: any) { alert(err.message); } finally { setUpdatingId(null); }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    showAlert({
        title: 'Vô hiệu hoá người dùng?',
        message: `Bạn có chắc muốn vô hiệu hoá người dùng "${userName}"? Họ sẽ không thể đăng nhập và sẽ bị ẩn khỏi hệ thống.`,
        variant: 'danger',
        confirmText: 'Vô hiệu hoá',
        cancelText: 'Hủy',
        onConfirm: async () => {
            setDeletingId(userId);
            try {
              const { error } = await supabase.rpc('soft_delete_user', {
                user_id_to_delete: userId
              });
              if (error) throw error;
              setUsers(prev => prev.filter(u => u.id !== userId));
            } catch (err: any) { 
                showAlert({
                    title: 'Lỗi',
                    message: err.message || 'Không thể vô hiệu hoá người dùng. Vui lòng thử lại.',
                    variant: 'danger',
                    confirmText: 'Đóng'
                });
            } finally { 
              setDeletingId(null); 
            }
        }
    });
  };

  const SortHeader = ({ label, sortKey, width, textAlign = 'text-left' }: { label: string, sortKey: string, width?: string, textAlign?: string }) => (
    <th style={{ width }} className={`px-4 py-4 text-[11px] font-bold text-slate-400 cursor-pointer hover:bg-slate-100/50 transition-colors ${textAlign}`} onClick={() => handleSort(sortKey)}>
      <div className={`flex items-center gap-1.5 ${textAlign === 'text-center' ? 'justify-center' : textAlign === 'text-right' ? 'justify-end' : ''}`}>
        {label}
        <ArrowUpDown size={10} className={`${sortConfig.key === sortKey ? 'text-indigo-600' : 'opacity-20'}`} />
      </div>
    </th>
  );

  const roleOptions = [
    {label:'Tất cả chức vụ', value:'ALL', icon: ShieldAlert, style: 'bg-slate-100 text-slate-600 border-slate-200'}, 
    {label:'Quản trị viên', value:'admin', icon: Shield, style: 'bg-rose-50 text-rose-600 border-rose-100'}, 
    {label:'Điều phối', value:'manager', icon: Settings, style: 'bg-indigo-50 text-indigo-600 border-indigo-100'}, 
    {label:'Tài xế', value:'driver', icon: Car, style: 'bg-emerald-50 text-emerald-600 border-emerald-100'}, 
    {label:'Thành viên', value:'user', icon: User, style: 'bg-sky-50 text-sky-600 border-sky-100'} 
  ];

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-gradient-to-br from-emerald-50/80 to-indigo-50/60 p-6 rounded-[32px] border border-emerald-100 shadow-sm space-y-5 backdrop-blur-sm relative z-30">
        <div className="flex flex-col gap-4">
          {/* ... existing Search/Sort UI ... */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex gap-3 w-full md:flex-1">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={16} />
                  <input 
                    type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 h-[42px] bg-white/80 border border-slate-200 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50/50 rounded-2xl outline-none transition-all font-bold text-slate-800 text-sm placeholder:text-slate-400 shadow-sm" 
                  />
               </div>
               
               <div className="flex-1 md:w-48 md:flex-none shrink-0">
                  <UnifiedDropdown 
                    label="Sắp xếp" icon={ArrowUpDown} value={sortOrder} width="w-full" showCheckbox={false}
                    options={[
                      { label: 'Mới nhất', value: 'NEWEST' },
                      { label: 'Cũ nhất', value: 'OLDEST' },
                      { label: 'Tên (A-Z)', value: 'NAME_ASC' },
                      { label: 'Tên (Z-A)', value: 'NAME_DESC' },
                      { label: 'Tham gia sớm', value: 'JOIN_DATE_ASC' },
                      { label: 'Hoạt động gần', value: 'LAST_ACTIVITY_DESC' }
                    ]}
                    onChange={setSortOrder}
                  />
               </div>
            </div>
            
            <div className="hidden md:flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm items-center shrink-0 h-[42px]">
              <button onClick={() => setViewMode('list')} className={`p-2 h-full aspect-square flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutList size={18} />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2 h-full aspect-square flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-3 w-full">
            <UnifiedDropdown label="Chức vụ" icon={Shield} value={roleFilter} onChange={setRoleFilter} width="w-full lg:w-48" showCheckbox={true}
              isRole={true} roleConfig={roleOptions} options={roleOptions} />
            <UnifiedDropdown label="Hoạt động" icon={CalendarDays} value={activityTimeFilter} onChange={setActivityTimeFilter} width="w-full lg:w-48" showCheckbox={true}
              options={[{label:'Tất cả thời gian', value:'ALL'}, {label:'Hôm nay', value:'TODAY'}, {label:'Hôm qua', value:'YESTERDAY'}, {label:'7 ngày qua', value:'WEEK'}]} />
          </div>
        </div>
      </div>
      
      {/* Password Reset UI State */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[28px] shadow-2xl p-6 relative">
                <button onClick={() => setPasswordResetUser(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-amber-50 rounded-full text-amber-600 border border-amber-100"><Key size={24} /></div>
                    <h3 className="text-lg font-bold text-slate-800">Cấp lại mật khẩu</h3>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                    <p className="text-xs text-slate-500 mb-1">Người dùng:</p>
                    <p className="font-bold text-slate-800">{passwordResetUser.full_name}</p>
                    <p className="text-xs text-slate-400">{passwordResetUser.phone || 'Không có SĐT'}</p>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800">
                        <p className="font-bold mb-1">⚠️ Lưu ý dành cho Admin</p>
                        <p>Vì lý do bảo mật, bạn không thể đổi mật khẩu người khác trực tiếp tại đây. Vui lòng copy ID bên dưới và thực hiện trong trang quản trị Supabase.</p>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 mb-1 block">User ID (UUID)</label>
                        <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-lg group">
                            <span className="flex-1 px-3 py-2 text-xs font-mono text-slate-600 truncate">{passwordResetUser.id}</span>
                            <CopyableCode code={passwordResetUser.id} label="" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-1" />
                        </div>
                    </div>

                    <a href={`https://supabase.com/dashboard/project/_/auth/users`} target="_blank" rel="noreferrer" className="w-full py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all">
                        Mở trang quản trị Auth <ArrowUpDown size={14} className="rotate-90"/>
                    </a>
                </div>
            </div>
        </div>
      )}

      {/* ... existing Grid View ... */}
      
      {/* Desktop Table View (Hidden in Grid Mode) */}
      <div className={`hidden md:${viewMode === 'list' ? 'block' : 'hidden'} bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-visible min-h-[500px]`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left table-fixed min-w-[1400px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <SortHeader label="Thành viên & Mã" sortKey="full_name" width="18%" />
                <SortHeader label="Quyền hạn" sortKey="role" width="12%" textAlign="text-center" />
                <SortHeader label="Số điện thoại" sortKey="phone" width="12%" />
                <SortHeader label="Email" sortKey="email" width="15%" />
                <SortHeader label="Chuyến đi" sortKey="trips_count" width="7%" textAlign="text-center" />
                <SortHeader label="Chuyến đặt" sortKey="bookings_count" width="7%" textAlign="text-center" />
                <SortHeader label="Hoạt động" sortKey="last_activity_at" width="10%" textAlign="text-center"/>
                <SortHeader label="Ngày tham gia" sortKey="created_at" width="10%" textAlign="text-center" />
                <th className="px-4 py-4 text-[11px] font-bold text-slate-400 text-right pr-8">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? filteredUsers.map(user => {
                // ... existing row logic ...
                const userCode = `C${user.id.substring(0,5).toUpperCase()}`;
                const isEditing = editingId === user.id;
                const avatarStyle = getRoleAvatarStyle(user.role);
                const AvatarIcon = avatarStyle.icon;
                const badgeStyle = getBookingBadgeStyle(user.bookings_count);
                const tripsColor = getCountLevelStyle(user.trips_count);
                const bookingsColor = getCountLevelStyle(user.bookings_count);

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/30 transition-colors group/row ${isEditing ? 'bg-indigo-50/20' : ''}`}>
                    {/* ... existing cells ... */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-100 shadow-sm transition-all ${avatarStyle.style}`}>
                             <AvatarIcon size={16} />
                          </div>
                          <div className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm ring-2 ring-white border border-white/50 ${badgeStyle}`} title={`Đã đặt ${user.bookings_count} chuyến`}>
                            {user.bookings_count}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <input 
                              type="text" value={editData.full_name} onChange={e => setEditData({...editData, full_name: e.target.value})}
                              className="w-full px-2 py-1 text-[12px] font-bold text-slate-800 border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                            />
                          ) : (
                            <p className="text-[12px] font-bold text-slate-800 truncate mb-1">{user.full_name}</p>
                          )}
                          <div className="inline-flex items-center bg-[#7B68EE10] text-[#7B68EE] px-2 py-0.5 rounded-md border border-[#7B68EE30] shadow-sm">
                            <CopyableCode code={userCode} className="text-[9px] font-black" label={userCode} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="w-32 relative">
                          {updatingId === user.id && !isEditing ? <div className="flex items-center justify-center py-2 bg-slate-50 rounded-xl border border-slate-100"><Loader2 className="animate-spin text-indigo-500" size={14} /></div> : <RoleSelector value={user.role} onChange={(role) => handleUpdateRole(user.id, role)} />}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="relative w-full">
                            <Phone size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="tel" value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})}
                              className="w-full pl-6 pr-2 py-1 text-[12px] font-bold text-slate-800 border border-indigo-200 rounded outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                            />
                          </div>
                        ) : (
                          <>
                            {user.phone && (
                              <a href={`tel:${user.phone}`} className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shrink-0">
                                 <Phone size={10} />
                              </a>
                            )}
                            <CopyableCode code={user.phone || ''} className="text-[11px] font-bold text-indigo-600 truncate" label={user.phone || 'N/A'} />
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                            {user.email && <Mail size={10} className="text-slate-400 shrink-0" />}
                            <CopyableCode code={user.email || ''} className="text-[11px] font-bold text-slate-600 truncate" label={user.email || 'N/A'} />
                        </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] h-6 px-1.5 rounded-lg text-[10px] font-black border shadow-sm ${tripsColor}`}>
                        {user.trips_count}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] h-6 px-1.5 rounded-lg text-[10px] font-black border shadow-sm ${bookingsColor}`}>
                        {user.bookings_count}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                        {user.last_activity_at ? (
                            <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-600 px-2 py-1 rounded-lg border border-sky-100 shadow-sm">
                            <Clock size={10} />
                            <span className="text-[10px] font-bold whitespace-nowrap">{new Date(user.last_activity_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">Chưa có</span>
                        )}
                    </td>
                    <td className="px-4 py-4 text-center">
                        {user.created_at ? (
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                            <CalendarDays size={10} />
                            <span className="text-[10px] font-bold whitespace-nowrap">{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-slate-400">N/A</span>
                        )}
                    </td>
                    <td className="px-4 py-4 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveInfo(user.id)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100"><Check size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setPasswordResetUser(user)} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 hover:bg-amber-600 hover:text-white transition-all" title="Cấp lại mật khẩu"><Key size={14} /></button>
                            <button onClick={() => handleStartEdit(user)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={14} /></button>
                            <button onClick={() => handleDeleteUser(user.id, user.full_name)} disabled={deletingId === user.id} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 hover:bg-rose-600 hover:text-white transition-all">
                              {deletingId === user.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={9} className="px-6 py-20 text-center italic text-slate-500 text-[11px] font-bold">Không tìm thấy người dùng nào</td></tr>
              )}
            </tbody>
          </table>
          <div className="h-40"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
