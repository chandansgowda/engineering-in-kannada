import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Testimonial } from "../types";
import defaultTestimonials from "../data/testimonials.json";

interface TestimonialsState {
  testimonials: Testimonial[];
  hasSubmitted: boolean;
  userTestimonialId: string | null;
  addTestimonial: (data: Omit<Testimonial, "id" | "date">) => boolean;
  removeOwnTestimonial: () => void;
}

export const useTestimonialsStore = create<TestimonialsState>()(
  persist(
    (set, get) => ({
      testimonials: (defaultTestimonials as Testimonial[]) ?? [],
      hasSubmitted: false,
      userTestimonialId: null,

      addTestimonial: (data) => {
        // Enforce: each visitor can only submit once
        if (get().hasSubmitted) {
          return false;
        }

        const id = `testimonial-${Date.now()}`;
        const newTestimonial: Testimonial = {
          ...data,
          id,
          date: new Date().toISOString(),
        };

        set((state) => ({
          testimonials: [newTestimonial, ...state.testimonials],
          hasSubmitted: true,
          userTestimonialId: id,
        }));

        return true;
      },

      removeOwnTestimonial: () => {
        const id = get().userTestimonialId;
        if (!id) return;

        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id),
          hasSubmitted: false,
          userTestimonialId: null,
        }));
      },
    }),
    {
      name: "eik-testimonials-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

