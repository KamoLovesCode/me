"use client"


import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'


export default function ChatSheet() {
  const pathname = usePathname();
  if (pathname === '/chat') return null;
  return (
    <Link
      href="/chat"
      className="fixed bottom-4 right-4 z-[100] bg-primary p-3 rounded-full text-primary-foreground shadow-lg hover:bg-primary/90 focus:outline-none md:bottom-6 md:right-6"
      style={{ pointerEvents: 'auto' }}
    >
      <MessageCircle size={24} />
    </Link>
  );
}
