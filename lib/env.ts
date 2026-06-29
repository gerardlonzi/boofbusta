import { z } from "zod";

const emptyToUndefined = (val: unknown) =>
  val === "" || val === undefined ? undefined : val;

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.preprocess(emptyToUndefined, z.string().min(32).optional()),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  STRIPE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_PUBLISHABLE_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),

  CLOUDINARY_CLOUD_NAME: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CLOUDINARY_API_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),

  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().email().optional()),

  TAX_RATE: z.coerce.number().min(0).max(1).default(0.2),
  SHIPPING_FLAT_RATE: z.coerce.number().min(0).default(5.99),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().min(0).default(100),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export const env = parseEnv();

export const isStripeEnabled = () =>
  Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);

export const isCloudinaryEnabled = () =>
  Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
  );

export const isEmailEnabled = () =>
  Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
