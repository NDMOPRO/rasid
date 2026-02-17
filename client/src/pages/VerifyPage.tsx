import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Search } from "lucide-react";
import { useParams } from "wouter";

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/eAXbruiTdhpCTGaH.png";

export default function VerifyPage() {
  const params = useParams<{ code?: string }>();
  const [code, setCode] = useState(params.code || "");
  const [result, setResult] = useState<null | { valid: boolean; summary: string }>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    setLoading(true);
    // Simulated verification
    setTimeout(() => {
      setResult({
        valid: code.length > 5,
        summary: code.length > 5
          ? "الوثيقة صالحة وصادرة من منصة راصد الوطنية"
          : "رمز التحقق غير صالح أو منتهي الصلاحية",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
        <img src={LOGO_URL} alt="منصة راصد" className="h-12 mx-auto" />
        <div>
          <h1 className="text-xl font-bold mb-2">التحقق من الوثائق</h1>
          <p className="text-sm text-muted-foreground">
            أدخل رمز التحقق أو امسح رمز QR للتحقق من صحة الوثيقة
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="أدخل رمز التحقق..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="text-center"
          />
          <Button onClick={handleVerify} disabled={loading} className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${result.valid ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {result.valid ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <Badge variant={result.valid ? "default" : "destructive"}>
                {result.valid ? "صالح" : "غير صالح"}
              </Badge>
            </div>
            <p className="text-sm">{result.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
