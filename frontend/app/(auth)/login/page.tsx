"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { LayoutDashboard, Lock, User, Loader2, UserPlus, CheckSquare, Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Esquemas de validación
const loginSchema = z.object({
  nickname: z.string().min(1, "El nickname es requerido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = z.object({
  nickname: z.string().min(3, "El nickname debe tener al menos 3 caracteres").max(20),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Formulario de Login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nickname: "", password: "" },
  });

  // Formulario de Registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nickname: "", password: "", confirmPassword: "" },
  });

  /**
   * MUTATION: Iniciar sesión del usuario
   */
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      const { access_token, user } = data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success(`¡Bienvenido de nuevo, ${user.nickname}!`);
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    },
  });

  /**
   * MUTATION: Registrar un nuevo usuario
   */
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      return api.post("/auth/register", {
        nickname: data.nickname,
        password: data.password,
      });
    },
    onSuccess: () => {
      toast.success("¡Registro exitoso! Ahora puedes iniciar sesión.");
      registerForm.reset();
      setActiveTab("login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al registrarse");
    },
  });

  /**
   * HANDLER: Manejar el envío del formulario de login
   */
  async function onLogin(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  /**
   * HANDLER: Manejar el envío del formulario de registro
   */
  async function onRegister(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <CardHeader className="space-y-1 text-center bg-white dark:bg-zinc-900 border-b pb-6">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <LayoutDashboard className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            SIM - Sistema de Tareas
          </CardTitle>
          <CardDescription>
            Gestiona tus proyectos de forma eficiente
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Formulario de LOGIN */}
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(onLogin)}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-nickname">Usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-nickname"
                      placeholder="Tu nickname"
                      className="pl-10"
                      {...loginForm.register("nickname")}
                    />
                  </div>
                  {loginForm.formState.errors.nickname && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.nickname.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Entrar al sistema
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* Formulario de REGISTRO */}
          <TabsContent value="register">
            <form onSubmit={registerForm.handleSubmit(onRegister)}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="reg-nickname">Nickname</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-nickname"
                      placeholder="Crea un usuario"
                      className="pl-10"
                      {...registerForm.register("nickname")}
                    />
                  </div>
                  {registerForm.formState.errors.nickname && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.nickname.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 pr-10"
                      {...registerForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm">Confirmar Contraseña</Label>
                  <div className="relative">
                    <CheckSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-confirm"
                      type={showRegConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      className="pl-10 pr-10"
                      {...registerForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="secondary" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Crear cuenta gratuita
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

