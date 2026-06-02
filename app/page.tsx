'use client'

import { useState, useCallback, useEffect } from 'react'

export default function Home() {
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const loadImage = useCallback(async () => {
    setLoading(true)
    setError(null)
    setImageUrl(null)
    setCode('')
    setVerifyResult(null)
    setCurrentToken(null)

    try {
      const response = await fetch('/api/generate')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCurrentToken(data.token)
      setImageUrl(data.dataURL)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load image')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadImage()
  }, [loadImage])

  const verifyCode = useCallback(async () => {
    if (!code.trim()) {
      setVerifyResult({ success: false, message: 'Please input valid code' })
      return
    }

    if (!currentToken) {
      setVerifyResult({ success: false, message: 'Please load valid first' })
      return
    }

    setVerifyResult(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: currentToken,
          code: code.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setVerifyResult({ success: true, message: '✓ Success!' })
      } else {
        setVerifyResult({ success: false, message: data.error || 'Failed' })
      }
    } catch (err) {
      setVerifyResult({
        success: false,
        message: err instanceof Error ? err.message : 'Verify error',
      })
    }
  }, [code, currentToken])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        verifyCode()
      }
    },
    [verifyCode],
  )

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <h1 className='text-3xl font-bold mb-8'>Stereo Verify</h1>

      {loading && <div className='mb-4 text-gray-600'>loading...</div>}

      {error && <div className='mb-4 text-red-500'>Error: {error}</div>}

      {imageUrl && (
        <img
          src={imageUrl}
          alt='Captcha'
          className='max-w-full max-h-[50vh] border border-gray-300 mb-6'
        />
      )}

      <div className='flex items-center gap-4 min-w-[300px]'>
        <button
          onClick={loadImage}
          className='px-5 py-2.5 text-base bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
        >
          refresh
        </button>

        <input
          type='text'
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyPress}
          placeholder='valid code'
          maxLength={4}
          className='flex-1 px-3 py-2.5 text-lg text-center border border-gray-300 rounded uppercase'
        />

        <button
          onClick={verifyCode}
          className='px-8 py-2.5 text-base bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer'
        >
          verify
        </button>
      </div>

      {verifyResult && (
        <div
          className={`mt-4 text-lg font-bold ${verifyResult.success ? 'text-green-500' : 'text-red-500'}`}
        >
          {verifyResult.message}
        </div>
      )}

      <a
        href='https://github.com/geoochi/stereo-verify'
        target='_blank'
        rel='noopener noreferrer'
        className='absolute top-4 right-4'
      >
        <img src='/github.png' alt='GitHub' className='w-12 h-12' />
      </a>
    </div>
  )
}
