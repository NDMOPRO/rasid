import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Mail, Phone, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const teamRoles = ["super_admin", "admin", "ops_manager", "field_agent", "viewer", "finance", "owner_portal"];
const accessLevels = ["full_access", "edit_view", "view_only", "restricted"];

const roleColors: Record<string, string> = {
  super_admin: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  admin: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  ops_manager: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  field_agent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  finance: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  owner_portal: "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400",
};

export default function Team() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const isAdmin = user?.role === "admin";
  const [showCreate, setShowCreate] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");

  const { data: members, isLoading, refetch } = trpc.team.list.useQuery({
    role: roleFilter || undefined,
  });

  const createMutation = trpc.team.create.useMutation({
    onSuccess: () => { toast.success(lang === "ar" ? "تمت إضافة العضو" : "Team member added"); setShowCreate(false); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    nameAr: "", nameEn: "", email: "", phone: "",
    teamRole: "viewer" as const, accessLevel: "view_only" as const,
    canEditContracts: false, canViewFinancials: false, canManageTeam: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("team.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("team.subtitle")}</p>
        </div>
        {isAdmin && (
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 me-2" />{t("team.addMember")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{t("team.addMember")}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>{t("team.nameAr")} *</Label><Input dir="rtl" value={form.nameAr} onChange={e => setForm(f => ({...f, nameAr: e.target.value}))} /></div>
                  <div className="space-y-2"><Label>{t("team.nameEn")}</Label><Input value={form.nameEn} onChange={e => setForm(f => ({...f, nameEn: e.target.value}))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>{t("team.email")}</Label><Input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
                  <div className="space-y-2"><Label>{t("team.phone")}</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+966-5X-XXX-XXXX" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("team.role")}</Label>
                    <Select value={form.teamRole} onValueChange={v => setForm(f => ({...f, teamRole: v as any}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{teamRoles.map(r => <SelectItem key={r} value={r}>{t(`teamRole.${r}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("team.accessLevel")}</Label>
                    <Select value={form.accessLevel} onValueChange={v => setForm(f => ({...f, accessLevel: v as any}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{accessLevels.map(a => <SelectItem key={a} value={a}>{t(`accessLevel.${a}`)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between"><Label className="text-sm">{t("team.canEditContracts")}</Label><Switch checked={form.canEditContracts} onCheckedChange={v => setForm(f => ({...f, canEditContracts: v}))} /></div>
                  <div className="flex items-center justify-between"><Label className="text-sm">{t("team.canViewFinancials")}</Label><Switch checked={form.canViewFinancials} onCheckedChange={v => setForm(f => ({...f, canViewFinancials: v}))} /></div>
                  <div className="flex items-center justify-between"><Label className="text-sm">{t("team.canManageTeam")}</Label><Switch checked={form.canManageTeam} onCheckedChange={v => setForm(f => ({...f, canManageTeam: v}))} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
                <Button onClick={() => { if (!form.nameAr) { toast.error(lang === "ar" ? "الاسم بالعربية مطلوب" : "Arabic name is required"); return; } createMutation.mutate(form); }} disabled={createMutation.isPending}>
                  {createMutation.isPending ? t("common.loading") : t("common.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={roleFilter} onValueChange={v => setRoleFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder={t("common.all") + " " + t("team.role")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {teamRoles.map(r => <SelectItem key={r} value={r}>{t(`teamRole.${r}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Team Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>)}
        </div>
      ) : members && members.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member: any) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{lang === "ar" ? (member.nameAr || member.nameEn) : (member.nameEn || member.nameAr)}</h3>
                    {member.nameEn && lang === "ar" && <p className="text-xs text-muted-foreground">{member.nameEn}</p>}
                    {member.nameAr && lang === "en" && <p className="text-xs text-muted-foreground">{member.nameAr}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${roleColors[member.teamRole] || ""}`}>
                      {t(`teamRole.${member.teamRole}`)}
                    </Badge>
                    {!member.isActive && <Badge variant="destructive" className="text-[10px]">{lang === "ar" ? "غير نشط" : "Inactive"}</Badge>}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {member.email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /><span className="truncate">{member.email}</span></div>}
                  {member.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /><span>{member.phone}</span></div>}
                  <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" /><span>{t(`accessLevel.${member.accessLevel}`)}</span></div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t">
                  {member.canEditContracts && <Badge variant="outline" className="text-[9px]">{t("team.canEditContracts")}</Badge>}
                  {member.canViewFinancials && <Badge variant="outline" className="text-[9px]">{t("team.canViewFinancials")}</Badge>}
                  {member.canManageTeam && <Badge variant="outline" className="text-[9px]">{t("team.canManageTeam")}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">{t("team.noMembers")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("team.addFirst")}</p>
            {isAdmin && <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 me-2" />{t("team.addMember")}</Button>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
