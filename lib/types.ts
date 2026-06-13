// The shape of a single stored document, shared across the whole app.
// Named `DocumentRecord` rather than `Document` to avoid shadowing the
// built-in DOM `Document` global type.
export type DocumentRecord = {
  /** URL-safe unique id — becomes part of the /docs/[id] URL. */
  id: string;
  /** Plain-text title. */
  title: string;
  /** Markdown source. */
  body: string;
  /** Creation time, epoch milliseconds. */
  createdAt: number;
  /** Last-modified time, epoch milliseconds. */
  updatedAt: number;
};
