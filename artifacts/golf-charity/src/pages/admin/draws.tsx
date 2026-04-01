import { useState } from "react";
import { motion } from "framer-motion";
import { useListDraws, useCreateDraw, useSimulateDraw, usePublishDraw, getListDrawsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Play, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminDrawsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: draws } = useListDraws();
  const createDrawMutation = useCreateDraw();
  const simulateMutation = useSimulateDraw();
  const publishMutation = usePublishDraw();

  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [algorithm, setAlgorithm] = useState("random");
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeDraw, setActiveDraw] = useState<number | null>(null);

  function invalidateDraws() {
    queryClient.invalidateQueries({ queryKey: getListDrawsQueryKey() });
  }

  function handleCreate() {
    createDrawMutation.mutate({ data: { month: parseInt(month), year: parseInt(year), algorithm, jackpotRollover: 0 } }, {
      onSuccess: (draw) => {
        invalidateDraws();
        setActiveDraw(draw.id);
        toast({ title: `Draw created for ${month}/${year}` });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  function handleSimulate(drawId: number) {
    simulateMutation.mutate({ id: drawId }, {
      onSuccess: (result) => {
        setSimulationResult(result);
        invalidateDraws();
        toast({ title: "Simulation complete" });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  function handlePublish(drawId: number) {
    publishMutation.mutate({ id: drawId }, {
      onSuccess: () => {
        invalidateDraws();
        setSimulationResult(null);
        toast({ title: "Draw published successfully!" });
      },
      onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/admin" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to admin
          </Link>

          <h1 className="font-serif text-3xl font-bold mb-8">Draw Management</h1>

          <Card className="mb-8">
            <CardHeader><CardTitle>Create New Draw</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>Month</Label>
                  <Input type="number" min={1} max={12} value={month} onChange={e => setMonth(e.target.value)} data-testid="input-draw-month" />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input type="number" min={2024} value={year} onChange={e => setYear(e.target.value)} data-testid="input-draw-year" />
                </div>
                <div>
                  <Label>Algorithm</Label>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger data-testid="select-algorithm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="weighted">Weighted by Score Frequency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createDrawMutation.isPending} data-testid="button-create-draw">
                {createDrawMutation.isPending ? "Creating..." : "Create Draw"}
              </Button>
            </CardContent>
          </Card>

          {simulationResult && (
            <Card className="mb-8 border-accent/30 bg-accent/5">
              <CardHeader><CardTitle>Simulation Results</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Drawn Numbers</p>
                  <div className="flex gap-2">
                    {simulationResult.drawnNumbers.map((n: number, i: number) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  {[5, 4, 3].map(tier => {
                    const w = simulationResult[`tier${tier}Winners`] ?? [];
                    return (
                      <div key={tier} className="bg-muted rounded-lg p-3">
                        <p className="font-semibold mb-1">{tier}-Match ({tier === 5 ? "40%" : tier === 4 ? "35%" : "25%"})</p>
                        {w.length === 0 ? <p className="text-muted-foreground text-xs">No winners</p> : w.map((winner: any, i: number) => (
                          <p key={i} className="text-xs">{winner.userName} — £{Number(winner.prizeAmount).toFixed(2)}</p>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground mt-3">Prize pool: £{Number(simulationResult.prizePool).toFixed(2)}</p>
                {activeDraw && (
                  <Button className="mt-4" onClick={() => handlePublish(activeDraw)} disabled={publishMutation.isPending} data-testid="button-publish-draw">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {publishMutation.isPending ? "Publishing..." : "Publish Final Draw"}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {draws && draws.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-bold mb-4">All Draws</h2>
              <div className="space-y-3">
                {draws.map((draw) => (
                  <Card key={draw.id} data-testid={`card-draw-${draw.id}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{draw.month}/{draw.year} — {draw.algorithm} algorithm</p>
                        <p className="text-xs text-muted-foreground">Pool: £{Number(draw.prizePool).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={draw.status === "published" ? "border-green-300 text-green-700" : draw.status === "simulated" ? "border-yellow-300 text-yellow-700" : ""}
                        >
                          {draw.status}
                        </Badge>
                        {draw.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => { setActiveDraw(draw.id); handleSimulate(draw.id); }} disabled={simulateMutation.isPending} data-testid={`button-simulate-${draw.id}`}>
                            <Play className="w-4 h-4 mr-1" />
                            Simulate
                          </Button>
                        )}
                        {draw.status === "simulated" && (
                          <Button size="sm" onClick={() => { setActiveDraw(draw.id); handlePublish(draw.id); }} disabled={publishMutation.isPending} data-testid={`button-publish-${draw.id}`}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
