import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Ruler, TrendingUp, RotateCcw, Clock, Target } from "lucide-react";

interface KeyPoint {
  x: number;
  y: number;
  confidence: number;
}

interface AnalysisMetrics {
  heightAtWithers: number | null;
  bodyLength: number | null;
  rumpAngle: number | null;
}

interface AnalysisResult {
  keypoints: Record<string, KeyPoint>;
  metrics: AnalysisMetrics;
  overallScore: number;
  confidence: number;
  processingTime: number;
  imageWidth: number;
  imageHeight: number;
}

interface ResultsDisplayProps {
  result: AnalysisResult;
  imageUrl: string;
  animalType: string;
}

export default function ResultsDisplay({ result, imageUrl, animalType }: ResultsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const renderKeypointsOnImage = () => {
    const keypointLabels = {
      withers: "Withers",
      pinBone: "Pin Bone", 
      shoulder: "Shoulder",
      elbow: "Elbow",
      knee: "Knee",
      hock: "Hock",
      fetlock: "Fetlock",
      coronet: "Coronet"
    };

    return (
      <div className="relative inline-block">
        <img
          src={imageUrl}
          alt={`${animalType} analysis`}
          className="max-w-full h-auto rounded-lg"
        />
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox={`0 0 ${result.imageWidth} ${result.imageHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {Object.entries(result.keypoints).map(([key, point], index) => (
            <g key={key}>
              <circle
                cx={point.x}
                cy={point.y}
                r="6"
                fill="hsl(var(--accent))"
                stroke="hsl(var(--accent-foreground))"
                strokeWidth="2"
              />
              <text
                x={point.x + 10}
                y={point.y - 10}
                fill="hsl(var(--accent-foreground))"
                fontSize="12"
                fontWeight="bold"
                className="drop-shadow-lg"
              >
                {keypointLabels[key as keyof typeof keypointLabels]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Image with Keypoints */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Anatomical Analysis - {animalType.charAt(0).toUpperCase() + animalType.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {renderKeypointsOnImage()}
          </div>
        </CardContent>
      </Card>

      {/* Overall Score */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analysis Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                Overall Score: {result.overallScore}%
              </span>
              <Badge variant="secondary" className={getScoreColor(result.overallScore)}>
                {getScoreLabel(result.overallScore)}
              </Badge>
            </div>
            <Progress value={result.overallScore} className="h-3" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                Confidence: {Math.round(result.confidence * 100)}%
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Processing: {result.processingTime}ms
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Height at Withers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {result.metrics.heightAtWithers ? `${result.metrics.heightAtWithers} cm` : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">
                Vertical measurement from withers to ground level
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Body Length
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {result.metrics.bodyLength ? `${result.metrics.bodyLength} cm` : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">
                Distance from shoulder to pin bone
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Rump Angle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {result.metrics.rumpAngle ? `${result.metrics.rumpAngle}°` : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground">
                Angle of the rump relative to horizontal
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keypoint Details */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Detected Keypoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(result.keypoints).map(([key, point]) => (
              <div key={key} className="space-y-1">
                <div className="font-medium capitalize">{key}</div>
                <div className="text-sm text-muted-foreground">
                  X: {Math.round(point.x)}, Y: {Math.round(point.y)}
                </div>
                <div className="text-sm">
                  <Badge variant="outline">
                    {Math.round(point.confidence * 100)}% confidence
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}