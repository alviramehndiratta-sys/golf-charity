import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetCharity } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, ArrowLeft } from "lucide-react";

export default function CharityDetailPage() {
  const [, params] = useRoute("/charities/:id");
  const id = parseInt(params?.id ?? "0");
  const { data: charity, isLoading } = useGetCharity(id, { query: { enabled: !!id } });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-64 bg-muted rounded-xl animate-pulse mb-6" />
          <div className="h-8 bg-muted rounded animate-pulse mb-4 w-1/2" />
          <div className="h-4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (!charity) return <div className="min-h-screen flex items-center justify-center">Charity not found.</div>;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/charities" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to charities
          </Link>

          {charity.imageUrl && (
            <div className="h-64 lg:h-80 overflow-hidden rounded-xl mb-8">
              <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-start gap-3 mb-4">
            <Badge variant="outline" className="capitalize">{charity.category}</Badge>
            {charity.featured && <Badge className="bg-accent text-accent-foreground">Featured Partner</Badge>}
          </div>

          <h1 className="font-serif text-4xl font-bold mb-4" data-testid="text-charity-name">{charity.name}</h1>

          <div className="flex flex-wrap gap-6 mb-8">
            {charity.totalContributions > 0 && (
              <div className="flex items-center gap-2 text-primary">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">£{Number(charity.totalContributions).toLocaleString()} raised by members</span>
              </div>
            )}
            {charity.websiteUrl && (
              <a href={charity.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="w-5 h-5" />
                <span>{charity.websiteUrl}</span>
              </a>
            )}
          </div>

          <div className="prose prose-lg max-w-none mb-10">
            <p className="text-muted-foreground leading-relaxed text-lg">{charity.description}</p>
          </div>

          <div className="bg-muted rounded-xl p-8 text-center">
            <h3 className="font-serif text-2xl font-bold mb-3">Support {charity.name}</h3>
            <p className="text-muted-foreground mb-6">Join GolfGives and choose this charity as your beneficiary. A portion of your subscription goes directly to them every month.</p>
            <Link href="/register">
              <Button size="lg" className="gap-2">
                <Heart className="w-5 h-5" />
                Subscribe and Support
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
