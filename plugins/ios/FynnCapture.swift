import AppIntents
import Foundation

// A payment captured by the Shortcuts app is appended to a small queue file in the app's
// Documents folder. Fynn imports and clears it the next time it is opened. Nothing leaves the
// device and the intent never touches the ledger database directly, so it cannot corrupt it.
enum FynnCaptureQueue {
  static let fileName = "fynn-captures.jsonl"

  static var url: URL {
    FileManager.default
      .urls(for: .documentDirectory, in: .userDomainMask)[0]
      .appendingPathComponent(fileName)
  }

  static func append(_ phrase: String) throws {
    let entry: [String: String] = [
      "phrase": phrase,
      "at": ISO8601DateFormatter().string(from: Date()),
    ]
    var data = try JSONSerialization.data(withJSONObject: entry)
    data.append(0x0A)

    if FileManager.default.fileExists(atPath: url.path) {
      let handle = try FileHandle(forWritingTo: url)
      defer { try? handle.close() }
      try handle.seekToEnd()
      try handle.write(contentsOf: data)
    } else {
      try data.write(to: url, options: .atomic)
    }
  }
}

@available(iOS 16.0, *)
struct AddToFynnIntent: AppIntent {
  static var title: LocalizedStringResource = "Add payment to Fynn"
  static var description = IntentDescription(
    "Saves a payment such as \"Jumbo 18500\" in your Fynn ledger without opening the app."
  )
  static var openAppWhenRun: Bool = false

  @Parameter(title: "Payment", description: "Merchant and amount, for example Jumbo 18500")
  var phrase: String

  static var parameterSummary: some ParameterSummary {
    Summary("Add \(\.$phrase) to Fynn")
  }

  func perform() async throws -> some IntentResult & ProvidesDialog {
    let trimmed = phrase.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else {
      throw $phrase.needsValueError("What did you pay for?")
    }
    try FynnCaptureQueue.append(trimmed)
    return .result(dialog: "Saved. It will be in Fynn when you open it.")
  }
}

@available(iOS 16.0, *)
struct FynnShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: AddToFynnIntent(),
      phrases: ["Add a payment to \(.applicationName)"],
      shortTitle: "Add payment",
      systemImageName: "plus.circle"
    )
  }
}
