import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { History, Eye, Trash2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Analysis {
  id: string;
  animal_id: string;
  animal_type: string;
  image_url: string;
  analysis_date: string;
  status: string;
  overall_score: number;
  height_at_withers: number;
  body_length: number;
  rump_angle: number;
  confidence_score: number;
}

interface AnalysisHistoryProps {
  onViewAnalysis: (analysis: Analysis) => void;
}

export default function AnalysisHistory({ onViewAnalysis }: AnalysisHistoryProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('animal_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: "Error",
        description: "Failed to load analysis history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('animal_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      toast({
        title: "Success",
        description: "Analysis deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: "Error",
        description: "Failed to delete analysis",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Analysis History ({analyses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analyses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analyses yet. Upload your first animal image to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <img
                    src={analysis.image_url}
                    alt={`${analysis.animal_type} analysis`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {analysis.animal_id} ({analysis.animal_type})
                    </h3>
                    <Badge variant={getStatusColor(analysis.status)}>
                      {analysis.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(analysis.analysis_date), { addSuffix: true })}
                    </div>
                    {analysis.overall_score && (
                      <div className={`font-medium ${getScoreColor(analysis.overall_score)}`}>
                        Score: {analysis.overall_score}%
                      </div>
                    )}
                  </div>
                  
                  {analysis.status === 'completed' && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {analysis.height_at_withers && (
                        <span>Height: {analysis.height_at_withers}cm</span>
                      )}
                      {analysis.body_length && (
                        <span>Length: {analysis.body_length}cm</span>
                      )}
                      {analysis.rump_angle && (
                        <span>Angle: {analysis.rump_angle}°</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewAnalysis(analysis)}
                    disabled={analysis.status !== 'completed'}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAnalysis(analysis.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}