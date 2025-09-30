import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { imageUrl, animalType = 'cattle' } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Starting AI analysis for animal type: ${animalType}`);
    const startTime = Date.now();

    // Call Lovable AI Gateway for animal pose detection
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro", // Using pro model for better accuracy with images
        messages: [
          {
            role: "system",
            content: `You are an expert animal anatomical analysis system. Analyze the uploaded ${animalType} image and extract key anatomical landmarks for morphometric measurements. Return ONLY valid JSON with the following structure:
{
  "keypoints": {
    "withers": {"x": number, "y": number, "confidence": number},
    "pinBone": {"x": number, "y": number, "confidence": number},
    "shoulder": {"x": number, "y": number, "confidence": number},
    "elbow": {"x": number, "y": number, "confidence": number},
    "knee": {"x": number, "y": number, "confidence": number},
    "hock": {"x": number, "y": number, "confidence": number},
    "fetlock": {"x": number, "y": number, "confidence": number},
    "coronet": {"x": number, "y": number, "confidence": number}
  },
  "imageWidth": number,
  "imageHeight": number,
  "confidence": number
}
Coordinates should be in pixels relative to the image dimensions. Confidence should be 0-1.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this ${animalType} image and identify anatomical keypoints for morphometric analysis.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please check your workspace credits." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }

      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    let analysisData;

    try {
      // Extract and parse the JSON response
      let content = aiResult.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content in AI response");
      }
      
      // Remove markdown code blocks if present
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      analysisData = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw AI response:", aiResult.choices?.[0]?.message?.content);
      throw new Error("Invalid AI response format");
    }

    // Calculate derived metrics based on keypoints
    const metrics = calculateMetrics(analysisData.keypoints, analysisData.imageWidth, analysisData.imageHeight);
    
    // Calculate overall score
    const overallScore = calculateOverallScore(metrics, analysisData.confidence);

    const processingTime = Date.now() - startTime;

    const result = {
      keypoints: analysisData.keypoints,
      metrics,
      overallScore,
      confidence: analysisData.confidence,
      processingTime,
      imageWidth: analysisData.imageWidth,
      imageHeight: analysisData.imageHeight
    };

    console.log("Analysis completed successfully in", processingTime, "ms");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-animal function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateMetrics(keypoints: any, imageWidth: number, imageHeight: number) {
  // Convert pixel coordinates to standardized measurements
  const pixelsPerCm = Math.min(imageWidth, imageHeight) / 150; // Rough estimate
  
  // Height at withers (vertical distance from withers to ground level)
  const heightAtWithers = keypoints.withers && keypoints.coronet 
    ? Math.abs(keypoints.withers.y - keypoints.coronet.y) / pixelsPerCm
    : null;

  // Body length (horizontal distance from shoulder to pin bone)
  const bodyLength = keypoints.shoulder && keypoints.pinBone
    ? Math.sqrt(
        Math.pow(keypoints.pinBone.x - keypoints.shoulder.x, 2) +
        Math.pow(keypoints.pinBone.y - keypoints.shoulder.y, 2)
      ) / pixelsPerCm
    : null;

  // Rump angle (angle of the rump based on withers and pin bone)
  let rumpAngle = null;
  if (keypoints.withers && keypoints.pinBone) {
    const deltaX = keypoints.pinBone.x - keypoints.withers.x;
    const deltaY = keypoints.pinBone.y - keypoints.withers.y;
    rumpAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }

  return {
    heightAtWithers: heightAtWithers ? Number(heightAtWithers.toFixed(2)) : null,
    bodyLength: bodyLength ? Number(bodyLength.toFixed(2)) : null,
    rumpAngle: rumpAngle ? Number(rumpAngle.toFixed(2)) : null,
  };
}

function calculateOverallScore(metrics: any, confidence: number) {
  // Calculate score based on metric completeness and confidence
  let score = 0;
  let factors = 0;

  if (metrics.heightAtWithers !== null) {
    score += 30;
    factors++;
  }
  
  if (metrics.bodyLength !== null) {
    score += 30;
    factors++;
  }
  
  if (metrics.rumpAngle !== null) {
    score += 20;
    factors++;
  }

  // Add confidence factor
  score += confidence * 20;

  return Number((score).toFixed(2));
}