"use client";

import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApplyJobMutation, useUploadCVAndApplyMutation } from "@/redux/features/applications/applicationApi";
import { Button } from "@/components/ui/Btn";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, File, Loader2, Upload, X } from "lucide-react";

function ApplyForm() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [applyJob, { isLoading }] = useApplyJobMutation();
  const [uploadCVAndApply, { isLoading: isUploadingCV }] = useUploadCVAndApplyMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedSalary, setExpectedSalary] = useState<number | "">("");
  const [availableDate, setAvailableDate] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");

  // Handle CV file selection
  const handleCVFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setCvFile(file);
  };

  // Remove uploaded CV
  const handleRemoveCV = () => {
    setCvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // At least ONE of resume text OR CV file must be provided
    const hasResumeText = resume.trim().length > 0;
    const hasCVFile = cvFile !== null;

    if (!hasResumeText && !hasCVFile) {
      newErrors.resume = "Please provide at least one: resume text or CV file";
    }
    
    // Validate resume text if provided
    if (hasResumeText) {
      if (resume.trim().length < 10) {
        newErrors.resume = "Resume text must be at least 10 characters";
      } else if (resume.trim().length > 2000) {
        newErrors.resume = "Resume text cannot exceed 2000 characters";
      }
    }

    if (coverLetter && coverLetter.length > 2000) {
      newErrors.coverLetter = "Cover letter cannot exceed 2000 characters";
    }

    if (expectedSalary !== "" && (expectedSalary as number) < 0) {
      newErrors.expectedSalary = "Salary must be a positive number";
    }

    if (availableDate) {
      const selectedDate = new Date(availableDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.availableDate = "Available date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    if (!jobId) {
      toast.error("Job ID is missing");
      return;
    }

    try {
      setSubmitError("");

      // ✅ DEBUG: Check token before submission
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        toast.error('You are not logged in. Please login first.');
        navigate('/auth/sign-in');
        return;
      }

      // If user uploaded CV file, use the upload endpoint
      if (cvFile) {
        const formData = new FormData();
        formData.append("cv", cvFile);
        formData.append("jobId", jobId);
        
        // ✅ IMPORTANT: Include resume text if user provided both
        if (resume.trim()) {
          // Check if resume is a URL
          const isUrl = /^https?:\/\/.+/i.test(resume.trim());
          if (isUrl) {
            // If URL, send as resumeLink (backend will save to resumeUrl field)
            formData.append("resumeLink", resume.trim());
          } else {
            // If text, send as resume
            formData.append("resume", resume.trim());
          }
        }
        
        if (coverLetter) formData.append("coverLetter", coverLetter);
        if (expectedSalary) formData.append("expectedSalary", expectedSalary.toString());
        if (availableDate) formData.append("availableDate", availableDate);

        await uploadCVAndApply(formData).unwrap();
      } else {
        // If user provided resume text/URL only, use regular apply endpoint
        // Check if resume is a URL
        const isUrl = /^https?:\/\/.+/i.test(resume.trim());
        
        console.log('📝 Submitting without file:', {
          isUrl,
          resumeLength: resume.trim().length,
          hasToken: !!localStorage.getItem('token')
        });
        
        if (isUrl) {
          // If URL, send as resumeLink AND include dummy resume to pass validation
          console.log('🔗 Sending as resumeLink:', resume.trim());
          await applyJob({
            jobId,
            resume: "URL provided in resumeLink field", // ✅ Dummy text to pass BE validation
            resumeLink: resume.trim(),
            coverLetter: coverLetter || undefined,
            expectedSalary: expectedSalary ? (expectedSalary as number) : undefined,
            availableDate: availableDate || undefined,
          }).unwrap();
        } else {
          // If text, send as resume
          console.log('📄 Sending as resume text');
          await applyJob({
            jobId,
            resume: resume.trim(),
            coverLetter: coverLetter || undefined,
            expectedSalary: expectedSalary ? (expectedSalary as number) : undefined,
            availableDate: availableDate || undefined,
          }).unwrap();
        }
      }

      toast.success("Application submitted successfully!");

      // Reset form
      setResume("");
      setCoverLetter("");
      setExpectedSalary("");
      setAvailableDate("");
      setCvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Redirect to applications list after 2 seconds
      setTimeout(() => {
        navigate("/job-seeker/applications");
      }, 2000);
    } catch (err: any) {
      const errorMessage = err?.data?.message || err?.message || "Failed to submit application";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full ">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Apply for this Job</h2>
        <p className="text-gray-600 mb-8">Fill out the form below to submit your application</p>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Application Error</h3>
              <p className="text-red-700 text-sm mt-1">{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Upload CV (PDF only)
              <span className="text-gray-500 font-normal ml-1">
                {resume.trim() ? "(Optional - you have resume text)" : "(Required if no resume text)"}
              </span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleCVFileSelect}
                className="hidden"
                disabled={isLoading || isUploadingCV}
              />

              {!cvFile ? (
                <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to select a PDF file
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Max 5MB • PDF only</p>
                </div>
              ) : (
                <div className="text-center">
                  <File className="mx-auto h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900">{cvFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    onClick={handleRemoveCV}
                    disabled={isLoading || isUploadingCV}
                    className="mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    <X size={16} />
                    Change File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Resume/CV Text Field */}
          <div>
            <label htmlFor="resume" className="block text-sm font-semibold text-gray-900 mb-2">
              Resume/CV Text
              <span className="text-gray-500 font-normal ml-1">
                {cvFile ? "(Optional - you uploaded a file)" : "(Required if no file uploaded)"}
              </span>
            </label>
            <Textarea
              id="resume"
              placeholder="Paste your resume content or URL (e.g., https://example.com/resume.pdf)"
              value={resume}
              onChange={(e) => {
                setResume(e.target.value);
                if (errors.resume) setErrors({ ...errors, resume: "" });
              }}
              className={`w-full border rounded-lg p-3 min-h-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.resume ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.resume && (
              <p className="text-red-600 text-sm mt-2 flex gap-1">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errors.resume}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              {resume.length}/2000 characters
              {!cvFile && resume.length === 0 && " • Required if no file uploaded"}
              {cvFile && " • Optional (you already uploaded a file)"}
            </p>
          </div>

          {/* Cover Letter Field */}
          <div>
            <label htmlFor="coverLetter" className="block text-sm font-semibold text-gray-900 mb-2">
              Cover Letter
              <span className="text-gray-500 font-normal ml-1">(Optional)</span>
            </label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you're interested in this position..."
              value={coverLetter}
              onChange={(e) => {
                setCoverLetter(e.target.value);
                if (errors.coverLetter) setErrors({ ...errors, coverLetter: "" });
              }}
              maxLength={2000}
              className={`w-full border rounded-lg p-3 min-h-24 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.coverLetter ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.coverLetter && (
              <p className="text-red-600 text-sm mt-2 flex gap-1">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errors.coverLetter}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">{coverLetter.length}/2000 characters</p>
          </div>

          {/* Expected Salary Field */}
          <div>
            <label htmlFor="salary" className="block text-sm font-semibold text-gray-900 mb-2">
              Expected Salary
              <span className="text-gray-500 font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-600 font-medium">₫</span>
              <Input
                id="salary"
                type="number"
                placeholder="50,000,000"
                value={expectedSalary}
                onChange={(e) => {
                  setExpectedSalary(e.target.value ? Number(e.target.value) : "");
                  if (errors.expectedSalary) setErrors({ ...errors, expectedSalary: "" });
                }}
                className={`w-full pl-8 border rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.expectedSalary ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                min="0"
              />
            </div>
            {errors.expectedSalary && (
              <p className="text-red-600 text-sm mt-2 flex gap-1">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errors.expectedSalary}
              </p>
            )}
          </div>

          {/* Available Date Field */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-900 mb-2">
              Available Start Date
              <span className="text-gray-500 font-normal ml-1">(Optional)</span>
            </label>
            <Input
              id="date"
              type="date"
              value={availableDate}
              onChange={(e) => {
                setAvailableDate(e.target.value);
                if (errors.availableDate) setErrors({ ...errors, availableDate: "" });
              }}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.availableDate ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.availableDate && (
              <p className="text-red-600 text-sm mt-2 flex gap-1">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errors.availableDate}
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">📋 Tips:</span>
          </p>
          <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1 list-disc">
            <li>You can provide <strong>both</strong> a PDF file and resume text</li>
            <li>PDF file will be stored as the primary CV (visible to recruiters)</li>
            <li>Resume text can be additional info or a backup URL</li>
            <li>At least one option (file or text) is required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ApplyForm;
