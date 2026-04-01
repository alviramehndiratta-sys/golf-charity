import { useState } from "react";
import { motion } from "framer-motion";
import { useListCharities, useCreateCharity, useUpdateCharity, useDeleteCharity, getListCharitiesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminCharitiesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: charities, isLoading } = useListCharities();
  const createMutation = useCreateCharity();
  const updateMutation = useUpdateCharity();
  const deleteMutation = useDeleteCharity();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", description: "", category: "General", imageUrl: "", websiteUrl: "", featured: false });

  function invalidate() { queryClient.invalidateQueries({ queryKey: getListCharitiesQueryKey() }); }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", category: "General", imageUrl: "", websiteUrl: "", featured: false });
    setOpen(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    setForm({ name: c.name, description: c.description, category: c.category, imageUrl: c.imageUrl ?? "", websiteUrl: c.websiteUrl ?? "", featured: c.featured });
    setOpen(true);
  }

  function handleSubmit() {
    const payload = { ...form, imageUrl: form.imageUrl || undefined, websiteUrl: form.websiteUrl || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Charity updated" }); },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => { invalidate(); setOpen(false); toast({ title: "Charity created" }); },
        onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
      });
    }
  }

  function handleDelete(id: number) {
    deleteMutation.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Charity deleted" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
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

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-serif text-3xl font-bold">Charity Management</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} data-testid="button-add-charity">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Charity" : "Add Charity"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="input-charity-name" /></div>
                  <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} data-testid="input-charity-description" /></div>
                  <div><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} data-testid="input-charity-category" /></div>
                  <div><Label>Image URL (optional)</Label><Input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} /></div>
                  <div><Label>Website URL (optional)</Label><Input value={form.websiteUrl} onChange={e => setForm({ ...form, websiteUrl: e.target.value })} /></div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.featured} onCheckedChange={v => setForm({ ...form, featured: v })} data-testid="switch-featured" />
                    <Label>Featured on homepage</Label>
                  </div>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="w-full" data-testid="button-save-charity">
                    {editing ? "Save Changes" : "Create Charity"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {charities?.map((charity) => (
                <Card key={charity.id} data-testid={`card-charity-${charity.id}`}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{charity.name}</span>
                        {charity.featured && <Badge className="text-xs bg-accent text-accent-foreground">Featured</Badge>}
                        <Badge variant="outline" className="text-xs">{charity.category}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-1">{charity.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(charity)} data-testid={`button-edit-charity-${charity.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(charity.id)} data-testid={`button-delete-charity-${charity.id}`}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
