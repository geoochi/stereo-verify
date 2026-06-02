import { NextResponse } from 'next/server'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import { join } from 'path'
import * as jose from 'jose'

// Register font
try {
  const fontPath = join(process.cwd(), 'public/msyh.ttf')
  GlobalFonts.registerFromPath(fontPath, 'myfont')
} catch (e) {
  console.warn('Font registration failed, using default font:', e)
}

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}
const secret = jose.base64url.decode(JWT_SECRET)

function getRandomValidCode(): string {
  const validChars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
  const charLength = validChars.length
  let code = ''
  const validLength = 4
  for (let i = 0; i < validLength; i++) {
    let char = validChars.charAt(Math.floor(Math.random() * charLength))
    while (code.indexOf(char) !== -1) {
      char = validChars.charAt(Math.floor(Math.random() * charLength))
    }
    code += char
  }
  return code
}

function getRandom(x: number): number {
  if (x <= 0) {
    return 0
  } else {
    return Math.floor(Math.random() * x)
  }
}

function getCanvasSirds(text: string) {
  const WIDTH = 992
  const HEIGHT = 279
  const FONT = 200

  const canvas_grayscale = createCanvas(WIDTH, HEIGHT)
  const context_grayscale = canvas_grayscale.getContext('2d')
  context_grayscale.clearRect(0, 0, canvas_grayscale.width, canvas_grayscale.height)
  context_grayscale.font = FONT + 'px myfont'
  const text_width = context_grayscale.measureText(text).width
  context_grayscale.fillText(text, (WIDTH - text_width) / 2, HEIGHT / 2 + FONT / 2.7)

  const canvas_sirds = createCanvas(WIDTH, HEIGHT)
  const context_sirds = canvas_sirds.getContext('2d')
  context_sirds.clearRect(0, 0, canvas_sirds.width, canvas_sirds.height)

  const stereo_cycles = 5
  const alpha = 3
  const pattern_width = Math.floor(WIDTH / stereo_cycles)

  for (let i = 0; i < WIDTH; i++) {
    for (let j = 0; j < HEIGHT; j++) {
      const style = getRandom(3) !== 0 ? '#FFFFFF' : '#000000'
      context_sirds.fillStyle = style
      context_sirds.fillRect(i, j, 1, 1)
    }
  }

  const canvas_pattern = createCanvas(pattern_width, HEIGHT)
  const context_pattern = canvas_pattern.getContext('2d')
  const pattern = context_pattern.getImageData(0, 0, pattern_width, HEIGHT)
  const pixel_displace = Math.floor(pattern_width / 20)

  for (let c = 0; c < stereo_cycles; c++) {
    const disparity = context_grayscale.getImageData(
      c * pattern_width + Math.floor(pattern_width / 2),
      0,
      pattern_width,
      HEIGHT
    )
    const pattern_sirds = context_sirds.getImageData(
      c * pattern_width,
      0,
      pattern_width,
      HEIGHT
    )

    for (let i = 0; i < 4 * disparity.data.length; i++) {
      pattern.data[i] = pattern_sirds.data[i]
    }

    for (let i = 0; i < disparity.data.length; i++) {
      pattern.data[i * 4 + alpha] = disparity.data[i * 4 + alpha] === 0 ? 255 : 0
    }

    context_pattern.putImageData(pattern, 0, 0)
    context_sirds.drawImage(canvas_pattern, (c + 1) * pattern_width - pixel_displace * 0, 0)

    for (let i = 0; i < disparity.data.length; i++) {
      pattern.data[i * 4 + alpha] = disparity.data[i * 4 + alpha] === 0 ? 0 : 255
    }

    context_pattern.putImageData(pattern, 0, 0)
    context_sirds.drawImage(canvas_pattern, (c + 1) * pattern_width - pixel_displace, 0)
  }

  return canvas_sirds
}

export async function GET() {
  try {
    const code = getRandomValidCode()
    const canvas_sirds = getCanvasSirds(code)
    const dataURL = canvas_sirds.toDataURL()

    const token = await new jose.EncryptJWT({ code })
      .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
      .setExpirationTime('1m')
      .encrypt(secret)

    return NextResponse.json({ token, dataURL })
  } catch (error) {
    console.error('Error generating captcha:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
