import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

export default function AdminUsers() {
  const { data: users, isLoading } = trpc.admin.users.useQuery();

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <h1 className="text-2xl font-bold">المستخدمون</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-gold" />
          <h1 className="text-2xl font-bold">المستخدمون</h1>
        </div>
        <Badge variant="outline" className="text-gold border-gold/30">
          {users?.length || 0} مستخدم
        </Badge>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right">المستخدم</TableHead>
              <TableHead className="text-right">البريد الإلكتروني</TableHead>
              <TableHead className="text-right">الدور</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!users || users.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  لا يوجد مستخدمون
                </TableCell>
              </TableRow>
            ) : (
              users.map((u: any) => (
                <TableRow key={u.id} className="border-border/20">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-gold/20">
                        <AvatarFallback className="text-xs bg-gold/10 text-gold">
                          {u.name?.charAt(0)?.toUpperCase() || "م"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" || u.role === "superadmin" || u.role === "root_admin" ? "default" : "secondary"}>
                      {u.role === "root_admin" ? "مدير رئيسي" : u.role === "superadmin" ? "مدير النظام" : u.role === "admin" ? "مدير" : "مستخدم"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive !== false ? "default" : "destructive"}>
                      {u.isActive !== false ? "نشط" : "معطل"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SA") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
