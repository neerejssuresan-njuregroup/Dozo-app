
import React, { useState } from 'react';
import { analyzeImageCondition } from '../services/geminiService';
import { UploadCloud, FileImage, RefreshCw, CheckCircle } from 'lucide-react';
import { Product } from '../types';

interface AiDamageGuardProps {
  product: Product;
  onCheckComplete: (report: string) => void;
}

const AiDamageGuard: React.FC<AiDamageGuardProps> = ({ product, onCheckComplete }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // strip prefix `data:image/jpeg;base64,`
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
      };
      reader.readAsDataURL(file);
      setAnalysis('');
      setIsAnalyzed(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setIsLoading(true);
    const result = await analyzeImageCondition(imageBase64, product.name);
    setAnalysis(result);
    setIsLoading(false);
    setIsAnalyzed(true);
  };

  const handleConfirm = () => {
    onCheckComplete(analysis);
  }

  const renderAnalysis = () => {
    const lines = analysis.split('\n');
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
        {lines.map((line, index) => {
           if (line.startsWith('* ')) {
             return <li key={index}>{line.substring(2)}</li>;
           }
           if(line.trim().length > 0) return <p key={index}>{line}</p>;
           return null;
        })}
      </ul>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-xl font-bold text-dozo-charcoal mb-2">AI Damage Guard</h3>
      <p className="text-dozo-gray mb-4">Upload a photo of the item to document its condition before rental.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-64 text-center">
            {imagePreview ? (
              <img src={imagePreview} alt="Item preview" className="max-h-full max-w-full rounded-md object-contain" />
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
                <span className="font-semibold text-dozo-teal">Click to upload</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
              </>
            )}
          </label>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg" onChange={handleFileChange} />
          {imagePreview && (
            <button
              onClick={handleAnalyze}
              disabled={isLoading || isAnalyzed}
              className="mt-4 w-full bg-dozo-teal text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center transition-all duration-300 disabled:bg-gray-400 hover:bg-opacity-90"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              ) : isAnalyzed ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <FileImage className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Analyzing...' : isAnalyzed ? 'Analyzed' : 'Analyze Condition'}
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg h-64 overflow-y-auto">
          <h4 className="font-semibold mb-2">Condition Report</h4>
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-dozo-teal animate-spin" />
            </div>
          )}
          {!isLoading && analysis && (
            <div className="prose prose-sm max-w-none">{renderAnalysis()}</div>
          )}
          {!isLoading && !analysis && (
            <p className="text-gray-500 text-sm italic">Analysis will appear here.</p>
          )}
        </div>
      </div>
      {isAnalyzed && (
          <button
            onClick={handleConfirm}
            className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-green-700"
          >
            <CheckCircle className="w-6 h-6 mr-2" />
            Confirm Condition & Proceed
          </button>
      )}
    </div>
  );
};

export default AiDamageGuard;
