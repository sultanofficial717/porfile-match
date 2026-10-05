"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  Link as LinkIcon,
  Save,
  Plus,
  Trash2,
  Upload,
  Check,
  X,
  Phone,
  Mail,
  MessageCircle,
  Edit2,
  MapPin,
  Building,
  Award,
  FileText,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  getStudentProfile,
  upsertStudentProfile,
  getExperiences,
  createExperience,
  deleteExperience,
  getProjects,
  createProject,
  deleteProject,
  uploadFile,
  getFilePreviewUrl,
  generateMatchesForStudent,
} from "@/lib/database";
import type { StudentProfile, Experience, Project } from "@/lib/types";
import Image from "next/image";

// Auto-suggest lists for datalists
const UNIVERSITIES_LIST = [
  "UC Berkeley", "Stanford University", "Massachusetts Institute of Technology (MIT)", 
  "Harvard University", "UCLA", "University of Toronto", "University of Oxford", 
  "University of Cambridge", "National University of Sciences and Technology (NUST)", 
  "Lahore University of Management Sciences (LUMS)", "University of Michigan"
];

const CITIES_LIST = [
  "San Francisco, CA", "New York, NY", "London, UK", "Toronto, ON", "Austin, TX",
  "Seattle, WA", "Chicago, IL", "Karachi, Pakistan", "Lahore, Pakistan", 
  "Islamabad, Pakistan", "Dubai, UAE", "Berlin, Germany", "Singapore"
];

const SKILL_SUGGESTIONS = [
  "Project Management", "Public Speaking", "Data Analysis", "Graphic Design",
  "Digital Marketing", "Sales", "Accounting", "Financial Modeling", "Human Resources",
  "Copywriting", "SEO", "Customer Service", "Business Development",
  "JavaScript", "Python", "Excel", "Figma", "Research", "Event Planning"
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [gpa, setGpa] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [desiredRoleType, setDesiredRoleType] = useState("");
  const [preferredIndustry, setPreferredIndustry] = useState("");
  const [locationPreference, setLocationPreference] = useState("");
  const [workMode, setWorkMode] = useState("any");

  // Contact info
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  // New experience form
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");

  // New project form
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjUrl, setNewProjUrl] = useState("");
  const [newProjThumbnail, setNewProjThumbnail] = useState<File | null>(null);
  const [newProjImages, setNewProjImages] = useState<File[]>([]);

  // Files
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [academicDocFiles, setAcademicDocFiles] = useState<File[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) {
      router.push("/login");
      return;
    }
    if (profile.role !== "student") {
      router.push("/recruiter");
      return;
    }
    loadProfileData();
  }, [user, profile, authLoading]);

  const loadProfileData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sp = await getStudentProfile(user.$id);
      if (sp) {
        setStudentProfile(sp);
        setLocation(sp.location || "");
        setBio(sp.bio || "");
        setInstitution(sp.institution || "");
        setDegree(sp.degree || "");
        setFieldOfStudy(sp.fieldOfStudy || "");
        setGraduationYear(sp.graduationYear?.toString() || "");
        setGpa(sp.gpa?.toString() || "");
        setSelectedSkills(sp.skills || []);
        setPortfolioUrl(sp.portfolioUrl || "");
        setLinkedinUrl(sp.linkedinUrl || "");
        setGithubUrl(sp.githubUrl || "");
        setDesiredRoleType(sp.desiredRoleType || "");
        setPreferredIndustry(sp.preferredIndustry || "");
        setLocationPreference(sp.locationPreference || "");
        setWorkMode(sp.workMode || "any");
        
        setEmail(sp.email || "");
        setPhone(sp.phone || "");
        setWhatsapp(sp.whatsapp || "");

        const exps = await getExperiences(sp.$id);
        setExperiences(exps);
        const projs = await getProjects(sp.$id);
        setProjects(projs);
      } else {
        setIsEditing(true);
        if (profile?.email) setEmail(profile.email);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompleteness = () => {
    let score = 0;
    const total = 10;
    if (institution) score++;
    if (degree) score++;
    if (fieldOfStudy) score++;
    if (graduationYear) score++;
    if (gpa) score++;
    if (selectedSkills.length > 0) score++;
    if (bio) score++;
    if (location) score++;
    if (experiences.length > 0) score++;
    if (projects.length > 0) score++;
    return Math.round((score / total) * 100);
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
    }
    setCustomSkill("");
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const saveProfileData = async (showSuccessMessage = true): Promise<StudentProfile | null> => {
    if (!user) return null;
    setSaving(true);
    try {
      let profilePhotoFileId = studentProfile?.profilePhotoFileId;
      if (profilePhoto) {
        profilePhotoFileId = await uploadFile(profilePhoto);
      }

      let resumeFileId = studentProfile?.resumeFileId;
      if (resumeFile) {
        resumeFileId = await uploadFile(resumeFile);
      }

      const uploadedCerts = await Promise.all(certFiles.map(f => uploadFile(f)));
      const certificationFileIds = [...(studentProfile?.certificationFileIds || []), ...uploadedCerts];

      const uploadedDocs = await Promise.all(academicDocFiles.map(f => uploadFile(f)));
      const academicDocFileIds = [...(studentProfile?.academicDocFileIds || []), ...uploadedDocs];

      const completeness = calculateCompleteness();
      const data: Partial<StudentProfile> = {
        location,
        bio,
        institution,
        degree,
        fieldOfStudy,
        graduationYear: graduationYear ? parseInt(graduationYear) : undefined,
        gpa: gpa ? parseFloat(gpa) : undefined,
        skills: selectedSkills,
        profilePhotoFileId,
        resumeFileId,
        certificationFileIds,
        academicDocFileIds,
        portfolioUrl: portfolioUrl || undefined,
        linkedinUrl: linkedinUrl || undefined,
        githubUrl: githubUrl || undefined,
        desiredRoleType,
        preferredIndustry,
        locationPreference,
        workMode: workMode as any,
        profileCompleteness: completeness,
        email,
        phone,
        whatsapp,
      };

      const result = await upsertStudentProfile(user.$id, data, studentProfile?.$id);
      setStudentProfile(result);

      // Automatically recalculate matches against open roles
      try {
        await generateMatchesForStudent(result.$id);
      } catch (matchErr) {
        console.error("Match generation error:", matchErr);
      }
      
      // Reset file inputs
      setProfilePhoto(null);
      setResumeFile(null);
      setCertFiles([]);
      setAcademicDocFiles([]);

      if (showSuccessMessage) {
        toast.success("Profile saved and matches updated!");
        setIsEditing(false); // Return to view mode
      }
      return result;
    } catch (err: any) {
      if (showSuccessMessage) {
        toast.error(err.message || "Failed to save profile.");
      }
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => saveProfileData(true);

  const handleAddExperience = async () => {
    if (!user || !newExpCompany || !newExpTitle) return;
    
    let currentProfile = studentProfile;
    if (!currentProfile) {
      currentProfile = await saveProfileData(false);
      if (!currentProfile) {
        toast.error("Please save your profile first before adding experiences.");
        return;
      }
    }

    try {
      const exp = await createExperience(
        { studentProfileId: currentProfile.$id, company: newExpCompany, title: newExpTitle, description: newExpDesc },
        user.$id
      );
      setExperiences((prev) => [...prev, exp]);
      setNewExpCompany("");
      setNewExpTitle("");
      setNewExpDesc("");
      toast.success("Experience added!");
    } catch (err) {
      toast.error("Failed to add experience.");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    await deleteExperience(id);
    setExperiences((prev) => prev.filter((e) => e.$id !== id));
    toast.success("Experience deleted.");
  };

  const handleAddProject = async () => {
    if (!user || !newProjTitle) return;

    let currentProfile = studentProfile;
    if (!currentProfile) {
      currentProfile = await saveProfileData(false);
      if (!currentProfile) {
        toast.error("Please save your profile first before adding projects.");
        return;
      }
    }

    try {
      let thumbnailFileId;
      if (newProjThumbnail) thumbnailFileId = await uploadFile(newProjThumbnail);

      const imageFileIds = await Promise.all(newProjImages.map(f => uploadFile(f)));

      const proj = await createProject(
        {
          studentProfileId: currentProfile.$id,
          title: newProjTitle,
          description: newProjDesc,
          techUsed: newProjTech.split(",").map((t) => t.trim()).filter(Boolean),
          projectUrl: newProjUrl || undefined,
          thumbnailFileId,
          imageFileIds
        },
        user.$id
      );
      
      setProjects((prev) => [...prev, proj]);
      setNewProjTitle("");
      setNewProjDesc("");
      setNewProjTech("");
      setNewProjUrl("");
      setNewProjThumbnail(null);
      setNewProjImages([]);
      
      toast.success("Project added!");
    } catch (err) {
      toast.error("Failed to add project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.$id !== id));
    toast.success("Project deleted.");
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  // ─── READ-ONLY VIEW MODE ────────────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <div className="max-w-[1000px] mx-auto px-6 sm:px-10 py-8 space-y-8">
        {/* Profile Header section */}
        <div className="editorial-card relative overflow-hidden">
          <div className="h-32 bg-primary/10 w-full absolute top-0 left-0"></div>
          <div className="px-8 pb-8 pt-20 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <div className="w-32 h-32 rounded-full border-4 border-background bg-muted overflow-hidden flex items-center justify-center relative shadow-sm">
                {studentProfile?.profilePhotoFileId ? (
                  <Image src={getFilePreviewUrl(studentProfile.profilePhotoFileId)} alt="Profile" fill style={{ objectFit: "cover" }} />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-display font-semibold text-foreground">
                  {profile?.name || "Your Profile"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                  {location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{location}</span>
                  )}
                  {degree && institution && (
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" />{degree} at {institution}</span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md shadow-none mb-2"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {completeness < 100 && (
          <div className="editorial-card p-4 border-l-4 border-l-primary/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Complete Your Profile</span>
              <span className="text-sm font-semibold text-primary">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-1.5 mb-2" />
            <p className="text-xs text-muted-foreground">Recruiters are more likely to notice fully completed profiles.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="editorial-card p-6 space-y-3">
              <h2 className="text-lg font-display font-semibold">About</h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {bio || <span className="text-muted-foreground italic">No bio provided.</span>}
              </p>
            </div>

            {/* Experience */}
            <div className="editorial-card p-6 space-y-4">
              <h2 className="text-lg font-display font-semibold">Experience</h2>
              {experiences.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No experiences added.</p>
              ) : (
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div key={exp.$id} className={idx !== 0 ? "pt-4 border-t border-border" : ""}>
                      <h3 className="text-base font-semibold text-foreground">{exp.title}</h3>
                      <p className="text-sm text-primary font-medium">{exp.company}</p>
                      {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="editorial-card p-6 space-y-4">
              <h2 className="text-lg font-display font-semibold">Projects & Portfolio</h2>
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No projects added.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div key={proj.$id} className="border border-border rounded-md overflow-hidden bg-muted/30 flex flex-col">
                      {proj.thumbnailFileId ? (
                        <div className="w-full h-32 bg-muted relative">
                          <Image src={getFilePreviewUrl(proj.thumbnailFileId)} alt={proj.title} fill style={{ objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-muted flex items-center justify-center">
                          <Code className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base font-semibold text-foreground line-clamp-1">{proj.title}</h3>
                        {proj.description && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 flex-1">{proj.description}</p>}
                        
                        <div className="mt-3 space-y-3">
                          {proj.techUsed && proj.techUsed.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {proj.techUsed.slice(0, 3).map((t) => (
                                <span key={t} className="px-1.5 py-0.5 rounded border border-border text-[10px] font-medium text-muted-foreground">{t}</span>
                              ))}
                              {proj.techUsed.length > 3 && <span className="text-[10px] text-muted-foreground">+{proj.techUsed.length - 3}</span>}
                            </div>
                          )}
                          
                          {(proj.projectUrl || proj.githubUrl) && (
                            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                              {proj.projectUrl && (
                                <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" /> Live Demo
                                </a>
                              )}
                              {proj.githubUrl && (
                                <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                  <Code className="w-3 h-3" /> Source
                                </a>
                              )}
                            </div>
                          )}

                          {proj.imageFileIds && proj.imageFileIds.length > 0 && (
                            <div className="flex items-center gap-1 pt-2">
                              <ImageIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{proj.imageFileIds.length} attached images</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents & Certifications */}
            <div className="editorial-card p-6 space-y-4">
              <h2 className="text-lg font-display font-semibold">Documents & Certifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Certifications</h3>
                  {studentProfile?.certificationFileIds && studentProfile.certificationFileIds.length > 0 ? (
                    <div className="space-y-2">
                      {studentProfile.certificationFileIds.map((id, idx) => (
                        <a key={id} href={getFilePreviewUrl(id)} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted transition-colors text-sm">
                          <Award className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">Certification Document {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">None uploaded.</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Academic Docs</h3>
                  {studentProfile?.academicDocFileIds && studentProfile.academicDocFileIds.length > 0 ? (
                    <div className="space-y-2">
                      {studentProfile.academicDocFileIds.map((id, idx) => (
                        <a key={id} href={getFilePreviewUrl(id)} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-muted transition-colors text-sm">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate">Academic Record {idx + 1}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">None uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            {/* Contact & Links */}
            <div className="editorial-card p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Contact & Links</h2>
              <div className="space-y-3 text-sm">
                {email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /><span className="truncate">{email}</span></div>}
                {phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /><span>{phone}</span></div>}
                {whatsapp && <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary" /><span>{whatsapp}</span></div>}
                {linkedinUrl && <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" /><a href={linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">{linkedinUrl.replace(/^https?:\/\//,'')}</a></div>}
                {githubUrl && <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" /><a href={githubUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">{githubUrl.replace(/^https?:\/\//,'')}</a></div>}
                {portfolioUrl && <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4 text-primary" /><a href={portfolioUrl} target="_blank" rel="noreferrer" className="hover:underline truncate">Portfolio Website</a></div>}
                {studentProfile?.resumeFileId && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <a href={getFilePreviewUrl(studentProfile.resumeFileId)} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">Download Resume</a>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="editorial-card p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills</h2>
              {selectedSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium border border-border">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="editorial-card p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preferences</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Role Type</span>
                  <span className="font-medium">{desiredRoleType || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Industry</span>
                  <span className="font-medium">{preferredIndustry || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs mb-0.5">Location Pref.</span>
                  <span className="font-medium">{locationPreference || "-"} ({workMode})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── EDIT MODE ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      {/* Hidden Datalists for Autocomplete */}
      <datalist id="universities">
        {UNIVERSITIES_LIST.map(u => <option key={u} value={u} />)}
      </datalist>
      <datalist id="cities">
        {CITIES_LIST.map(c => <option key={c} value={c} />)}
      </datalist>
      <datalist id="skill-suggestions">
        {SKILL_SUGGESTIONS.map(s => <option key={s} value={s} />)}
      </datalist>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-foreground">
            Edit Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update your information below.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsEditing(false)}
            variant="outline"
            className="font-semibold text-sm rounded-md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {/* ─── Profile Media ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Profile Photo & Resume</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted border overflow-hidden shrink-0 flex items-center justify-center relative">
                {profilePhoto ? (
                  <img src={URL.createObjectURL(profilePhoto)} alt="Preview" className="w-full h-full object-cover" />
                ) : studentProfile?.profilePhotoFileId ? (
                  <Image src={getFilePreviewUrl(studentProfile.profilePhotoFileId)} alt="Existing" fill style={{ objectFit: "cover" }} />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <Input type="file" accept="image/*" onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)} className="text-xs h-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Resume (PDF)</Label>
            <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="text-xs h-9" />
            {studentProfile?.resumeFileId && !resumeFile && (
              <p className="text-[10px] text-muted-foreground">A resume is already uploaded.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Basic Info & Contact ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <User className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Basic Info & Contact</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input 
              list="cities" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="San Francisco, CA" 
              className="rounded-md" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email (Optional)</Label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com" 
                className="pl-8 rounded-md" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="+1 (555) 000-0000" 
                className="pl-8 rounded-md" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">WhatsApp (Optional)</Label>
            <div className="relative">
              <MessageCircle className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
                placeholder="+1 (555) 000-0000" 
                className="pl-8 rounded-md" 
              />
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell recruiters about yourself..." className="rounded-md" rows={3} />
        </div>
      </div>

      {/* ─── Education & Documents ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <GraduationCap className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Education & Documents</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Institution</Label>
            <Input 
              list="universities"
              value={institution} 
              onChange={(e) => setInstitution(e.target.value)} 
              placeholder="UC Berkeley" 
              className="rounded-md" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Degree</Label>
            <Input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="B.S., B.A., MBA..." className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Field of Study</Label>
            <Input value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} placeholder="Business, Computer Science, Design..." className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Graduation Year</Label>
            <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2025" type="number" className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">GPA</Label>
            <Input value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="3.8" type="number" step="0.01" className="rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
          <div className="space-y-2">
            <Label className="text-xs">Add Certifications</Label>
            <Input 
              type="file" 
              multiple 
              onChange={(e) => setCertFiles(Array.from(e.target.files || []))} 
              className="text-xs h-9" 
            />
            {studentProfile?.certificationFileIds && studentProfile.certificationFileIds.length > 0 && (
              <p className="text-[10px] text-muted-foreground">{studentProfile.certificationFileIds.length} certification(s) already uploaded.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Add Academic Docs (Transcripts, etc)</Label>
            <Input 
              type="file" 
              multiple 
              onChange={(e) => setAcademicDocFiles(Array.from(e.target.files || []))} 
              className="text-xs h-9" 
            />
            {studentProfile?.academicDocFileIds && studentProfile.academicDocFileIds.length > 0 && (
              <p className="text-[10px] text-muted-foreground">{studentProfile.academicDocFileIds.length} document(s) already uploaded.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Skills ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Code className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Skills</h2>
        </div>
        <Separator />
        
        <div className="space-y-3">
          <Label className="text-xs">Add Your Skills</Label>
          <div className="flex gap-2">
            <Input 
              list="skill-suggestions"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
              placeholder="E.g. Marketing, Python, Public Speaking..." 
              className="rounded-md max-w-sm"
            />
            <Button type="button" onClick={addCustomSkill} variant="outline" className="shrink-0 rounded-md">
              <Plus className="w-4 h-4 mr-1" /> Add Skill
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground border border-primary"
            >
              {skill}
              <button 
                onClick={() => removeSkill(skill)}
                className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedSkills.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
          )}
        </div>
      </div>

      {/* ─── Experience ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Briefcase className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Experience</h2>
        </div>
        <Separator />

        {experiences.map((exp) => (
          <div key={exp.$id} className="flex items-start justify-between p-3 rounded-md bg-muted">
            <div>
              <p className="text-sm font-semibold text-foreground">{exp.title}</p>
              <p className="text-xs text-muted-foreground">{exp.company}</p>
              {exp.description && <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>}
            </div>
            <button onClick={() => handleDeleteExperience(exp.$id)} className="text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground">Add Experience</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={newExpCompany} onChange={(e) => setNewExpCompany(e.target.value)} placeholder="Company" className="rounded-md text-sm" />
            <Input value={newExpTitle} onChange={(e) => setNewExpTitle(e.target.value)} placeholder="Title" className="rounded-md text-sm" />
          </div>
          <Textarea value={newExpDesc} onChange={(e) => setNewExpDesc(e.target.value)} placeholder="Description (optional)" className="rounded-md text-sm" rows={2} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            disabled={!newExpCompany || !newExpTitle}
            className="text-xs rounded-md"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* ─── Projects ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Code className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Projects / Portfolio Work</h2>
        </div>
        <Separator />

        {projects.map((proj) => (
          <div key={proj.$id} className="flex items-start justify-between p-3 rounded-md bg-muted">
            <div className="flex gap-4 w-full">
              {proj.thumbnailFileId && (
                <div className="w-16 h-16 relative rounded-md border overflow-hidden shrink-0">
                  <Image src={getFilePreviewUrl(proj.thumbnailFileId)} alt="thumb" fill style={{ objectFit: "cover" }} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {proj.title}
                  {proj.projectUrl && <a href={proj.projectUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" /></a>}
                </p>
                {proj.description && <p className="text-xs text-muted-foreground mt-0.5">{proj.description}</p>}
                {proj.techUsed && proj.techUsed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {proj.techUsed.map((t) => (
                      <span key={t} className="tag tag-outline text-[10px]">{t}</span>
                    ))}
                  </div>
                )}
                {proj.imageFileIds && proj.imageFileIds.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> {proj.imageFileIds.length} images</p>
                )}
              </div>
            </div>
            <button onClick={() => handleDeleteProject(proj.$id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground">Add Project / Work Sample</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} placeholder="Project title" className="rounded-md text-sm" />
            <Input value={newProjUrl} onChange={(e) => setNewProjUrl(e.target.value)} placeholder="Live URL (Optional)" className="rounded-md text-sm" />
          </div>
          <Textarea value={newProjDesc} onChange={(e) => setNewProjDesc(e.target.value)} placeholder="Description" className="rounded-md text-sm" rows={2} />
          <Input value={newProjTech} onChange={(e) => setNewProjTech(e.target.value)} placeholder="Tools/Technologies (comma-separated)" className="rounded-md text-sm" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-3 bg-muted/50 rounded-md border border-border/50">
            <div className="space-y-1.5">
              <Label className="text-xs">Project Thumbnail</Label>
              <Input type="file" accept="image/*" onChange={(e) => setNewProjThumbnail(e.target.files?.[0] || null)} className="text-xs h-8" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Additional Images</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => setNewProjImages(Array.from(e.target.files || []))} className="text-xs h-8" />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProject}
            disabled={!newProjTitle}
            className="text-xs rounded-md mt-2"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
          </Button>
        </div>
      </div>

      {/* ─── Links ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <LinkIcon className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Links</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Portfolio URL</Label>
            <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yoursite.com" className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/you" className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">GitHub URL (Optional)</Label>
            <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you" className="rounded-md" />
          </div>
        </div>
      </div>

      {/* ─── Preferences ─── */}
      <div className="editorial-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Briefcase className="w-4 h-4 text-primary" />
          <h2 className="text-base font-display font-semibold">Preferences</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Desired Role Type</Label>
            <Input value={desiredRoleType} onChange={(e) => setDesiredRoleType(e.target.value)} placeholder="Marketing Manager, Engineer..." className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Preferred Industry</Label>
            <Input value={preferredIndustry} onChange={(e) => setPreferredIndustry(e.target.value)} placeholder="Tech, Finance, Healthcare..." className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Location Preference</Label>
            <Input 
              list="cities"
              value={locationPreference} 
              onChange={(e) => setLocationPreference(e.target.value)} 
              placeholder="San Francisco, Remote" 
              className="rounded-md" 
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Work Mode</Label>
            <div className="flex gap-2">
              {["remote", "hybrid", "onsite", "any"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    workMode === mode
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save button (bottom) */}
      <div className="flex justify-end gap-2 pb-8">
        <Button
          onClick={() => setIsEditing(false)}
          variant="outline"
          className="font-semibold text-sm rounded-md"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
