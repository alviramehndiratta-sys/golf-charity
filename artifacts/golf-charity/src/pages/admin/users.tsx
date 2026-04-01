import { useState } from "react";
import { motion } from "framer-motion";
import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Link } from "lucide-react";
import { format } from "date-fns";
import { Link as WouterLink } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data: users, isLoading } = useListUsers({ search });

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <WouterLink href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to admin
          </WouterLink>

          <div className="flex items-center justify-between mb-6">
            <h1 className="font-serif text-3xl font-bold">User Management</h1>
            <Badge variant="outline">{users?.length ?? 0} users</Badge>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
            </div>
          ) : users && users.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left p-4 font-semibold">Name</th>
                        <th className="text-left p-4 font-semibold">Email</th>
                        <th className="text-left p-4 font-semibold">Role</th>
                        <th className="text-left p-4 font-semibold">Subscription</th>
                        <th className="text-left p-4 font-semibold">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors" data-testid={`row-user-${user.id}`}>
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-muted-foreground">{user.email}</td>
                          <td className="p-4">
                            <Badge variant={user.role === "admin" ? "default" : "outline"} className="capitalize">{user.role}</Badge>
                          </td>
                          <td className="p-4">
                            {user.subscription ? (
                              <Badge
                                className={user.subscription.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}
                              >
                                {user.subscription.status} — {user.subscription.plan}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">None</span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">{format(new Date(user.createdAt), "dd MMM yyyy")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No users found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
