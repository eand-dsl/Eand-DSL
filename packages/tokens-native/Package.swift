// swift-tools-version:5.7
import PackageDescription

let package = Package(
    name: "EandTokens",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "EandTokens", targets: ["EandTokens"]),
    ],
    targets: [
        // Generated SwiftUI tokens (EandColor / EandSpacing / EandRadius / EandIcon /
        // EandBorder / EandTypography). Regenerate with: python3 tools/build-native-tokens.py
        .target(name: "EandTokens", path: "ios"),
    ]
)
