import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload, History, Save, ArrowLeft } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ResultsDisplay from "@/components/ResultsDisplay";
import AnalysisHistory from "@/components/AnalysisHistory";

interface AnalysisResult {
  keypoints: Record<string, any>;
  metrics: {
    heightAtWithers: number | null;
    bodyLength: number | null;
    rumpAngle: number | null;
  };
  overallScore: number;
  confidence: number;
  processingTime: number;
  imageWidth: number;
  imageHeight: number;
}

export default function Dashboard() {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentAnimalType, setCurrentAnimalType] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleImageUploaded = async (imageUrl: string, animalType: string) => {
    setCurrentImageUrl(imageUrl);
    setCurrentAnimalType(animalType);
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-animal', {
        body: { imageUrl, animalType }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw new Error(error.message || 'Analysis failed');
      }

      setAnalysisResult(data);
      setActiveTab("results");
      
      toast({
        title: "Analysis Complete",
        description: "Animal anatomy has been successfully analyzed!",
      });
      
    } catch (error) {
      console.error('Error during analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !currentImageUrl || !currentAnimalType) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const animalId = `${currentAnimalType.toUpperCase()}-${Date.now()}`;

      const { error } = await supabase
        .from('animal_analyses')
        .insert([{
          user_id: user.id,
          animal_id: animalId,
          animal_type: currentAnimalType as any,
          image_url: currentImageUrl,
          status: 'completed',
          keypoints: analysisResult.keypoints,
          height_at_withers: analysisResult.metrics.heightAtWithers,
          body_length: analysisResult.metrics.bodyLength,
          rump_angle: analysisResult.metrics.rumpAngle,
          overall_score: analysisResult.overallScore,
          confidence_score: analysisResult.confidence,
          processing_time_ms: analysisResult.processingTime,
        }]);

      if (error) throw error;

      toast({
        title: "Analysis Saved",
        description: `Analysis record ${animalId} has been saved successfully!`,
      });
      
      setActiveTab("history");
      
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save analysis",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewAnalysis = (analysis: any) => {
    const result: AnalysisResult = {
      keypoints: analysis.keypoints,
      metrics: {
        heightAtWithers: analysis.height_at_withers,
        bodyLength: analysis.body_length,
        rumpAngle: analysis.rump_angle,
      },
      overallScore: analysis.overall_score,
      confidence: analysis.confidence_score,
      processingTime: analysis.processing_time_ms || 0,
      imageWidth: 800, // Default values since not stored
      imageHeight: 600,
    };
    
    setAnalysisResult(result);
    setCurrentImageUrl(analysis.image_url);
    setCurrentAnimalType(analysis.animal_type);
    setActiveTab("results");
  };

  const resetAnalysis = () => {
    setCurrentImageUrl(null);
    setCurrentAnimalType("");
    setAnalysisResult(null);
    setActiveTab("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-white shadow-soft border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Animal Analysis System
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-powered anatomical analysis platform
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>
              Results
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="text-center">
                    Upload Animal Image for Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    onImageUploaded={handleImageUploaded}
                    loading={analyzing}
                  />
                </CardContent>
              </Card>

              {analyzing && (
                <Card className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                      <div className="text-center">
                        <h3 className="font-medium">Analyzing Animal Anatomy</h3>
                        <p className="text-sm text-muted-foreground">
                          AI is processing your image and detecting anatomical landmarks...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {analysisResult && currentImageUrl && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={resetAnalysis}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    New Analysis
                  </Button>
                  <Button onClick={handleSaveAnalysis} disabled={saving}>
                    {saving ? (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-pulse" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Analysis
                      </>
                    )}
                  </Button>
                </div>
                
                <ResultsDisplay
                  result={analysisResult}
                  imageUrl={currentImageUrl}
                  animalType={currentAnimalType}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <AnalysisHistory onViewAnalysis={handleViewAnalysis} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}