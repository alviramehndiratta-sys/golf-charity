import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetFeaturedCharities } from "@workspace/api-client-react";
import { Trophy, Heart, ArrowRight, Users, ClipboardList, Ticket } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const { data: featured } = useGetFeaturedCharities();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
            <motion.div variants={fadeUp}>
              <Badge className="bg-accent text-white mb-6 px-3 py-1 text-xs font-medium tracking-wide uppercase">
                Monthly Draw · Charity-backed
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
              Your Stableford score<br className="hidden sm:block" /> is your lottery ticket.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-white/75 mb-10 leading-relaxed max-w-xl">
              GolfGives lets you enter a monthly prize draw using the scores you're already submitting. Subscribe, pick a charity to support, and you're in — no extra effort required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 text-sm font-semibold px-7 gap-2" data-testid="button-hero-cta">
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 text-white hover:bg-white/10 text-sm font-medium px-7"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary/[0.06] border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { value: "₹999/mo", label: "to enter every month" },
              { value: "10%+", label: "of each sub to charity" },
              { value: "Monthly", label: "prize draw" },
            ].map((stat, i) => (
              <div key={i} className="py-6 px-4 text-center">
                <div className="text-xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-foreground mb-3">
              How it works
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base max-w-xl">
              It takes about two minutes to set up, and after that your round does the work.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-5 h-5" />,
                step: "01",
                title: "Subscribe and pick your charity",
                desc: "Choose a monthly or yearly plan. During sign-up, select a partner charity — at least 10% of your subscription goes directly to them every month.",
              },
              {
                icon: <ClipboardList className="w-5 h-5" />,
                step: "02",
                title: "Log your Stableford scores",
                desc: "After each round, add your score to your dashboard (1–45 Stableford). You can keep up to five scores on file — your most recent ones become your draw entries.",
              },
              {
                icon: <Ticket className="w-5 h-5" />,
                step: "03",
                title: "We draw five numbers each month",
                desc: "Match 3, 4, or all 5 of your scores to the drawn numbers and you win a share of that month's prize pool. The jackpot rolls over if no one hits all five.",
              },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="border-border h-full">
                  <CardContent className="p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                      <span className="text-xs font-mono font-semibold text-muted-foreground">{item.step}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
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
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-3">
              Prize tiers
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground text-base max-w-xl">
              Every subscription contributes to the pool. The more scores you match, the bigger your cut.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-5">
            {[
              { tier: "5 matches", label: "Jackpot", pct: "40%", highlight: true, desc: "All five drawn numbers match your logged scores. Rolls over to next month if no winner." },
              { tier: "4 matches", label: "Second prize", pct: "35%", highlight: false, desc: "Four of the five drawn numbers appear in your submitted scores." },
              { tier: "3 matches", label: "Third prize", pct: "25%", highlight: false, desc: "Three of the five match. Split equally among all three-match winners that month." },
            ].map((tier, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className={`h-full border ${tier.highlight ? "border-accent/40 bg-accent/[0.04]" : "border-border"}`}>
                  <CardContent className="p-7">
                    <div className="text-3xl font-bold text-accent mb-1">{tier.pct}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1 font-medium">{tier.tier}</div>
                    <div className="font-semibold text-base mb-3">{tier.label}</div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tier.desc}</p>
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
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14">
              <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-3">
                Partner charities
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-base max-w-xl">
                When you sign up, you choose one of these organisations to receive a share of your subscription each month.
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {featured.slice(0, 3).map((charity, i) => (
                <motion.div key={charity.id} variants={fadeUp}>
                  <Link href={`/charities/${charity.id}`}>
                    <Card className="border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full" data-testid={`card-charity-${charity.id}`}>
                      {charity.imageUrl && (
                        <div className="h-36 overflow-hidden rounded-t-md">
                          <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <Badge variant="outline" className="mb-3 text-xs">{charity.category}</Badge>
                        <h3 className="font-semibold text-base mb-1.5">{charity.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{charity.description}</p>
                        {charity.totalContributions > 0 && (
                          <div className="mt-4 flex items-center gap-1.5 text-primary text-xs font-medium">
                            <Heart className="w-3.5 h-3.5" />
                            £{Number(charity.totalContributions).toFixed(0)} raised via GolfGives
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <div>
              <Link href="/charities">
                <Button variant="outline" size="sm" className="gap-2">
                  View all charities
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      <section className="py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-3">
              Pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-base max-w-xl">
              One flat subscription. No entry fees on top, no catches. Cancel any time.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-5 max-w-2xl">
            {[
              { plan: "Monthly", price: "₹999", period: "per month", popular: false, desc: "Good for trying it out. No commitment beyond the month." },
              { plan: "Yearly", price: "₹9,999", period: "per year", popular: true, desc: "Two months free compared to monthly. Locks in your charity contribution for the year." },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className={`border ${plan.popular ? "border-accent/50 bg-white/[0.08]" : "border-white/15 bg-white/[0.04]"}`}>
                  <CardContent className="p-7">
                    {plan.popular && (
                      <Badge className="bg-accent text-white mb-4 text-xs font-medium">Best value</Badge>
                    )}
                    <div className="text-sm font-medium text-white/70 mb-1">{plan.plan}</div>
                    <div className="text-4xl font-bold text-white mb-1">{plan.price}</div>
                    <div className="text-white/50 text-xs mb-4">{plan.period}</div>
                    <p className="text-white/65 text-sm mb-6 leading-relaxed">{plan.desc}</p>
                    <Link href="/register">
                      <Button
                        className={plan.popular
                          ? "bg-accent text-white w-full hover:bg-accent/90 text-sm font-semibold"
                          : "bg-white text-primary w-full hover:bg-white/90 text-sm font-semibold"}
                        data-testid={`button-plan-${plan.plan.toLowerCase()}`}
                      >
                        Get started
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
