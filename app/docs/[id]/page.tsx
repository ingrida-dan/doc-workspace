import DocumentEditor from "@/app/components/DocumentEditor";

// Per-document route. `params` is a Promise in this version of Next.js, so we
// await it (see docs/nextjs-dynamic-routes.md) and hand the plain id to the
// client editor. key={id} remounts the editor when switching documents so its
// local state resets cleanly.
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentEditor key={id} id={id} />;
}
