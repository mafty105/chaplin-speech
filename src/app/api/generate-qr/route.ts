import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

interface RequestBody {
  url: string
}

interface QRResponse {
  qrCode: string
}

export async function POST(request: NextRequest): Promise<NextResponse<QRResponse | { error: string }>> {
  try {
    const body = await request.json() as RequestBody
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URLが必要です' },
        { status: 400 }
      )
    }

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#172B4D',
        light: '#FFFFFF'
      }
    })

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json(
      { error: 'QRコードの生成に失敗しました' },
      { status: 500 }
    )
  }
}