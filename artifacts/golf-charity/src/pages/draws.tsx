import { motion } from "framer-motion";
import { useListDraws, useGetLatestDraw } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function DrawsPage() {
  const { data: draws } = useListDraws();
  const { data: latestDraw } = useGetLatestDraw();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Prize Draws</h1>
            <p className="text-muted-foreground text-lg">Monthly draws where your golf scores are your lottery tickets.</p>
          </motion.div>

          {latestDraw && (
            <motion.div variants={fadeUp} className="mb-10">
              <Card className="border-2 border-accent bg-accent/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-2xl flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-accent" />
                      Latest Draw — {latestDraw.month}/{latestDraw.year}
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-800">Published</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {latestDraw.drawnNumbers && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Drawn Numbers</p>
                      <div className="flex gap-3 flex-wrap">
                        {JSON.parse(latestDraw.drawnNumbers).map((n: number, i: number) => (
                          <div key={i} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg" data-testid={`text-drawn-number-${i}`}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-3 gap-4">
                    {[5, 4, 3].map(tier => {
                      const tierWinners = latestDraw.results.filter(r => r.matchTier === tier);
                      return (
                        <div key={tier} className="bg-muted rounded-lg p-4">
                          <p className="font-semibold text-sm mb-2">{tier}-Match Winners ({tier === 5 ? "40%" : tier === 4 ? "35%" : "25%"})</p>
                          {tierWinners.length === 0 ? (
                            <p className="text-muted-foreground text-xs">No winners{tier === 5 ? " — jackpot rolls over!" : ""}</p>
                          ) : (
                            tierWinners.map(w => (
                              <div key={w.id} className="text-xs mb-1">
                                <span className="font-medium">{w.userName}</span>
                                <span className="text-muted-foreground"> — £{Number(w.prizeAmount).toFixed(2)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 text-sm text-muted-foreground">
                    Prize pool: <span className="font-medium text-foreground">£{Number(latestDraw.prizePool).toFixed(2)}</span>
                    {Number(latestDraw.jackpotRollover) > 0 && (
                      <> + <span className="font-medium text-accent">£{Number(latestDraw.jackpotRollover).toFixed(2)} jackpot rollover</span></>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {draws && draws.length > 0 && (
            <motion.div variants={fadeUp}>
              <h2 className="font-serif text-2xl font-bold mb-6">Draw History</h2>
              <div className="space-y-3">
                {draws.map((draw) => (
                  <Card key={draw.id} className="border-border" data-testid={`card-draw-${draw.id}`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{draw.month}/{draw.year} Draw</p>
                          {draw.publishedAt && (
                            <p className="text-xs text-muted-foreground">{format(new Date(draw.publishedAt), "dd MMM yyyy")}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">£{Number(draw.prizePool).toFixed(2)} pool</span>
                        <Badge
                          variant="outline"
                          className={draw.status === "published" ? "border-green-300 text-green-700" : draw.status === "simulated" ? "border-yellow-300 text-yellow-700" : ""}
                        >
                          {draw.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {(!draws || draws.length === 0) && !latestDraw && (
            <motion.div variants={fadeUp} className="text-center py-20 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No draws yet</p>
              <p className="text-sm">The first draw will be run by our admin team at the end of the month.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
