/**
 * نظام الصلاحيات المركزي لمنصة راصد
 * يضمن أن root_admin و admin و superadmin لديهم وصول كامل
 */

type UserLike = {
  role?: string;
  rasidRole?: string;
  platformRole?: string;
} | null | undefined;

/** التحقق من أن المستخدم مدير (أي نوع من أنواع المدراء) */
export function isAdminUser(user: UserLike): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase() || '';
  const rasidRole = user.rasidRole?.toLowerCase() || '';
  const platformRole = (user as any)?.platformRole?.toLowerCase() || '';
  
  const adminRoles = ['admin', 'root_admin', 'superadmin', 'root', 'director'];
  return adminRoles.includes(role) || adminRoles.includes(rasidRole) || adminRoles.includes(platformRole);
}

/** التحقق من أن المستخدم root admin */
export function isRootAdmin(user: UserLike): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase() || '';
  const rasidRole = user.rasidRole?.toLowerCase() || '';
  return role === 'root_admin' || role === 'superadmin' || rasidRole === 'root_admin' || rasidRole === 'root';
}

/** التحقق من أن المستخدم لديه صلاحية معينة */
export function hasPermission(user: UserLike, _permission: string): boolean {
  // المدراء لديهم كل الصلاحيات
  if (isAdminUser(user)) return true;
  // يمكن توسيع هذا لاحقاً بنظام صلاحيات مفصل
  return false;
}

/** الحصول على اسم الدور بالعربية */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    root_admin: 'مدير النظام الرئيسي',
    root: 'روت راصد',
    superadmin: 'مدير النظام',
    admin: 'مدير',
    director: 'مدير إدارة',
    smart_monitor_manager: 'مدير راصد الذكي',
    monitoring_director: 'مدير إدارة الرصد',
    monitoring_specialist: 'أخصائي رصد',
    monitoring_officer: 'مسؤول رصد',
    manager: 'مدير قسم',
    analyst: 'محلل',
    viewer: 'مشاهد',
    user: 'مستخدم',
  };
  return labels[role] || role;
}

/** الحصول على لون الدور */
export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    root_admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    root: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    superadmin: 'text-red-400 bg-red-500/10 border-red-500/20',
    admin: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    director: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    smart_monitor_manager: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    monitoring_director: 'text-green-400 bg-green-500/10 border-green-500/20',
    monitoring_specialist: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    monitoring_officer: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    user: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };
  return colors[role] || colors.user;
}
