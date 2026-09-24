// app/manifest.ts — Progressive Web App (PWA) Manifest
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Troly — Hệ thống Quản lý Phòng trọ Thông minh',
    short_name: 'Troly',
    description: 'Nền tảng quản lý phòng trọ, căn hộ mini và chốt điện nước dành riêng cho chủ nhà Việt Nam',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
