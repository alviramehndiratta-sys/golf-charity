import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Trophy } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: FormData) {
    loginMutation.mutate({ data }, {
      onSuccess: (res) => {
        login(res.user as any, res.token);
        setLocation(res.user.role === "admin" ? "/admin" : "/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Login failed", description: err.message, variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 30% 60%, hsl(45 90% 50%) 0%, transparent 50%)"
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-serif font-bold text-2xl text-primary-foreground">
            <Trophy className="w-7 h-7 text-accent" />
            GolfGives
          </Link>
          <p className="text-primary-foreground/60 mt-2 text-sm">Welcome back</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your details to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" data-testid="input-email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" data-testid="input-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-submit">
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Join GolfGives
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
