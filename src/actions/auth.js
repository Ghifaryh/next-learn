"use server"

import { getCollection } from "@/lib/db"
import { RegisterFormSchema } from "@/lib/rules"
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
  if (!userCollection) return {
    errors: {
      email: "Something went wrong",
    }
  }

  const existingUser = await userCollection.findOne({ email })
  if (existingUser) return {
    errors: {
      email: "Email already registered",
    }
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Save in the DB
  const results = await userCollection.insertOne({ email, password: hashedPassword })

  // Create a session

  redirect("/dashboard")
}