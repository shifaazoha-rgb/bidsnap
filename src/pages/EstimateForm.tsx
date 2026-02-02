import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { EstimateInput, QuoteData } from "../types/estimate";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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
    color: "from-[#CDEAC0] to-[#A7D7A0]",
  },
  {
    value: "premium",
    label: "Premium",
    icon: "⭐⭐⭐",
    description: "Top-tier materials & finish",
    color: "from-amber-400 to-amber-600",
  },
] as const;

type FormData = EstimateInput;

export default function EstimateForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      projectType: "",
      areaSquareFeet: undefined,
      qualityLevel: undefined,
      location: "",
      notes: "",
    },
  });

  const selectedQuality = watch("qualityLevel");

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/estimates/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to generate estimate");
      }
      const quote: QuoteData = await res.json();
      navigate(`/quote/${quote.id}`, { state: { quote } });
    } catch (e) {
      console.error(e);
      navigate("/quote/mock-1", { state: { estimateInput: data } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF6FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F8BBD0] via-[#F48FB1] to-[#F48FB1] text-[#4A1D2F] px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#4A1D2F]/80 hover:text-[#4A1D2F] mb-4 text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">New Estimate</h1>
              <p className="text-[#4A1D2F]/70 text-sm">
                Fill in project details for an instant AI quote
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8 -mt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Type */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">🏗️</span>
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register("projectType", { required: "Select a project type" })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#EAD7E1] bg-[#FFF6FA] text-[#1F2937] focus:outline-none focus:border-[#F48FB1] focus:bg-white transition-all text-base"
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
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">📐</span>
              Area <span className="text-red-500">*</span>
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
                className="w-full px-4 py-3.5 pr-16 rounded-xl border-2 border-[#EAD7E1] bg-[#FFF6FA] text-[#1F2937] focus:outline-none focus:border-[#F48FB1] focus:bg-white transition-all text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-invalid={!!errors.areaSquareFeet}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-medium bg-[#F3FAF5] px-2 py-1 rounded-lg text-sm border border-[#EAD7E1]">
                sq ft
              </span>
            </div>
            {errors.areaSquareFeet && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.areaSquareFeet.message}
              </p>
            )}
          </div>

          {/* Quality Level - Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">✨</span>
              Quality Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {QUALITY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${
                    selectedQuality === level.value
                      ? "border-[#F48FB1] bg-[#FFF6FA] shadow-md shadow-[#F48FB1]/20"
                      : "border-[#EAD7E1] bg-white hover:border-[#F48FB1]/50 hover:bg-[#FFF6FA]"
                  }`}
                >
                  <input
                    type="radio"
                    value={level.value}
                    {...register("qualityLevel", {
                      required: "Select a quality level",
                    })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-white text-sm font-bold mb-2`}>
                    {level.value === "basic" ? "B" : level.value === "standard" ? "S" : "P"}
                  </div>
                  <p className="font-semibold text-[#1F2937] text-sm">{level.label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{level.description}</p>
                  {selectedQuality === level.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[#F48FB1] rounded-full flex items-center justify-center">
                      <span className="text-[#4A1D2F] text-xs">✓</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">📍</span>
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="City or PIN code"
              {...register("location", {
                required: "Enter city or PIN code",
                minLength: {
                  value: 3,
                  message: "At least 3 characters",
                },
              })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#EAD7E1] bg-[#FFF6FA] text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F48FB1] focus:bg-white transition-all text-base"
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <span>⚠️</span> {errors.location.message}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#EAD7E1]">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#1F2937] mb-4">
              <span className="w-8 h-8 rounded-lg bg-[#F3FAF5] border border-[#EAD7E1] flex items-center justify-center text-lg">📝</span>
              Additional Notes <span className="text-[#6B7280] font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Any specific requirements, materials, or details..."
              {...register("notes", {
                maxLength: {
                  value: 500,
                  message: "Max 500 characters",
                },
              })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-[#EAD7E1] bg-[#FFF6FA] text-[#1F2937] placeholder:text-[#6B7280] focus:outline-none focus:border-[#F48FB1] focus:bg-white transition-all text-base resize-none"
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
            className="w-full py-4 rounded-xl font-semibold text-[#4A1D2F] text-lg bg-[#F8BBD0] hover:bg-[#F48FB1] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-[#F48FB1]/20 hover:shadow-xl hover:shadow-[#F48FB1]/25 flex items-center justify-center gap-3 border border-[#EAD7E1]"
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
