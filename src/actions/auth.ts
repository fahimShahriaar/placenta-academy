"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginAction(formData: FormData) {
    try {
        await signIn("credentials", {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            redirectTo: "/admin",
        });
    } catch (error: any) {
        if (error?.type === "CredentialsSignin") {
            return { error: "Invalid email or password." };
        }
        throw error;
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/admin/login" });
}
