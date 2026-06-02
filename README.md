# Stereo Verify - Next.js Version

A captcha demonstration based on Stereograms, converted to Next.js for Vercel deployment.

## 🚀 Local Development

1. **Install dependencies**

   ```bash
   pnpm i
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and set the JWT secret key:

   ```
   JWT_SECRET=your-strong-secret-key-here
   ```

3. **Start the development server**

   ```bash
   pnpm dev
   ```

4. **Access the page**

   - Captcha verification page: `http://localhost:3000`

## 📡 API Documentation

### `GET /api/generate`

Generate captcha image and encrypted token.

**Response Example**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "dataURL": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### `POST /api/verify`

Verify the user's input captcha code.

**Request Body**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "A3B7"
}
```

## 🚀 Deploy to Vercel

1. Push this `next` directory to a GitHub repository

2. Go to [Vercel](https://vercel.com) and create a new project

3. Import your GitHub repository

4. Configure environment variables:
   - `JWT_SECRET`: Your strong secret key (at least 32 characters)

5. Deploy!

## 📁 Project Structure

```
next/
├── app/
│   ├── api/
│   │   ├── generate/route.ts    # Generate captcha API
│   │   └── verify/route.ts      # Verify captcha API
│   ├── page.tsx                 # Main page
│   └── layout.tsx               # Layout component
├── public/
│   ├── github.png               # GitHub logo
│   └── msyh.ttf                 # Font file
├── .env.example                 # Environment variables template
├── vercel.json                  # Vercel configuration
└── package.json
```

## 🔧 Technical Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Generation**: @napi-rs/canvas
- **Security**: jose (JWT encryption)

## 📝 Notes

- The font file `msyh.ttf` is required for captcha text rendering
- JWT tokens expire after 1 minute for security
- Captcha codes exclude confusing characters (0/O/1/I/L)
