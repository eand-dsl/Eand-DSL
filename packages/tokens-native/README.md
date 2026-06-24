# @eand/tokens-native

Native e& design tokens, generated from the single source of truth (`variables.json`)
— the same file the web package consumes, so colors/spacing/type never drift across
web, iOS, and Android.

```
ios/EandTokens.swift          SwiftUI  — EandColor, EandSpacing, EandRadius, EandIcon, EandBorder, EandTypography
android/EandTokens.kt         Compose  — EandColor, EandSpacing, EandRadius, EandIcon, EandBorder, EandTypography
android/res/values/colors.xml Android resources (@color/...)
android/res/values/dimens.xml Android resources (@dimen/...)
Package.swift                 Swift Package (SwiftPM) exposing the EandTokens library
```

## Regenerate

```bash
python3 tools/build-native-tokens.py
```

Reads `../../variables.json`. Never hand-edit the generated files — change the Figma
variables, re-export `variables.json`, and re-run.

## iOS (SwiftUI)

Add the package via Swift Package Manager (point at this folder / repo), then:

```swift
import SwiftUI
import EandTokens

struct PlanRow: View {
    var body: some View {
        Text("2 GB left")
            .foregroundColor(EandColor.textDefaultDefault)
            .padding(EandSpacing.lg)
            .background(EandColor.surfaceRaisedDefault)
            .cornerRadius(EandRadius.radius3)
    }
}
```

Text styles:

```swift
let s = EandTypography.titleMd
Text("My Plan").font(.system(size: s.size, weight: s.weight))
```

## Android (Jetpack Compose)

Copy `android/EandTokens.kt` into your module (package `com.eand.tokens`) or wire this
folder as a Gradle source set, then:

```kotlin
import com.eand.tokens.EandColor
import com.eand.tokens.EandSpacing
import com.eand.tokens.EandRadius

Text(
    "2 GB left",
    color = EandColor.textDefaultDefault,
    modifier = Modifier
        .background(EandColor.surfaceRaisedDefault)
        .padding(EandSpacing.lg),
    style = EandTypography.titleMd,
)
```

Or use the XML resources directly: `@color/text_default_default`, `@dimen/spacing_lg`.

## Notes

- Colors carry alpha (e.g. white `a90` → `rgba`/`#E6FFFFFF`).
- `Suisse Int'l` is the type family (commercial license); load the font in-app and apply
  it to the generated text styles.
- Icons ship separately — see `@eand/icons` (mirrors the e& App Icons Figma library).
