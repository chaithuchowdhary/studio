
"use client";

import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { detectDisease } from "@/ai/flows/detect-disease";
import { summarizeDiseaseInfo } from "@/ai/flows/summarize-disease-info";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [disease, setDisease] = useState<{ name?: string; confidence?: number } | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
    const [alertSettings, setAlertSettings] = useState({
        notificationsEnabled: true,
        frequency: 'daily',
    });

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDiseaseDetection = useCallback(async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);
    try {
      const result = await detectDisease({ photoUrl: image });
      if (result.diseaseDetected && result.diseaseName && result.confidenceLevel) {
        setDisease({ name: result.diseaseName, confidence: result.confidenceLevel });
                const summaryResult = await summarizeDiseaseInfo({ diseaseName: result.diseaseName });
                setSummary(summaryResult.summary);
      } else {
        setDisease(null);
        setSummary(null);
      }
    } catch (error) {
      console.error("Disease detection failed:", error);
      alert("Disease detection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [image]);

    const handleAlertSettingsChange = (newSettings: any) => {
        setAlertSettings(newSettings);
        // TODO: Implement actual notification logic here.
        console.log('Alert settings updated:', newSettings);
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-bold mb-4 text-green-500">LeafGuard</h1>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload Plant Leaf Image</CardTitle>
          <CardDescription>Identify potential plant diseases</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
          {image && (
            <img src={image} alt="Uploaded leaf" className="max-w-full h-auto rounded-md mb-4" />
          )}
          <Button onClick={handleDiseaseDetection} disabled={loading} className="bg-teal-500 text-white">
            {loading ? "Detecting..." : "Detect Disease"}
          </Button>
        </CardContent>
      </Card>

      {disease ? (
        <Alert className="mt-4 w-full max-w-md">
          <AlertTitle>Disease Detected!</AlertTitle>
          <AlertDescription>
            Detected disease: {disease.name} with confidence: {(disease.confidence * 100).toFixed(2)}%
                      {summary && <div className="mt-2">{summary}</div>}
          </AlertDescription>
        </Alert>
      ) : (disease === null && image)  ? (
        <Alert className="mt-4 w-full max-w-md">
          <AlertTitle>No Disease Detected</AlertTitle>
          <AlertDescription>
            The AI model did not detect any disease in the uploaded image. The plant appears to be healthy.
          </AlertDescription>
        </Alert>
      ) : null}

            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" className="absolute right-4 top-4">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-sm">
                    <SheetHeader>
                        <SheetTitle>Alert Settings</SheetTitle>
                        <SheetDescription>
                            Customize your alert preferences for disease detection.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center space-x-2">
                            <Switch id="notifications"
                                    checked={alertSettings.notificationsEnabled}
                                    onCheckedChange={(checked) => handleAlertSettingsChange({
                                        ...alertSettings,
                                        notificationsEnabled: checked
                                    })} />
                            <Label htmlFor="notifications">Enable Notifications</Label>
                        </div>
                        {/* Add more settings here, such as alert frequency, etc. */}
                    </div>
                </SheetContent>
            </Sheet>
    </div>
  );
}
