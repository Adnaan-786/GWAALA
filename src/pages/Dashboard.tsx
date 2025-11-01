import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload, History, Save, ArrowLeft, Ruler, ShoppingCart, DollarSign, Pill, Stethoscope, Package } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ResultsDisplay from "@/components/ResultsDisplay";
import AnalysisHistory from "@/components/AnalysisHistory";
import { BuyCattle } from "@/components/BuyCattle";
import { SellCattle } from "@/components/SellCattle";
import { MedicineStore } from "@/components/MedicineStore";
import { Veterinarians } from "@/components/Veterinarians";
import { MyOrders } from "@/components/MyOrders";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

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
  const [activeTab, setActiveTab] = useState("phenotyping");
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
    <BackgroundGradientAnimation
      gradientBackgroundStart="rgb(108, 0, 162)"
      gradientBackgroundEnd="rgb(0, 17, 82)"
      firstColor="138, 43, 226"
      secondColor="255, 20, 147"
      thirdColor="0, 191, 255"
      fourthColor="50, 205, 50"
      fifthColor="255, 165, 0"
      interactive={true}
      containerClassName="fixed inset-0"
    >
      <div className="min-h-screen relative z-10">
        {/* Header */}
        <header className="bg-card/50 backdrop-blur-sm shadow-soft border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent animate-pulse">
                🐄 AI PASHU SEVA
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                National Digital Livestock Mission
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="phenotyping" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <Ruler className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Phenotype</span>
            </TabsTrigger>
            <TabsTrigger value="buy" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Buy</span>
            </TabsTrigger>
            <TabsTrigger value="sell" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Sell</span>
            </TabsTrigger>
            <TabsTrigger value="medicine" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <Pill className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Medicine</span>
            </TabsTrigger>
            <TabsTrigger value="vets" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <Stethoscope className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Vets</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2">
              <Package className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phenotyping" className="space-y-6">
            <Tabs defaultValue="upload" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="buy">
            <BuyCattle />
          </TabsContent>

          <TabsContent value="sell">
            <SellCattle />
          </TabsContent>

          <TabsContent value="medicine">
            <MedicineStore />
          </TabsContent>

          <TabsContent value="vets">
            <Veterinarians />
          </TabsContent>

          <TabsContent value="orders">
            <MyOrders />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </BackgroundGradientAnimation>
  );
}