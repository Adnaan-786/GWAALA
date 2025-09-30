-- Create enum types for animal analysis
CREATE TYPE animal_type AS ENUM ('cattle', 'buffalo', 'goat', 'sheep', 'horse', 'pig', 'other');
CREATE TYPE analysis_status AS ENUM ('pending', 'completed', 'failed');

-- Create storage bucket for animal images
INSERT INTO storage.buckets (id, name, public) VALUES ('animal-images', 'animal-images', true);

-- Create animal_analyses table
CREATE TABLE public.animal_analyses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    animal_id TEXT NOT NULL,
    animal_type animal_type,
    image_url TEXT,
    image_path TEXT,
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status analysis_status NOT NULL DEFAULT 'pending',
    
    -- AI Analysis Results
    keypoints JSONB,
    
    -- Calculated Metrics
    height_at_withers DECIMAL(10,2),
    body_length DECIMAL(10,2),
    rump_angle DECIMAL(10,2),
    
    -- Overall Score
    overall_score DECIMAL(5,2),
    
    -- Metadata
    processing_time_ms INTEGER,
    confidence_score DECIMAL(5,2),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.animal_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for animal_analyses
CREATE POLICY "Users can view their own analyses" 
ON public.animal_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses" 
ON public.animal_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses" 
ON public.animal_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses" 
ON public.animal_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create storage policies for animal images
CREATE POLICY "Users can view animal images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'animal-images');

CREATE POLICY "Users can upload their own animal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'animal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own animal images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'animal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own animal images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'animal-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_animal_analyses_updated_at
    BEFORE UPDATE ON public.animal_analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_animal_analyses_user_id ON public.animal_analyses(user_id);
CREATE INDEX idx_animal_analyses_animal_type ON public.animal_analyses(animal_type);
CREATE INDEX idx_animal_analyses_status ON public.animal_analyses(status);
CREATE INDEX idx_animal_analyses_created_at ON public.animal_analyses(created_at DESC);