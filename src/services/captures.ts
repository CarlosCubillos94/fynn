import { parseCaptureLines } from "@/services/captureLines";
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const QUEUE = "fynn-captures.jsonl";
const CLAIMED = ".claimed";

export type CaptureBatch = {
  phrases: string[];
  // Delete the claimed files only after every phrase has been saved or handed to the user.
  commit: () => void;
};

// Claim whatever the Shortcuts intent queued, so a payment arriving mid-import lands in a fresh
// file instead of being lost. Claimed files that a crash left behind are picked up next time.
export async function readCaptures(): Promise<CaptureBatch | null> {
  if (Platform.OS !== "ios") return null;
  try {
    const documents: Directory = Paths.document;
    const queue = new File(documents, QUEUE);
    if (queue.exists) {
      queue.move(new File(documents, `fynn-captures-${Date.now()}${CLAIMED}`));
    }
    const claimed = documents
      .list()
      .filter((entry): entry is File => entry instanceof File)
      .filter((entry) => entry.name.startsWith("fynn-captures-") && entry.name.endsWith(CLAIMED));
    if (claimed.length === 0) return null;
    const texts = await Promise.all(claimed.map((entry) => entry.text()));
    const phrases = texts.flatMap((text) => parseCaptureLines(text));
    return {
      phrases,
      commit: () => {
        for (const entry of claimed) {
          try {
            entry.delete();
          } catch {
            continue;
          }
        }
      },
    };
  } catch {
    return null;
  }
}

let running = false;

// One import at a time for the whole app. Home can mount more than once, and two readers would
// both see the same claimed file and save every payment twice.
export async function importCaptures(handle: (phrases: string[]) => Promise<void>): Promise<void> {
  if (running) return;
  running = true;
  try {
    const batch = await readCaptures();
    if (!batch) return;
    if (batch.phrases.length > 0) await handle(batch.phrases);
    batch.commit();
  } finally {
    running = false;
  }
}
