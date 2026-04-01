import { motion } from "framer-motion";
import { useListWinners, useVerifyWinner, useMarkWinnerPaid, getListWinnersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, DollarSign, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function AdminWinnersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: winners, isLoading } = useListWinners();
  const verifyMutation = useVerifyWinner();
  const markPaidMutation = useMarkWinnerPaid();
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  function invalidate() { queryClient.invalidateQueries({ queryKey: getListWinnersQueryKey() }); }

  function handleVerify(id: number, approved: boolean) {
    verifyMutation.mutate({ id, data: { approved, adminNote: adminNotes[id] ?? null } }, {
      onSuccess: () => { invalidate(); toast({ title: approved ? "Winner approved" : "Winner rejected" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }

  function handleMarkPaid(id: number) {
    markPaidMutation.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Marked as paid" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    });
  }

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to admin
          </Link>

          <h1 className="font-serif text-3xl font-bold mb-8">Winner Management</h1>

          {isLoading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : winners && winners.length > 0 ? (
            <div className="space-y-4">
              {winners.map((winner) => (
                <Card key={winner.id} className="border-border" data-testid={`card-winner-${winner.id}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">{winner.userName}</span>
                          <span className="text-muted-foreground text-sm">{winner.userEmail}</span>
                          <Badge className={statusColor[winner.status] ?? ""}>{winner.status}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Draw {winner.drawMonth}/{winner.drawYear} — {winner.matchTier}-match winner — <span className="font-semibold text-foreground">£{Number(winner.prizeAmount).toFixed(2)}</span>
                        </div>
                        {winner.proofUrl ? (
                          <a href={winner.proofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline" data-testid={`link-proof-${winner.id}`}>
                            View proof document
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">No proof uploaded yet</span>
                        )}
                        {winner.adminNote && (
                          <p className="text-xs text-muted-foreground mt-1">Note: {winner.adminNote}</p>
                        )}
                      </div>

                      {winner.status === "pending" && winner.proofUrl && (
                        <div className="flex flex-col gap-2 min-w-48">
                          <Input
                            placeholder="Admin note (optional)"
                            value={adminNotes[winner.id] ?? ""}
                            onChange={e => setAdminNotes({ ...adminNotes, [winner.id]: e.target.value })}
                            className="text-sm"
                            data-testid={`input-admin-note-${winner.id}`}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1" onClick={() => handleVerify(winner.id, true)} disabled={verifyMutation.isPending} data-testid={`button-approve-${winner.id}`}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleVerify(winner.id, false)} disabled={verifyMutation.isPending} data-testid={`button-reject-${winner.id}`}>
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {winner.status === "approved" && (
                        <Button size="sm" onClick={() => handleMarkPaid(winner.id)} disabled={markPaidMutation.isPending} data-testid={`button-mark-paid-${winner.id}`}>
                          <DollarSign className="w-4 h-4 mr-1" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No winners yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
