"use client"
import '@/app/globals.css';
import Loading from '@/components/ui/loading'
import {useState, useEffect} from 'react'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
        setIsLoading(false);
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Zi-Draw</title>
        <link rel='icon' href='/next.svg' />
      </head>
      <body>
        {isLoading ? <Loading/> : children}
      </body>
    </html>
  );
}