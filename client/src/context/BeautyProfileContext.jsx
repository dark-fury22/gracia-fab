import { useState, useEffect } from "react";
import { BeautyProfileContext } from "../hooks/useBeautyProfile";

// One shared profile every AI tool (Advisor, Skin Analysis, Skin Tone
// Detector, Routine Generator) reads from and writes to, so a shopper
// never has to re-enter the same skin/hair details twice. Persisted to
// localStorage so it survives a refresh or a detour to register/login.
const DEFAULT_PROFILE = {
  shoppingFor: "", // skincare | haircare | wig | bridal | everything
  skinType: "",
  skinConcerns: "",
  hairType: "",
  hairConcerns: "",
  ageRange: "",
  budget: "",
  occasion: "",
  weddingDate: "",
  bridalStyle: "",
  skinTone: null, // { id, label, hex } from the Skin Tone Detector
};

const STORAGE_KEY = "beautyProfile";

export function BeautyProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const updateProfile = (partial) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasProfile = Boolean(
    profile.skinType || profile.hairType || profile.shoppingFor,
  );

  return (
    <BeautyProfileContext.Provider
      value={{ profile, updateProfile, resetProfile, hasProfile }}
    >
      {children}
    </BeautyProfileContext.Provider>
  );
}
