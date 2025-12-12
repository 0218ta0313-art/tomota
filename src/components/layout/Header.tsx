'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { Heart, Settings, AlertTriangle, ClipboardList, LogOut, Users, User, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { logout } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentPoints?: number;
  userName?: string;
  systemRoleId?: number;
}

// 内部コンポーネント（useSearchParamsを使用）
function HeaderContent({ currentPoints = 0, userName, systemRoleId }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get('filter');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = systemRoleId === 1;

  // ▼▼▼ ここに追加 ▼▼▼
  type Sparkle = { id: string; x: number; y: number; size: number; rotate: number };
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const spawnSparkles = (x: number, y: number) => {
    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    const newOnes: Sparkle[] = Array.from({ length: 12 }).map(() => ({
      id: crypto.randomUUID(),
      x: x + rand(-18, 18),
      y: y + rand(-18, 18),
      size: rand(6, 12),
      rotate: rand(0, 360),
    }));

    setSparkles((prev) => [...prev, ...newOnes]);

    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !newOnes.some((n) => n.id === s.id)));
    }, 800);
  };
  // ▲▲▲ ここまで追加 ▲▲▲

  // メニュー外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentFilter === filter) {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* ロゴ・タイトル */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <ClipboardList className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-800 hidden sm:inline-block">
            クリニック日報
          </span>
        </Link>

        {/* フィルターボタン */}
        <div className="flex items-center space-x-2">
          <Button
            variant={currentFilter === 'urgent' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              "text-red-500 hover:text-red-600 hover:bg-red-50",
              currentFilter === 'urgent' && "bg-red-50"
            )}
            title="至急のみ表示"
            onClick={() => toggleFilter('urgent')}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">至急</span>
          </Button>

          <Button
            variant={currentFilter === 'todo' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              "text-blue-500 hover:text-blue-600 hover:bg-blue-50",
              currentFilter === 'todo' && "bg-blue-50"
            )}
            title="未解決のみ表示"
            onClick={() => toggleFilter('todo')}
          >
            <ClipboardList className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">TODO</span>
          </Button>
        </div>

        {/* 右側: ポイント・設定 */}
        <div className="flex items-center space-x-3">
          {/* ポイント表示（クリックでポイントページへ） */}
          <Link 
            href="/points"
            onClick={(e) => spawnSparkles(e.clientX, e.clientY)}
            className="flex items-center space-x-1 rounded-full bg-pink-50 px-3 py-1.5 text-pink-600 hover:bg-pink-100 transition-colors"
            title="ポイント詳細を見る"
          >
            <Heart className="h-4 w-4 fill-current" />
            <span className="font-semibold text-sm">{currentPoints}</span>
          </Link>

          {/* 設定ボタンとメニュー */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500"
              title="設定"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* ハンバーガーメニュー */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="py-1">
                  <Link
                    href="/mypage"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>マイページ</span>
                  </Link>

                  <Link
                    href="/points"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    <span>ポイント履歴</span>
                  </Link>

                  <Link
                    href="/ranking"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Trophy className="h-4 w-4" />
                    <span>ランキング</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>ユーザー管理画面</span>
                    </Link>
                  )}
                  
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <form 
                      action={logout}
                      onSubmit={() => setIsMenuOpen(false)}
                    >
                      <button
                        type="submit"
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>ログアウト</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* sparkle layer */}
<div className="pointer-events-none fixed inset-0 z-[9999]">
  {sparkles.map((s) => (
    <span
      key={s.id}
      style={{
        position: 'absolute',
        left: s.x,
        top: s.y,
        width: s.size,
        height: s.size,
        transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`,
        animation: 'sparkle-pop 0.8s ease-out forwards',
      }}
      className="bg-yellow-300 shadow rounded-sm"
    />
  ))}
</div>

<style jsx global>{`
  @keyframes sparkle-pop {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6) rotate(0deg); }
    10% { opacity: 1; }
    100% { opacity: 0; transform: translate(-50%, -90%) scale(1.7) rotate(180deg); }
  }
`}</style>

    </header>
  );
}

// ローディング中のフォールバック
function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
            <ClipboardList className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-slate-800 hidden sm:inline-block">
            クリニック日報
          </span>
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded animate-pulse"></div>
      </div>
    </header>
  );
}

// エクスポートするコンポーネント（Suspenseでラップ）
export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}
