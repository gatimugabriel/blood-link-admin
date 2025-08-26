"use server";

import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookies(data: SignInResult) {
    const cookieStore = await cookies();

    // Set refresh token cookie
    cookieStore.set("refreshToken", data.refreshToken, {
        maxAge: SESSION_DURATION,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });

    // Set access token cookie
    cookieStore.set("accessToken", data.accessToken, {
        maxAge: 60 * 20, // 20 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
    });
}

export async function signIn(body: SignInParams): Promise<any> {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Authentication failed",
            };
        }

        // Set cookies using the helper function
        await setSessionCookies(data);

        return {
            success: true,
            message: "Signed in successfully",
        };
    } catch (error: any) {
        console.error("Sign-in error:", error);
        return {
            success: false,
            message: error.message || "Internal Server Error",
        };
    }
}

export async function signUp(body: SignUpParams): Promise<any> {
    try {

        const response = await fetch(`${API_BASE_URL}/admin/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: error.message || 'Authentication failed',
            }
        }

        return {
            success: true,
            message: "Account created successfully. Check email for verification.",
        }
    } catch (error: any) {
        return {
            message: error.message || 'Internal Server Error',
            success: false,
        }
    }
}

// Sign out user by clearing the session cookie
export async function signOut(): Promise<any> {
    try {
        // console.log("sigout clicked");

        const response = await fetch(`${API_BASE_URL}/auth/signout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(body),
            credentials: 'include',
        });

        const data = await response.json();
        console.log("signout data ", data);

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Authentication failed",
            };
        }

        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");

        return NextResponse.redirect("/sign-in", {
            status: 302,
        });
    } catch (error: any) {
        return {
            message: error.message || 'Internal Server Error',
            success: false,
        }
    }
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<any | null> {
    const cookieStore = await cookies();

    const accessTokenCookie = cookieStore.get("accessToken")?.value;
    if (!accessTokenCookie) return null;

    try {
        // Verify token with backend
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessTokenCookie}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            return null;
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.log('Token verification failed:', error);
        return null;
    }
}

// Check if user is authenticated
export async function isAuthenticated() {
    const user = await getCurrentUser();
    return !!user;
}