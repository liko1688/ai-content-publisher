import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const utils = trpc.useUtils();

  const generateMutation = trpc.content.generate.useMutation({
    onSuccess: () => {
      toast.success("文章生成成功！");
      setKeyword("");
      utils.content.list.invalidate();
    },
    onError: (error) => {
      toast.error(`生成失敗：${error.message}`);
    },
  });

  const { data: articles, isLoading } = trpc.content.list.useQuery();

  const handleGenerate = () => {
    if (!keyword.trim()) {
      toast.error("請輸入關鍵字");
      return;
    }
    generateMutation.mutate({ keyword: keyword.trim() });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">文章生成</h1>
        <p className="text-gray-600 mt-2">輸入關鍵字，由 AI 自動搜尋網路資料並生成文章和圖片</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>生成新文章</CardTitle>
          <CardDescription>
            輸入一個關鍵字，AI 將搜尋相關資料並生成約 500 字的文章和配圖
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">關鍵字</Label>
            <Input
              id="keyword"
              placeholder="例如：人工智能發展趨勢"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              disabled={generateMutation.isPending}
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成文章
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">我的文章</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription className="mt-1">
                        關鍵字：{article.keyword}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        article.status === "published"
                          ? "bg-green-100 text-green-700"
                          : article.status === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {article.status === "published"
                        ? "已發佈"
                        : article.status === "failed"
                        ? "失敗"
                        : "草稿"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(article.createdAt!).toLocaleString("zh-TW")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              還沒有文章，請輸入關鍵字開始生成
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
