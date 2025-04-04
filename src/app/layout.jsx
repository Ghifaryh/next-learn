import Link from "next/link"
import "./globals.css"
import { Poppins } from "next/font/google" // from nextjs documentation.

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["200", "400", "700"],
})

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={poppins.className}>
				<header>
					<nav>
						<Link href="/" className="nav-link">
							Home
						</Link>
						<div className="">
							<Link href="/dashboard" className="nav-link">
								Dashboard
							</Link>
							<Link href="/register" className="nav-link">
								Register
							</Link>
						</div>
					</nav>
				</header>
				<main>{children}</main>
				<footer>Footer</footer>
			</body>
		</html>
	)
}
