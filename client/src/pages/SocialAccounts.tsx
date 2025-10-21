import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SocialAccounts() {
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<
    "facebook" | "twitter" | "instagram" | ""
  >("");
  const [accountName, setAccountName] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const utils = trpc.useUtils();

  const { data: accounts, isLoading } = trpc.socialAccounts.list.useQuery();

  const createMutation = trpc.socialAccounts.create.useMutation({
    onSuccess: () => {
      toast.success("社群帳號新增成功！");
      setOpen(false);
      setPlatform("");
      setAccountName("");
      setAccessToken("");
      utils.socialAccounts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const deleteMutation = trpc.socialAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("社群帳號已刪除");
      setDeleteId(null);
      utils.socialAccounts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!platform) {
      toast.error("請選擇平台");
      return;
    }
    if (!accountName.trim()) {
      toast.error("請輸入帳號名稱");
      return;
    }
    if (!accessToken.trim()) {
      toast.error("請輸入 Access Token");
      return;
    }

    createMutation.mutate({
      platform,
      accountName: accountName.trim(),
      accessToken: accessToken.trim(),
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const getPlatformGuide = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "https://developers.facebook.com/docs/facebook-login/guides/access-tokens";
      case "twitter":
        return "https://developer.twitter.com/en/docs/authentication/oauth-2-0";
      case "instagram":
        return "https://developers.facebook.com/docs/instagram-basic-display-api/getting-started";
      default:
        return "#";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">社群帳號管理</h1>
          <p className="text-gray-600 mt-2">
            管理您的社群媒體帳號，用於自動發布文章
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增帳號
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新增社群帳號</DialogTitle>
              <DialogDescription>
                新增社群媒體帳號以啟用自動發文功能
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform">平台</Label>
                <Select
                  value={platform}
                  onValueChange={(value: any) => setPlatform(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇平台" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter (X)</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">帳號名稱</Label>
                <Input
                  id="accountName"
                  placeholder="例如：我的粉絲專頁"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="貼上您的 Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                {platform && (
                  <p className="text-xs text-gray-500">
                    如何取得 Access Token？
                    <a
                      href={getPlatformGuide(platform)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-1"
                    >
                      查看官方文件
                    </a>
                  </p>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">設定指引：</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>
                        <strong>Facebook:</strong> 需要建立 Facebook App 並取得
                        Page Access Token
                      </li>
                      <li>
                        <strong>Twitter:</strong> 需要申請 Twitter Developer
                        Account 並建立 App
                      </li>
                      <li>
                        <strong>Instagram:</strong> 需要 Instagram Business
                        Account 並連結 Facebook Page
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    新增中...
                  </>
                ) : (
                  "新增帳號"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : accounts && accounts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {account.accountName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {account.platform === "facebook"
                          ? "Facebook"
                          : account.platform === "twitter"
                          ? "Twitter (X)"
                          : "Instagram"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          account.isActive === "yes"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {account.isActive === "yes" ? "啟用" : "停用"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(account.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400">
                    新增時間：
                    {new Date(account.createdAt!).toLocaleString("zh-TW")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              還沒有社群帳號，點擊「新增帳號」開始設定
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除此社群帳號嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

