
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
  isLabel?: boolean;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: Category;
  onCategorySelect: (category: Category) => void;
}

export const CategorySidebar = ({
  categories,
  selectedCategory,
  onCategorySelect
}: CategorySidebarProps) => {
  // Filter out categories with empty or undefined names
  const validCategories = categories.filter(category => 
    category.name && category.name.trim() !== ""
  );
  
  return (
    <Card className="w-64 shrink-0 animate-slide-in-bottom" style={{ animationDelay: "0ms" }}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="font-medium">Categories</div>
          <ScrollArea className="h-[calc(100vh-14rem)]">
            <div className="space-y-1 pr-3">
              {validCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory.id === category.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    category.color && "overflow-hidden relative"
                  )}
                  onClick={() => onCategorySelect(category)}
                >
                  {category.color && (
                    <div 
                      className="w-1 absolute left-0 top-0 bottom-0" 
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
