/** Historical document cards — newspaper texture + text overlay */
import { STORY_DOCUMENTS } from "../data/storyDocuments.js";
import { DOCUMENT_TEXTURE } from "../data/imageAssets.js";

export function getDocument(docId) {
  return STORY_DOCUMENTS[docId] || null;
}

export function getDocumentArtUrl() {
  return DOCUMENT_TEXTURE;
}
