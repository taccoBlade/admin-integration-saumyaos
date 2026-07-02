import React from "react";
import DashboardView from "../views/DashboardView";
import ProjectsView from "../views/ProjectsView";
import MediaView from "../views/MediaView";
import AIView from "../views/AIView";
import SettingsView from "../views/SettingsView";

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
      case "projects":
        return <ProjectsView projects={projects} />;
      case "media":
        return <MediaView />;
      case "ai":
        return <AIView />;
      case "settings":
        return <SettingsView displayName={profile.display_name} email={profile.email} />;
      default:
        return <DashboardView displayName={profile.display_name} />;
    }
  };

  return (
    <div className="flex-1 bg-[#050608] p-8 overflow-y-auto select-none">
      {renderContent()}
    </div>
  );
}
