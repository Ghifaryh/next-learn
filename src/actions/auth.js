"use server"

import { getCollection } from "@/lib/db"
import { LoginFormSchema, RegisterFormSchema } from "@/lib/rules"
import { createSession } from "@/lib/sessions"
import bcrypt from "bcrypt"
import { redirect } from "next/navigation"

export async function register(state, formData) {
	// await new Promise((resolve) => setTimeout(resolve, 3000))

	// Validate the form fields
	const validatedFields = RegisterFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	})

	// If forms are invalid
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			email: formData.get("email"),
		}
	}

	// Extract the form fields
	const { email, password } = validatedFields.data

	// Check if the email is already registered
	const userCollection = await getCollection("users")
	if (!userCollection)
		return {
			errors: {
				email: "Something went wrong",
			},
		}

	const existingUser = await userCollection.findOne({ email })
	if (existingUser)
		return {
			errors: {
				email: "Email already registered",
			},
		}

	// Hash the password
	const hashedPassword = await bcrypt.hash(password, 10)

	// Save in the DB
	const results = await userCollection.insertOne({
		email,
		password: hashedPassword,
	})

	// Create a session
	await createSession(results.insertedId.toString())

	// Redirect to the dashboard
	redirect("/dashboard")
}

export async function login(state, formData) {
	// Validate the form fields
	const validatedFields = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	})

	// If any form fields are invalid
	if (!validatedFields.success) {
		return {
			errors: validatedFields.error.flatten().fieldErrors,
			email: formData.get("email"),
		}
	}

	// Extract the form fields
	const { email, password } = validatedFields.data

	// Check if the email is exist
	const userCollection = await getCollection("users")
	if (!userCollection) return { errors: { email: "Something went wrong" } }

	const existingUser = await userCollection.findOne({ email })
	if (!existingUser) return { errors: { email: "Invalid credentials" } }

	// check the password
	const matchedPassword = await bcrypt.compare(
		password,
		existingUser.password
	)
	if (!matchedPassword) return { errors: { email: "Invalid credentials" } }

	// Create a session
	await createSession(existingUser._id.toString())

	// Redirect
	redirect("/dashboard")
}
