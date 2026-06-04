import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, Sparkles, TrendingUp, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

// Set up PDF.js worker (bundled locally to match installed pdfjs-dist version)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ResumeAnalyzer = () => {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [extracting, setExtracting] = useState(false);

  const sendToBuilder = () => {
    if (!results?.extractedResume) {
      toast.error("No extracted resume data to send");
      return;
    }
    navigate("/builder", {
      state: {
        extractedResume: results.extractedResume,
        missingKeywords: results?.keywords?.missing || [],
        matchedKeywords: results?.keywords?.matched || [],
      },
    });
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    setExtracting(true);
    toast.info('Extracting text from file...');

    try {
      let extractedText = '';
      
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        extractedText = await extractTextFromDOCX(file);
      } else if (fileName.endsWith('.doc')) {
        toast.error('Please convert .doc files to .docx format');
        setExtracting(false);
        return;
      }

      setResumeText(extractedText);
      toast.success('Text extracted successfully!');
    } catch (error) {
      console.error('Error extracting text:', error);
      toast.error('Failed to extract text from file');
    } finally {
      setExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      toast.error("Please enter both resume content and job description");
      return;
    }

    setAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: {
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim()
        }
      });

      if (error) {
        console.error('Error analyzing resume:', error);
        if (error.message.includes('429')) {
          toast.error('Too many requests. Please wait a moment and try again.');
        } else if (error.message.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to analyze resume. Please try again.');
        }
        setAnalyzing(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setAnalyzing(false);
        return;
      }

      setResults(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      <div className="container mx-auto max-w-6xl px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Resume <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-primary">Analyzer</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Get AI-powered insights to optimize your resume for any job
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="p-6 border-2">
              <Label htmlFor="resume-text" className="text-lg font-semibold mb-4 block">
                Resume Content
              </Label>
              
              <div className="mb-4">
                <Label htmlFor="resume-file" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {extracting ? 'Extracting text...' : 'Upload PDF or DOCX file'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or paste text below
                    </p>
                  </div>
                  <Input
                    id="resume-file"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileUpload}
                    disabled={extracting}
                    className="hidden"
                  />
                </Label>
              </div>

              <Textarea
                id="resume-text"
                placeholder="Paste your resume content here...

Example:
John Doe
Software Engineer

EXPERIENCE:
Senior Developer at Tech Corp (2020-Present)
- Led development of microservices architecture
- Managed team of 5 developers
..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[300px] resize-none font-mono text-sm"
                disabled={extracting}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Upload a file or paste your resume text for analysis
              </p>
            </Card>

            <Card className="p-6 border-2">
              <Label htmlFor="job-desc" className="text-lg font-semibold mb-4 block">
                Job Description
              </Label>
              <Textarea
                id="job-desc"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[250px] resize-none"
              />
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg py-6 rounded-xl"
            >
              {analyzing ? (
                <>
                  <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {results ? (
              <>
                <Card className="p-6 border-2 bg-gradient-to-br from-card to-muted/20">
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-primary mb-2">
                      {results.matchScore}%
                    </div>
                    <p className="text-muted-foreground flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Match Score
                    </p>
                  </div>
                </Card>

                <Card className="p-6 border-2">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {results.strengths.map((strength: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2" />
                        <span className="text-muted-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 border-2">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {results.improvements.map((improvement: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2" />
                        <span className="text-muted-foreground">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-6 border-2">
                  <h3 className="font-bold text-lg mb-4">Keywords Analysis</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-green-600 mb-2">Matched Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.matched.map((kw: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-600 mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {results.keywords.missing.map((kw: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  onClick={sendToBuilder}
                  className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 text-lg py-6 rounded-xl"
                  disabled={!results?.extractedResume}
                >
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Send to Resume Builder (with missing keywords)
                </Button>
              </>
            ) : (
              <Card className="p-12 border-2 border-dashed text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Upload your resume and job description to see detailed analysis
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
