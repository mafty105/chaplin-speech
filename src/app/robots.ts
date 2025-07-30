import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://charlie-talk.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/session/*/print', // Prevent crawling print pages if you add them later
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}