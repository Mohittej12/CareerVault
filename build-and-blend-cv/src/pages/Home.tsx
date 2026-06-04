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
              Smart Career Tools
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
            Elevate Your Career
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-primary">
              Professional Profile
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Craft compelling resumes and get intelligent career insights to advance your professional journey.
            Unlock opportunities with smart optimization tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analyzer">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl">
                <FileSearch className="h-5 w-5 mr-2" />
                Analyze Profile
              </Button>
            </Link>
            <Link to="/builder">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-xl border-2 hover:bg-muted/50">
                <FileEdit className="h-5 w-5 mr-2" />
                Create Resume
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
              <h3 className="text-2xl font-bold mb-4">Profile Analyzer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Upload your resume and target job description for intelligent analysis. 
                Get actionable feedback on skill alignment, career positioning, 
                and strategies to enhance your competitiveness.
              </p>
              <Link to="/analyzer">
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  Start Analysis
                </Button>
              </Link>
            </Card>

            <Card className="p-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-card to-muted/20">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-6 shadow-lg">
                <FileEdit className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Career Builder</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Design impressive resumes with our smart builder. 
                Select from contemporary templates, personalize your sections, and save 
                your resume in diverse formats ready for career advancement.
              </p>
              <Link to="/builder">
                <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90">
                  Start Creating
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose CareerVault?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Career Advancement</h3>
              <p className="text-muted-foreground">
                Strategically position your experience to align with career goals and unlock new opportunities
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Format</h3>
              <p className="text-muted-foreground">
                Ensure your documents maintain professional quality across all platforms and systems
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Optimization</h3>
              <p className="text-muted-foreground">
                Receive intelligent recommendations and real-time suggestions to enhance your professional profile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-gradient-to-r from-primary to-primary-glow rounded-3xl p-12 text-primary-foreground shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Advance Your Career?</h2>
            <p className="text-lg mb-8 opacity-90">
              Begin building your professional brand today and unlock your career potential
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
