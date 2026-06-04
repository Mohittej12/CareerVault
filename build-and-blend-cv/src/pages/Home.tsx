import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSearch, FileEdit, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-medium text-primary flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Tools
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
            Build & Analyze Your
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-primary">
              Perfect Resume
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Create professional resumes and get AI-powered insights to match your dream job.
            Stand out from the competition with data-driven optimization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analyzer">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl">
                <FileSearch className="h-5 w-5 mr-2" />
                Analyze Resume
              </Button>
            </Link>
            <Link to="/builder">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-muted/50">
                <FileEdit className="h-5 w-5 mr-2" />
                Build Resume
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-muted/20">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                <FileSearch className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Resume Analyzer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Upload your resume and job description to get AI-powered analysis. 
                Receive detailed feedback on keyword optimization, ATS compatibility, 
                and suggestions to improve your match score.
              </p>
              <Link to="/analyzer">
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  Start Analyzing
                </Button>
              </Link>
            </Card>

            <Card className="p-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-muted/20">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                <FileEdit className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Resume Builder</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Create professional resumes with our intuitive builder. 
                Choose from modern templates, customize sections, and export 
                your resume in multiple formats ready for job applications.
              </p>
              <Link to="/builder">
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  Start Building
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose ResumeAI?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Boost Match Rate</h3>
              <p className="text-muted-foreground">
                Optimize your resume to match job requirements and increase your chances of getting interviews
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS-Friendly</h3>
              <p className="text-muted-foreground">
                Ensure your resume passes Applicant Tracking Systems with our optimization tools
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Insights</h3>
              <p className="text-muted-foreground">
                Get real-time feedback and actionable suggestions to improve your resume immediately
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary to-primary-glow rounded-3xl p-12 text-primary-foreground shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-lg mb-8 opacity-90">
              Start optimizing your resume today and stand out from the competition
            </p>
            <Link to="/analyzer">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 rounded-xl">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
