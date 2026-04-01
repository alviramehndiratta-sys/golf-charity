import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetFeaturedCharities } from "@workspace/api-client-react";
import { Trophy, Heart, Star, ArrowRight, Users, Coins, Target } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  const { data: featured } = useGetFeaturedCharities();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(45 90% 50%) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(153 60% 40%) 0%, transparent 50%)"
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp}>
              <Badge className="bg-accent text-accent-foreground mb-6 px-4 py-1.5 text-sm font-semibold">
                Golf + Charity + Prizes
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-primary-foreground leading-tight mb-6">
              Play golf. Win prizes. Change lives.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-primary-foreground/80 mb-10 leading-relaxed max-w-2xl">
              GolfGives is the subscription platform that turns your Stableford scores into lottery tickets — and a portion of every subscription goes directly to the charities you love.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8 gap-2" data-testid="button-hero-cta">
                  Start Playing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/draws">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base px-8">
                  See How It Works
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How it works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to join a community doing good through golf
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                step: "1",
                title: "Subscribe and choose your charity",
                desc: "Pick a monthly or yearly plan. Choose the charity your subscription will support — minimum 10% goes directly to them.",
              },
              {
                icon: <Target className="w-8 h-8" />,
                step: "2",
                title: "Enter your Stableford scores",
                desc: "Log up to 5 golf scores (1–45 Stableford). Your latest scores become your monthly draw entries — no extra tickets needed.",
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                step: "3",
                title: "Win prizes every month",
                desc: "Each month we draw 5 numbers. Match 3, 4, or all 5 of your scores to win your tier of the prize pool. Jackpot rolls over!",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="border-border hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      <span className="font-serif text-4xl font-bold text-accent">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Prize Tiers */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-4xl font-bold mb-4">
              Three tiers. One jackpot.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every subscription contributes to the prize pool. Match more scores, win a bigger share.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              { tier: "5 Matches", label: "Jackpot", pct: "40%", color: "border-accent bg-accent/5", icon: "🏆", desc: "Match all 5 drawn numbers. Rolls over if no winner." },
              { tier: "4 Matches", label: "Big Win", pct: "35%", color: "border-primary/30 bg-primary/5", icon: "🥈", desc: "Match exactly 4 of the 5 drawn numbers." },
              { tier: "3 Matches", label: "Winner", pct: "25%", color: "border-muted-foreground/20 bg-muted-foreground/5", icon: "🥉", desc: "Match any 3 of the 5 drawn numbers." },
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className={`border-2 ${tier.color} h-full`}>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">{tier.icon}</div>
                    <div className="font-serif text-5xl font-bold text-accent mb-2">{tier.pct}</div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{tier.tier}</div>
                    <div className="font-semibold text-lg mb-3">{tier.label}</div>
                    <p className="text-muted-foreground text-sm">{tier.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Charities */}
      {featured && featured.length > 0 && (
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-4xl font-bold mb-4">
                Charities we support
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every subscriber chooses where their contribution goes. These are our featured partners.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {featured.slice(0, 3).map((charity, i) => (
                <motion.div key={charity.id} variants={fadeUp}>
                  <Link href={`/charities/${charity.id}`}>
                    <Card className="border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" data-testid={`card-charity-${charity.id}`}>
                      {charity.imageUrl && (
                        <div className="h-40 overflow-hidden rounded-t-lg">
                          <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3 text-xs">{charity.category}</Badge>
                        <h3 className="font-semibold text-lg mb-2">{charity.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{charity.description}</p>
                        {charity.totalContributions > 0 && (
                          <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                            <Heart className="w-4 h-4" />
                            £{Number(charity.totalContributions).toFixed(0)} raised
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center">
              <Link href="/charities">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Charities
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing CTA */}
      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ready to play?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Join hundreds of golfers who are winning prizes and funding charities they love.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[
              { plan: "Monthly", price: "£9.99", period: "/month", popular: false, desc: "Pay month-to-month, cancel anytime." },
              { plan: "Yearly", price: "£99", period: "/year", popular: true, desc: "Save £20.88 per year vs monthly." },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className={`border-2 ${plan.popular ? "border-accent bg-accent/5" : "border-primary-foreground/20 bg-primary-foreground/5"}`}>
                  <CardContent className="p-8 text-center">
                    {plan.popular && <Badge className="bg-accent text-accent-foreground mb-4">Best Value</Badge>}
                    <div className="font-semibold text-primary-foreground/80 mb-2">{plan.plan}</div>
                    <div className="font-serif text-5xl font-bold text-primary-foreground mb-1">{plan.price}</div>
                    <div className="text-primary-foreground/60 text-sm mb-4">{plan.period}</div>
                    <p className="text-primary-foreground/70 text-sm mb-6">{plan.desc}</p>
                    <Link href="/register">
                      <Button className={plan.popular ? "bg-accent text-accent-foreground w-full hover:bg-accent/90" : "bg-primary-foreground text-primary w-full hover:bg-primary-foreground/90"} data-testid={`button-plan-${plan.plan.toLowerCase()}`}>
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
