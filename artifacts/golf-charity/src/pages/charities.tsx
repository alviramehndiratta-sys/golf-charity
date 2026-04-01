import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListCharities } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Search } from "lucide-react";

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const CATEGORIES = ["All", "Health", "Education", "Environment", "Sports", "Community", "Children", "General"];

export default function CharitiesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { data: charities, isLoading } = useListCharities({ search, category: category === "All" ? undefined : category });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Partner Charities</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every subscription supports a charity you choose. Browse our partners and discover the causes that matter to you.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search charities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-charities"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : charities && charities.length > 0 ? (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities.map((charity) => (
                <motion.div key={charity.id} variants={fadeUp}>
                  <Link href={`/charities/${charity.id}`}>
                    <Card className="border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full" data-testid={`card-charity-${charity.id}`}>
                      {charity.imageUrl ? (
                        <div className="h-44 overflow-hidden rounded-t-lg">
                          <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-44 bg-primary/10 rounded-t-lg flex items-center justify-center">
                          <Heart className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <Badge variant="outline" className="mb-3 text-xs capitalize">{charity.category}</Badge>
                        {charity.featured && <Badge className="ml-2 mb-3 text-xs bg-accent text-accent-foreground">Featured</Badge>}
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{charity.name}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{charity.description}</p>
                        {charity.totalContributions > 0 && (
                          <div className="flex items-center gap-1 text-primary text-sm font-medium">
                            <Heart className="w-4 h-4" />
                            £{Number(charity.totalContributions).toLocaleString()} raised
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No charities found</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
