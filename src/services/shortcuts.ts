import { Linking } from "react-native";

// Opens the new-automation sheet. iOS does not let an app fill in the Transaction trigger.
const NEW_AUTOMATION = "shortcuts://create-automation";

export async function openShortcutAutomation(): Promise<boolean> {
  try {
    await Linking.openURL(NEW_AUTOMATION);
    return true;
  } catch {
    return false;
  }
}
