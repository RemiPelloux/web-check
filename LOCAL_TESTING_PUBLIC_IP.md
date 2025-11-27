# Local Testing with Real Public IP Detection

## The Problem
When you access `localhost:3001` directly:
- Browser → localhost:3001
- Server sees: `::1` (local socket)
- NO public IP headers!

## The Solution: Use ngrok for Local Testing

### 1. Install ngrok
```bash
brew install ngrok
# or download from https://ngrok.com/
```

### 2. Start your server
```bash
yarn dev
```

### 3. Create ngrok tunnel
```bash
ngrok http 3001
```

### 4. Access via ngrok URL
```
Forwarding: https://abc123.ngrok.io -> localhost:3001
```

Now when you access `https://abc123.ngrok.io`:
- Browser → ngrok → localhost:3001
- ngrok adds headers: `x-forwarded-for: 88.185.86.131`
- Server sees your REAL public IP! ✅

## Why This Works

**Direct localhost**:
```
Browser → localhost:3001
Headers: (none)
Server detects: ::1
```

**Through ngrok**:
```
Browser → ngrok.io → localhost:3001
Headers: x-forwarded-for: 88.185.86.131
Server detects: 88.185.86.131 ✅
```

**In production (with nginx/CloudFlare)**:
```
Browser → CloudFlare/nginx → your-server
Headers: x-forwarded-for: 88.185.86.131
Server detects: 88.185.86.131 ✅
```

## Alternative: Skip IP Check in Development

Add a development mode flag:

```javascript
export const getClientIp = (req) => {
  // In development, force use of a test IP
  if (process.env.NODE_ENV === 'development' && process.env.DEV_PUBLIC_IP) {
    console.log('DEV MODE: Using configured public IP');
    return process.env.DEV_PUBLIC_IP;
  }
  
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};
```

Then in `.env`:
```
NODE_ENV=development
DEV_PUBLIC_IP=88.185.86.131
```

But ngrok is the PROPER way to test this!




