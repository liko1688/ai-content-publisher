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
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ScheduledPosts() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [platforms, setPlatforms] = useState<
    Array<"facebook" | "twitter" | "instagram">
  >([]);

  const utils = trpc.useUtils();

  const { data: scheduledPosts, isLoading } =
    trpc.scheduledPosts.list.useQuery();

  const createMutation = trpc.scheduledPosts.create.useMutation({
    onSuccess: () => {
      toast.success("排程任務建立成功！");
      setOpen(false);
      setKeyword("");
      setScheduledTime("");
      setPlatforms([]);
      utils.scheduledPosts.list.invalidate();
    },
    onError: (error) => {
      toast.error(`建立失敗：${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!keyword.trim()) {
      toast.error("請輸入關鍵字");
      return;
    }
    if (!scheduledTime) {
      toast.error("請選擇排程時間");
      return;
    }
    if (platforms.length === 0) {
      toast.error("請至少選擇一個發布平台");
      return;
    }

    createMutation.mutate({
      keyword: keyword.trim(),
      scheduledTime: new Date(scheduledTime),
      platforms,
    });
  };

  const togglePlatform = (platform: "facebook" | "twitter" | "instagram") => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">排程管理</h1>
          <p className="text-gray-600 mt-2">
            設定關鍵字和發布時間，系統將自動生成文章並發布到社群媒體
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增排程
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增排程任務</DialogTitle>
              <DialogDescription>
                設定關鍵字、發布平台和時間，系統將自動生成並發布文章
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyword">關鍵字</Label>
                <Input
                  id="keyword"
                  placeholder="例如：人工智能發展趨勢"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">排程時間</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>發布平台</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="facebook"
                      checked={platforms.includes("facebook")}
                      onCheckedChange={() => togglePlatform("facebook")}
                    />
                    <label
                      htmlFor="facebook"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Facebook
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="twitter"
                      checked={platforms.includes("twitter")}
                      onCheckedChange={() => togglePlatform("twitter")}
                    />
                    <label
                      htmlFor="twitter"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Twitter (X)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instagram"
                      checked={platforms.includes("instagram")}
                      onCheckedChange={() => togglePlatform("instagram")}
                    />
                    <label
                      htmlFor="instagram"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Instagram
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    建立中...
                  </>
                ) : (
                  "建立排程"
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
        ) : scheduledPosts && scheduledPosts.length > 0 ? (
          <div className="grid gap-4">
            {scheduledPosts.map((post) => {
              const platforms = JSON.parse(post.platforms) as string[];
              return (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {post.keyword}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.scheduledTime).toLocaleDateString(
                              "zh-TW"
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(post.scheduledTime).toLocaleTimeString(
                              "zh-TW",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                        </CardDescription>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          post.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : post.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : post.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {post.status === "completed"
                          ? "已完成"
                          : post.status === "failed"
                          ? "失敗"
                          : post.status === "processing"
                          ? "處理中"
                          : "待執行"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">發布平台：</span>
                      <div className="flex gap-2">
                        {platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                          >
                            {platform === "facebook"
                              ? "Facebook"
                              : platform === "twitter"
                              ? "Twitter"
                              : "Instagram"}
                          </span>
                        ))}
                      </div>
                    </div>
                    {post.errorMessage && (
                      <p className="text-sm text-red-600 mt-2">
                        錯誤：{post.errorMessage}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              還沒有排程任務，點擊「新增排程」開始建立
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

