"use server"; // Si usas Server Actions en otro lado

import { signIn } from "@/auth";
import { loginSchema } from "@/schemas";
import { z } from "zod";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/services/user";
import { generateTwoFactorToken } from "@/services/two-factor-token";
import { sendTwoFactorEmail } from "@/services/mail";
import {
  getTwoFactorConfirmationByUserId,
  deleteTwoFactorConfirmationById,
} from "@/services/two-factor-confirmation";
import { isExpired, response, signJwt } from "@/lib/utils";
import { verifyPassword } from "@/lib/passwordHash";

// == Mantén signInCredentials tal cual ==
export const signInCredentials = async (email: string, password: string) => {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return response({
            success: false,
            error: {
              code: 401,
              message: "Invalid credentials.",
            },
          });

        case "OAuthAccountNotLinked":
          return response({
            success: false,
            error: {
              code: 403,
              message:
                "Another account already registered with the same Email Address. Please login the different one.",
            },
          });

        case "Verification":
          return response({
            success: false,
            error: {
              code: 422,
              message: "Verification failed. Please try again.",
            },
          });
      
        default:
          return response({
            success: false,
            error: {
              code: 500,
              message: "Something went wrong.",
            },
          });
      }
    }

    throw error;
  }
};

// == Ajusta login para que DEVUELVA el token en lugar de setear la cookie directamente ==
export const login = async (payload: z.infer<typeof loginSchema>) => {
  const validatedFields = loginSchema.safeParse(payload);
  if (!validatedFields.success) {
    return response({
      success: false,
      error: {
        code: 422,
        message: "Invalid fields.",
      },
    });
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return response({
      success: false,
      error: {
        code: 401,
        message: "Invalid credentials.",
      },
    });
  }

  const isPasswordMatch = await verifyPassword(password, existingUser.password);
  if (!isPasswordMatch) {
    return response({
      success: false,
      error: {
        code: 401,
        message: "Invalid credentials.",
      },
    });
  }

  if (!existingUser.emailVerified) {
    return response({
      success: false,
      error: {
        code: 401,
        message: "Your email address is not verified yet. Please check your email.",
      },
    });
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    const existingTwoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
    const hasExpired = isExpired(existingTwoFactorConfirmation?.expires!);

    if (existingTwoFactorConfirmation && hasExpired) {
      await deleteTwoFactorConfirmationById(existingTwoFactorConfirmation.id);
    }

    if (!existingTwoFactorConfirmation || hasExpired) {
      // Genera el token, pero NO lo seteamos aquí
      const token = signJwt(validatedFields.data);

      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorEmail(twoFactorToken.email, twoFactorToken.token);

      return response({
        success: true,
        code: 200,
        message: "Please confirm your two-factor authentication code.",
        data: {
          token, // <-- Devolvemos el token para que el route handler sepa que escribir
        }
      });
    }
  }

  // Si no hay 2FA, next-auth credentials
  return await signInCredentials(email, password);
};
