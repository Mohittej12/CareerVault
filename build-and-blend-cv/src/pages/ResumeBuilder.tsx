import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Download, Eye, Sparkles, Wand2, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { downloadResumePdf, previewResumePdf } from "@/lib/generateResumePdf";
import { downloadResumeDocx } from "@/lib/generateResumeDocx";
import { supabase } from "@/integrations/supabase/client";
import { FileText } from "lucide-react";

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

interface Project {
  id: string;
  name: string;
  tech: string;
  description: string;
  link: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

const ResumeBuilder = () => {
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState("");
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [improving, setImproving] = useState(false);
  const location = useLocation();

  // Receive extracted resume + missing keywords from the Analyzer
  useEffect(() => {
    const state: any = location.state;
    if (!state?.extractedResume) return;
    const ex = state.extractedResume;
    setPersonalInfo({
      name: ex.personalInfo?.name || "",
      email: ex.personalInfo?.email || "",
      phone: ex.personalInfo?.phone || "",
      location: ex.personalInfo?.location || "",
      summary: ex.personalInfo?.summary || "",
      linkedin: ex.personalInfo?.linkedin || "",
      github: ex.personalInfo?.github || "",
      portfolio: ex.personalInfo?.portfolio || "",
    });
    setExperiences(
      (ex.experiences || []).map((e: any) => ({
        id: crypto.randomUUID(),
        company: e.company || "",
        position: e.position || "",
        duration: e.duration || "",
        description: e.description || "",
      }))
    );
    setEducation(
      (ex.education || []).map((e: any) => ({
        id: crypto.randomUUID(),
        school: e.school || "",
        degree: e.degree || "",
        year: e.year || "",
      }))
    );
    setProjects(
      (ex.projects || []).map((p: any) => ({
        id: crypto.randomUUID(),
        name: p.name || "",
        tech: p.tech || "",
        description: p.description || "",
        link: p.link || "",
      }))
    );
    setCertifications(
      (ex.certifications || []).map((c: any) => ({
        id: crypto.randomUUID(),
        name: c.name || "",
        issuer: c.issuer || "",
        year: c.year || "",
      }))
    );
    const existingSkills: string[] = Array.isArray(ex.skills) ? ex.skills : [];
    const missing: string[] = state.missingKeywords || [];
    const seen = new Set<string>();
    const merged: string[] = [];
    [...existingSkills, ...missing].forEach((s) => {
      const k = String(s || "").trim();
      if (!k) return;
      const key = k.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(k);
    });
    setSkills(merged.join(", "));
    setMissingKeywords(missing);
    if (missing.length > 0) {
      toast.success(`Resume loaded. Added ${missing.length} ATS keyword${missing.length > 1 ? "s" : ""} to Skills.`);
    } else {
      toast.success("Resume loaded from analyzer");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeMissingKeyword = (kw: string) => {
    setMissingKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      duration: "",
      description: ""
    }]);
  };
  const removeExperience = (id: string) => setExperiences(experiences.filter(e => e.id !== id));

  const addEducation = () => {
    setEducation([...education, { id: crypto.randomUUID(), school: "", degree: "", year: "" }]);
  };
  const removeEducation = (id: string) => setEducation(education.filter(e => e.id !== id));

  const addProject = () => {
    setProjects([...projects, { id: crypto.randomUUID(), name: "", tech: "", description: "", link: "" }]);
  };
  const removeProject = (id: string) => setProjects(projects.filter(p => p.id !== id));

  const addCertification = () => {
    setCertifications([...certifications, { id: crypto.randomUUID(), name: "", issuer: "", year: "" }]);
  };
  const removeCertification = (id: string) => setCertifications(certifications.filter(c => c.id !== id));

  const buildData = () => ({
    personalInfo,
    experiences,
    education,
    projects,
    certifications,
    skills,
  });

  const handlePreview = () => {
    if (!personalInfo.name || !personalInfo.email) {
      toast.error("Please fill in at least name and email");
      return;
    }
    try {
      previewResumePdf(buildData());
      toast.success("Preview opened in a new tab");
    } catch (err) {
      console.error(err);
      toast.error("Could not open preview. Check pop-up blocker.");
    }
  };

  const handleDownload = () => {
    if (!personalInfo.name || !personalInfo.email) {
      toast.error("Please fill in at least name and email");
      return;
    }
    try {
      downloadResumePdf(buildData());
      toast.success("Resume downloaded as PDF");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadDocx = async () => {
    if (!personalInfo.name || !personalInfo.email) {
      toast.error("Please fill in at least name and email");
      return;
    }
    try {
      await downloadResumeDocx(buildData());
      toast.success("ATS-friendly Word document downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Word document");
    }
  };

  const handleImproveWithAI = async () => {
    if (!personalInfo.name) {
      toast.error("Add at least your name first");
      return;
    }
    setImproving(true);
    try {
      const skillsArr = skills.split(",").map((s) => s.trim()).filter(Boolean);
      const resume = {
        personalInfo,
        experiences: experiences.map(({ id, ...rest }) => rest),
        education: education.map(({ id, ...rest }) => rest),
        projects: projects.map(({ id, ...rest }) => rest),
        certifications: certifications.map(({ id, ...rest }) => rest),
        skills: skillsArr,
      };
      const { data, error } = await supabase.functions.invoke("improve-resume", {
        body: { resume, missingKeywords },
      });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("429")) toast.error("Too many requests. Try again shortly.");
        else if (msg.includes("402")) toast.error("AI credits exhausted.");
        else toast.error("Failed to improve resume");
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      const r = data.resume;
      setPersonalInfo({
        name: r.personalInfo?.name || personalInfo.name,
        email: r.personalInfo?.email || personalInfo.email,
        phone: r.personalInfo?.phone || personalInfo.phone,
        location: r.personalInfo?.location || personalInfo.location,
        summary: r.personalInfo?.summary || personalInfo.summary,
        linkedin: r.personalInfo?.linkedin ?? personalInfo.linkedin,
        github: r.personalInfo?.github ?? personalInfo.github,
        portfolio: r.personalInfo?.portfolio ?? personalInfo.portfolio,
      });
      setExperiences(
        (r.experiences || []).map((e: any) => ({
          id: crypto.randomUUID(),
          company: e.company || "",
          position: e.position || "",
          duration: e.duration || "",
          description: e.description || "",
        }))
      );
      setEducation(
        (r.education || []).map((e: any) => ({
          id: crypto.randomUUID(),
          school: e.school || "",
          degree: e.degree || "",
          year: e.year || "",
        }))
      );
      if (Array.isArray(r.projects)) {
        setProjects(r.projects.map((p: any) => ({
          id: crypto.randomUUID(),
          name: p.name || "",
          tech: p.tech || "",
          description: p.description || "",
          link: p.link || "",
        })));
      }
      if (Array.isArray(r.certifications)) {
        setCertifications(r.certifications.map((c: any) => ({
          id: crypto.randomUUID(),
          name: c.name || "",
          issuer: c.issuer || "",
          year: c.year || "",
        })));
      }
      setSkills((r.skills || []).join(", "));
      toast.success("Resume improved with AI");
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error improving resume");
    } finally {
      setImproving(false);
    }
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: string) => {
    setExperiences(experiences.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(projects.map(item => item.id === id ? { ...item, [field]: value } : item));
  };
  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Resume <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-primary">Builder</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Create a professional resume in minutes
          </p>
        </div>

        <div className="space-y-8">
          {/* Updated Resume — pre-filled from Analyzer */}
          {missingKeywords.length > 0 && (
            <Card className="p-6 border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary-glow/5">
              <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Updated Resume
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    We pre-filled your resume from the Analyzer and added missing ATS keywords to your Skills section.
                  </p>
                </div>
                <Button
                  onClick={handleImproveWithAI}
                  disabled={improving}
                  className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                >
                  <Wand2 className={`h-4 w-4 mr-2 ${improving ? "animate-spin" : ""}`} />
                  {improving ? "Improving..." : "Improve with AI"}
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Missing keywords added to Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeMissingKeyword(kw)}
                        className="hover:text-destructive"
                        aria-label={`Remove ${kw}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Tip: Edit the Skills section below or click "Improve with AI" to weave these keywords into your summary and experience.
                </p>
              </div>
            </Card>
          )}

          {/* Personal Information */}
          <Card className="p-6 border-2">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+1 234 567 890" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  placeholder="New York, NY" />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input id="linkedin" value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username" />
              </div>
              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input id="github" value={personalInfo.github}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                  placeholder="github.com/username" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="portfolio">Portfolio / Website</Label>
                <Input id="portfolio" value={personalInfo.portfolio}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                  placeholder="yourportfolio.com" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea id="summary" value={personalInfo.summary}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                  placeholder="Brief overview of your professional background..."
                  className="min-h-[100px]" />
              </div>
            </div>
          </Card>

          {/* Work Experience */}
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Work Experience</h2>
              <Button onClick={addExperience} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Experience
              </Button>
            </div>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-lg bg-muted/20 relative">
                  <Button onClick={() => removeExperience(exp.id)} variant="ghost" size="icon" className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="grid md:grid-cols-2 gap-4 pr-12">
                    <div>
                      <Label>Company</Label>
                      <Input value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} placeholder="Company Name" />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} placeholder="Job Title" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Duration</Label>
                      <Input value={exp.duration} onChange={(e) => updateExperience(exp.id, "duration", e.target.value)} placeholder="Jan 2020 - Present" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description (use bullets: each line starting with • or -)</Label>
                      <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                        placeholder="• Led team of 5 engineers...&#10;• Built microservices architecture..."
                        className="min-h-[100px]" />
                    </div>
                  </div>
                </div>
              ))}
              {experiences.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No work experience added yet.</p>
              )}
            </div>
          </Card>

          {/* Projects */}
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Projects</h2>
              <Button onClick={addProject} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Project
              </Button>
            </div>
            <div className="space-y-6">
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 border rounded-lg bg-muted/20 relative">
                  <Button onClick={() => removeProject(proj.id)} variant="ghost" size="icon" className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="grid md:grid-cols-2 gap-4 pr-12">
                    <div>
                      <Label>Project Name</Label>
                      <Input value={proj.name} onChange={(e) => updateProject(proj.id, "name", e.target.value)} placeholder="Project Name" />
                    </div>
                    <div>
                      <Label>Link</Label>
                      <Input value={proj.link} onChange={(e) => updateProject(proj.id, "link", e.target.value)} placeholder="github.com/.../project" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Tech / Stack</Label>
                      <Input value={proj.tech} onChange={(e) => updateProject(proj.id, "tech", e.target.value)} placeholder="React, Node.js, PostgreSQL" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea value={proj.description} onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                        placeholder="What it does and your contribution..." className="min-h-[80px]" />
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No projects added yet.</p>
              )}
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Education</h2>
              <Button onClick={addEducation} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </div>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 border rounded-lg bg-muted/20 relative">
                  <Button onClick={() => removeEducation(edu.id)} variant="ghost" size="icon" className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="grid md:grid-cols-2 gap-4 pr-12">
                    <div>
                      <Label>School/University</Label>
                      <Input value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} placeholder="University Name" />
                    </div>
                    <div>
                      <Label>Degree</Label>
                      <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} placeholder="Bachelor of Science" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Year</Label>
                      <Input value={edu.year} onChange={(e) => updateEducation(edu.id, "year", e.target.value)} placeholder="2020" />
                    </div>
                  </div>
                </div>
              ))}
              {education.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No education added yet.</p>
              )}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6 border-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Certifications</h2>
              <Button onClick={addCertification} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Add Certification
              </Button>
            </div>
            <div className="space-y-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-lg bg-muted/20 relative">
                  <Button onClick={() => removeCertification(cert.id)} variant="ghost" size="icon" className="absolute top-2 right-2">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  <div className="grid md:grid-cols-2 gap-4 pr-12">
                    <div>
                      <Label>Name</Label>
                      <Input value={cert.name} onChange={(e) => updateCertification(cert.id, "name", e.target.value)} placeholder="AWS Certified Solutions Architect" />
                    </div>
                    <div>
                      <Label>Issuer</Label>
                      <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)} placeholder="Amazon Web Services" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Year</Label>
                      <Input value={cert.year} onChange={(e) => updateCertification(cert.id, "year", e.target.value)} placeholder="2023" />
                    </div>
                  </div>
                </div>
              ))}
              {certifications.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No certifications added yet.</p>
              )}
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6 border-2">
            <h2 className="text-2xl font-bold mb-6">Skills</h2>
            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea id="skills" value={skills} onChange={(e) => setSkills(e.target.value)}
                placeholder="JavaScript, React, Node.js, Python, SQL..." className="min-h-[100px]" />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handlePreview} variant="outline" className="flex-1" size="lg">
              <Eye className="h-5 w-5 mr-2" /> Preview
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1" size="lg">
              <Download className="h-5 w-5 mr-2" /> Download PDF
            </Button>
            <Button onClick={handleDownloadDocx}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90" size="lg">
              <FileText className="h-5 w-5 mr-2" /> Download Word (ATS)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Tip: The ATS-plain Word file uses single-column layout, standard fonts, and no tables/icons — best for ATS parsers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
