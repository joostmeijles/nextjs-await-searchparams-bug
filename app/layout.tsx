import Link from 'next/link';
import { ReactNode } from 'react';

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Link href="/overview">Overview</Link>
        {children}
      </body>
    </html>
  );
}
