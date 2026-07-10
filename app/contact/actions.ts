"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name || !email || !message) {
      return { success: false, error: "All fields are required." };
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        message,
        read_status: false,
      });

    if (error) {
      console.error("Error inserting contact message:", error);
      return { success: false, error: "Failed to send message. Please try again later." };
    }

    revalidatePath("/admin");
    return { success: true, error: null };
  } catch (error) {
    console.error("Unexpected error submitting contact message:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
