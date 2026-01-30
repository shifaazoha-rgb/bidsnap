import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import type { EstimateInput, QuoteData } from "../types/estimate";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const PROJECT_TYPES = [
  "Painting",
  "Kitchen Remodel",
  "Bathroom Renovation",
  "Flooring",
  "Electrical Work",
  "Plumbing",
  "General Renovation",
] as const;

type FormData = EstimateInput;

export default function EstimateForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
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
      // Fallback: navigate with form data so quote page can show mock
      navigate("/quote/mock-1", { state: { estimateInput: data } });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--color-background)]">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/"
          className="text-[var(--color-primary)] hover:underline mb-6 inline-block font-medium"
        >
          ← Back
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          New Estimate
        </h1>
        <p className="text-[var(--color-neutral)] mb-8">
          Enter project details. We’ll generate a detailed quote.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0"
        >
          {/* Project Type */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-4 md:p-6 shadow-[var(--shadow-sm)]">
            <label
              htmlFor="projectType"
              className="block text-sm font-medium text-[#0f172a] mb-2"
            >
              Project Type <span className="text-[var(--color-error)]">*</span>
            </label>
            <select
              id="projectType"
              {...register("projectType", { required: "Select a project type" })}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-neutral)]/30 bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              aria-invalid={!!errors.projectType}
            >
              <option value="">Choose type...</option>
              {PROJECT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                {errors.projectType.message}
              </p>
            )}
          </div>

          {/* Area */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-4 md:p-6 shadow-[var(--shadow-sm)]">
            <label
              htmlFor="areaSquareFeet"
              className="block text-sm font-medium text-[#0f172a] mb-2"
            >
              Area <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="relative">
              <input
                id="areaSquareFeet"
                type="number"
                min={1}
                max={100000}
                placeholder="0"
                {...register("areaSquareFeet", {
                  required: "Enter square footage",
                  valueAsNumber: true,
                  validate: (v) =>
                    !Number.isNaN(v) && v > 0 && v < 100001
                      ? true
                      : "Enter 1–100,000 sq ft",
                })}
                className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-neutral)]/30 bg-white text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-invalid={!!errors.areaSquareFeet}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-neutral)] text-sm">
                sq ft
              </span>
            </div>
            {errors.areaSquareFeet && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                {errors.areaSquareFeet.message}
              </p>
            )}
          </div>

          {/* Quality Level */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-4 md:p-6 shadow-[var(--shadow-sm)]">
            <span className="block text-sm font-medium text-[#0f172a] mb-3">
              Quality Level <span className="text-[var(--color-error)]">*</span>
            </span>
            <div className="flex flex-wrap gap-4">
              {(["basic", "standard", "premium"] as const).map((level) => (
                <label
                  key={level}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={level}
                    {...register("qualityLevel", {
                      required: "Select a quality level",
                    })}
                    className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-neutral)]/30 focus:ring-[var(--color-primary)]"
                    aria-invalid={!!errors.qualityLevel}
                  />
                  <span className="text-[#0f172a] capitalize">{level}</span>
                </label>
              ))}
            </div>
            {errors.qualityLevel && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                {errors.qualityLevel.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-4 md:p-6 shadow-[var(--shadow-sm)]">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-[#0f172a] mb-2"
            >
              Location <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              id="location"
              type="text"
              placeholder="City or ZIP code"
              {...register("location", {
                required: "Enter city or ZIP",
                minLength: {
                  value: 3,
                  message: "At least 3 characters",
                },
              })}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-neutral)]/30 bg-white text-[#0f172a] placeholder:text-[var(--color-neutral)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              aria-invalid={!!errors.location}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Additional Notes – full width */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-neutral)]/20 bg-white p-4 md:p-6 shadow-[var(--shadow-sm)] md:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-[#0f172a] mb-2"
            >
              Additional Notes <span className="text-[var(--color-neutral)]">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Any extra details..."
              {...register("notes", {
                maxLength: {
                  value: 500,
                  message: "Max 500 characters",
                },
              })}
              className="w-full px-4 py-3 rounded-[var(--radius-md)] border border-[var(--color-neutral)]/30 bg-white text-[#0f172a] placeholder:text-[var(--color-neutral)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-y"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-[var(--color-error)]">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit – full width */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-[var(--radius-md)] font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-neutral)] disabled:cursor-not-allowed transition-colors shadow-[var(--shadow-md)] flex items-center justify-center gap-2 md:col-span-2"
          >
            {isSubmitting ? (
              <>
                <span
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  aria-hidden
                />
                Generating...
              </>
            ) : (
              "Generate Estimate"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
