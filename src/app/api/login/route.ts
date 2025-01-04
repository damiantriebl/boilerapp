// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { login } from "@/actions/login";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    // Llamamos a la lógica de autenticación
    const loginResult = await login(payload);

    // Creamos la respuesta base
    const statusCode = loginResult && 'code' in loginResult ? loginResult.code : 200;
    const res = NextResponse.json(loginResult, { status: statusCode });

    // Si vino un token en loginResult, seteamos cookie
    if (loginResult && 'data' in loginResult && loginResult.data.token) {
      res.cookies.set("credentials-session", loginResult.data.token, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1 día
      });
    }

    return res;
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 500, message: "Internal Server Error" },
      },
      { status: 500 }
    );
  }
}
