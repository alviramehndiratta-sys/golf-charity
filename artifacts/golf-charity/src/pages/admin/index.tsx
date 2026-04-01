import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetAnalytics, useGetPrizePool } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trophy, Heart, Coins, ArrowRight, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function AdminPage() {
  const { data: analytics } = useGetAnalytics();
  const { data: prizePool } = useGetPrizePool();

  const chartData = analytics ? [
    { name: "Total Users", value: analytics.totalUsers },
    { name: "Active Subs", value: analytics.activeSubscribers },
    { name: "Total Draws", value: analytics.totalDraws },
    { name: "Winners", value: analytics.totalWinners },
    { name: "Pending Payouts", value: analytics.pendingPayouts },
  ] : [];

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and management</p>
          </motion.div>

          {analytics && (
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: analytics.totalUsers, icon: <Users className="w-5 h-5" />, color: "text-blue-600" },
                { label: "Active Subscribers", value: analytics.activeSubscribers, icon: <Trophy className="w-5 h-5" />, color: "text-green-600" },
                { label: "Monthly Revenue", value: `£${Number(analytics.monthlyRevenue).toFixed(2)}`, icon: <Coins className="w-5 h-5" />, color: "text-accent" },
                { label: "Pending Payouts", value: analytics.pendingPayouts, icon: <AlertCircle className="w-5 h-5" />, color: "text-red-600" },
              ].map((stat, i) => (
                <Card key={i} data-testid={`card-stat-${stat.label.toLowerCase().replace(/ /g, "-")}`}>
                  <CardContent className="p-5">
                    <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                    <div className="font-serif text-2xl font-bold">{stat.value}</div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {analytics && (
              <motion.div variants={fadeUp} className="lg:col-span-2">
                <Card>
                  <CardHeader><CardTitle>Platform Overview</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(153, 60%, 20%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {prizePool && (
              <motion.div variants={fadeUp}>
                <Card className="border-accent/30 bg-accent/5">
                  <CardHeader><CardTitle>Prize Pool</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Current Pool</span>
                      <span className="font-bold text-accent">£{Number(prizePool.currentPool).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Jackpot Rollover</span>
                      <span className="font-medium">£{Number(prizePool.jackpotRollover).toFixed(2)}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">5-Match (40%)</span>
                      <span className="font-medium">£{Number(prizePool.tier5Prize).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">4-Match (35%)</span>
                      <span className="font-medium">£{Number(prizePool.tier4Prize).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">3-Match (25%)</span>
                      <span className="font-medium">£{Number(prizePool.tier3Prize).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground text-sm">Active Subscribers</span>
                      <span className="font-medium">{prizePool.activeSubscribers}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <motion.div variants={fadeUp} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Manage Users", desc: "View and edit user accounts", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
              { title: "Prize Draws", desc: "Run and publish monthly draws", href: "/admin/draws", icon: <Trophy className="w-5 h-5" /> },
              { title: "Charities", desc: "Add and manage charity partners", href: "/admin/charities", icon: <Heart className="w-5 h-5" /> },
              { title: "Winners", desc: "Verify and process payouts", href: "/admin/winners", icon: <Coins className="w-5 h-5" /> },
            ].map((item, i) => (
              <Link key={i} href={item.href}>
                <Card className="border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" data-testid={`card-admin-nav-${item.title.toLowerCase().replace(/ /g, "-")}`}>
                  <CardContent className="p-5">
                    <div className="text-primary mb-3">{item.icon}</div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs">{item.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
