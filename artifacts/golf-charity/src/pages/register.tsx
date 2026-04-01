import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister, useListCharities } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth-context";
import { Trophy } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  charityId: z.string().optional(),
  charityPercent: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const { data: charities } = useListCharities();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", charityId: "", charityPercent: "10" },
  });

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      charityId: data.charityId ? parseInt(data.charityId) : undefined,
      charityPercent: data.charityPercent ? parseInt(data.charityPercent) : undefined,
    };

    registerMutation.mutate({ data: payload }, {
      onSuccess: (res) => {
        login(res.user as any, res.token);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Registration failed", description: err.message, variant: "destructive" });
      },
    });
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 70% 30%, hsl(45 90% 50%) 0%, transparent 50%)"
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
          <p className="text-primary-foreground/60 mt-2 text-sm">Join the community</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Create your account</CardTitle>
            <CardDescription>Start playing, winning, and giving today</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

                {charities && charities.length > 0 && (
                  <>
                    <FormField
                      control={form.control}
                      name="charityId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose a charity (optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-charity">
                                <SelectValue placeholder="Select a charity to support" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {charities.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="charityPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contribution % (min 10%)</FormLabel>
                          <FormControl>
                            <Input type="number" min={10} max={100} data-testid="input-charity-percent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="button-submit">
                  {registerMutation.isPending ? "Creating account..." : "Join GolfGives"}
                </Button>
              </form>
            </Form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
