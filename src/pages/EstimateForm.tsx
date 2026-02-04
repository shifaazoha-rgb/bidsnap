import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { EstimateInput } from "../types/estimate";
// Runtime imports
import { apiGenerateEstimate } from "../lib/bidsnapApi";
// Type-only import
import type { BidSnapInputs } from "../lib/bidsnapApi";

const PROJECT_TYPES = [
  { value: "Painting", icon: "🎨", label: "Painting" },
  { value: "Kitchen Remodel", icon: "🍳", label: "Kitchen Remodel" },
  { value: "Bathroom Renovation", icon: "🚿", label: "Bathroom Renovation" },
  { value: "Flooring", icon: "🪵", label: "Flooring" },
  { value: "Electrical Work", icon: "⚡", label: "Electrical Work" },
  { value: "Plumbing", icon: "🔧", label: "Plumbing" },
  { value: "General Renovation", icon: "🏠", label: "General Renovation" },
] as const;

const QUALITY_LEVELS = [
  {
    value: "basic",
    label: "Basic",
    icon: "⭐",
    description: "Budget-friendly materials",
    color: "from-gray-400 to-gray-500",
  },
  {
    value: "standard",
    label: "Standard",
    icon: "⭐⭐",
    description: "Quality & value balanced",
    color: "from-[#60A5FA] to-[#2563EB]",
  },
  {
    value: "premium",
    label: "Premium",
    icon: "⭐⭐⭐",
    description: "Top-tier materials & finish",
    color: "from-amber-400 to-amber-600",
  },
] as const;

export default function EstimateForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EstimateInput>({
    defaultValues: {
      projectType: "",
      areaSquareFeet: undefined,
      qualityLevel: undefined,
      location: "",
      notes: "",
    },
  });

  const selectedQuality = watch("qualityLevel");

  const onSubmit = async (data: EstimateInput) => {
    setIsSubmitting(true);

    try {
      const inputs: BidSnapInputs = {
        projectType: data.projectType,
        areaSqft: Number(data.areaSquareFeet),
        location: data.location,
        qualityLevel: data.qualityLevel,
        additionalSpec: data.notes || "",
      };

      const quote = await apiGenerateEstimate(inputs);
      // Local backend generates everything in one go currently.

      navigate("/quotedashboard", { state: { quote, estimateInput: inputs } });
    } catch (e) {
      console.error(e);
      alert("Failed to generate estimate. Check your Google Script WebApp URL.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF]">
      {/* Header */}
      <div className="bg-[#0F172A] relative overflow-hidden text-white px-4 py-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/10 rounded-full blur-[80px]" />
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-white/80 hover:text-white mb-4 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">New Estimate</h1>
              <p className="text-white/60 text-base font-medium">
                Generate an accurate, professional quote in seconds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 -mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Type */}
          <div className="bg-white rounded-3xl p-8 shadow-premium-lg border border-[#E2E8F0]">
            <label className="flex items-center gap-3 text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">🏗️</span>
              Project Type <span className="text-[#3B82F6]">*</span>
            </label>
            <select
              {...register("projectType", { required: "Select a project type" })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-base"
              aria-invalid={!!errors.projectType}
            >
              <option value="">Choose project type...</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.projectType.message}
              </p>
            )}
          </div>

          {/* Area */}
          <div className="bg-white rounded-3xl p-8 shadow-premium-lg border border-[#E2E8F0]">
            <label className="flex items-center gap-3 text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">📐</span>
              Area <span className="text-[#3B82F6]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100000}
                placeholder="Enter area"
                {...register("areaSquareFeet", {
                  required: "Enter square footage",
                  valueAsNumber: true,
                  validate: (v) =>
                    !Number.isNaN(v) && v > 0 && v < 100001
                      ? true
                      : "Enter 1–100,000 sq ft",
                })}
                className="w-full px-4 py-3.5 pr-16 rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-invalid={!!errors.areaSquareFeet}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] font-medium bg-[#F1F6FF] px-2 py-1 rounded-lg text-sm border border-[#DBEAFE]">
                sq ft
              </span>
            </div>
            {errors.areaSquareFeet && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.areaSquareFeet.message}
              </p>
            )}
          </div>

          {/* Quality Level */}
          <div className="bg-white rounded-3xl p-8 shadow-premium-lg border border-[#E2E8F0]">
            <label className="flex items-center gap-3 text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">✨</span>
              Quality Level <span className="text-[#3B82F6]">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUALITY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${selectedQuality === level.value
                    ? "border-[#A8E6CF] bg-[#F3FFF7] shadow-md shadow-[#A8E6CF]/20"
                    : "border-[#E5E7EB] bg-white hover:border-[#A8E6CF]/50 hover:bg-[#F3FFF7]"
                    }`}
                >
                  <input
                    type="radio"
                    value={level.value}
                    {...register("qualityLevel", { required: "Select a quality level" })}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-white text-sm font-bold mb-2`}
                  >
                    {level.value === "basic" ? "B" : level.value === "standard" ? "S" : "P"}
                  </div>
                  <p className="font-semibold text-[#1F2937] text-sm">{level.label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{level.description}</p>
                  {selectedQuality === level.value && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </label>
              ))}
            </div>
            {errors.qualityLevel && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.qualityLevel.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-3xl p-8 shadow-premium-lg border border-[#E2E8F0]">
            <label className="flex items-center gap-3 text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">📍</span>
              Location <span className="text-[#3B82F6]">*</span>
            </label>
            <input
              type="text"
              placeholder="City or PIN code"
              {...register("location", {
                required: "Enter city or PIN code",
                minLength: { value: 3, message: "At least 3 characters" },
              })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-base"
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.location.message}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-3xl p-8 shadow-premium-lg border border-[#E2E8F0]">
            <label className="flex items-center gap-3 text-sm font-bold text-[#0F172A] mb-5 uppercase tracking-wider">
              <span className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-xl shadow-sm">📝</span>
              Additional Notes <span className="text-[#94A3B8] font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Any specific requirements, materials, or details..."
              {...register("notes", { maxLength: { value: 500, message: "Max 500 characters" } })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#E2E8F0] bg-[#F8FAFF] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-all text-base resize-none"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group w-full py-5 rounded-2xl font-black text-white text-xl bg-[#3B82F6] hover:bg-[#1D4ED8] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_40px_rgba(29,78,216,0.4)] flex items-center justify-center gap-4 border border-[#DBEAFE] hover:-translate-y-1"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Your Quote...</span>
              </>
            ) : (
              <>
                <span>💰</span>
                <span>Generate Estimate</span>
              </>
            )}
          </button>

          <p className="text-center text-[#6B7280] text-sm">
            Our AI will analyze your project and generate a detailed quote in seconds
          </p>
        </form>
      </div>
    </div>
  );
}
