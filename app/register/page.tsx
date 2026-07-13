"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ROUTES } from "@/constants";
import { syncGuestDataOnLogin } from "@/hooks/use-guest-commerce";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        const details = json.error?.details;
        if (details) {
          const firstError = Object.values(details).flat()[0];
          throw new Error(typeof firstError === "string" ? firstError : json.error?.message ?? "Something went wrong");
        }
        throw new Error(json.error?.message ?? "Something went wrong");
      }
      await syncGuestDataOnLogin();
      toast.success("Compte créé avec succès");
      router.push(ROUTES.account);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Firsname</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Lastname</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              <p className="mt-1 text-xs text-zinc-500">
                Min. 8 characters, 1 majuscule, 1 minuscule, 1 number and 1 special character (!@#$...)
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création..." : "S'inscrire"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
           Already have and account ?{" "}
            <Link href={ROUTES.login} className="font-medium hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
