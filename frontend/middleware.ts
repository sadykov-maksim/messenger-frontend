import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // const hostname = request.headers.get('host') || ''
    // const subdomain = hostname.split('.')[0]
    //
    // const url = request.nextUrl.clone()
    //
    // if (subdomain === 'messenger') {
    //     url.pathname = `/messenger${url.pathname}`
    //     return NextResponse.rewrite(url)
    // }

    return NextResponse.next()
}



// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/((?!_next|api|favicon.ico).*)'],
}