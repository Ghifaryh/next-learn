"use server"

import { getCollection } from "@/lib/db"
import getAuthUser from "@/lib/getAuthUser"
import { BlogPostSchema } from "@/lib/rules"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPost(state, formData) {
	// Check if user is logged in
	const user = await getAuthUser()
	if (!user) return redirect("/login")

	// Validate form fields
	const title = formData.get("title")
	const content = formData.get("content")

	const validatedFields = BlogPostSchema.safeParse({
		title,
		content,
	})

	// If any form fields are invalid
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			title, // keeping the values in the form
			content, // keeping the values in the form
		}
	}

	// Save the post to the database
	try {
		const postsCollection = await getCollection("posts")
		const post = {
			title: validatedFields.data.title,
			content: validatedFields.data.content,
			userId: ObjectId.createFromHexString(user.userId), // mongodb
		}
		await postsCollection.insertOne(post)
	} catch (error) {
		return {
			error: { title: error.message },
		}
	}

	redirect("/dashboard")
}

export async function updatePost(state, formData) {
	// Check if user is logged in
	const user = await getAuthUser()
	if (!user) return redirect("/login")

	// Validate form fields
	const title = formData.get("title")
	const content = formData.get("content")
	const postId = formData.get("postId")

	const validatedFields = BlogPostSchema.safeParse({
		title,
		content,
	})

	// If any form fields are invalid
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			title, // keeping the values in the form
			content, // keeping the values in the form
		}
	}

	// Find the post to update
	const postsCollection = await getCollection("posts")
	const post = await postsCollection.findOne({
		_id: ObjectId.createFromHexString(postId),
	})

	// check if the user owns the post
	if (user.userId !== post.userId.toString()) return redirect("/")

	// Update the post to the database
	postsCollection.findOneAndUpdate(
		{
			_id: post._id,
		},
		{
			$set: {
				title: validatedFields.data.title,
				content: validatedFields.data.content,
			},
		}
	)

	redirect("/dashboard")
}

export async function deletePost(formData) {
	// Check if user is logged in
	const user = await getAuthUser()
	if (!user) return redirect("/login")

	// Find the post to delete
	const postsCollection = await getCollection("posts")
	const post = await postsCollection.findOne({
		_id: ObjectId.createFromHexString(formData.get("postId")),
	})

	// check if the user owns the post
	if (user.userId !== post.userId.toString()) return redirect("/")

	// Delete the post from the database
	postsCollection.findOneAndDelete({
		_id: post._id,
	})

	revalidatePath("/dashboard") // instead of redirecting to dashboard use revalidatePath
	// its purging the cache and revalidating the data
}
