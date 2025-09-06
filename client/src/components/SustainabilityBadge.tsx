import { Badge } from "@/components/ui/badge";
import { Leaf, Award } from "lucide-react";

interface SustainabilityBadgeProps {
  certified: boolean;
  ecoScore: string;
  className?: string;
  "data-testid"?: string;
}

export default function SustainabilityBadge({ 
  certified, 
  ecoScore,
  className = "",
  "data-testid": testId
}: SustainabilityBadgeProps) {
  if (certified) {
    return (
      <Badge 
        className={`sustainability-badge text-white text-xs ${className}`}
        data-testid={testId || "badge-certified"}
      >
        <Award className="w-3 h-3 mr-1" />
        ♻️ Certified
      </Badge>
    );
  }

  // Show eco score badge for non-certified items
  const getScoreColor = (score: string) => {
    const grade = score.charAt(0);
    switch (grade) {
      case 'A':
        return 'bg-primary text-primary-foreground';
      case 'B':
        return 'bg-accent text-accent-foreground';
      case 'C':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge 
      className={`${getScoreColor(ecoScore)} text-xs ${className}`}
      data-testid={testId || "badge-eco-score"}
    >
      <Leaf className="w-3 h-3 mr-1" />
      {ecoScore} Eco
    </Badge>
  );
}
