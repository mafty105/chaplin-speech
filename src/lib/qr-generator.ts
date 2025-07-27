import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCodeDataURL(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#172B4D',  // Atlassian dark text color
      light: '#FFFFFF'
    }
  }

  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      ...defaultOptions,
      ...options,
      errorCorrectionLevel: 'M'
    })
    
    return qrCodeDataURL
  } catch (error) {
    console.error('QR Code generation error:', error)
    throw new Error('QRコードの生成に失敗しました')
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateQRCodeSVG(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#172B4D',
      light: '#FFFFFF'
    }
  }

  try {
    const svgString = await QRCode.toString(text, {
      ...defaultOptions,
      ...options,
      type: 'svg',
      errorCorrectionLevel: 'M'
    })
    
    return svgString
  } catch (error) {
    console.error('QR Code SVG generation error:', error)
    throw new Error('QRコードの生成に失敗しました')
  }
}

/**
 * Create shareable URL for a session
 */
export function createShareableURL(sessionId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4321')
  
  return `${baseUrl}/session/${sessionId}`
}