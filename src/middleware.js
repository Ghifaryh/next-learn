import { NextResponse } from "next/server"
import getAuthUser from "./lib/getAuthUser"

const protectedRoutes = ["/dashboard", "/posts/create"] // you cant add dynamic route in here
const publicRoutes = ["/login", "/register"]

export default async function middleware(req) {
	const path = req.nextUrl.pathname

	const isProtected =
		protectedRoutes.includes(path) || path.startsWith("/posts/edit/") // for dynamic route
	const isPublic = publicRoutes.includes(path)

	const user = await getAuthUser()
	const userId = user?.userId

	if (isProtected && !userId) {
		return NextResponse.redirect(new URL("/login", req.nextUrl))
	}

	if (isPublic && userId) {
		return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
	}

	return NextResponse.next()
}

export const config = {
	// to exclude or include the path
	// matcher: [
	// 	"/dashboard",
	// 	"/posts/create",
	// 	"/posts/:path*",
	// 	// "/((?!api|_next/static|_next/image|favicon.ico)|sitemap.xml|robots.txt).*)",
	// ],
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
}

// now what is the difference between using protectedRoutes and using config matcher

// why above matcher is not working and the below is working
