/**
 * ImageSearch — AI-powered image search and analysis component.
 * Supports searching through uploaded images, screenshots, and visual content.
 */
import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  relevanceScore: number;
  tags?: string[];
  date?: string;
}

interface ImageSearchProps {
  className?: string;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onImageSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

export function ImageSearch({
  className,
  onSearch,
  onImageSelect,
  placeholder = "ابحث في الصور...",
}: ImageSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !onSearch) return;
    setIsSearching(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (err) {
      console.error("Image search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        const result: SearchResult = {
          id: `upload-${Date.now()}`,
          url: reader.result as string,
          title: file.name,
          description: `${(file.size / 1024).toFixed(1)} KB — ${file.type}`,
          relevanceScore: 1,
          date: new Date().toISOString(),
        };
        setResults((prev) => [result, ...prev]);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setSelectedImage(result);
      onImageSelect?.(result);
    },
    [onImageSelect]
  );

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)} dir="rtl">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-sm transition-all disabled:opacity-50"
          >
            {isSearching ? "جاري البحث..." : "بحث"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 text-sm transition-all"
            title="رفع صورة"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* View mode toggle */}
        {results.length > 0 && (
          <div className="flex gap-1 mt-3">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-1 rounded text-xs transition-all",
                viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              ▦ شبكة
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1 rounded text-xs transition-all",
                viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              ☰ قائمة
            </button>
            <span className="text-xs text-white/30 mr-auto mt-1">
              {results.length} نتيجة
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        {results.length === 0 && !isSearching && (
          <div className="text-center py-12 text-white/30">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">ابحث عن صور أو ارفع صورة للتحليل</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-3" />
            <p className="text-sm text-white/40">جاري البحث...</p>
          </div>
        )}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "relative group rounded-lg overflow-hidden cursor-pointer border transition-all",
                  selectedImage?.id === result.id
                    ? "border-cyan-500 ring-2 ring-cyan-500/30"
                    : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="aspect-square bg-slate-800">
                  <img
                    src={result.thumbnail || result.url}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white truncate">{result.title}</p>
                    {result.tags && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {result.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Relevance badge */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-black/50 text-cyan-400">
                  {Math.round(result.relevanceScore * 100)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "flex gap-3 p-3 rounded-lg cursor-pointer border transition-all",
                  selectedImage?.id === result.id
                    ? "border-cyan-500/50 bg-cyan-500/5"
                    : "border-white/5 hover:border-white/10 hover:bg-white/5"
                )}
              >
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={result.thumbnail || result.url} alt={result.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 truncate">{result.title}</p>
                  {result.description && <p className="text-xs text-white/40 mt-1 truncate">{result.description}</p>}
                  {result.tags && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {result.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-cyan-400 flex-shrink-0">
                  {Math.round(result.relevanceScore * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageSearch;
