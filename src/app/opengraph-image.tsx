import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Charlie Talk - チャップリン方式スピーチ練習'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: '#FAFBFC',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="8" r="3" fill="#0052CC" />
            <path d="M16 14c0-2.21-1.79-4-4-4s-4 1.79-4 4v5h8v-5z" fill="#0052CC" />
            <path d="M12 11.5c.28 0 .5.22.5.5v1.5h1c.28 0 .5.22.5.5s-.22.5-.5.5h-1v1h1c.28 0 .5.22.5.5s-.22.5-.5.5h-1v1.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V16h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1v-1h-1c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h1V12c0-.28.22-.5.5-.5z" fill="white" />
            <circle cx="6" cy="6" r="2" fill="#0052CC" />
            <path d="M6 8.5c-1.38 0-2.5 1.12-2.5 2.5v3h5v-3c0-1.38-1.12-2.5-2.5-2.5z" fill="#0052CC" />
            <circle cx="18" cy="6" r="2" fill="#0052CC" />
            <path d="M18 8.5c-1.38 0-2.5 1.12-2.5 2.5v3h5v-3c0-1.38-1.12-2.5-2.5-2.5z" fill="#0052CC" />
          </svg>
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: '#172B4D',
            }}
          >
            Charlie Talk
          </div>
        </div>
        <div
          style={{
            fontSize: 36,
            color: '#172B4D',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          チャップリン方式スピーチ練習
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#6B778C',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          あがり症克服・雑談力向上・会話力アップに効果的
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}