import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Hero from '../components/marketing/Hero.jsx';
import Features from '../components/marketing/Features.jsx';
import Showcase from '../components/marketing/Showcase.jsx';
import Partners from '../components/marketing/Partners.jsx';
import Testimonials from '../components/marketing/Testimonials.jsx';
import CTA from '../components/marketing/CTA.jsx';

export default function Landing() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Show loading or nothing while checking auth status
  if (!isLoaded) {
    return null;
  }

  // Only show landing page if user is not signed in
  if (isSignedIn) {
    return null;
  }

  return (
    <div className="bg-white">
      <Hero />
      <Features />
      <Showcase />
      <Testimonials />
      <Partners />
      <CTA />
    </div>
  );
}
