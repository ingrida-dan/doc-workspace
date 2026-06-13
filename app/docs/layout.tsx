import type { Metadata } from "next";
import DocumentsProvider from "@/app/components/DocumentsProvider";
import Sidebar from "@/app/components/Sidebar";
import WorkspaceShell from "@/app/components/WorkspaceShell";

export const metadata: Metadata = {
  title: "Workspace — Doc Workspace",
};

// Shared layout for the /docs subtree (this page and future /docs/[id]).
// The DocumentsProvider wraps both panes so the sidebar and the content area
// share one live document list. Wraps every workspace route in the two-pane
// shell with the sidebar.
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocumentsProvider>
      <WorkspaceShell sidebar={<Sidebar />}>{children}</WorkspaceShell>
    </DocumentsProvider>
  );
}
