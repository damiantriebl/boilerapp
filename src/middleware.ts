import { authConfig } from "@/auth/config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from "./routes";

export const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Para omitir la validación en rutas API
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Rutas de login/register/etc.
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    // Si NO estás loggeado, dejamos pasar
    return NextResponse.next();
  }

  // Si no está loggeado y no es pública => forzar login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // En cualquier otro caso, continuar normalmente
  return NextResponse.next();
});

// Opcionalmente, ajustar matcher
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
