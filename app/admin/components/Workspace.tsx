"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import DashboardView from "../views/DashboardView";
import ProjectsView from "../views/ProjectsView";
import MediaView from "../views/MediaView";
import AIView from "../views/AIView";
import SettingsView from "../views/SettingsView";
import HeroView from "../views/HeroView";
import AboutView from "../views/AboutView";
import TimelineView from "../views/TimelineView";
import ResearchView from "../views/ResearchView";
import PhotographyView from "../views/PhotographyView";
import ResumeView from "../views/ResumeView";
import SkillsView from "../views/SkillsView";
import GrowthView from "../views/GrowthView";
import VaultView from "../views/VaultView";

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  year: number;
  description: string;
  overview: string;
  status: string;
}

interface WorkspaceProps {
  activeTab: string;
  profile: {
    display_name: string;
    email: string;
  };
  projects: ProjectItem[];
}

export default function Workspace({ activeTab, profile, projects }: WorkspaceProps) {
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView displayName={profile.display_name} />;
      case "hero":
        return <HeroView />;
      case "about":
        return <AboutView />;
      case "projects":
        return <ProjectsView projects={projects} />;
      case "timeline":
        return <TimelineView projects={projects} />;
      case "research":
        return <ResearchView />;
      case "photography":
        return <PhotographyView />;
      case "resume":
        return <ResumeView />;
      case "skills":
        return <SkillsView />;
      case "media":
        return <MediaView />;
      case "ai":
        return <AIView projects={projects} />;
      case "vault":
        return <VaultView />;
      case "growth":
        return <GrowthView projects={projects} />;
      case "settings":
        return <SettingsView displayName={profile.display_name} email={profile.email} />;
      default:
        return <DashboardView displayName={profile.display_name} />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto w-full max-w-7xl"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
