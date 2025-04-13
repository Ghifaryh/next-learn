import PostCard from "@/components/postCard"
import { getCollection } from "@/lib/db"
import { Suspense } from "react"

export default async function Home() {
	return (
		//  to prevent too long loading when the db is error
		// <Suspense fallback={<p>Loading...</p>}>
		// <PostsList />
		// </Suspense>
		// either using Suspense or loading.jsx, but not both at the same time

		<PostsList />
	)
}

async function PostsList() {
	const postsCollection = await getCollection("posts")
	const posts = await postsCollection?.find().sort({ $natural: -1 }).toArray() // sort by newest

	if (posts) {
		return (
			<div className="grid grid-cols-2 gap-6">
				{posts.map((post) => (
					<div key={post._id}>
						<PostCard post={post} />
					</div>
				))}
			</div>
		)
	} else {
		return <p>Failed to fetch the data from the db</p>
	}
}
