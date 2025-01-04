// app/api/two-factor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { twoFactor } from "@/actions/two-factor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body.payload => lo que vayas a pasarle al twoFactorSchema
    // body.credentials => { email, password } según tu loginSchema
    const result = await twoFactor(body.payload, body.credentials);

    // Armamos la respuesta
    const statusCode = 'error' in result! ? result.error.code : result?.code || 200;
    const res = NextResponse.json(result, { status: statusCode });

    // Si salió bien y necesitas borrar la cookie, hazlo aquí:
    if (result && result.success) {
      res.cookies.delete("credentials-session");
    }
    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 500, message: "Internal Server Error" } },
      { status: 500 }
    );
  }
}
