import type { Metadata } from "next";
import Sidebar from "@/app/components/Sidebar";
import WorkspaceShell from "@/app/components/WorkspaceShell";

export const metadata: Metadata = {
  title: "Workspace — Doc Workspace",
};

// Shared layout for the /docs subtree (this page and future /docs/[id]).
// Wraps every workspace route in the two-pane shell with the sidebar.
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell sidebar={<Sidebar />}>{children}</WorkspaceShell>;
}
