'use client';

import { useState, useEffect } from 'react';

export interface FreelancerProfile {
  skills: string[];
}

export function useFreelancerProfile(address?: string) {
  const [profile, setProfile] = useState<FreelancerProfile>({ skills: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    // Load profile from localStorage
    const key = `archire-profile-${address.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse profile:', error);
      }
    }
    
    setIsLoading(false);
  }, [address]);

  const updateSkills = (skills: string[]) => {
    if (!address) return;

    const newProfile = { ...profile, skills };
    setProfile(newProfile);

    // Save to localStorage
    const key = `archire-profile-${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(newProfile));
  };

  return {
    profile,
    isLoading,
    updateSkills,
  };
}
