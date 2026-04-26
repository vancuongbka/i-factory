'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPathname = useRef(pathname);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    setActive(true);
    setWidth(15);
    tickRef.current = setInterval(() => {
      setWidth((w) => {
        if (w >= 80) {
          clearInterval(tickRef.current!);
          return 80;
        }
        return w + Math.random() * 12;
      });
    }, 350);
  }

  function finish() {
    if (tickRef.current) clearInterval(tickRef.current);
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 350);
  }

  // Detect any internal link click → start bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
      const dest = href.split('?')[0];
      if (dest === pathname) return;
      start();
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Pathname changed → navigation complete → finish bar
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      finish();
    }
    return () => {
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      role="progressbar"
      className="pointer-events-none fixed left-0 top-0 z-[200] h-[3px] transition-[width] duration-300 ease-out"
      style={{
        width: `${width}%`,
        background: 'hsl(var(--primary))',
        boxShadow: '0 0 10px 1px hsl(var(--primary) / 0.5)',
      }}
    />
  );
}
