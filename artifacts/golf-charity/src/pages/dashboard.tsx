import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/lib/auth-context";
import {
  useGetMySubscription, getGetMySubscriptionQueryKey,
  useListMyScores, getListMyScoresQueryKey,
  useGetMyCharitySelection, getGetMyCharitySelectionQueryKey,
  useListCharities,
  useAddScore, useUpdateScore, useDeleteScore,
  useCreateSubscription,
  useSetMyCharitySelection,
  useListWinners,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy, Plus, Trash2, Edit2, Check, X, Heart, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription } = useGetMySubscription();
  const { data: scores } = useListMyScores();
  const { data: myCharity } = useGetMyCharitySelection();
  const { data: charities } = useListCharities();
  const { data: winners } = useListWinners();

  const addScoreMutation = useAddScore();
  const updateScoreMutation = useUpdateScore();
  const deleteScoreMutation = useDeleteScore();
  const createSubMutation = useCreateSubscription();
  const setCharityMutation = useSetMyCharitySelection();

  const [newScore, setNewScore] = useState("");
  const [newScoreDate, setNewScoreDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingScore, setEditingScore] = useState<{ id: number; value: string; date: string } | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<string>("");
  const [charityPercent, setCharityPercent] = useState<number[]>([myCharity?.charityPercent ?? 10]);

  function invalidateScores() {
    queryClient.invalidateQueries({ queryKey: getListMyScoresQueryKey() });
  }

  function handleAddScore() {
    const v = parseInt(newScore);
    if (isNaN(v) || v < 1 || v > 45) {
      toast({ title: "Invalid score", description: "Score must be between 1 and 45", variant: "destructive" });
      return;
    }
    addScoreMutation.mutate({ data: { value: v, scoreDate: new Date(newScoreDate + "T12:00:00Z").toISOString() } }, {
      onSuccess: () => { invalidateScores(); setNewScore(""); toast({ title: "Score added" }); },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  function handleUpdateScore() {
    if (!editingScore) return;
    const v = parseInt(editingScore.value);
    if (isNaN(v) || v < 1 || v > 45) { toast({ title: "Invalid score", variant: "destructive" }); return; }
    updateScoreMutation.mutate({ id: editingScore.id, data: { value: v, scoreDate: new Date(editingScore.date + "T12:00:00Z").toISOString() } }, {
      onSuccess: () => { invalidateScores(); setEditingScore(null); },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  function handleDeleteScore(id: number) {
    deleteScoreMutation.mutate({ id }, {
      onSuccess: () => { invalidateScores(); toast({ title: "Score removed" }); },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  function handleSubscribe(plan: string) {
    createSubMutation.mutate({ data: { plan } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryKey() });
        toast({ title: "Subscription activated!" });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  function handleUpdateCharity() {
    if (!selectedCharity && !myCharity) { toast({ title: "Select a charity first", variant: "destructive" }); return; }
    const id = selectedCharity ? parseInt(selectedCharity) : myCharity!.charityId;
    setCharityMutation.mutate({ data: { charityId: id, charityPercent: charityPercent[0] } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCharitySelectionQueryKey() });
        toast({ title: "Charity selection updated!" });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  const subStatus = subscription?.status ?? "inactive";
  const myWinnings = winners?.filter(w => w.userId === user?.id) ?? [];

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="font-serif text-3xl font-bold">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground mt-1">Manage your scores, subscription, and charity contribution</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Subscription</CardTitle>
                      <Badge
                        className={subStatus === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        data-testid="status-subscription"
                      >
                        {subStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {subscription && subStatus === "active" ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="font-medium capitalize">{subscription.plan}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-medium">£{Number(subscription.amount).toFixed(2)}/{subscription.plan === "monthly" ? "mo" : "yr"}</span>
                        </div>
                        {subscription.renewalDate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Renews</span>
                            <span className="font-medium">{format(new Date(subscription.renewalDate), "dd MMM yyyy")}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground text-sm mb-4">Subscribe to enter the monthly prize draws.</p>
                        <div className="flex gap-3">
                          <Button size="sm" onClick={() => handleSubscribe("monthly")} disabled={createSubMutation.isPending} data-testid="button-subscribe-monthly">
                            Monthly — £9.99
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleSubscribe("yearly")} disabled={createSubMutation.isPending} data-testid="button-subscribe-yearly">
                            Yearly — £99
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Scores */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">My Golf Scores</CardTitle>
                    <CardDescription>Up to 5 Stableford scores (newest first). Adding a 6th removes the oldest.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {scores && scores.length > 0 ? (
                      <div className="space-y-2">
                        {scores.map((score) => (
                          <div key={score.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg" data-testid={`card-score-${score.id}`}>
                            {editingScore?.id === score.id ? (
                              <>
                                <Input
                                  type="number" min={1} max={45} value={editingScore.value}
                                  onChange={e => setEditingScore({ ...editingScore, value: e.target.value })}
                                  className="w-20" data-testid="input-edit-score"
                                />
                                <Input
                                  type="date" value={editingScore.date}
                                  onChange={e => setEditingScore({ ...editingScore, date: e.target.value })}
                                  className="flex-1" data-testid="input-edit-score-date"
                                />
                                <Button size="icon" variant="ghost" onClick={handleUpdateScore}><Check className="w-4 h-4 text-green-600" /></Button>
                                <Button size="icon" variant="ghost" onClick={() => setEditingScore(null)}><X className="w-4 h-4" /></Button>
                              </>
                            ) : (
                              <>
                                <span className="font-serif text-2xl font-bold text-primary w-12 text-center">{score.value}</span>
                                <span className="text-sm text-muted-foreground flex-1 flex items-center gap-1">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  {format(new Date(score.scoreDate), "dd MMM yyyy")}
                                </span>
                                <Button size="icon" variant="ghost" onClick={() => setEditingScore({ id: score.id, value: String(score.value), date: new Date(score.scoreDate).toISOString().split("T")[0] })} data-testid={`button-edit-score-${score.id}`}>
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeleteScore(score.id)} data-testid={`button-delete-score-${score.id}`}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No scores yet. Add your first Stableford score below.</p>
                    )}

                    {(!scores || scores.length < 5) && (
                      <div className="flex gap-2 mt-4">
                        <Input
                          type="number" min={1} max={45} placeholder="Score (1-45)"
                          value={newScore} onChange={e => setNewScore(e.target.value)}
                          className="w-32" data-testid="input-new-score"
                        />
                        <Input
                          type="date" value={newScoreDate}
                          onChange={e => setNewScoreDate(e.target.value)}
                          className="flex-1" data-testid="input-new-score-date"
                        />
                        <Button onClick={handleAddScore} disabled={addScoreMutation.isPending} size="icon" data-testid="button-add-score">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {scores && scores.length >= 5 && (
                      <p className="text-xs text-muted-foreground">You have 5 scores. Edit or delete one to add a new score.</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Charity */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-destructive" />
                      My Charity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {myCharity && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="font-semibold text-sm">{myCharity.charity.name}</p>
                        <p className="text-muted-foreground text-xs">{myCharity.charityPercent}% of subscription</p>
                      </div>
                    )}
                    {charities && (
                      <Select onValueChange={setSelectedCharity} defaultValue={myCharity ? String(myCharity.charityId) : ""}>
                        <SelectTrigger data-testid="select-charity">
                          <SelectValue placeholder="Select charity..." />
                        </SelectTrigger>
                        <SelectContent>
                          {charities.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <div>
                      <Label className="text-sm mb-2 block">Contribution: {charityPercent[0]}%</Label>
                      <Slider
                        min={10} max={100} step={5}
                        value={charityPercent}
                        onValueChange={setCharityPercent}
                        data-testid="slider-charity-percent"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>10% min</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full" onClick={handleUpdateCharity} disabled={setCharityMutation.isPending} data-testid="button-update-charity">
                      Update Charity
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Winnings */}
              <motion.div variants={fadeUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-accent" />
                      My Winnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {myWinnings.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No winnings yet. Keep playing!</p>
                    ) : (
                      <div className="space-y-3">
                        {myWinnings.map((w) => (
                          <div key={w.id} className="flex items-center justify-between p-2 bg-muted rounded-lg" data-testid={`card-winning-${w.id}`}>
                            <div>
                              <p className="text-sm font-medium">{w.drawMonth}/{w.drawYear} Draw</p>
                              <p className="text-xs text-muted-foreground">{w.matchTier}-match winner</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-accent">£{Number(w.prizeAmount).toFixed(2)}</p>
                              <Badge variant="outline" className="text-xs capitalize">{w.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
