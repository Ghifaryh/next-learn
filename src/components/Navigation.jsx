import NavLink from "./NavLink"

export default function Navigation() {
	return (
		<nav>
			<NavLink label="Home" href="/" />
			<div>
				<NavLink label="Dashboard" href="/dashboard" />
				<NavLink label="Register" href="/register" />
			</div>
		</nav>
	)
}
