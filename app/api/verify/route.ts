import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set')
}
const secret = jose.base64url.decode(JWT_SECRET)

export async function POST(request: NextRequest) {
  try {
    const { token, code } = await request.json()

    if (!token || !code) {
      return NextResponse.json(
        { error: 'Token and code are required' },
        { status: 400 }
      )
    }

    try {
      const { payload } = await jose.jwtDecrypt(token, secret)
      if (payload.code === code) {
        return NextResponse.json({ success: true, message: 'Verification successful' })
      } else {
        return NextResponse.json(
          { success: false, error: 'Incorrect verification code' },
          { status: 400 }
        )
      }
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : 'Unknown error'
      return NextResponse.json(
        { success: false, error: errorName },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
