import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export const runtime = 'nodejs'

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ip = searchParams.get('ip') || ''
  const name = searchParams.get('name') || ip
  const port = searchParams.get('port') || '3389'
  const username = searchParams.get('username') || ''

  if (!ip || !IP_REGEX.test(ip)) {
    return NextResponse.json({ error: 'Valid IP address required' }, { status: 400 })
  }

  const rdpContent = [
    'screen mode id:i:2',
    'use multimon:i:0',
    'desktopwidth:i:1920',
    'desktopheight:i:1080',
    'session bpp:i:32',
    'winposstr:s:0,1,0,0,800,600',
    'compression:i:1',
    'keyboardhook:i:2',
    'audiocapturemode:i:0',
    'videoplaybackmode:i:1',
    'connection type:i:7',
    'networkautodetect:i:1',
    'bandwidthautodetect:i:1',
    'displayconnectionbar:i:1',
    'enableworkspacereconnect:i:0',
    'disable wallpaper:i:0',
    'allow font smoothing:i:1',
    'allow desktop composition:i:1',
    'disable full window drag:i:0',
    'disable menu anims:i:0',
    'disable themes:i:0',
    'disable cursor setting:i:0',
    'bitmapcachepersistenable:i:1',
    `full address:s:${ip}:${port}`,
    `username:s:${username}`,
    'authentication level:i:2',
    'prompt for credentials:i:1',
    'negotiate security layer:i:1',
    'remoteapplicationmode:i:0',
    'alternate shell:s:',
    'shell working directory:s:',
    'gatewayhostname:s:',
    'gatewayusagemethod:i:4',
    'gatewaycredentialssource:i:4',
    'gatewayprofileusagemethod:i:0',
    'promptcredentialonce:i:0',
    'gatewaybrokeringtype:i:0',
    'use redirection server name:i:0',
    'rdgiskdcproxy:i:0',
    'kdcproxyname:s:',
  ].join('\r\n')

  const safeName = name.replace(/[^a-zA-Z0-9_\-. ]/g, '_')

  return new NextResponse(rdpContent, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeName}.rdp"`,
    },
  })
}
