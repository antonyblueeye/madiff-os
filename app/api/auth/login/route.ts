import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body || {};

        if (username === "admin" && password === "madiff2026") {
            const response = NextResponse.json({
                success: true,
                user: {
                    username: "admin",
                    name: "Anton Synieokyi",
                    role: "Super Admin",
                    avatarInitials: "AS",
                },
                message: "Authentication successful",
            });

            // Set secure auth cookie
            response.cookies.set("madiff_auth_token", "authenticated_session_madiff2026", {
                httpOnly: false, // Accessible to client-side auth context
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return response;
        }

        return NextResponse.json(
            { error: "Invalid credentials. Use login: admin / password: madiff2026" },
            { status: 401 }
        );
    } catch (err: any) {
        return NextResponse.json(
            { error: "Login failed", message: err.message },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete("madiff_auth_token");
    return response;
}
