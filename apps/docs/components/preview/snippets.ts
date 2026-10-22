import type { Snippet } from './code-tabs';

// Native snippets show how to build the e& look from @eand/tokens-native (EandColor /
// EandSpacing / EandRadius / EandTypography / EandScale / EandIcon / EandBorder and the
// component-size enums). Every Eand* name is a real generated token — checked against
// packages/tokens-native. React shows the @eand/react-design-system component as used in
// the Figma Make kit. Geometry follows the Figma DSL V1.2 published symbols.
//
// Radius scale: radius1 4 · radius2 6 · radius3 8 · radius4 12 · radius5 14 · radius6 16 ·
// radius7 20 · radius8 24 · radius9 pill. Helper views are named so they never shadow a
// token namespace (CheckboxView, not EandCheckbox).
export const snippets: Record<string, Snippet> = {
  button: {
    swift: `import SwiftUI
import EandTokens

// V1.2 button: pill, lg 48 / md 40 / sm 32 tall, inline inset 16 / 16 / 10.
// Secondary is a 1pt INSIDE stroke (strokeBorder), so it never grows the box.
// Tertiary and link hug their text: no height, no padding.
struct EandButton: View {
  enum Variant { case primary, secondary, tertiary }
  let title: String
  var variant: Variant = .primary
  var action: () -> Void
  var body: some View {
    Button(action: action) {
      Text(title)
        .font(.system(size: EandTypography.buttonLg.size, weight: EandTypography.buttonLg.weight))
        .foregroundColor(ink)
        .padding(.horizontal, variant == .tertiary ? 0 : EandSpacing.lg)
        .frame(minWidth: variant == .tertiary ? nil : EandScale.scale48,
               minHeight: variant == .tertiary ? nil : EandScale.scale48)
        .background(variant == .primary ? EandColor.buttonPrimarySurfaceBrandDefault : .clear)
        .overlay {
          if variant == .secondary {
            Capsule().strokeBorder(EandColor.buttonSecondaryBorderBrandDefault, lineWidth: EandBorder.sm)
          }
        }
        .clipShape(Capsule())
    }
  }
  private var ink: Color {
    switch variant {
    case .primary: return EandColor.buttonPrimaryTextBrandDefault
    case .secondary: return EandColor.buttonSecondaryTextBrandDefault
    case .tertiary: return EandColor.buttonTertiaryTextBrandDefault
    }
  }
}`,
    kotlin: `import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import com.eand.tokens.*

// V1.2 button: pill, lg 48 / md 40 / sm 32 tall, inline inset 16 / 16 / 10.
// Secondary = 1dp stroke drawn inside; tertiary and link hug their text.
enum class ButtonVariant { Primary, Secondary, Tertiary }

@Composable
fun EandButton(title: String, variant: ButtonVariant = ButtonVariant.Primary, onClick: () -> Unit) {
  val ink = when (variant) {
    ButtonVariant.Primary -> EandColor.buttonPrimaryTextBrandDefault
    ButtonVariant.Secondary -> EandColor.buttonSecondaryTextBrandDefault
    ButtonVariant.Tertiary -> EandColor.buttonTertiaryTextBrandDefault
  }
  if (variant == ButtonVariant.Tertiary) {
    TextButton(onClick, contentPadding = PaddingValues(0.dp), modifier = Modifier.defaultMinSize(1.dp, 1.dp)) {
      Text(title, style = EandTypography.buttonLg, color = ink)
    }
    return
  }
  Button(
    onClick = onClick,
    shape = CircleShape,
    modifier = Modifier.heightIn(min = EandScale.scale48).widthIn(min = EandScale.scale48),
    contentPadding = PaddingValues(horizontal = EandSpacing.lg),
    colors = ButtonDefaults.buttonColors(
      containerColor = if (variant == ButtonVariant.Primary) EandColor.buttonPrimarySurfaceBrandDefault else Color.Transparent),
    border = if (variant == ButtonVariant.Secondary)
      BorderStroke(EandBorder.sm, EandColor.buttonSecondaryBorderBrandDefault) else null,
  ) { Text(title, style = EandTypography.buttonLg, color = ink) }
}`,
    react: `import { Button, Icon } from '@eand/react-design-system';

<Button variant="primary" size="lg" block>Make your own deal</Button>
<Button variant="secondary">Overview</Button>          {/* 1px inside stroke */}
<Button variant="tertiary">Not now</Button>            {/* hugs its label */}
<Button variant="link" size="md">Terms apply</Button>  {/* body text, underline on press */}

{/* scheme re-colours the set: default = red, inverse = white (on red / dark), midnight = ink */}
<Button scheme="inverse" trailingIcon={<Icon name="chevron-right" size={16} />}>Continue</Button>`,
  },

  uaepassbutton: {
    swift: `import SwiftUI
import EandTokens

// button-uae-pass: 48pt pill, min 48 wide, padding 12, no fill, 1pt inside stroke.
// 24pt UAE PASS logo, then the button/lg label (4 + 4 inset). lg only, no pressed state.
// Disabled: the stroke and label take the disabled tokens, the logo dims to 34%.
struct UaePassButton: View {
  var title = "Login with UAE PASS"     // or "Continue with UAE PASS"
  var disabled = false
  var action: () -> Void
  var body: some View {
    Button(action: action) {
      HStack(spacing: 0) {
        Image("uae-pass-logo")            // the third-party mark, exported from Figma 39861:22255
          .resizable().frame(width: EandIcon.xl, height: EandIcon.xl)
          .opacity(disabled ? 0.34 : 1)
        Text(title)
          .font(.system(size: EandTypography.buttonLg.size, weight: EandTypography.buttonLg.weight))
          .foregroundColor(disabled ? EandColor.buttonSecondaryTextMidnightDisabled
                                    : EandColor.buttonSecondaryTextMidnightDefault)
          .padding(.horizontal, EandSpacing.sm)
      }
      .padding(EandSpacing.md)
      .frame(minWidth: EandScale.scale48, minHeight: EandScale.scale48)
      .overlay(Capsule().strokeBorder(
        disabled ? EandColor.buttonSecondaryBorderBrandDisabled : EandColor.buttonSecondaryTextMidnightDefault,
        lineWidth: EandBorder.sm))
    }
    .disabled(disabled)
  }
}`,
    kotlin: `import androidx.compose.foundation.border
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// button-uae-pass: 48dp pill, padding 12, no fill, 1dp stroke, 24dp logo + button/lg label.
// Disabled: disabled stroke + label tokens, logo at 34% (unbound in Figma).
@Composable
fun UaePassButton(title: String = "Login with UAE PASS", enabled: Boolean = true, onClick: () -> Unit) {
  Row(
    Modifier
      .heightIn(min = EandScale.scale48).widthIn(min = EandScale.scale48)
      .clip(CircleShape)
      .border(EandBorder.sm,
        if (enabled) EandColor.buttonSecondaryTextMidnightDefault else EandColor.buttonSecondaryBorderBrandDisabled,
        CircleShape)
      .clickable(enabled = enabled, onClick = onClick)
      .padding(EandSpacing.md),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Image(painterResource(R.drawable.uae_pass_logo), null,
      Modifier.size(EandIcon.xl).alpha(if (enabled) 1f else 0.34f))
    Text(title, style = EandTypography.buttonLg,
      color = if (enabled) EandColor.buttonSecondaryTextMidnightDefault else EandColor.buttonSecondaryTextMidnightDisabled,
      modifier = Modifier.padding(horizontal = EandSpacing.sm))
  }
}`,
    react: `import { UaePassButton } from '@eand/react-design-system';

<UaePassButton block onClick={signIn} />               {/* "Login with UAE PASS" */}
<UaePassButton variant="continue" />                   {/* "Continue with UAE PASS" */}
<UaePassButton variant="rtl" />                        {/* Arabic label, logo after the text */}
<UaePassButton disabled />`,
  },

  badge: {
    swift: `import SwiftUI
import EandTokens

// V1.2 badge: sm 16 / md 20 / lg 24 tall, min width 40 / 56 / 64,
// radius 6 / 6 / 8 (radius2, radius2, radius3). Optional trailing chevron.
struct OfferBadge: View {
  let text: String
  var chevron = false
  var body: some View {
    HStack(spacing: 0) {
      Text(text).font(.system(size: EandTypography.badgeMd.size, weight: EandTypography.badgeMd.weight))
      if chevron {
        Image(systemName: "chevron.right").font(.system(size: EandIcon.sm - 2, weight: .bold))
          .frame(width: EandIcon.md, height: EandIcon.md)          // 12pt glyph box
      }
    }
    .foregroundColor(EandColor.badgeTextOffersNewPlan)
    .padding(.vertical, EandSpacing.xs)
    .padding(.leading, EandSpacing.sm)
    .padding(.trailing, chevron ? 0 : EandSpacing.sm)
    .frame(minWidth: EandScale.scale56).frame(height: EandScale.scale20)
    .background(EandColor.badgeSurfaceOffersNewPlan)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius2))   // md = 6
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 badge: sm 16 / md 20 / lg 24 tall, min width 40 / 56 / 64, radius 6 / 6 / 8.
@Composable
fun OfferBadge(text: String, chevron: Boolean = false) {
  val shape = RoundedCornerShape(EandRadius.radius2)   // md = 6
  Row(
    Modifier
      .height(EandScale.scale20).widthIn(min = EandScale.scale56)
      .background(EandColor.badgeSurfaceOffersNewPlan, shape)
      .padding(start = EandSpacing.sm, end = if (chevron) 0.dp else EandSpacing.sm),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.Center,
  ) {
    Text(text, style = EandTypography.badgeMd, color = EandColor.badgeTextOffersNewPlan)
    if (chevron) Icon(Icons.Filled.ChevronRight, null, Modifier.size(EandIcon.md),
      tint = EandColor.badgeTextOffersNewPlan)
  }
}`,
    react: `import { Badge } from '@eand/react-design-system';

<Badge offer="new-plan">New</Badge>                  {/* md: 20 tall, radius 6 */}
<Badge offer="discount" size="lg">20% off</Badge>    {/* lg: 24 tall, radius 8 */}
<Badge status="positive" chevron>3 active</Badge>    {/* trailing chevron-right */}`,
  },

  statusindicator: {
    swift: `import SwiftUI
import EandTokens

// status-indicator: 8pt dot (in a 12pt box) + badge/md label, padded 4 start / 8 end.
//   basic  16 tall, no surface, label in the status ink
//   pill   24 tall, status tint, default ink
//   glass  32 tall, white 5% + frost (glass-dark: inverse ink)
struct StatusIndicator: View {
  enum Kind { case basic, pill, glass }
  let label: String
  var kind: Kind = .basic
  var body: some View {
    HStack(spacing: 0) {
      Circle().fill(EandColor.statusIndicatorTextPositive)
        .frame(width: EandIcon.xs, height: EandIcon.xs)
        .frame(width: EandIcon.sm, height: EandIcon.sm)
      Text(label)
        .font(.system(size: EandTypography.badgeMd.size))
        .foregroundColor(kind == .basic ? EandColor.statusIndicatorTextPositive : EandColor.textDefaultDefault)
    }
    .padding(.leading, EandSpacing.xs).padding(.trailing, EandSpacing.sm)
    .frame(height: kind == .basic ? EandScale.scale16 : kind == .pill ? EandScale.scale24 : EandScale.scale32)
    .background(kind == .pill ? EandColor.statusIndicatorSurfacePositive
                : kind == .glass ? EandColor.surfaceGlassWhiteXs : .clear)
    .background { if kind == .glass { Rectangle().fill(.ultraThinMaterial) } }   // glass frost
    .clipShape(Capsule())
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// status-indicator: 8dp dot in a 12dp box + badge/md label, padded 4 start / 8 end.
// basic 16 tall (no surface) · pill 24 tall (status tint) · glass 32 tall (white 5% + blur).
enum class IndicatorType { Basic, Pill, Glass }

@Composable
fun StatusIndicator(label: String, type: IndicatorType = IndicatorType.Basic) {
  val height = when (type) {
    IndicatorType.Basic -> EandScale.scale16
    IndicatorType.Pill -> EandScale.scale24
    IndicatorType.Glass -> EandScale.scale32
  }
  val surface = when (type) {
    IndicatorType.Basic -> Color.Transparent
    IndicatorType.Pill -> EandColor.statusIndicatorSurfacePositive
    IndicatorType.Glass -> EandColor.surfaceGlassWhiteXs
  }
  Row(
    Modifier.height(height).background(surface, CircleShape)
      .padding(start = EandSpacing.xs, end = EandSpacing.sm),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Box(Modifier.size(EandIcon.sm), contentAlignment = Alignment.Center) {
      Box(Modifier.size(EandIcon.xs).background(EandColor.statusIndicatorTextPositive, CircleShape))
    }
    Text(label, style = EandTypography.badgeMd,
      color = if (type == IndicatorType.Basic) EandColor.statusIndicatorTextPositive else EandColor.textDefaultDefault)
  }
}`,
    react: `import { StatusIndicator } from '@eand/react-design-system';

<StatusIndicator status="positive">Active</StatusIndicator>                 {/* basic */}
<StatusIndicator type="pill" status="warning">Expiring soon</StatusIndicator>
<StatusIndicator type="glass" status="danger">Overdue</StatusIndicator>     {/* over imagery */}
<StatusIndicator type="glass-dark" status="neutral" dot={false}>Paused</StatusIndicator>`,
  },

  chip: {
    swift: `import SwiftUI
import EandTokens

// V1.2 chip: 40 tall, min 72 wide, body/md, padding 12 (8 before a 16pt marker).
// Outline = 1pt stroke; selected fills midnight with no stroke.
struct EandChip: View {
  let label: String; let selected: Bool
  var body: some View {
    Text(label)
      .font(.system(size: EandTypography.bodyMd.size))
      .foregroundColor(selected ? EandColor.chipsDefaultOutlineTextSelected
                                : EandColor.chipsDefaultOutlineTextDefault)
      .padding(.horizontal, EandSpacing.md)
      .frame(minWidth: EandScale.scale72, minHeight: EandTabs.heightMd)
      .background(selected ? EandColor.chipsDefaultOutlineSurfaceSelected : .clear)
      .overlay {
        if !selected {
          Capsule().strokeBorder(EandColor.chipsDefaultOutlineBorderDefault, lineWidth: EandBorder.sm)
        }
      }
      .clipShape(Capsule())
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// V1.2 chip: 40 tall, min 72 wide, body/md. Outline = 1dp stroke; selected = midnight fill.
@Composable
fun EandChip(label: String, selected: Boolean, onClick: () -> Unit) {
  Box(
    Modifier
      .heightIn(min = EandTabs.heightMd).widthIn(min = EandScale.scale72)
      .clip(CircleShape)
      .background(if (selected) EandColor.chipsDefaultOutlineSurfaceSelected else Color.Transparent)
      .then(if (selected) Modifier
            else Modifier.border(EandBorder.sm, EandColor.chipsDefaultOutlineBorderDefault, CircleShape))
      .clickable(onClick = onClick)
      .padding(horizontal = EandSpacing.md),
    contentAlignment = Alignment.Center,
  ) {
    Text(label, style = EandTypography.bodyMd,
      color = if (selected) EandColor.chipsDefaultOutlineTextSelected else EandColor.chipsDefaultOutlineTextDefault)
  }
}`,
    react: `import { Chip, Icon } from '@eand/react-design-system';

<Chip type="outline" selected check>Manage my Plan</Chip>
<Chip type="outline">Change Plan</Chip>
<Chip type="filled" leadingIcon={<Icon name="sim" size={12} />}>eSIM</Chip>
<Chip type="outline" selected onDismiss={() => removeFilter('5G')}>5G</Chip>  {/* removable */}`,
  },

  topbar: {
    swift: `import SwiftUI
import EandTokens

// V1.2 header: a 4pt-inset rounded card (36 top / 20 bottom) on brand, midnight, white or
// none. The middle (logo or page name) is always centred; back + 40pt glass links either
// side. Big-title block padded 16/16/0, then the add-on slot (16pt rhythm).
struct TopBar<AddOns: View>: View {
  var onBack: (() -> Void)?
  @ViewBuilder var addOns: AddOns
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      ZStack {
        EtisalatLogo(scheme: .white, size: 40)          // lockup; red on white / none
        HStack {
          if let onBack { TopBarLink(icon: "chevron.left", action: onBack) }
          Spacer()
          TopBarLink(icon: "wand.and.stars") {}
          TopBarLink(icon: "bell") {}
        }
      }
      .padding(.horizontal, EandSpacing.lg)
      VStack(alignment: .leading, spacing: 0) {
        Text("Overline").font(.system(size: EandTypography.bodyMd.size))
        Text("Large title goes here")                    // heading/lg style: 24 / 110%
          .font(.system(size: EandTypography.headingLg.size, weight: EandTypography.headingLg.weight))
        Text("Lorem ipsum dolor sit amet.").font(.system(size: EandTypography.bodyLg.size))
          .padding(.top, EandSpacing.sm)
      }
      .padding([.top, .horizontal], EandSpacing.lg)
      VStack(spacing: EandSpacing.lg) { addOns }         // searchbar, glass chips, tabs
        .padding([.top, .horizontal], EandSpacing.lg)
    }
    .foregroundColor(EandColor.textDefaultInverse)
    .padding(.bottom, EandSpacing.lg)
    .background(EandColor.surfaceBaseBrand)
    // 36 has no radius token yet (design question 14); the bottom binds radius7 = 20.
    .clipShape(UnevenRoundedRectangle(topLeadingRadius: 36, bottomLeadingRadius: EandRadius.radius7,
                                      bottomTrailingRadius: EandRadius.radius7, topTrailingRadius: 36))
    .padding([.top, .horizontal], EandSpacing.xs)
  }
}

// topbar-link on brand / midnight: glass inverse, white 20% + blur, icon white 75%.
struct TopBarLink: View {
  let icon: String; var action: () -> Void
  var body: some View {
    Button(action: action) {
      Image(systemName: icon).font(.system(size: EandIcon.lg))
        .foregroundColor(EandColor.sectionLinkGlassInverseIconDefault)
        .frame(width: EandScale.scale40, height: EandScale.scale40)
        .background(EandColor.sectionLinkGlassInverseSurfaceDefault, in: Circle())
    }
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 header: 4dp-inset rounded card (36 top / 20 bottom). Middle always centred,
// 40dp glass links either side, big-title block 16/16/0, add-on slot on a 16dp rhythm.
@Composable
fun TopBar(onBack: (() -> Unit)? = null, addOns: @Composable ColumnScope.() -> Unit = {}) {
  // 36 has no radius token yet (design question 14); the bottom binds radius7 = 20.
  val shape = RoundedCornerShape(topStart = 36.dp, topEnd = 36.dp,
    bottomStart = EandRadius.radius7, bottomEnd = EandRadius.radius7)
  Column(
    Modifier
      .padding(start = EandSpacing.xs, top = EandSpacing.xs, end = EandSpacing.xs)
      .fillMaxWidth()
      .background(EandColor.surfaceBaseBrand, shape)
      .padding(bottom = EandSpacing.lg),
  ) {
    Box(Modifier.fillMaxWidth().padding(horizontal = EandSpacing.lg), contentAlignment = Alignment.Center) {
      EtisalatLogo(LogoScheme.White, size = 40.dp)
      Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        onBack?.let { TopBarLink(Icons.Filled.ChevronLeft, it) }
        Spacer(Modifier.weight(1f))
        TopBarLink(Icons.Filled.AutoAwesome) {}
        TopBarLink(Icons.Filled.Notifications) {}
      }
    }
    Column(Modifier.padding(start = EandSpacing.lg, top = EandSpacing.lg, end = EandSpacing.lg)) {
      Text("Overline", style = EandTypography.bodyMd, color = EandColor.textDefaultInverse)
      Text("Large title goes here", style = EandTypography.headingLg, color = EandColor.textDefaultInverse)
      Text("Lorem ipsum dolor sit amet.", style = EandTypography.bodyLg, color = EandColor.textDefaultInverse,
        modifier = Modifier.padding(top = EandSpacing.sm))
    }
    Column(
      Modifier.padding(start = EandSpacing.lg, top = EandSpacing.lg, end = EandSpacing.lg),
      verticalArrangement = Arrangement.spacedBy(EandSpacing.lg),
      content = addOns,
    )
  }
}

@Composable
fun TopBarLink(icon: ImageVector, onClick: () -> Unit) {
  IconButton(onClick, Modifier.size(EandScale.scale40)
    .background(EandColor.sectionLinkGlassInverseSurfaceDefault, CircleShape)) {
    Icon(icon, null, Modifier.size(EandIcon.lg), tint = EandColor.sectionLinkGlassInverseIconDefault)
  }
}`,
    react: `import { TopBar, Searchbar, Chip, Icon } from '@eand/react-design-system';

<TopBar
  surface="brand"
  logo
  onBack={() => history.back()}
  actions={[<Icon name="magic-wand" />, <Icon name="notification" />]}
  eyebrow="Overline"
  bigTitle="Large title goes here"
  chevron
  subtext="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
>
  <Searchbar placeholder="Search for feature" />
  <div style={{ display: 'flex', gap: 8 }}>
    <Chip type="glass" selected check>All</Chip>
    <Chip type="glass">Plans</Chip>
  </div>
</TopBar>

{/* Pushed page: white card (or "none" on a grey / midnight canvas) with a centred page name */}
<TopBar surface="white" onBack={() => history.back()} title="Payment" subtitle="Step 2 of 3" />`,
  },

  section: {
    swift: `import SwiftUI
import EandTokens

// V1.2 section: radius 24, header padded 16/16/0 with a 40pt field row — 24pt title
// (heading/lg style) and the trigger (40pt section-link chevron, or a tertiary lg button).
// Body padded 16; its min height reserves the row for the card type it holds.
struct SectionView<Content: View>: View {
  let title: String; let context: String
  var bodyHeight: CGFloat = EandSection.bodyHeightRow3   // row-1 72 · 2 148 · 3 224 · 4 300 · 6 452
  @ViewBuilder var content: Content
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      VStack(alignment: .leading, spacing: EandSpacing.xs) {
        HStack(spacing: 0) {
          Text(title)
            .font(.system(size: EandTypography.headingLg.size, weight: EandTypography.headingLg.weight))
            .lineLimit(1)
          Spacer(minLength: EandSpacing.md)
          SectionLinkButton(action: .forward)    // 40pt, r14, solid white
        }
        .frame(minHeight: EandScale.scale40)
        Text(context).font(.system(size: EandTypography.bodyMd.size))
          .foregroundColor(EandColor.textDefaultSubtle)
      }
      .padding([.top, .horizontal], EandSpacing.lg)
      content
        .frame(maxWidth: .infinity, minHeight: bodyHeight, alignment: .topLeading)
        .padding(EandSpacing.lg)
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .background(EandColor.surfaceBaseDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius8))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 section: radius 24, header 16/16/0 (40dp field row: 24dp title + trigger),
// body padded 16 with a min height per card row.
@Composable
fun SectionView(
  title: String, context: String,
  bodyHeight: Dp = EandSection.bodyHeightRow3,   // row-1 72 · 2 148 · 3 224 · 4 300 · 6 452
  content: @Composable ColumnScope.() -> Unit,
) {
  Column(
    Modifier.fillMaxWidth()
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius8)),
  ) {
    Column(
      Modifier.padding(start = EandSpacing.lg, top = EandSpacing.lg, end = EandSpacing.lg),
      verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
    ) {
      Row(Modifier.heightIn(min = EandScale.scale40), verticalAlignment = Alignment.CenterVertically) {
        Text(title, style = EandTypography.headingLg, color = EandColor.textDefaultDefault,
          maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
        Spacer(Modifier.width(EandSpacing.md))
        SectionLinkButton(SectionLinkAction.Forward)   // 40dp, r14, solid white
      }
      Text(context, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
    }
    Column(Modifier.heightIn(min = bodyHeight).padding(EandSpacing.lg), content = content)
  }
}`,
    react: `import { Section, DealCard, FilterPill } from '@eand/react-design-system';

<Section title="Deals" context="Cover these with your Smiles Points"
  surface="default" trigger="chevron" size="md" carousel>
  <DealCard overline="Smiles" title="Control from anywhere" price="AED 49" />
  <DealCard overline="Smiles" title="Manage plans" price="AED 29" />
</Section>

{/* Text trigger (tertiary lg Button), inline filter pill and the sunset glow on midnight */}
<Section title="Your lines" surface="midnight-base" trigger="button" triggerLabel="Manage"
  filterPill={<FilterPill inverse>All lines</FilterPill>} gradient size="sm">
  …
</Section>`,
  },

  listrow: {
    swift: `import SwiftUI
import EandTokens

// V1.2 list-item (type=info): a padded r20 card. 40pt icon tile (r12, glass midnight 7%),
// title/xs + body/md subtitle; trailing value (title/xs) over a hint, then a 16pt chevron.
// type=price is flat: no surface, padding 0/0/16. Not a tap target — use ActionBar for that.
struct ListRowView: View {
  let label: String; let sublabel: String; let value: String; let hint: String
  var body: some View {
    HStack(spacing: EandSpacing.md) {
      HStack(alignment: .top, spacing: EandSpacing.sm) {
        Image(systemName: "simcard.fill")
          .frame(width: EandScale.scale32, height: EandScale.scale32)
          .padding(EandSpacing.xs)
          .background(EandColor.surfaceGlassMidnightSm, in: RoundedRectangle(cornerRadius: EandRadius.radius4))
        VStack(alignment: .leading, spacing: EandSpacing.spacing2xs) {
          Text(label).font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
          Text(sublabel).font(.system(size: EandTypography.bodyMd.size))
            .foregroundColor(EandColor.textDefaultSubtle)
        }
      }
      Spacer(minLength: 0)
      HStack(spacing: EandSpacing.xs) {
        VStack(alignment: .trailing, spacing: EandSpacing.spacing2xs) {
          Text(value).font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
          Text(hint).font(.system(size: EandTypography.bodyMd.size))
            .foregroundColor(EandColor.textDefaultSubtle)
        }
        Image(systemName: "chevron.right").font(.system(size: EandIcon.md))
          .frame(width: EandIcon.lg, height: EandIcon.lg)
      }
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .padding(EandSpacing.lg)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 list-item (info): padded r20 card, 40dp icon tile, title/xs + body/md subtitle,
// trailing value + hint, 16dp chevron. Price rows are flat (padding 0/0/16).
@Composable
fun ListRowView(label: String, sublabel: String, value: String, hint: String) {
  Row(
    Modifier.fillMaxWidth()
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius7))
      .padding(EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
      Box(
        Modifier.size(EandScale.scale40)
          .background(EandColor.surfaceGlassMidnightSm, RoundedCornerShape(EandRadius.radius4))
          .padding(EandSpacing.xs),
        contentAlignment = Alignment.Center,
      ) { Icon(Icons.Filled.SimCard, null, Modifier.size(EandScale.scale24)) }
      Column(verticalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs)) {
        Text(label, style = EandTypography.titleXs, color = EandColor.textDefaultDefault)
        Text(sublabel, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
      }
    }
    Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs)) {
      Text(value, style = EandTypography.titleXs, color = EandColor.textDefaultDefault)
      Text(hint, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
    }
    Icon(Icons.Filled.ChevronRight, null, Modifier.size(EandIcon.md))
  }
}`,
    react: `import { ListRow, Icon, Badge } from '@eand/react-design-system';

<ListRow icon={<Icon name="sim" />} label="Local data" sublabel="Renews 12 Nov"
  value="2 GB" hint="left" />
<ListRow type="price" label="Freedom Live 200" value="AED 200" chevron={false} />
<ListRow inverse surface="midnight-raised" label="Roaming" sublabel="Pay as you go"
  badge={<Badge status="positive" size="sm">On</Badge>} />`,
  },

  quickaction: {
    swift: `import SwiftUI
import EandTokens

// V1.2 quick-action cell: 148pt (row-2), padding 12, r20, raised white, no border.
// Header: 40pt r12 tile + an end-aligned lg badge; title/sm label at the bottom.
// The grid is 2-up; layout=carousel scrolls 147pt cells.
struct QuickActionCell: View {
  let label: String; let icon: Image; var badge: String? = nil
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        icon.frame(width: EandIcon.xl, height: EandIcon.xl)
          .frame(width: EandScale.scale40, height: EandScale.scale40)
          .background(EandColor.surfaceBaseDefault, in: RoundedRectangle(cornerRadius: EandRadius.radius4))
        Spacer()
        if let badge { StatusBadge(text: badge, size: .lg) }
      }
      Spacer()
      Text(label).font(.system(size: EandTypography.titleSm.size, weight: EandTypography.titleSm.weight))
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .padding(EandSpacing.md)
    .frame(maxWidth: .infinity, minHeight: EandSection.bodyHeightRow2, alignment: .leading)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 quick-action cell: 148dp (row-2), padding 12, r20, raised white, no border.
@Composable
fun QuickActionCell(label: String, icon: Painter, badge: String? = null) {
  Column(
    Modifier
      .heightIn(min = EandSection.bodyHeightRow2)
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius7))
      .padding(EandSpacing.md),
    verticalArrangement = Arrangement.SpaceBetween,
  ) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.Top) {
      Box(
        Modifier.size(EandScale.scale40)
          .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius4)),
        contentAlignment = Alignment.Center,
      ) { Icon(icon, null, Modifier.size(EandIcon.xl)) }
      Spacer(Modifier.weight(1f))
      badge?.let { StatusBadge(it, BadgeSize.Lg) }
    }
    Text(label, style = EandTypography.titleSm, color = EandColor.textDefaultDefault)
  }
}`,
    react: `import { QuickAction, Icon, Badge } from '@eand/react-design-system';

<QuickAction items={[
  { type: 'addon-buy', badge: <Badge status="positive" size="lg">3 active</Badge> },
  { type: 'mParking' },
  { label: 'Roaming', icon: <Icon name="globe-filled" /> },
  { type: 'all-services' },
]} />

{/* One row of 147px cells that scrolls horizontally */}
<QuickAction layout="carousel" items={[{ type: 'quick-pay' }, { type: 'sim-replace' }, { type: 'live-chat' }]} />`,
  },

  navbar: {
    swift: `// Floating glass pill (white 15% + blur, no border) over a midnight fade, 4 equal tabs.
// Active tab = solid white pill, red 32pt icon + body/xs label (Regular, not bold).
// Scrolling down collapses the bar to icons only.
import SwiftUI
import EandTokens

struct NavTab: View {
  let title: String; let icon: Image; let active: Bool
  var body: some View {
    VStack(spacing: 0) {
      icon.frame(width: EandIcon.icon2xl, height: EandIcon.icon2xl)
      Text(title).font(.system(size: EandTypography.bodyXs.size))
    }
    .foregroundColor(active ? EandColor.navbarTabTextSelected : EandColor.navbarTabTextDefault)
    .padding(.bottom, EandSpacing.xs)
    .frame(maxWidth: .infinity)
    .background(active ? EandColor.navbarTabSurfaceSelected : .clear)
    .clipShape(Capsule())
    .padding(.vertical, EandSpacing.xs)
  }
}

// Bar: HStack(spacing: 0) { tabs }
//   .padding(.horizontal, EandSpacing.xs)
//   .background(EandColor.surfaceGlassWhiteMd).background(.ultraThinMaterial)
//   .clipShape(Capsule())`,
    kotlin: `// Frosted white-15% pill, no border, 4 equal tabs. Active = white pill + red 32dp icon
// and a body/xs label (stays Regular).
import com.eand.tokens.*

@Composable
fun RowScope.NavTab(title: String, icon: Painter, active: Boolean, onClick: () -> Unit) {
  val ink = if (active) EandColor.navbarTabTextSelected else EandColor.navbarTabTextDefault
  Column(
    Modifier
      .weight(1f)
      .padding(vertical = EandSpacing.xs)
      .clip(CircleShape)
      .background(if (active) EandColor.navbarTabSurfaceSelected else Color.Transparent)
      .clickable(onClick = onClick)
      .padding(bottom = EandSpacing.xs),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Icon(icon, null, Modifier.size(EandIcon.icon2xl), tint = ink)
    Text(title, style = EandTypography.bodyXs, color = ink)
  }
}

// Bar: Row(Modifier.clip(CircleShape).background(EandColor.surfaceGlassWhiteMd)
//   .padding(horizontal = EandSpacing.xs)) { NavTab(…) × 4 }`,
    react: `import { NavBar, Icon } from '@eand/react-design-system';

<NavBar items={[
  { label: 'Home', icon: <Icon name="home" />, active: true },
  { label: 'Shop', icon: <Icon name="shop" /> },
  { label: 'Support', icon: <Icon name="support" /> },
  { label: 'Profile', icon: <Icon name="user" /> },
]} />

<NavBar scrollDirection="down" items={items} />   {/* collapses to icons on scroll */}`,
  },

  plancard: {
    swift: `import SwiftUI
import EandTokens

// plans-portable: 222×300 (row-4), r16, padding 16, white. Header (gap 4): overline,
// 20pt heading/md title, logo row md. Footer pinned to the bottom: lg Discount badge,
// "from", then the title/md price.
struct PlanCard: View {
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.xs) {
      Text("Postpaid").font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultSubtle)
      Text("Freedom Live 200")
        .font(.system(size: EandTypography.headingMd.size, weight: EandTypography.headingMd.weight))
        .lineLimit(2)
      LogoRow(logos: [Image("brand-smiles")], more: 4).padding(.top, EandSpacing.sm)
      Spacer(minLength: 0)
      OfferBadge(text: "Discount", size: .lg)            // red, 24pt
      Text("from").font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultSubtle)
      Text("AED 200/mo")
        .font(.system(size: EandTypography.titleMd.size, weight: EandTypography.titleMd.weight))
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .padding(EandSpacing.lg)
    .frame(width: 222, height: EandSection.bodyHeightRow4, alignment: .topLeading)
    .background(EandColor.surfaceBaseInverse)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// plans-portable: 222×300 (row-4), r16, padding 16, white. Header + bottom-pinned footer.
@Composable
fun PlanCard() {
  Column(
    Modifier
      .size(222.dp, EandSection.bodyHeightRow4)
      .background(EandColor.surfaceBaseInverse, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Text("Postpaid", style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
    Text("Freedom Live 200", style = EandTypography.headingMd, color = EandColor.textDefaultDefault, maxLines = 2)
    LogoRow(listOf(painterResource(R.drawable.brand_smiles)), more = 4,
      modifier = Modifier.padding(top = EandSpacing.sm))
    Spacer(Modifier.weight(1f))
    OfferBadge("Discount", BadgeSize.Lg)
    Text("from", style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
    Text("AED 200/mo", style = EandTypography.titleMd, color = EandColor.textDefaultDefault)
  }
}`,
    react: `import { PlanCard } from '@eand/react-design-system';

<PlanCard category="Postpaid" name="Freedom Live 200" price="AED 200" period="/mo"
  discount="20% off" moreLogos={4} />
<PlanCard colorScheme="inverse" category="Prepaid" name="Flexi 50" price="AED 50"
  from={false} discount={false} />`,
  },

  ctabar: {
    swift: `import SwiftUI
import EandTokens

// cta-bar: white card, top radius 24, shadow/md (0 0 44, midnight 10%). Action block:
// status ribbon → price line → consent line (16/20/0) → button group (20/20/0, gap 20).
// The 34pt home-indicator block is the bar's only bottom spacing — keep it.
struct CtaFooter: View {
  @State private var agreed = false
  var body: some View {
    VStack(spacing: 0) {
      StatusRibbon(status: .success, message: "Payment method saved", action: "View")
      PriceLine(label: "Total amount", value: "AED 1,250", actionLabel: "View breakdown")
      ConsentCheckbox(on: $agreed)
        .padding(.top, EandSpacing.lg).padding(.horizontal, EandSpacing.xl)
      VStack(spacing: EandSpacing.xl) {
        EandButton(title: "Continue") {}                          // lg, block
        EandButton(title: "Not now", variant: .tertiary) {}
          .padding(.vertical, EandSpacing.sm)
      }
      .padding(.top, EandSpacing.xl).padding(.horizontal, EandSpacing.xl)
      Color.clear.frame(height: 34)        // home-indicator block; on device the safe area
    }
    .background(EandColor.surfaceBaseInverse)
    .clipShape(UnevenRoundedRectangle(topLeadingRadius: EandRadius.radius8,
                                      topTrailingRadius: EandRadius.radius8))
    .shadow(color: EandColor.midnightA10, radius: 22)              // shadow/md: blur 44
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.shadow
import com.eand.tokens.*

// cta-bar: white, top radius 24, shadow/md. Ribbon → price line → consent → buttons,
// then the 34dp home-indicator block (the bar's only bottom spacing).
@Composable
fun CtaFooter() {
  var agreed by remember { mutableStateOf(false) }
  val shape = RoundedCornerShape(topStart = EandRadius.radius8, topEnd = EandRadius.radius8)
  Column(
    Modifier.fillMaxWidth()
      .shadow(22.dp, shape, ambientColor = EandColor.midnightA10, spotColor = EandColor.midnightA10)
      .background(EandColor.surfaceBaseInverse, shape),
  ) {
    StatusRibbon(RibbonStatus.Success, "Payment method saved", action = "View")
    PriceLine("Total amount", "AED 1,250", actionLabel = "View breakdown")
    ConsentCheckbox(agreed, { agreed = it },
      Modifier.padding(start = EandSpacing.xl, top = EandSpacing.lg, end = EandSpacing.xl))
    Column(
      Modifier.padding(start = EandSpacing.xl, top = EandSpacing.xl, end = EandSpacing.xl),
      verticalArrangement = Arrangement.spacedBy(EandSpacing.xl),
      horizontalAlignment = Alignment.CenterHorizontally,
    ) {
      EandButton("Continue", Modifier.fillMaxWidth()) {}
      EandButton("Not now", ButtonVariant.Tertiary, Modifier.padding(vertical = EandSpacing.sm)) {}
    }
    Spacer(Modifier.height(34.dp))   // home-indicator block; on device, the navigation-bar inset
  }
}`,
    react: `import { CtaFooter, StatusRibbon, ButtonGroup, ConsentCheckbox, Button } from '@eand/react-design-system';

<CtaFooter
  ribbon={<StatusRibbon status="success" action="View">Payment method saved</StatusRibbon>}
  price={{ label: 'Total amount', value: 'AED 1,250', actionLabel: 'View breakdown' }}
  terms={<ConsentCheckbox prefix="I accept the" links={[{ label: 'Terms & Conditions', href: '/terms' }]} />}
  actions={
    <ButtonGroup
      primary={<Button block size="lg">Continue</Button>}
      secondary={<Button block size="lg" variant="secondary">Save for later</Button>}
      tertiary={<Button variant="tertiary">Not now</Button>}
    />
  }
/>
{/* homeIndicator is on by default; surface={false} drops the white card + shadow */}`,
  },

  priceline: {
    swift: `import SwiftUI
import EandTokens

// price-line: padding 12 top / 20 sides, gap 12, top-aligned. Label body/md subtle with
// an optional tertiary md action under it (gap 2); the value is title/xs, end-aligned.
struct PriceLine: View {
  let label: String; let value: String
  var actionLabel: String? = nil
  var onAction: () -> Void = {}
  var body: some View {
    HStack(alignment: .top, spacing: EandSpacing.md) {
      VStack(alignment: .leading, spacing: EandSpacing.spacing2xs) {
        Text(label).font(.system(size: EandTypography.bodyMd.size))
          .foregroundColor(EandColor.textDefaultSubtle)
        if let actionLabel {
          Button(action: onAction) {                 // tertiary hugs: no padding
            Text(actionLabel)
              .font(.system(size: EandTypography.buttonMd.size, weight: EandTypography.buttonMd.weight))
              .foregroundColor(EandColor.buttonTertiaryTextBrandDefault)
          }
        }
      }
      Spacer(minLength: 0)
      Text(value)
        .font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
        .foregroundColor(EandColor.textDefaultDefault)
        .multilineTextAlignment(.trailing)
    }
    .padding(.top, EandSpacing.md).padding(.horizontal, EandSpacing.xl)
  }
}`,
    kotlin: `import com.eand.tokens.*

// price-line: padding 12 top / 20 sides, gap 12. Label + optional tertiary action; value end.
@Composable
fun PriceLine(label: String, value: String, actionLabel: String? = null, onAction: () -> Unit = {}) {
  Row(
    Modifier.fillMaxWidth().padding(start = EandSpacing.xl, top = EandSpacing.md, end = EandSpacing.xl),
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
    verticalAlignment = Alignment.Top,
  ) {
    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs)) {
      Text(label, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
      actionLabel?.let {
        Text(it, style = EandTypography.buttonMd, color = EandColor.buttonTertiaryTextBrandDefault,
          modifier = Modifier.clickable(onClick = onAction))
      }
    }
    Text(value, style = EandTypography.titleXs, color = EandColor.textDefaultDefault, textAlign = TextAlign.End)
  }
}`,
    react: `import { PriceLine, Icon } from '@eand/react-design-system';

<PriceLine label="Total amount" value="AED 1,250" />
<PriceLine label="Monthly charge" value="AED 200/mo"
  actionLabel="View breakdown" actionIcon={<Icon name="chevron-down" size={16} />}
  onAction={() => setOpen(true)} />`,
  },

  actionblock: {
    swift: `import SwiftUI
import EandTokens

// .action-block payment=true: the payment summary and the lg primary button share one row
// half and half (gap 2), padded 16/20/0. Without payment the button group pads 20/20/0.
// PaymentRow: 40pt r8 tile on surface/base/default, body/md number over a tertiary "Change".
struct ActionBlock: View {
  var body: some View {
    VStack(spacing: 0) {
      PriceLine(label: "Total amount", value: "AED 1,250")
      HStack(spacing: EandSpacing.spacing2xs) {
        HStack(spacing: EandSpacing.md) {
          Image("card-visa").resizable().scaledToFit()
            .frame(width: EandScale.scale40, height: EandScale.scale40)
            .background(EandColor.surfaceBaseDefault)
            .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius3))
          VStack(alignment: .leading, spacing: EandSpacing.xs) {
            Text("•••• 4326").font(.system(size: EandTypography.bodyMd.size)).lineLimit(1)
            Text("Change")
              .font(.system(size: EandTypography.buttonMd.size, weight: EandTypography.buttonMd.weight))
              .foregroundColor(EandColor.buttonTertiaryTextBrandDefault)
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        EandButton(title: "Pay now") {}.frame(maxWidth: .infinity)
      }
      .padding(.top, EandSpacing.lg).padding(.horizontal, EandSpacing.xl)
    }
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// .action-block payment=true: payment summary + lg primary button, half each (gap 2),
// padded 16/20/0 under the price line.
@Composable
fun ActionBlock() {
  Column(Modifier.fillMaxWidth()) {
    PriceLine("Total amount", "AED 1,250")
    Row(
      Modifier.padding(start = EandSpacing.xl, top = EandSpacing.lg, end = EandSpacing.xl),
      horizontalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
        verticalAlignment = Alignment.CenterVertically) {
        Image(painterResource(R.drawable.card_visa), null,
          Modifier.size(EandScale.scale40).clip(RoundedCornerShape(EandRadius.radius3))
            .background(EandColor.surfaceBaseDefault))
        Column(verticalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
          Text("•••• 4326", style = EandTypography.bodyMd, maxLines = 1)
          Text("Change", style = EandTypography.buttonMd, color = EandColor.buttonTertiaryTextBrandDefault)
        }
      }
      EandButton("Pay now", Modifier.weight(1f)) {}
    }
  }
}`,
    react: `import { ActionBlock, PaymentRow, StatusRibbon, Button } from '@eand/react-design-system';

{/* The CTA bar's content without the bar — e.g. a sheet footer or an inline summary */}
<ActionBlock
  ribbon={<StatusRibbon status="info">Price includes 5% VAT</StatusRibbon>}
  price={{ label: 'Total amount', value: 'AED 1,250' }}
  payment={<PaymentRow icon={<img src="/cards/visa.svg" alt="Visa" />} label="•••• 4326" />}
  actions={<Button block size="lg">Pay now</Button>}
/>`,
  },

  consentcheckbox: {
    swift: `import SwiftUI
import EandTokens

// checkbox-variants: a 20pt checkbox, gap 8, then ONE wrapping body/md run —
// prefix · link · "and" · link · suffix. Links are body/md link ink, no underline.
// Tapping a link opens it; tapping the box toggles it.
struct ConsentCheckbox: View {
  @Binding var on: Bool
  var body: some View {
    HStack(alignment: .top, spacing: EandSpacing.sm) {
      CheckboxMark(on: on).onTapGesture { on.toggle() }     // see Checkbox
      Text("Agree to the [Terms & Conditions](eand://terms) and [Privacy Policy](eand://privacy) before proceeding")
        .font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultDefault)
        .tint(EandColor.buttonLinkTextBrandDefault)
    }
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(on ? .isSelected : [])
  }
}`,
    kotlin: `import androidx.compose.foundation.selection.toggleable
import androidx.compose.ui.text.*
import com.eand.tokens.*

// checkbox-variants: 20dp checkbox, gap 8, one wrapping body/md run with two links.
// Links do not toggle the box.
@Composable
fun ConsentCheckbox(checked: Boolean, onCheckedChange: (Boolean) -> Unit, modifier: Modifier = Modifier,
                    onTerms: () -> Unit = {}, onPrivacy: () -> Unit = {}) {
  val link = TextLinkStyles(SpanStyle(color = EandColor.buttonLinkTextBrandDefault))
  val copy = buildAnnotatedString {
    append("Agree to the ")
    withLink(LinkAnnotation.Clickable("terms", link) { onTerms() }) { append("Terms & Conditions") }
    append(" and ")
    withLink(LinkAnnotation.Clickable("privacy", link) { onPrivacy() }) { append("Privacy Policy") }
    append(" before proceeding")
  }
  Row(modifier, horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
    CheckboxMark(checked, Modifier.toggleable(checked, role = Role.Checkbox, onValueChange = onCheckedChange))
    Text(copy, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault)
  }
}`,
    react: `import { ConsentCheckbox } from '@eand/react-design-system';

<ConsentCheckbox
  prefix="Agree to the"
  links={[
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', onClick: () => openPrivacy() },
  ]}
  suffix="before proceeding"
  checked={agreed}
  onChange={(e) => setAgreed(e.currentTarget.checked)}
/>
<ConsentCheckbox inverse prefix="I accept the" links={[{ label: 'Terms' }]} />  {/* on brand / midnight */}`,
  },

  snackbar: {
    swift: `import SwiftUI
import EandTokens

// Snack-bar: midnight pill, r16, min 48 tall, padding 2/8/2/2, gap 10. The mark is a
// 44pt r14 tile on the status tint holding a 24pt filled glyph. Message body/md in
// inverse ink; an optional primary/sm/inverse button sits at the end.
struct Snackbar: View {
  let message: String
  var action: String? = nil
  var body: some View {
    HStack(spacing: 10) {
      Image(systemName: "checkmark.circle.fill").font(.system(size: EandIcon.xl))
        .foregroundColor(EandColor.alertMessageTextInfo)
        .frame(width: 44, height: 44)
        .background(EandColor.statusIndicatorSurfacePositive,
                    in: RoundedRectangle(cornerRadius: EandRadius.radius5))
      Text(message).font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultInverse)
      Spacer(minLength: 0)
      if let action { InverseButton(title: action, size: .sm) {} }   // white fill, ink label
    }
    .padding(.vertical, EandSpacing.spacing2xs)
    .padding(.leading, EandSpacing.spacing2xs).padding(.trailing, EandSpacing.sm)
    .frame(minHeight: EandScale.scale48)
    .background(EandColor.surfaceBaseMidnight)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// Snack-bar: midnight pill, r16, min 48, padding 2/8/2/2, gap 10; 44dp r14 status tile.
@Composable
fun Snackbar(message: String, action: String? = null, onAction: () -> Unit = {}) {
  Row(
    Modifier.fillMaxWidth().heightIn(min = EandScale.scale48)
      .background(EandColor.surfaceBaseMidnight, RoundedCornerShape(EandRadius.radius6))
      .padding(start = EandSpacing.spacing2xs, top = EandSpacing.spacing2xs,
               end = EandSpacing.sm, bottom = EandSpacing.spacing2xs),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(10.dp),
  ) {
    Box(
      Modifier.size(44.dp)
        .background(EandColor.statusIndicatorSurfacePositive, RoundedCornerShape(EandRadius.radius5)),
      contentAlignment = Alignment.Center,
    ) { Icon(Icons.Filled.CheckCircle, null, Modifier.size(EandIcon.xl), tint = EandColor.alertMessageTextInfo) }
    Text(message, style = EandTypography.bodyMd, color = EandColor.textDefaultInverse, modifier = Modifier.weight(1f))
    action?.let { InverseButton(it, ButtonSize.Sm, onAction) }
  }
}`,
    react: `import { Snackbar } from '@eand/react-design-system';

<Snackbar status="success" message="Your changes were saved" />
<Snackbar status="info" message="Recharge successful:" aed="AED 25" action="Undo" onAction={undo} />
<Snackbar status="loader" message="Saving…" backdrop />   {/* bottom-of-screen fade */}`,
  },

  alert: {
    swift: `import SwiftUI
import EandTokens

// alert-message: padding 8, gap 12, r16 on the status-indicator tint. Mark = 32pt r12
// tile (padding 6) on the status colour with a 16pt white filled glyph. Title title/xs and
// body body/md, both default ink. The action is a primary / sm / inverse button.
struct AlertMessage: View {
  let title: String; let message: String
  var action: String? = nil
  var body: some View {
    HStack(alignment: .center, spacing: EandSpacing.md) {
      Image(systemName: "checkmark.circle.fill").font(.system(size: EandIcon.md))
        .foregroundColor(EandColor.textDefaultInverse)
        .frame(width: EandScale.scale32, height: EandScale.scale32)
        .background(EandColor.statusPositive, in: RoundedRectangle(cornerRadius: EandRadius.radius4))
      VStack(alignment: .leading, spacing: 0) {
        Text(title).font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
        Text(message).font(.system(size: EandTypography.bodyMd.size))
      }
      .foregroundColor(EandColor.textDefaultDefault)
      Spacer(minLength: 0)
      if let action { InverseButton(title: action, size: .sm) {} }
    }
    .padding(EandSpacing.sm)
    .background(EandColor.statusIndicatorSurfacePositive)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// alert-message: padding 8, gap 12, r16 on the status tint; 32dp r12 mark tile.
@Composable
fun AlertMessage(title: String, message: String, action: String? = null, onAction: () -> Unit = {}) {
  Row(
    Modifier.fillMaxWidth()
      .background(EandColor.statusIndicatorSurfacePositive, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.sm),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Box(
      Modifier.size(EandScale.scale32)
        .background(EandColor.statusPositive, RoundedCornerShape(EandRadius.radius4)),
      contentAlignment = Alignment.Center,
    ) { Icon(Icons.Filled.CheckCircle, null, Modifier.size(EandIcon.md), tint = EandColor.textDefaultInverse) }
    Column(Modifier.weight(1f)) {
      Text(title, style = EandTypography.titleXs, color = EandColor.textDefaultDefault)
      Text(message, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault)
    }
    action?.let { InverseButton(it, ButtonSize.Sm, onAction) }
  }
}`,
    react: `import { Alert } from '@eand/react-design-system';

<Alert status="success" title="You're all set!" action="Done" onAction={close}>
  Your request was completed successfully.
</Alert>
<Alert status="warning" title="Payment failed" action="Retry" actionPlacement="below">
  We couldn't charge your card ending 4326.
</Alert>
<Alert status="info-midnight" title="New: eSIM transfer">Move your number in under a minute.</Alert>`,
  },

  alertmodal: {
    swift: `import SwiftUI
import EandTokens

// V1.2 alert-modal is a success screen, not a dialog. Full-screen on surface/base/default
// (or a bottom sheet over the Scrim): close (top-end, glass) → visual → centred title
// block padded 32/16/48 → footer padded 20.
struct AlertModal<Visual: View, Footer: View>: View {
  let title: String; let description: String
  var onClose: () -> Void
  @ViewBuilder var visual: Visual
  @ViewBuilder var footer: Footer
  var body: some View {
    VStack(spacing: 0) {
      HStack { Spacer(); CloseLink(glass: true, action: onClose) }   // 40pt section-link
        .padding([.top, .horizontal], EandSpacing.xl)
      visual.padding([.top, .horizontal], EandSpacing.xs)
      VStack(spacing: EandSpacing.xs) {
        Text(title)                    // typography/heading/lg variables: 28 / 120%, bold
          .font(.system(size: EandTypography.headingXl.size, weight: .bold))
        Text(description).font(.system(size: EandTypography.bodyLg.size))
      }
      .multilineTextAlignment(.center)
      .foregroundColor(EandColor.textDefaultDefault)
      .padding(.top, EandSpacing.spacing3xl).padding(.horizontal, EandSpacing.lg)
      .padding(.bottom, EandSpacing.spacing5xl)
      Spacer(minLength: 0)
      footer.padding(EandSpacing.xl)
    }
    .background(EandColor.surfaceBaseDefault.ignoresSafeArea())
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import com.eand.tokens.*

// V1.2 alert-modal: a full-screen success screen on surface/base/default.
// Close (top-end) → visual → centred title block (32/16/48) → footer (20).
@Composable
fun AlertModal(title: String, description: String, onClose: () -> Unit,
               visual: @Composable () -> Unit, footer: @Composable () -> Unit) {
  Column(Modifier.fillMaxSize().background(EandColor.surfaceBaseDefault)) {
    Row(Modifier.fillMaxWidth().padding(start = EandSpacing.xl, top = EandSpacing.xl, end = EandSpacing.xl),
      horizontalArrangement = Arrangement.End) { CloseLink(glass = true, onClick = onClose) }
    Box(Modifier.padding(start = EandSpacing.xs, top = EandSpacing.xs, end = EandSpacing.xs)) { visual() }
    Column(
      Modifier.fillMaxWidth().padding(start = EandSpacing.lg, top = EandSpacing.spacing3xl,
        end = EandSpacing.lg, bottom = EandSpacing.spacing5xl),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
    ) {
      // typography/heading/lg variables: 28 / 120%
      Text(title, style = EandTypography.headingXl.copy(lineHeight = 33.6.sp),
        color = EandColor.textDefaultDefault, textAlign = TextAlign.Center)
      Text(description, style = EandTypography.bodyLg, color = EandColor.textDefaultDefault,
        textAlign = TextAlign.Center)
    }
    Spacer(Modifier.weight(1f))
    Box(Modifier.padding(EandSpacing.xl)) { footer() }
  }
}`,
    react: `import { AlertModal, Button } from '@eand/react-design-system';

<AlertModal open integration="full-screen"
  visual={<img src="/illustrations/success.png" alt="" style={{ width: '100%' }} />}
  title="Your new plan is active"
  description="Freedom Live 200 starts today. We've emailed you the details."
  footer={<Button block size="lg">Back to home</Button>}
  onClose={() => router.back()} />

{/* The same content as a sheet over the Scrim */}
<AlertModal open integration="bottom-sheet" title="Payment received"
  description="AED 250 was added to your balance."
  footer={<Button block size="lg">Done</Button>} onClose={close} />`,
  },

  scrim: {
    swift: `import SwiftUI
import EandTokens

// Scrim: surface/overlay/scrim (midnight 50%) under a 20pt glass blur, full-bleed, behind
// every bottom sheet and modal. Tapping it dismisses the overlay on top.
struct PlanScreen: View {
  @State private var showSheet = true
  var body: some View {
    ZStack(alignment: .bottom) {
      HomeScreen()
      if showSheet {
        EandColor.surfaceOverlayScrim
          .background(.ultraThinMaterial)             // ≈ glass-md, blur 20
          .ignoresSafeArea()
          .onTapGesture { showSheet = false }
          .transition(.opacity)
        BottomSheet(title: "Choose a plan") { PlanPicker() }
          .transition(.move(edge: .bottom))
      }
    }
    .animation(.easeOut(duration: 0.25), value: showSheet)
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.ui.draw.blur
import com.eand.tokens.*

// Scrim: surface/overlay/scrim (midnight 50%) + a 20dp blur of the content behind it,
// full-bleed, under every sheet and modal. Tapping it dismisses.
@Composable
fun PlanScreen() {
  var showSheet by remember { mutableStateOf(true) }
  Box(Modifier.fillMaxSize()) {
    HomeScreen(if (showSheet) Modifier.blur(20.dp) else Modifier)   // glass-md (API 31+)
    if (showSheet) {
      Box(
        Modifier.fillMaxSize()
          .background(EandColor.surfaceOverlayScrim)
          .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null) {
            showSheet = false
          },
      )
      EandBottomSheet("Choose a plan", Modifier.align(Alignment.BottomCenter)) { PlanPicker() }
    }
  }
}`,
    react: `import { Scrim, BottomSheet, Button } from '@eand/react-design-system';

{/* BottomSheet and AlertModal already render their own Scrim */}
<BottomSheet open title="Choose a plan" onDismiss={close}
  footer={<Button block size="lg">Confirm</Button>}>
  Plan options go here.
</BottomSheet>

{/* Custom overlay: Scrim is fixed, full-bleed, z-index 1000, midnight 50% + blur 20 */}
<Scrim onClick={close} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <div onClick={(e) => e.stopPropagation()}>Your panel</div>
</Scrim>`,
  },

  tabs: {
    swift: `import SwiftUI
import EandTokens

// V1.2 tab-pill: 48 tall, min 72 wide, padding 0/16, title/xs, gap 8 between pills.
// Unselected = white pill, muted ink; selected = brand-muted pill, red ink.
// inverse (on brand / midnight): white 20% + blur, selected solid white.
struct PillTab: View {
  let title: String; let active: Bool
  var body: some View {
    Text(title)
      .font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
      .foregroundColor(active ? EandColor.tabDefaultTextSelected : EandColor.tabDefaultTextDefault)
      .padding(.horizontal, EandSpacing.lg)
      .frame(minWidth: EandScale.scale72, minHeight: EandScale.scale48)
      .background(active ? EandColor.tabDefaultSurfaceSelected : EandColor.tabDefaultSurfaceDefault)
      .clipShape(Capsule())
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// V1.2 tab-pill: 48 tall, min 72 wide, padding 0/16, title/xs. Selected = brand-muted + red.
@Composable
fun PillTab(title: String, active: Boolean, onClick: () -> Unit) {
  Box(
    Modifier
      .heightIn(min = EandScale.scale48).widthIn(min = EandScale.scale72)
      .clip(CircleShape)
      .background(if (active) EandColor.tabDefaultSurfaceSelected else EandColor.tabDefaultSurfaceDefault)
      .clickable(onClick = onClick)
      .padding(horizontal = EandSpacing.lg),
    contentAlignment = Alignment.Center,
  ) {
    Text(title, style = EandTypography.titleXs,
      color = if (active) EandColor.tabDefaultTextSelected else EandColor.tabDefaultTextDefault)
  }
}`,
    react: `import { Tabs } from '@eand/react-design-system';

<Tabs tabs={['For you', 'Account', 'Loyalty']} defaultValue={0} onChange={setTab} />
<Tabs tabs={['Data', 'Calls', 'Roaming']} icons={['wifi', 'call', 'globe']} />
<Tabs inverse tabs={['All', 'Plans', 'Devices']} />   {/* glass pills on brand / midnight */}`,
  },

  checkbox: {
    swift: `import SwiftUI
import EandTokens

// V1.2 checkbox: md 20 / sm 16, radius 4, 1.5pt off ring; on = brand fill with the icon-set
// check (12pt in a 16pt box). Every state is a color/mark token — disabled is a colour.
// radio=yes draws the same mark as a circle.
struct CheckboxView: View {
  let label: String; @Binding var on: Bool
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      CheckboxMark(on: on)
      Text(label).font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultDefault)
    }
    .onTapGesture { on.toggle() }
  }
}

struct CheckboxMark: View {
  let on: Bool
  var body: some View {
    RoundedRectangle(cornerRadius: EandRadius.radius1)
      .fill(on ? EandColor.markDefaultSurfaceSelected : .clear)
      .overlay {
        if !on {
          RoundedRectangle(cornerRadius: EandRadius.radius1)
            .strokeBorder(EandColor.markDefaultBorderDefault, lineWidth: EandBorder.md)
        }
      }
      .overlay {
        if on {
          Image(systemName: "checkmark").font(.system(size: EandIcon.sm - 2, weight: .bold))
            .foregroundColor(EandColor.markDefaultIconSelected)
        }
      }
      .frame(width: EandCheckbox.md, height: EandCheckbox.md)
  }
}`,
    kotlin: `import com.eand.tokens.*

// V1.2 checkbox: 20dp, radius 4, colours from color/mark/* (disabled is a colour, not alpha).
@Composable
fun CheckboxView(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
  Row(verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
    Checkbox(
      checked = checked,
      onCheckedChange = onCheckedChange,
      modifier = Modifier.size(EandCheckbox.md),
      colors = CheckboxDefaults.colors(
        checkedColor = EandColor.markDefaultSurfaceSelected,
        uncheckedColor = EandColor.markDefaultBorderDefault,
        checkmarkColor = EandColor.markDefaultIconSelected,
        disabledCheckedColor = EandColor.markDefaultSurfaceSelectedDisabled,
      ),
    )
    Text(label, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault)
  }
}`,
    react: `import { Checkbox } from '@eand/react-design-system';

<Checkbox label="Remember this card" />
<Checkbox label="Radio option" radio />
<Checkbox label="On midnight" inverse defaultChecked />
{/* For a T&C line with links, use ConsentCheckbox */}`,
  },

  radio: {
    swift: `import SwiftUI
import EandTokens

// V1.2 radio: lg 24 / sm 20, a 2pt ring; selected adds a 16pt (sm 12) dot in the same
// colour. Off ring and selected fill are color/mark tokens.
struct RadioView: View {
  let label: String; let selected: Bool
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      Circle()
        .strokeBorder(selected ? EandColor.markDefaultSurfaceSelected : EandColor.markDefaultBorderDefault,
                      lineWidth: EandBorder.lg)
        .frame(width: EandRadio.md, height: EandRadio.md)
        .overlay {
          if selected {
            Circle().fill(EandColor.markDefaultSurfaceSelected)
              .frame(width: EandScale.scale16, height: EandScale.scale16)
          }
        }
      Text(label).font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultDefault)
    }
  }
}`,
    kotlin: `import androidx.compose.foundation.border
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// V1.2 radio: 24dp, 2dp ring, 16dp dot when selected — colours from color/mark/*.
@Composable
fun RadioView(label: String, selected: Boolean, onSelect: () -> Unit) {
  val ink = if (selected) EandColor.markDefaultSurfaceSelected else EandColor.markDefaultBorderDefault
  Row(
    Modifier.selectable(selected, role = Role.RadioButton, onClick = onSelect),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm),
  ) {
    Box(Modifier.size(EandRadio.md).border(EandBorder.lg, ink, CircleShape), contentAlignment = Alignment.Center) {
      if (selected) Box(Modifier.size(EandScale.scale16).background(ink, CircleShape))
    }
    Text(label, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault)
  }
}`,
    react: `import { Radio } from '@eand/react-design-system';

<Radio name="plan" label="Postpaid" defaultChecked />
<Radio name="plan" label="Prepaid" />
<Radio name="plan" label="On midnight" size="sm" inverse />`,
  },

  switcher: {
    swift: `import SwiftUI
import EandTokens

// V1.2 switcher: md 40×24 / sm 32×20, knob 20 / 16 with a 2pt inset. Every state is a
// color/mark pair — off track #c0bfc8, on brand red, knob white; disabled is a colour.
struct SwitcherView: View {
  @Binding var on: Bool
  var small = false
  var body: some View {
    let w = small ? EandSwitcher.trackWidthSm : EandSwitcher.trackWidthMd
    let h = small ? EandSwitcher.trackHeightSm : EandSwitcher.trackHeightMd
    let knob = small ? EandSwitcher.thumbWidthSm : EandSwitcher.thumbWidthMd
    Capsule()
      .fill(on ? EandColor.markDefaultSurfaceSelected : EandColor.markDefaultSurfaceDefault)
      .frame(width: w, height: h)
      .overlay(alignment: on ? .trailing : .leading) {
        Circle().fill(on ? EandColor.markDefaultIconSelected : EandColor.markDefaultIconDefault)
          .frame(width: knob, height: knob)
          .padding(EandSpacing.spacing2xs)
      }
      .animation(.easeOut(duration: 0.15), value: on)
      .onTapGesture { on.toggle() }
      .accessibilityAddTraits(.isButton)
  }
}`,
    kotlin: `import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// V1.2 switcher: md 40×24 / sm 32×20, knob 20 / 16, 2dp inset, color/mark tokens.
// (Material's Switch is 52×32 — build the e& one.)
@Composable
fun SwitcherView(checked: Boolean, onCheckedChange: (Boolean) -> Unit, small: Boolean = false) {
  val w = if (small) EandSwitcher.trackWidthSm else EandSwitcher.trackWidthMd
  val h = if (small) EandSwitcher.trackHeightSm else EandSwitcher.trackHeightMd
  val knob = if (small) EandSwitcher.thumbWidthSm else EandSwitcher.thumbWidthMd
  val x by animateDpAsState(if (checked) w - knob - EandSpacing.spacing2xs * 2 else 0.dp)
  Box(
    Modifier.size(w, h).clip(CircleShape)
      .background(if (checked) EandColor.markDefaultSurfaceSelected else EandColor.markDefaultSurfaceDefault)
      .toggleable(checked, role = Role.Switch, onValueChange = onCheckedChange)
      .padding(EandSpacing.spacing2xs),
  ) {
    Box(Modifier.offset(x = x).size(knob)
      .background(if (checked) EandColor.markDefaultIconSelected else EandColor.markDefaultIconDefault, CircleShape))
  }
}`,
    react: `import { Switcher } from '@eand/react-design-system';

<Switcher defaultChecked onChange={(on) => console.log(on)} />   {/* md 40×24 */}
<Switcher size="sm" />                                           {/* 32×20 */}
<Switcher inverse defaultChecked />                              {/* white track, red knob */}`,
  },

  filterpill: {
    swift: `import SwiftUI
import EandTokens

// V1.2 filter-pill: transparent, 40 tall, min 72 wide, 1pt stroke, padding 12 start /
// 8 end, gap 2; body/md label + chevron-down 16 in a 20pt box. Selected darkens the
// stroke and ink; only inverse + selected fills.
struct FilterPill: View {
  let label: String; let selected: Bool
  var body: some View {
    HStack(spacing: EandSpacing.spacing2xs) {
      Text(label).font(.system(size: EandTypography.bodyMd.size))
      Image(systemName: "chevron.down").font(.system(size: EandIcon.md))
        .frame(width: EandIcon.lg, height: EandIcon.lg)
    }
    .foregroundColor(selected ? EandColor.filterPillTextDefaultSelected : EandColor.filterPillTextDefaultDefault)
    .padding(.leading, EandSpacing.md).padding(.trailing, EandSpacing.sm)
    .frame(minWidth: EandScale.scale72, minHeight: EandTabs.heightMd)
    .overlay(Capsule().strokeBorder(
      selected ? EandColor.filterPillBorderDefaultSelected : EandColor.filterPillBorderDefaultDefault,
      lineWidth: EandBorder.sm))
  }
}`,
    kotlin: `import androidx.compose.foundation.border
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// V1.2 filter-pill: transparent, 40dp, 1dp stroke, padding 12 start / 8 end, gap 2.
@Composable
fun FilterPill(label: String, selected: Boolean, onClick: () -> Unit) {
  val ink = if (selected) EandColor.filterPillTextDefaultSelected else EandColor.filterPillTextDefaultDefault
  Row(
    Modifier
      .heightIn(min = EandTabs.heightMd).widthIn(min = EandScale.scale72)
      .clip(CircleShape)
      .border(EandBorder.sm,
        if (selected) EandColor.filterPillBorderDefaultSelected else EandColor.filterPillBorderDefaultDefault,
        CircleShape)
      .clickable(onClick = onClick)
      .padding(start = EandSpacing.md, end = EandSpacing.sm),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs, Alignment.CenterHorizontally),
  ) {
    Text(label, style = EandTypography.bodyMd, color = ink)
    Box(Modifier.size(EandIcon.lg), contentAlignment = Alignment.Center) {
      Icon(Icons.Filled.KeyboardArrowDown, null, Modifier.size(EandIcon.md), tint = ink)
    }
  }
}`,
    react: `import { FilterPill } from '@eand/react-design-system';

<FilterPill>Category</FilterPill>
<FilterPill selected>Category</FilterPill>
<FilterPill inverse>On dark</FilterPill>`,
  },

  searchbar: {
    swift: `import SwiftUI
import EandTokens

// 52pt field on surface/base/default, r16, 20pt search + mic glyphs (mic in brand red).
struct Searchbar: View {
  @Binding var query: String
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      Image(systemName: "magnifyingglass").font(.system(size: EandIcon.lg))
        .frame(width: EandIcon.lg, height: EandIcon.lg)
      TextField("Search", text: $query)
        .font(.system(size: EandTypography.bodyMd.size))
      Button { } label: { Image(systemName: "mic.fill").font(.system(size: EandIcon.lg)) }
        .foregroundColor(EandColor.textBrandDefault)
    }
    .padding(.horizontal, EandSpacing.lg).frame(height: 52)
    .background(EandColor.surfaceBaseDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.*

// 52dp field on surface/base/default, r16, 20dp search + mic glyphs (mic in brand red).
@Composable
fun Searchbar(query: String, onQueryChange: (String) -> Unit, onMic: () -> Unit = {}) {
  Row(
    Modifier
      .fillMaxWidth().height(52.dp)
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius6))
      .padding(horizontal = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm),
  ) {
    Icon(Icons.Filled.Search, null, Modifier.size(EandIcon.lg))
    BasicTextField(query, onQueryChange, Modifier.weight(1f), textStyle = EandTypography.bodyMd)
    IconButton(onMic, Modifier.size(EandIcon.lg)) {
      Icon(Icons.Filled.Mic, "Voice search", tint = EandColor.textBrandDefault)
    }
  }
}`,
    react: `import { Searchbar } from '@eand/react-design-system';

<Searchbar placeholder="Search" onMic={() => startVoiceSearch()} />`,
  },

  aisearch: {
    swift: `import SwiftUI
import EandTokens

// AI search shares the search bar shell with an "Ask e& or search" prompt.
struct AISearch: View {
  @Binding var query: String
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      Image(systemName: "sparkles").frame(width: EandIcon.lg, height: EandIcon.lg)
      TextField("Ask e& or search", text: $query)
    }
    .padding(.horizontal, EandSpacing.lg).frame(height: 52)
    .background(EandColor.surfaceBaseDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.*

@Composable
fun AISearch(query: String, onQueryChange: (String) -> Unit) {
  Row(
    Modifier
      .fillMaxWidth().height(52.dp)
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius6))
      .padding(horizontal = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm),
  ) {
    Icon(Icons.Filled.AutoAwesome, null, Modifier.size(EandIcon.lg))
    BasicTextField(query, onQueryChange, Modifier.weight(1f))
  }
}`,
    react: `import { AISearch } from '@eand/react-design-system';

<AISearch placeholder="Ask e& or search" />`,
  },

  selectors: {
    swift: `import SwiftUI
import EandTokens

// Segmented pill: active segment lifts to a white pill on a grey track.
struct Selectors: View {
  let options: [String]; @Binding var index: Int
  var body: some View {
    HStack(spacing: 0) {
      ForEach(Array(options.enumerated()), id: \\.offset) { i, opt in
        Text(opt).font(.system(size: EandTypography.buttonSm.size, weight: .semibold))
          .padding(.horizontal, EandSpacing.md).frame(height: 36)
          .background(i == index ? EandColor.surfaceCanvasDefault : .clear)
          .clipShape(Capsule()).onTapGesture { index = i }
      }
    }
    .padding(2).background(EandColor.surfaceBaseDefault).clipShape(Capsule())
  }
}`,
    kotlin: `import com.eand.tokens.*

@Composable
fun Selectors(options: List<String>, index: Int, onSelect: (Int) -> Unit) {
  Row(
    Modifier.background(EandColor.surfaceBaseDefault, CircleShape).padding(2.dp),
  ) {
    options.forEachIndexed { i, opt ->
      Text(opt, style = EandTypography.buttonSm, modifier = Modifier
        .clip(CircleShape).clickable { onSelect(i) }
        .background(if (i == index) EandColor.surfaceCanvasDefault else Color.Transparent)
        .height(36.dp).padding(horizontal = EandSpacing.md))
    }
  }
}`,
    react: `import { Selectors } from '@eand/react-design-system';

<Selectors options={['Monthly', 'Yearly']} defaultValue={0}
  onChange={(i) => console.log(i)} />`,
  },

  input: {
    swift: `import SwiftUI
import EandTokens

// V1.2 input-field: 56pt min, radius 14, padding 12 inline. No stroke at rest; a 1pt
// accent stroke while active, 1pt danger on error — drawn inside, so the field never
// shifts. Floating label body/sm over a body/lg value.
struct EandInput: View {
  let label: String; @Binding var value: String
  var error = false
  @FocusState private var focused: Bool
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.spacing2xs) {
      Text(label).font(.system(size: EandTypography.bodySm.size))
        .foregroundColor(EandColor.inputFieldTextDefaultLabelDefault)
      TextField("", text: $value).focused($focused)
        .font(.system(size: EandTypography.bodyLg.size))
        .foregroundColor(EandColor.inputFieldTextDefaultValueDefault)
        .tint(EandColor.textBrandDefault)
    }
    .padding(.horizontal, EandSpacing.md).padding(.vertical, EandSpacing.sm)
    .frame(minHeight: EandScale.scale56)
    .background(EandColor.inputFieldSurfaceDefaultDefault)
    .overlay {
      if error || focused {
        RoundedRectangle(cornerRadius: EandRadius.radius5).strokeBorder(
          error ? EandColor.borderInteractiveDangerSubtle : EandColor.borderInteractiveAccentDefault,
          lineWidth: EandBorder.sm)
      }
    }
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 input-field: 56dp min, radius 14, no stroke at rest; 1dp accent stroke while
// focused, 1dp danger on error.
@Composable
fun EandInput(label: String, value: String, onValueChange: (String) -> Unit, error: Boolean = false) {
  var focused by remember { mutableStateOf(false) }
  val shape = RoundedCornerShape(EandRadius.radius5)
  val stroke = when {
    error -> EandColor.borderInteractiveDangerSubtle
    focused -> EandColor.borderInteractiveAccentDefault
    else -> null
  }
  Column(
    Modifier
      .fillMaxWidth().heightIn(min = EandScale.scale56)
      .background(EandColor.inputFieldSurfaceDefaultDefault, shape)
      .then(if (stroke != null) Modifier.border(EandBorder.sm, stroke, shape) else Modifier)
      .padding(horizontal = EandSpacing.md, vertical = EandSpacing.sm),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs),
  ) {
    Text(label, style = EandTypography.bodySm, color = EandColor.inputFieldTextDefaultLabelDefault)
    BasicTextField(value, onValueChange, Modifier.onFocusChanged { focused = it.isFocused },
      textStyle = EandTypography.bodyLg.copy(color = EandColor.inputFieldTextDefaultValueDefault),
      cursorBrush = SolidColor(EandColor.textBrandDefault))
  }
}`,
    react: `import { Input, OtpInput } from '@eand/react-design-system';

<Input label="Email address" clearable helper="We'll never share it." />  {/* clear shows while active + filled */}
<Input label="Mobile number" defaultValue="050 12" error="Enter a valid UAE mobile number" />
<Input label="Plan" type="dropdown" defaultValue="Postpaid — Unlimited" />
<Input label="Add a comment" type="comment" />
<OtpInput onValueChange={verify} />                                    {/* 6 cells by default */}`,
  },

  progressbar: {
    swift: `import SwiftUI
import EandTokens

// progress-bar-core: a 300×4 clip holding one green fill — no track colour, no radius.
struct ProgressBar: View {
  let value: Double   // 0…1
  var body: some View {
    GeometryReader { geo in
      Rectangle().fill(EandColor.textPositiveSubtle)
        .frame(width: geo.size.width * min(max(value, 0), 1))
    }
    .frame(width: 300, height: EandScale.scale4)
    .clipped()
  }
}`,
    kotlin: `import com.eand.tokens.*

// progress-bar-core: a 300×4 clip with one green fill — no track, no radius.
@Composable
fun ProgressBar(value: Float) {   // 0..1
  Box(Modifier.width(300.dp).height(EandScale.scale4).clipToBounds()) {
    Box(Modifier.fillMaxHeight().fillMaxWidth(value.coerceIn(0f, 1f))
      .background(EandColor.textPositiveSubtle))
  }
}`,
    react: `import { ProgressBar } from '@eand/react-design-system';

<ProgressBar value={60} />
<ProgressBar value={90} tone="danger" />`,
  },

  stepper: {
    swift: `import SwiftUI
import EandTokens

// Segmented step progress: 6pt-tall pills, 4pt gap, completed ones filled.
struct Stepper: View {
  let steps: Int; let progress: Int
  var body: some View {
    HStack(spacing: EandSpacing.xs) {
      ForEach(0..<steps, id: \\.self) { i in
        Capsule()
          .fill(i < progress ? EandColor.stepperDefaultSelected : EandColor.stepperDefaultDefault)
          .frame(height: 6).frame(maxWidth: .infinity)
      }
    }
  }
}`,
    kotlin: `import com.eand.tokens.*

// Segmented step progress: 6dp-tall pills, 4dp gap, completed ones filled.
@Composable
fun Stepper(steps: Int, progress: Int) {
  Row(Modifier.fillMaxWidth().height(6.dp),
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
    repeat(steps) { i ->
      Box(Modifier.weight(1f).fillMaxHeight().clip(CircleShape)
        .background(if (i < progress) EandColor.stepperDefaultSelected else EandColor.stepperDefaultDefault))
    }
  }
}`,
    react: `import { Stepper } from '@eand/react-design-system';

<Stepper steps={5} progress={2} />
<Stepper steps={5} progress={3} inverse />`,
  },

  addtrigger: {
    swift: `import SwiftUI
import EandTokens

// add-trigger: a full-width 72pt glass panel (midnight 7%), r16, padding 16 × 20, no
// border. Centred content: a 16pt red disc holding an 8pt white plus, then the
// button/lg label (4pt inset each side).
struct AddTrigger: View {
  let label: String
  var action: () -> Void
  var body: some View {
    Button(action: action) {
      HStack(spacing: EandSpacing.xs) {
        Image(systemName: "plus").font(.system(size: EandIcon.xs, weight: .bold))
          .foregroundColor(EandColor.textDefaultInverse)
          .frame(width: EandScale.scale16, height: EandScale.scale16)
          .background(EandColor.textBrandDefault, in: Circle())
        Text(label)
          .font(.system(size: EandTypography.buttonLg.size, weight: EandTypography.buttonLg.weight))
          .foregroundColor(EandColor.textDefaultDefault)
          .padding(.horizontal, EandSpacing.xs)
      }
      .padding(.horizontal, EandSpacing.xs)
      .frame(maxWidth: .infinity, minHeight: EandScale.scale72)
      .background(EandColor.surfaceGlassMidnightSm)
      .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
    }
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// add-trigger: full-width 72dp glass panel (midnight 7%), r16, no border; a 16dp red
// disc with an 8dp white plus, then the button/lg label.
@Composable
fun AddTrigger(label: String, onClick: () -> Unit) {
  Row(
    Modifier
      .fillMaxWidth().height(EandScale.scale72)
      .clip(RoundedCornerShape(EandRadius.radius6))
      .background(EandColor.surfaceGlassMidnightSm)
      .clickable(onClick = onClick)
      .padding(horizontal = EandSpacing.xl, vertical = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs, Alignment.CenterHorizontally),
  ) {
    Box(Modifier.size(EandScale.scale16).background(EandColor.textBrandDefault, CircleShape),
      contentAlignment = Alignment.Center) {
      Icon(Icons.Filled.Add, null, Modifier.size(EandIcon.xs), tint = EandColor.textDefaultInverse)
    }
    Text(label, style = EandTypography.buttonLg, color = EandColor.textDefaultDefault,
      modifier = Modifier.padding(horizontal = EandSpacing.xs))
  }
}`,
    react: `import { AddTrigger } from '@eand/react-design-system';

<AddTrigger label="Add a line" onClick={addLine} />
<AddTrigger surface="inverse" label="Add a card" onClick={addCard} />   {/* on dark surfaces */}`,
  },

  logo: {
    swift: `import SwiftUI
import EandTokens

// etisalat logo (DSL V1.2). Export the Figma artworks into the asset catalog:
// etisalat-logo-{default,white,red} and etisalat-{lockup,logomark,wordmark,bilingual}[-rtl].
struct EtisalatLogo: View {
  enum Scheme: String { case \`default\`, white, red }
  var scheme: Scheme = .default
  var size: CGFloat = 96
  var body: some View {
    Image("etisalat-logo-\\(scheme.rawValue)")
      .resizable().scaledToFit().frame(width: size, height: size)
      .accessibilityLabel("etisalat")
  }
}`,
    kotlin: `import com.eand.tokens.R

// etisalat logo (DSL V1.2): color-scheme default (red tile) / white / red.
@Composable
fun EtisalatLogo(scheme: LogoScheme = LogoScheme.Default, size: Dp = 96.dp) {
  Image(
    painterResource(when (scheme) {
      LogoScheme.White -> R.drawable.etisalat_logo_white
      LogoScheme.Red -> R.drawable.etisalat_logo_red
      else -> R.drawable.etisalat_logo_default
    }),
    contentDescription = "etisalat",
    modifier = Modifier.size(size),
  )
}`,
    react: `import { Logo } from '@eand/react-design-system';

<Logo />                                   {/* red tile — the brand symbol */}
<Logo version="white" />                   {/* on brand or dark surfaces */}
<Logo version="red" type="logomark" />     {/* the swoosh alone */}
<Logo version="white" type="lockup" rtl /> {/* Arabic lockup */}`,
  },

  logorow: {
    swift: `import SwiftUI
import EandTokens

// logo-row: circle-clipped logos sm 24 / md 32 / lg 40 with gaps 4 / 4 / 8, no wrap, and
// an optional +N MoreItems at the logo size. glass sets each logo in a 40 / 48 / 56 tile
// (padding 8) on white 20% + blur, with a 0.5pt ring on the logo.
struct LogoRow: View {
  let logos: [Image]
  var size: CGFloat = EandIcon.icon2xl      // md
  var more: Int? = nil
  var body: some View {
    HStack(spacing: EandSpacing.xs) {
      ForEach(Array(logos.enumerated()), id: \\.offset) { _, logo in
        logo.resizable().scaledToFill()
          .frame(width: size, height: size)
          .clipShape(Circle())
      }
      if let more { MoreItems(count: more, size: size, inverse: true) }
    }
  }
}`,
    kotlin: `import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// logo-row: circle-clipped logos sm 24 / md 32 / lg 40, gaps 4 / 4 / 8, optional +N.
@Composable
fun LogoRow(logos: List<Painter>, size: Dp = EandIcon.icon2xl, more: Int? = null, modifier: Modifier = Modifier) {
  Row(modifier, horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs),
    verticalAlignment = Alignment.CenterVertically) {
    logos.forEach {
      Image(it, null, Modifier.size(size).clip(CircleShape), contentScale = ContentScale.Crop)
    }
    more?.let { MoreItems(it, size, inverse = true) }
  }
}`,
    react: `import { LogoRow } from '@eand/react-design-system';

<LogoRow size="md" logos={['/brands/smiles.png', '/brands/careem.png', '/brands/noon.png']} more={4} />
<LogoRow size="lg" glass logos={['/brands/osn.png', '/brands/starzplay.png']} />   {/* over imagery */}`,
  },

  moreitems: {
    swift: `import SwiftUI
import EandTokens

// more-items: the "+N" circle that closes a logo row, sized to the logos beside it
// (default 24). default = midnight glass 60%; inverse = white glass 15%. "+" and the count
// are separate body/xs (10pt) cells in inverse ink, so RTL reads "N+".
struct MoreItems: View {
  let count: Int
  var size: CGFloat = EandIcon.xl
  var inverse = false
  var body: some View {
    HStack(spacing: 0) { Text("+"); Text("\\(count)") }
      .font(.system(size: EandTypography.bodyXs.size))
      .foregroundColor(EandColor.textDefaultInverse)
      .frame(width: size, height: size)
      .background(inverse ? EandColor.surfaceGlassWhiteMd : EandColor.surfaceGlassMidnightLg)
      .clipShape(Circle())
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import com.eand.tokens.*

// more-items: "+N" circle (default 24dp), midnight glass 60% or white glass 15% (inverse),
// body/xs label in inverse ink.
@Composable
fun MoreItems(count: Int, size: Dp = EandIcon.xl, inverse: Boolean = false) {
  Box(
    Modifier.size(size).background(
      if (inverse) EandColor.surfaceGlassWhiteMd else EandColor.surfaceGlassMidnightLg, CircleShape),
    contentAlignment = Alignment.Center,
  ) {
    Row {
      Text("+", style = EandTypography.bodyXs, color = EandColor.textDefaultInverse)
      Text(count.toString(), style = EandTypography.bodyXs, color = EandColor.textDefaultInverse)
    }
  }
}`,
    react: `import { MoreItems, LogoRow } from '@eand/react-design-system';

<MoreItems count={4} />                               {/* 24px, midnight glass */}
<MoreItems count={12} surface="inverse" size={32} />  {/* on dark imagery */}
<LogoRow size="md" logos={logos} more={4} />          {/* LogoRow appends one for you */}`,
  },

  atomsurface: {
    swift: `import SwiftUI
import EandTokens

// Shared surface atom: radius 20, clipped. surfaceColor: default (white), subtle, sunken,
// midnight-base, midnight-raised, glass-midnight, glass-white (+ frost) or brand.
struct AtomSurface<Content: View>: View {
  var fill: Color = EandColor.surfaceBaseInverse    // e.g. EandColor.surfaceRaisedMidnight
  @ViewBuilder var content: Content
  var body: some View {
    content
      .background(fill)
      .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// Shared surface atom: radius 20, clipped; pass the surface-color token.
@Composable
fun AtomSurface(fill: Color = EandColor.surfaceBaseInverse, content: @Composable () -> Unit) {
  Box(Modifier.clip(RoundedCornerShape(EandRadius.radius7)).background(fill)) { content() }
}`,
    react: `import { AtomSurface } from '@eand/react-design-system';

<AtomSurface surfaceColor="default">Content on the white atom</AtomSurface>
<AtomSurface surfaceColor="midnight-raised">Content on midnight</AtomSurface>
<AtomSurface surfaceColor="glass-white">Over imagery (blurred)</AtomSurface>`,
  },

  pageheader: {
    swift: `import SwiftUI
import EandTokens

// page-header: white r20 card, padding 24/16, centred. Two-tone title bound to the
// typography/heading/lg variables (28 / 120%), body/md subtitle, then 48pt tab pills.
struct PageHeader: View {
  let lines: [(muted: String, strong: String)]
  let subtitle: String
  let tabs: [String]
  @State private var selected = 0
  var body: some View {
    VStack(spacing: EandSpacing.md) {
      VStack(spacing: EandSpacing.xs) {
        ForEach(lines.indices, id: \\.self) { i in
          (Text(lines[i].muted + " ").foregroundColor(EandColor.textDefaultSubtle)
            + Text(lines[i].strong).foregroundColor(EandColor.textDefaultDefault))
            .font(.system(size: EandTypography.headingXl.size, weight: .bold))   // 28pt
        }
        Text(subtitle)
          .font(.system(size: EandTypography.bodyMd.size))
          .foregroundColor(EandColor.textDefaultSubtle)
          .multilineTextAlignment(.center)
          .padding(.horizontal, EandSpacing.spacing2xl)
      }
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: EandSpacing.xs) {
          ForEach(tabs.indices, id: \\.self) { i in
            Text(tabs[i])
              .font(.system(size: EandTypography.titleXs.size, weight: .semibold))
              .foregroundColor(i == selected ? EandColor.tabInverseTextSelected : EandColor.tabDefaultTextDefault)
              .padding(.horizontal, EandSpacing.lg).frame(minWidth: 72, minHeight: 48)
              .background(i == selected ? EandColor.tabInverseSurfaceSelected : EandColor.tabDefaultSurfaceDefault)
              .clipShape(Capsule())
              .onTapGesture { selected = i }
          }
        }
      }
    }
    .padding(.vertical, EandSpacing.spacing2xl).padding(.horizontal, EandSpacing.lg)
    .background(EandColor.surfaceBaseInverse)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import com.eand.tokens.*

// page-header: white r20 card; two-tone 28sp / 120% title (heading/lg variables).
@Composable
fun PageHeader(lines: List<Pair<String, String>>, subtitle: String, tabs: List<String>) {
  var selected by remember { mutableStateOf(0) }
  Column(
    Modifier.fillMaxWidth().clip(RoundedCornerShape(EandRadius.radius7))
      .background(EandColor.surfaceBaseInverse)
      .padding(vertical = EandSpacing.spacing2xl, horizontal = EandSpacing.lg),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    lines.forEach { (muted, strong) ->
      Text(buildAnnotatedString {
        withStyle(SpanStyle(color = EandColor.textDefaultSubtle)) { append("$muted ") }
        withStyle(SpanStyle(color = EandColor.textDefaultDefault)) { append(strong) }
      }, style = EandTypography.headingXl.copy(lineHeight = 33.6.sp))
    }
    Text(subtitle, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle,
      textAlign = TextAlign.Center, modifier = Modifier.padding(horizontal = EandSpacing.spacing2xl))
    LazyRow(horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
      itemsIndexed(tabs) { i, label ->
        val on = i == selected
        Box(
          Modifier.height(48.dp).widthIn(min = 72.dp).clip(CircleShape)
            .background(if (on) EandColor.tabInverseSurfaceSelected else EandColor.tabDefaultSurfaceDefault)
            .clickable { selected = i }.padding(horizontal = EandSpacing.lg),
          contentAlignment = Alignment.Center,
        ) {
          Text(label, style = EandTypography.titleXs,
            color = if (on) EandColor.tabInverseTextSelected else EandColor.tabDefaultTextDefault)
        }
      }
    }
  }
}`,
    react: `import { PageHeader } from '@eand/react-design-system';

<PageHeader
  icon={<img src={thermostat3d} alt="" width={56} height={56} />}
  title={[
    { muted: 'Discover', strong: 'Thermostats.' },
    { muted: 'Built for', strong: 'Intelligence' },
  ]}
  subtitle="Your home learns your rhythm — adjusting temperature, saving energy, and creating comfort before you even notice."
  tabs={['Home', 'Thermostats', 'Cameras', 'Lighting']}
  onTabChange={(i) => setCategory(i)}
/>`,
  },

  pagetitle: {
    swift: `import SwiftUI
import EandTokens

// page-title lg: 56pt status-icon tile (r20), then a 24pt / 110% title (heading/lg style,
// 2 lines max) and an optional body/md description, centred, 20pt below.
struct PageTitle: View {
  let title: String
  let description: String?
  var body: some View {
    VStack(spacing: EandSpacing.md) {
      Image(systemName: "checkmark.circle.fill")
        .font(.system(size: EandIcon.icon2xl))
        .foregroundColor(EandColor.statusIconIconPositive)
        .frame(width: EandScale.scale56, height: EandScale.scale56)
        .background(EandColor.statusIconSurfacePositive)
        .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
      VStack(spacing: EandSpacing.xs) {
        Text(title)
          .font(.system(size: EandTypography.headingLg.size, weight: EandTypography.headingLg.weight))
          .lineLimit(2)
        if let description {
          Text(description).font(.system(size: EandTypography.bodyMd.size))
        }
      }
      .foregroundColor(EandColor.textDefaultDefault)
      .multilineTextAlignment(.center)
    }
    .padding(.bottom, EandSpacing.xl)
  }
}`,
    kotlin: `import com.eand.tokens.*

@Composable
fun PageTitle(title: String, description: String? = null) {
  Column(
    Modifier.fillMaxWidth().padding(bottom = EandSpacing.xl),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Box(
      Modifier.size(EandScale.scale56).clip(RoundedCornerShape(EandRadius.radius7))
        .background(EandColor.statusIconSurfacePositive),
      contentAlignment = Alignment.Center,
    ) {
      Icon(Icons.Filled.CheckCircle, null, tint = EandColor.statusIconIconPositive, modifier = Modifier.size(EandIcon.icon2xl))
    }
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
      // heading/lg style: 24 / 110%
      Text(title, style = EandTypography.headingLg, color = EandColor.textDefaultDefault,
        maxLines = 2, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center)
      description?.let { Text(it, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault, textAlign = TextAlign.Center) }
    }
  }
}`,
    react: `import { PageTitle } from '@eand/react-design-system';

<PageTitle
  type="lg"
  status="positive"
  title="Your new plan is active"
  description="Freedom Live Plan 200 starts today. We have sent the details to your email."
/>`,
  },

  accordion: {
    swift: `import SwiftUI
import EandTokens

// Accordion (page not finalised in V1.2): title/sm row, 12pt vertical padding, a 1pt
// divider in border/surface-based/raised. For a list of questions, use FAQ.
struct Accordion<Content: View>: View {
  let title: String; @State private var open = false
  @ViewBuilder var content: Content
  var body: some View {
    VStack(alignment: .leading) {
      Button { withAnimation { open.toggle() } } label: {
        HStack {
          Text(title).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
          Spacer()
          Image(systemName: "chevron.down").rotationEffect(.degrees(open ? 180 : 0))
        }
      }.padding(.vertical, EandSpacing.md)
      if open { content.padding(.bottom, EandSpacing.md) }
    }
    .overlay(Rectangle().frame(height: EandBorder.sm)
      .foregroundColor(EandColor.borderSurfaceBasedRaisedDefault), alignment: .bottom)
  }
}`,
    kotlin: `import com.eand.tokens.*

@Composable
fun Accordion(title: String, content: @Composable () -> Unit) {
  var open by remember { mutableStateOf(false) }
  Column(Modifier.fillMaxWidth()) {
    Row(Modifier.clickable { open = !open }.padding(vertical = EandSpacing.md),
      verticalAlignment = Alignment.CenterVertically) {
      Text(title, style = EandTypography.titleSm, modifier = Modifier.weight(1f))
      Icon(Icons.Filled.KeyboardArrowDown, null,
        Modifier.rotate(if (open) 180f else 0f))
    }
    if (open) Box(Modifier.padding(bottom = EandSpacing.md)) { content() }
    HorizontalDivider(thickness = EandBorder.sm, color = EandColor.borderSurfaceBasedRaisedDefault)
  }
}`,
    react: `import { Accordion } from '@eand/react-design-system';

<Accordion title="What's included in this plan?" defaultOpen>
  200 GB data, unlimited local minutes, 5G access.
</Accordion>`,
  },

  faq: {
    swift: `import SwiftUI
import EandTokens

// faq: optional outline-chip category row (40pt, gap 8) over a stack of white r20 cards,
// gap 4, inset 16. Header padding 16, gap 12: the question in title/xs (a 40pt block,
// 2 lines while closed) and a 20pt chevron in a 24pt box. The answer is body/md subtle,
// padded 0/12/16 inside a 0/4/4 container. One item open at a time.
struct FAQView: View {
  let items: [(q: String, a: String)]
  @State private var open: Int? = nil
  var body: some View {
    VStack(spacing: EandSpacing.xs) {
      ForEach(items.indices, id: \\.self) { i in
        VStack(alignment: .leading, spacing: 0) {
          Button { withAnimation { open = open == i ? nil : i } } label: {
            HStack(spacing: EandSpacing.md) {
              Text(items[i].q)
                .font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
                .lineLimit(open == i ? nil : 2)
                .frame(maxWidth: .infinity, minHeight: open == i ? nil : EandScale.scale40, alignment: .leading)
              Image(systemName: open == i ? "chevron.up" : "chevron.down")
                .font(.system(size: EandIcon.lg)).frame(width: EandIcon.xl, height: EandIcon.xl)
            }
            .foregroundColor(EandColor.textDefaultDefault)
            .padding(EandSpacing.lg)
          }
          if open == i {
            Text(items[i].a).font(.system(size: EandTypography.bodyMd.size))
              .foregroundColor(EandColor.textDefaultSubtle)
              .padding(.horizontal, EandSpacing.md).padding(.bottom, EandSpacing.lg)
              .padding([.horizontal, .bottom], EandSpacing.xs)
          }
        }
        .background(EandColor.surfaceBaseInverse)
        .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
      }
    }
    .padding(.horizontal, EandSpacing.lg)
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// faq: white r20 cards, gap 4, inset 16; title/xs question, body/md subtle answer;
// one item open at a time.
@Composable
fun FAQView(items: List<Pair<String, String>>) {
  var open by remember { mutableStateOf<Int?>(null) }
  Column(Modifier.padding(horizontal = EandSpacing.lg), verticalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
    items.forEachIndexed { i, (q, a) ->
      val isOpen = open == i
      Column(Modifier.fillMaxWidth().background(EandColor.surfaceBaseInverse, RoundedCornerShape(EandRadius.radius7))) {
        Row(
          Modifier.fillMaxWidth().clickable { open = if (isOpen) null else i }.padding(EandSpacing.lg),
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
        ) {
          Text(q, style = EandTypography.titleXs, color = EandColor.textDefaultDefault,
            maxLines = if (isOpen) Int.MAX_VALUE else 2, overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f).then(if (isOpen) Modifier else Modifier.heightIn(min = EandScale.scale40)))
          Icon(if (isOpen) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown, null,
            Modifier.size(EandIcon.xl), tint = EandColor.textDefaultDefault)
        }
        if (isOpen) Text(a, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle,
          modifier = Modifier.padding(start = EandSpacing.lg, end = EandSpacing.lg, bottom = EandSpacing.xl))
      }
    }
  }
}`,
    react: `import { Text, FAQ } from '@eand/react-design-system';

// FAQ carries its own 16px inset — place it on the page canvas, not in a Section body.
<Text as="h2" variant="heading.lg">FAQs</Text>
<FAQ
  categories={['Billing', 'Roaming']}
  defaultOpen={0}
  items={[
    { question: 'When is my bill generated?', answer: 'On the 1st of every month.', category: 'Billing' },
    { question: 'How do I turn on roaming?', answer: 'Open Manage, then Roaming, and switch it on.', category: 'Roaming' },
    { question: 'Can I keep my number?', answer: 'Yes — every plan keeps your number.' },
  ]}
/>`,
  },

  card: {
    swift: `import SwiftUI
import EandTokens

// Card (code-only, no V1.2 symbol): raised white, r20, no border, padding 16, gap 4.
// title/sm, body/md subtle, the action 8pt below. surface inverse = midnight-raised.
struct CardView<Action: View>: View {
  let title: String; let text: String
  @ViewBuilder var action: Action
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.xs) {
      Text(title).font(.system(size: EandTypography.titleSm.size, weight: EandTypography.titleSm.weight))
      Text(text).font(.system(size: EandTypography.bodyMd.size))
        .foregroundColor(EandColor.textDefaultSubtle)
      action.padding(.top, EandSpacing.sm)
    }
    .padding(EandSpacing.lg)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// Card (code-only): raised white, r20, no border, padding 16, gap 4.
@Composable
fun CardView(title: String, text: String, action: @Composable () -> Unit) {
  Column(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius7))
      .padding(EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Text(title, style = EandTypography.titleSm)
    Text(text, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
    Box(Modifier.padding(top = EandSpacing.sm)) { action() }
  }
}`,
    react: `import { Card, Button } from '@eand/react-design-system';

<Card title="Refer a friend" body="Give AED 50, get AED 50."
  action={<Button size="sm">Invite</Button>} />`,
  },

  generalcard: {
    swift: `import SwiftUI
import EandTokens

// General-card: a fixed 224pt (row-3) tile, r20, clipped; 166 wide in a two-up grid.
// surface default = DARK (surface/raised/midnight, inverse ink); inverse = white.
// Title title/sm, centred, 2 lines, padded 24/12/0. Image sm 64 (at y 104) · md 128 ·
// lg 224 full-bleed. Badge slot along the bottom (top with topAlignment).
struct GeneralCard: View {
  let title: String; let image: Image
  var body: some View {
    ZStack(alignment: .top) {
      image.resizable().scaledToFit()
        .frame(width: EandScale.scale64, height: EandScale.scale64)
        .offset(y: 104)
      Text(title)
        .font(.system(size: EandTypography.titleSm.size, weight: EandTypography.titleSm.weight))
        .multilineTextAlignment(.center).lineLimit(2)
        .padding(.top, EandSpacing.spacing2xl).padding(.horizontal, EandSpacing.md)
      VStack { Spacer(); HStack { OfferBadge(text: "20% off"); Spacer() } }
        .padding(EandSpacing.md)
    }
    .foregroundColor(EandColor.textDefaultInverse)
    .frame(width: EandSection.bodyWidthCol12, height: EandSection.bodyHeightRow3)
    .background(EandColor.surfaceRaisedMidnight)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// General-card: 166×224, r20, midnight-raised (default) with inverse ink; centred
// title/sm (24/12/0), a 64dp image at y 104, badge slot at the bottom.
@Composable
fun GeneralCard(title: String, image: Painter) {
  Box(
    Modifier
      .size(EandSection.bodyWidthCol12, EandSection.bodyHeightRow3)
      .clip(RoundedCornerShape(EandRadius.radius7))
      .background(EandColor.surfaceRaisedMidnight),
  ) {
    Text(title, style = EandTypography.titleSm, color = EandColor.textDefaultInverse,
      textAlign = TextAlign.Center, maxLines = 2,
      modifier = Modifier.fillMaxWidth().padding(start = EandSpacing.md, top = EandSpacing.spacing2xl, end = EandSpacing.md))
    Image(image, null, Modifier.align(Alignment.TopCenter).offset(y = 104.dp).size(EandScale.scale64))
    OfferBadge("20% off", Modifier.align(Alignment.BottomStart).padding(EandSpacing.md))
  }
}`,
    react: `import { Section, GeneralCard, Badge } from '@eand/react-design-system';

<Section title="Explore" size="md">
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
    <GeneralCard title="Home internet" image="/3d/router.png" size="md" />
    <GeneralCard title="TV packs" image="/3d/tv.png" surface="inverse"
      badge={<Badge offer="discount">20% off</Badge>} />
  </div>
</Section>

<GeneralCard carousel size="lg" topAlignment title="Apple Watch Series 10" image="/devices/watch.jpg" />`,
  },

  actionbar: {
    swift: `import SwiftUI
import EandTokens

// action-bar: 72pt, r20, padding 0/16, gap 12. 40pt r12 leading tile, title/xs over a
// body/md description (both the scheme ink), one trailing trigger: a button, a switcher
// or a 20pt chevron in a 24pt box.
struct ActionBar: View {
  let title: String; let subtitle: String
  var body: some View {
    HStack(spacing: EandSpacing.md) {
      Image(systemName: "headphones")
        .frame(width: EandScale.scale40, height: EandScale.scale40)
        .background(EandColor.surfaceBaseDefault, in: RoundedRectangle(cornerRadius: EandRadius.radius4))
      VStack(alignment: .leading, spacing: 0) {
        Text(title).font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
        Text(subtitle).font(.system(size: EandTypography.bodyMd.size))
      }
      .lineLimit(1)
      Spacer(minLength: 0)
      Image(systemName: "chevron.right").font(.system(size: EandIcon.lg))
        .frame(width: EandIcon.xl, height: EandIcon.xl)
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .padding(.horizontal, EandSpacing.lg).frame(height: EandScale.scale72)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// action-bar: 72dp, r20, padding 0/16, gap 12; 40dp r12 tile, title/xs + body/md, one trigger.
@Composable
fun ActionBar(title: String, subtitle: String, onClick: () -> Unit) {
  Row(
    Modifier
      .fillMaxWidth().height(EandScale.scale72)
      .clip(RoundedCornerShape(EandRadius.radius7))
      .background(EandColor.surfaceRaisedDefault)
      .clickable(onClick = onClick)
      .padding(horizontal = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Box(Modifier.size(EandScale.scale40).background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius4)),
      contentAlignment = Alignment.Center) { Icon(Icons.Filled.Headphones, null) }
    Column(Modifier.weight(1f)) {
      Text(title, style = EandTypography.titleXs, color = EandColor.textDefaultDefault, maxLines = 1)
      Text(subtitle, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault, maxLines = 1)
    }
    Box(Modifier.size(EandIcon.xl), contentAlignment = Alignment.Center) {
      Icon(Icons.Filled.ChevronRight, null, Modifier.size(EandIcon.lg))
    }
  }
}`,
    react: `import { ActionBar, Button, Icon } from '@eand/react-design-system';

<ActionBar icon={<Icon name="headphones" />} title="Now playing" subtitle="e& podcast · Ep 12"
  action={<Button size="sm">Play</Button>} />
<ActionBar surface="midnight-raised" icon={<Icon name="wifi" />} title="Wi-Fi calling"
  subtitle="Use Wi-Fi when signal is weak" switcher />
<ActionBar surface="glass" colorScheme="default" title="Track your order" chevron />`,
  },

  sectionlink: {
    swift: `import SwiftUI
import EandTokens

// Section header row (code-only): title left, "See all" link + chevron right.
// The 40pt round trigger in a Section header is SectionLinkButton.
struct SectionLink: View {
  let title: String; let link: String
  var body: some View {
    HStack {
      Text(title).font(.system(size: EandTypography.headingXs.size, weight: .bold))
      Spacer()
      HStack(spacing: 2) {
        Text(link).font(.system(size: EandTypography.buttonSm.size, weight: .semibold))
        Image(systemName: "chevron.right").font(.system(size: EandIcon.md))
      }.foregroundColor(EandColor.textBrandDefault)
    }
    .frame(height: 40)
  }
}`,
    kotlin: `import com.eand.tokens.*

@Composable
fun SectionLink(title: String, link: String, onLink: () -> Unit) {
  Row(Modifier.fillMaxWidth().height(40.dp),
    verticalAlignment = Alignment.CenterVertically) {
    Text(title, style = EandTypography.headingXs, modifier = Modifier.weight(1f))
    Row(Modifier.clickable(onClick = onLink), verticalAlignment = Alignment.CenterVertically) {
      Text(link, style = EandTypography.buttonSm, color = EandColor.textBrandDefault)
      Icon(Icons.Filled.ChevronRight, null, Modifier.size(EandIcon.md), tint = EandColor.textBrandDefault)
    }
  }
}`,
    react: `import { SectionLink } from '@eand/react-design-system';

<SectionLink title="Deals for you" link="See all" onLinkClick={() => {}} />`,
  },

  planusagebar: {
    swift: `import SwiftUI
import EandTokens

// 48pt filled block: the fill shows what is LEFT, the amount reads inside it,
// the category sits in the track opposite. Green normally, orange on low data.
// Text the fill covers switches to inverse (white) ink.
struct PlanUsageBar: View {
  let label: String; let remaining: Double; let total: Double; let unit: String
  var note: String? = nil
  var lowData: Bool = false

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        RoundedRectangle(cornerRadius: EandRadius.radius4)
          .fill(EandColor.surfaceCanvasInverse)
        RoundedRectangle(cornerRadius: EandRadius.radius4)
          .fill(lowData ? EandColor.orange500 : EandColor.green600)   // Figma green/550 = #54bc72
          .frame(width: geo.size.width * fraction)
        HStack {
          VStack(alignment: .leading, spacing: 0) {
            Text("\\(Int(remaining)) \\(unit) left")
              .font(.system(size: EandTypography.titleXs.size, weight: .semibold))
            if let note { Text(note).font(.system(size: EandTypography.bodySm.size)) }
          }
          Spacer()
          Text(label).font(.system(size: EandTypography.buttonMd.size, weight: .medium))
        }
        .padding(.horizontal, EandSpacing.lg)
      }
    }
    .frame(height: 48)
  }

  // Clamped: no allowance means nothing to draw, a top-up must not overflow the track.
  private var fraction: Double { total > 0 ? min(1, max(0, remaining / total)) : 0 }
}`,
    kotlin: `import com.eand.tokens.*

// 48dp filled block: the fill shows what is LEFT, the amount reads inside it,
// the category sits in the track opposite. Green normally, orange on low data.
@Composable
fun PlanUsageBar(
  label: String, remaining: Float, total: Float, unit: String,
  note: String? = null, lowData: Boolean = false,
) {
  // Clamped: no allowance means nothing to draw, a top-up must not overflow the track.
  val fraction = if (total > 0f) (remaining / total).coerceIn(0f, 1f) else 0f
  Box(
    Modifier.fillMaxWidth().height(48.dp)
      .clip(RoundedCornerShape(EandRadius.radius4))
      .background(EandColor.surfaceCanvasInverse)
  ) {
    Box(
      Modifier.fillMaxWidth(fraction).fillMaxHeight()
        .clip(RoundedCornerShape(EandRadius.radius4))
        .background(if (lowData) EandColor.orange500 else EandColor.green600)   // Figma green/550
    )
    Row(
      Modifier.fillMaxSize().padding(horizontal = EandSpacing.lg),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween,
    ) {
      Column {
        Text("\${remaining.toInt()} $unit left", style = EandTypography.titleXs)
        if (note != null) Text(note, style = EandTypography.bodySm)
      }
      Text(label, style = EandTypography.buttonMd)
    }
  }
}`,
    react: `import { PlanUsageBar } from '@eand/react-design-system';

// The fill shows what is LEFT of the allowance, not what has been consumed.
<PlanUsageBar label="Local Data" remaining={20} total={40} unit="GB" />

// "low-data" is the caller's call — the threshold is a product rule, and it
// differs for data, minutes and roaming.
<PlanUsageBar label="Roaming Data" remaining={0.6} total={10} unit="GB"
  status="low-data" note="Expires 3 days" />`,
  },

  productcard: {
    swift: `import SwiftUI
import EandTokens

// card-features type=product: 229×300 (row-4), r20, raised white. A 144pt tint panel
// (r24, 4pt white inside ring) holds a 112pt image. Footer (8/12/12, gap 4): heading/sm
// title, lg badge, then the body/xl price under a body/md "from". The tint colours the
// panel only, never the card.
struct ProductCard: View {
  let title: String; let price: String
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Image("case").resizable().scaledToFit().frame(height: 112)
        .frame(maxWidth: .infinity, minHeight: EandScale.scale144)
        .background(EandColor.atomSurfacesBlue)
        .overlay(RoundedRectangle(cornerRadius: EandRadius.radius8)
          .strokeBorder(EandColor.borderInteractiveInversePressed, lineWidth: EandBorder.xl))
        .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius8))
      VStack(alignment: .leading, spacing: EandSpacing.xs) {
        Text(title)
          .font(.system(size: EandTypography.headingSm.size, weight: EandTypography.headingSm.weight))
          .foregroundColor(EandColor.midnight1100)   // legacy High-emphasis #140f21 (no semantic token)
          .lineLimit(2)
        Spacer(minLength: 0)
        OfferBadge(text: "20% off", size: .lg)
        Text("from").font(.system(size: EandTypography.bodyMd.size))
          .foregroundColor(EandColor.textDefaultSubtle)
        Text(price).font(.system(size: EandTypography.bodyXl.size))
      }
      .padding(.top, EandSpacing.sm).padding([.horizontal, .bottom], EandSpacing.md)
    }
    .frame(width: 229, height: EandSection.bodyHeightRow4)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// card-features type=product: 229×300, r20; 144dp tint panel (r24, 4dp white ring),
// footer with heading/sm title, lg badge and a body/xl price.
@Composable
fun ProductCard(title: String, price: String, image: Painter) {
  val panel = RoundedCornerShape(EandRadius.radius8)
  Column(
    Modifier
      .size(229.dp, EandSection.bodyHeightRow4)
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius7)),
  ) {
    Box(
      Modifier.fillMaxWidth().height(EandScale.scale144).clip(panel)
        .background(EandColor.atomSurfacesBlue)
        .border(EandBorder.xl, EandColor.borderInteractiveInversePressed, panel),
      contentAlignment = Alignment.Center,
    ) { Image(image, null, Modifier.height(112.dp)) }
    Column(
      Modifier.weight(1f).padding(start = EandSpacing.md, top = EandSpacing.sm, end = EandSpacing.md, bottom = EandSpacing.md),
      verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
    ) {
      // legacy High-emphasis #140f21 — no semantic V1.2 token
      Text(title, style = EandTypography.headingSm, color = EandColor.midnight1100, maxLines = 2)
      Spacer(Modifier.weight(1f))
      OfferBadge("20% off", BadgeSize.Lg)
      Text("from", style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
      Text(price, style = EandTypography.bodyXl)
    }
  }
}`,
    react: `import { ProductCard } from '@eand/react-design-system';

<ProductCard type="product" title="iPhone Clear Case" price="AED 200" period="/mo"
  discount="20% off" tint="blue" image={<img src="/products/case.png" alt="" />} />
<ProductCard type="package" eyebrow="Home" title="eLife Unlimited 500 Mbps" price="AED 389" logos />
<ProductCard type="category" title="Smartwatches" priceLabel="pay-only" price="AED 99"
  image={<img src="/products/watch.png" alt="" />} />`,
  },

  dealcard: {
    swift: `import SwiftUI
import EandTokens

// deals-card: 166×224 (col-12 × row-3), r16, white, padding 12, no border.
// Header: body/sm overline, heading/xs title (2 lines), logo row sm. Footer (80pt,
// bottom-aligned): md Discount badge + struck-through old price, title/md price, and a
// 24pt feedback pill (thumbs up · count | thumbs down) on midnight glass 7%.
struct DealCard: View {
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.xs) {
      Text("Cinema").font(.system(size: EandTypography.bodySm.size))
        .foregroundColor(EandColor.textDefaultSubtle)
      Text("2 for 1 tickets every weekend")
        .font(.system(size: EandTypography.headingXs.size, weight: EandTypography.headingXs.weight))
        .lineLimit(2)
      Spacer(minLength: 0)
      HStack(spacing: EandSpacing.xs) {
        OfferBadge(text: "50% off")
        Text("AED 90").strikethrough().font(.system(size: EandTypography.bodySm.size))
          .foregroundColor(EandColor.textDefaultMuted)
      }
      Text("AED 45")
        .font(.system(size: EandTypography.titleMd.size, weight: EandTypography.titleMd.weight))
        .foregroundColor(EandColor.midnight1100)       // legacy High-emphasis #140f21
      FeedbackPill(likes: 128)
    }
    .padding(EandSpacing.md)
    .frame(width: EandSection.bodyWidthCol12, height: EandSection.bodyHeightRow3, alignment: .topLeading)
    .background(EandColor.surfaceBaseInverse)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.text.style.TextDecoration
import com.eand.tokens.*

// deals-card: 166×224, r16, white, padding 12; header + bottom-aligned price footer.
@Composable
fun DealCard() {
  Column(
    Modifier
      .size(EandSection.bodyWidthCol12, EandSection.bodyHeightRow3)
      .background(EandColor.surfaceBaseInverse, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.md),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Text("Cinema", style = EandTypography.bodySm, color = EandColor.textDefaultSubtle)
    Text("2 for 1 tickets every weekend", style = EandTypography.headingXs, maxLines = 2)
    Spacer(Modifier.weight(1f))
    Row(horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs), verticalAlignment = Alignment.CenterVertically) {
      OfferBadge("50% off")
      Text("AED 90", style = EandTypography.bodySm.copy(textDecoration = TextDecoration.LineThrough),
        color = EandColor.textDefaultMuted)
    }
    Text("AED 45", style = EandTypography.titleMd, color = EandColor.midnight1100)   // legacy #140f21
    FeedbackPill(likes = 128)
  }
}`,
    react: `import { DealCard } from '@eand/react-design-system';

<DealCard overline="Cinema" title="2 for 1 tickets every weekend"
  discount="50% off" wasPrice="AED 90" price="AED 45"
  likes={128} onLike={like} onDislike={dislike} />`,
  },

  newcard: {
    swift: `import SwiftUI
import EandTokens

// new-on-eand: a 137×224 Story column, no surface. A 4pt-padded frame (r24) around a
// r20 image; selected adds a 2pt gradient ring that does not move the image. "New card"
// md badge at 12,12; a centred body/md caption, 12pt below.
struct NewCard: View {
  let title: String; let image: Image
  var selected = false
  var body: some View {
    VStack(spacing: EandSpacing.md) {
      ZStack(alignment: .topLeading) {
        image.resizable().scaledToFill()
          .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
          .padding(EandSpacing.xs)
          .overlay {
            if selected {
              // Ring stops: legacy Light Green #47cb6c (no token), midnight, brand red.
              RoundedRectangle(cornerRadius: EandRadius.radius8).strokeBorder(
                LinearGradient(stops: [
                  .init(color: Color(hex: "#47cb6c"), location: 0),
                  .init(color: EandColor.midnight1000, location: 0.56),
                  .init(color: EandColor.red1000, location: 1),
                ], startPoint: .bottomLeading, endPoint: .topTrailing),
                lineWidth: EandBorder.lg)
            }
          }
        OfferBadge(text: "New card").padding(EandSpacing.md)
      }
      Text(title).font(.system(size: EandTypography.bodyMd.size))
        .multilineTextAlignment(.center).lineLimit(2)
        .padding(.horizontal, EandSpacing.md)
    }
    .frame(width: 137, height: EandSection.bodyHeightRow3)
  }
}`,
    kotlin: `import androidx.compose.foundation.border
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// new-on-eand: 137×224 Story column; r24 frame (padding 4) around a r20 image,
// 2dp gradient ring when selected, md "New card" badge at 12,12, body/md caption.
@Composable
fun NewCard(title: String, image: Painter, selected: Boolean = false) {
  val frame = RoundedCornerShape(EandRadius.radius8)
  // legacy Light Green #47cb6c has no token (design question); midnight → brand red.
  val ring = Brush.linearGradient(0f to Color(0xFF47CB6C), 0.56f to EandColor.midnight1000, 1f to EandColor.red1000)
  Column(Modifier.size(137.dp, EandSection.bodyHeightRow3),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(EandSpacing.md)) {
    Box(Modifier.weight(1f).fillMaxWidth()
      .then(if (selected) Modifier.border(EandBorder.lg, ring, frame) else Modifier)
      .padding(EandSpacing.xs)) {
      Image(image, null, Modifier.fillMaxSize().clip(RoundedCornerShape(EandRadius.radius7)),
        contentScale = ContentScale.Crop)
      OfferBadge("New card", Modifier.padding(EandSpacing.sm))
    }
    Text(title, style = EandTypography.bodyMd, textAlign = TextAlign.Center, maxLines = 2,
      modifier = Modifier.padding(horizontal = EandSpacing.md))
  }
}`,
    react: `import { NewCard } from '@eand/react-design-system';

<NewCard title="New on e&" image={<img src="/stories/esim.jpg" alt="" />} selected />
<NewCard title="Roam like home" image={<img src="/stories/roaming.jpg" alt="" />} badge={false} />`,
  },

  servicecard: {
    swift: `import SwiftUI
import EandTokens

// service-card: 148pt (row-2), r20, white, no border; padding 8/8/16, top-aligned.
// A 48pt icon under a 24pt top pad, then a title/xs label, centred, 40pt tall (2 lines).
// grid width 109 / carousel 128. Optional badge at 8,8.
struct ServiceCard: View {
  let label: String; let icon: Image
  var body: some View {
    VStack(spacing: 0) {
      icon.resizable().scaledToFit()
        .frame(width: EandIcon.icon4xl, height: EandIcon.icon4xl)
        .padding(.top, EandSpacing.spacing2xl)
      Spacer(minLength: 0)
      Text(label)
        .font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
        .multilineTextAlignment(.center).lineLimit(2)
        .frame(height: EandScale.scale40)
    }
    .padding(.horizontal, EandSpacing.sm).padding(.top, EandSpacing.sm).padding(.bottom, EandSpacing.lg)
    .frame(width: 109, height: EandSection.bodyHeightRow2)
    .background(EandColor.surfaceCanvasDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// service-card: 148dp (row-2), r20, white, no border; padding 8/8/16; 48dp icon under a
// 24dp pad; title/xs label, centred, 40dp tall.
@Composable
fun ServiceCard(label: String, icon: Painter, onClick: () -> Unit) {
  Column(
    Modifier
      .size(109.dp, EandSection.bodyHeightRow2)
      .clip(RoundedCornerShape(EandRadius.radius7))
      .background(EandColor.surfaceCanvasDefault)
      .clickable(onClick = onClick)
      .padding(start = EandSpacing.sm, top = EandSpacing.sm, end = EandSpacing.sm, bottom = EandSpacing.lg),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Image(icon, null, Modifier.padding(top = EandSpacing.spacing2xl).size(EandIcon.icon4xl))
    Spacer(Modifier.weight(1f))
    Text(label, style = EandTypography.titleXs, textAlign = TextAlign.Center, maxLines = 2,
      modifier = Modifier.height(EandScale.scale40))
  }
}`,
    react: `import { ServiceCard, Badge } from '@eand/react-design-system';

<ServiceCard size="grid" label="eLife TV"
  icon={<img src="/3d/elife-tv.png" alt="" width={48} height={48} />}
  badge={<Badge offer="new-plan" size="md">New</Badge>} />`,
  },

  highlight: {
    swift: `import SwiftUI
import EandTokens

// highlight lg: 452pt (row-6), r24, image + a midnight scrim (clear to 46%, 60% at 70%,
// 80% at the bottom). Content padded 16 top / 12: tag (glass logo row), 24pt title and
// body/md subtitle (2 lines each, inverse ink), then the glass action bar 16pt below.
// md 224 / sm 148 keep only the tag and the action bar.
struct Highlight: View {
  let title: String; let subtitle: String; let image: Image
  var body: some View {
    ZStack(alignment: .bottomLeading) {
      image.resizable().scaledToFill()
      LinearGradient(stops: [
        .init(color: EandColor.midnight1000.opacity(0), location: 0.46),
        .init(color: EandColor.midnightA60, location: 0.70),
        .init(color: EandColor.midnightA80, location: 1),
      ], startPoint: .top, endPoint: .bottom)
      VStack(alignment: .leading, spacing: 0) {
        LogoRow(logos: [Image("brand-smiles")]).padding(.bottom, EandSpacing.md)     // tag
        Text(title)
          .font(.system(size: EandTypography.headingLg.size, weight: EandTypography.headingLg.weight))
          .lineLimit(2)
        Text(subtitle).font(.system(size: EandTypography.bodyMd.size)).lineLimit(2)
        ActionBar(title: "Smiles Unlimited", subtitle: "From AED 49/mo")              // glass
          .padding(.top, EandSpacing.lg)
      }
      .foregroundColor(EandColor.textDefaultInverse)
      .padding(.top, EandSpacing.lg).padding([.horizontal, .bottom], EandSpacing.md)
    }
    .frame(height: EandSection.bodyHeightRow6)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius8))
  }
}`,
    kotlin: `import com.eand.tokens.*

// highlight lg: 452dp (row-6), r24, image + midnight scrim (0 → 60% → 80% from 46%),
// 24sp title + body/md subtitle in inverse ink, glass action bar at the bottom.
@Composable
fun Highlight(title: String, subtitle: String, image: Painter) {
  Box(
    Modifier.fillMaxWidth().height(EandSection.bodyHeightRow6)
      .clip(RoundedCornerShape(EandRadius.radius8)),
    contentAlignment = Alignment.BottomStart,
  ) {
    Image(image, null, Modifier.matchParentSize(), contentScale = ContentScale.Crop)
    Box(Modifier.matchParentSize().background(Brush.verticalGradient(
      0.46f to Color.Transparent, 0.70f to EandColor.midnightA60, 1f to EandColor.midnightA80)))
    Column(Modifier.padding(start = EandSpacing.md, top = EandSpacing.lg, end = EandSpacing.md, bottom = EandSpacing.md)) {
      Text(title, style = EandTypography.headingLg, color = EandColor.textDefaultInverse, maxLines = 2)
      Text(subtitle, style = EandTypography.bodyMd, color = EandColor.textDefaultInverse, maxLines = 2)
      Spacer(Modifier.height(EandSpacing.lg))
      ActionBar("Smiles Unlimited", "From AED 49/mo", glass = true) {}
    }
  }
}`,
    react: `import { Highlight } from '@eand/react-design-system';

<Highlight size="lg" image="/banners/smiles.jpg"
  title="Smiles Unlimited" subtitle="Exclusive venue deals, every day"
  action={{ title: 'Smiles Unlimited', subtitle: 'From AED 49/mo', cta: 'Play now', onCta: play }} />

<Highlight size="md" tag="badge" badge="Limited time offer" image="/banners/roaming.jpg"
  action={{ title: 'Roam like home', cta: 'Get it' }} />

<Highlight placement="stacked" image="/banners/tv.jpg" title="eLife TV"
  items={[{ image: '/banners/gaming.jpg', title: 'Gaming bundles' }]} />`,
  },

  recommendation: {
    swift: `import SwiftUI
import EandTokens

// Recommendation: 224pt (row-3), r20, padding 16, everything centred. inverse (default):
// white glass 15% + blur over imagery, white primary md button. 32pt r8 icon, title/md
// (2 lines), body/md description, CTA 12pt below. Carousel cards are 338 wide, gap 4.
struct Recommendation: View {
  var body: some View {
    VStack(spacing: 0) {
      Image("rec-offers").resizable()
        .frame(width: EandIcon.icon2xl, height: EandIcon.icon2xl)
        .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius3))
      VStack(spacing: EandSpacing.xs) {
        Text("Recommended for you")
          .font(.system(size: EandTypography.titleMd.size, weight: EandTypography.titleMd.weight))
          .foregroundColor(EandColor.textDefaultInverse).lineLimit(2)
        Text("Handpicked offers based on how you use e&.")
          .font(.system(size: EandTypography.bodyMd.size))
          .foregroundColor(EandColor.textDefaultInverseSubtle)
        Spacer(minLength: 0)
      }
      .multilineTextAlignment(.center)
      .padding(.top, EandSpacing.md)
      InverseButton(title: "Explore", size: .md) {}        // white fill, midnight label
        .padding(.top, EandSpacing.md)
    }
    .padding(EandSpacing.lg)
    .frame(maxWidth: .infinity).frame(height: EandSection.bodyHeightRow3)
    .background(EandColor.surfaceGlassWhiteMd)
    .background(.ultraThinMaterial)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// Recommendation (inverse): 224dp, r20, padding 16, centred; white glass 15% + blur,
// title/md + body/md, white primary md button.
@Composable
fun Recommendation(onCta: () -> Unit) {
  Column(
    Modifier
      .fillMaxWidth().height(EandSection.bodyHeightRow3)
      .clip(RoundedCornerShape(EandRadius.radius7))
      .background(EandColor.surfaceGlassWhiteMd)
      .padding(EandSpacing.lg),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Image(painterResource(R.drawable.rec_offers), null,
      Modifier.size(EandIcon.icon2xl).clip(RoundedCornerShape(EandRadius.radius3)))
    Column(
      Modifier.weight(1f).padding(top = EandSpacing.md),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
    ) {
      Text("Recommended for you", style = EandTypography.titleMd, color = EandColor.textDefaultInverse,
        textAlign = TextAlign.Center, maxLines = 2)
      Text("Handpicked offers based on how you use e&.", style = EandTypography.bodyMd,
        color = EandColor.textDefaultInverseSubtle, textAlign = TextAlign.Center)
    }
    InverseButton("Explore", ButtonSize.Md, onCta, Modifier.padding(top = EandSpacing.md))
  }
}`,
    react: `import { Recommendation } from '@eand/react-design-system';

<Recommendation title="Recommended for you" description="Handpicked offers based on how you use e&."
  cta="Explore" onCta={openOffers} />                         {/* glass, over imagery */}
<Recommendation inverse={false} title="Try eLife TV"
  description="200+ channels, first month free." cta="Start trial" />
<Recommendation carousel title="Roaming packs" cta="View"
  items={[{ title: 'Smiles deals', cta: 'View' }, { title: 'Device offers', cta: 'View' }]} />`,
  },

  smilesbalance: {
    swift: `import SwiftUI
import EandTokens

// smiles-balance-card: white (surface/base/inverse), full width × 148 (row-2), r16.
// Header 16/16/0: the 28pt total (heading/lg variables) over "Points" (24pt style) with
// a 20pt info button, and a 40pt tier pill. Footer 8/16/0, bottom-aligned, gap 4: a 12pt
// pill progress bar (sunken-inverse track, positive fill) and the next-tier line.
struct SmilesBalance: View {
  let points: String; let progress: Double   // 0…1
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 0) {
          Text(points).font(.system(size: EandTypography.headingXl.size, weight: .bold))   // 28pt
          HStack(spacing: EandSpacing.xs) {
            Text("Points")
              .font(.system(size: EandTypography.headingLg.size, weight: EandTypography.headingLg.weight))
            Image(systemName: "info.circle.fill").font(.system(size: EandIcon.md))
              .frame(width: EandIcon.lg, height: EandIcon.lg)
          }
        }
        Spacer()
        TierPill(tier: .silver)       // 40pt pill, 32pt medal; legacy fill #f4f3f5 (no token)
      }
      .padding([.top, .horizontal], EandSpacing.lg)
      Spacer(minLength: EandSpacing.sm)
      VStack(alignment: .leading, spacing: EandSpacing.xs) {
        GeometryReader { geo in
          ZStack(alignment: .leading) {
            Capsule().fill(EandColor.surfaceSunkenInverse)
            Capsule().fill(EandColor.textPositiveSubtle).frame(width: geo.size.width * progress)
          }
        }
        .frame(height: EandScale.scale12)
        Text("Just 2,500 points to your Gold Tier").font(.system(size: EandTypography.bodyMd.size))
      }
      .padding(.horizontal, EandSpacing.lg)
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .frame(maxWidth: .infinity).frame(height: EandSection.bodyHeightRow2)
    .background(EandColor.surfaceBaseInverse)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// smiles-balance-card: white, full width × 148dp, r16. 28sp total over "Points" (24sp),
// tier pill, then a 12dp pill progress bar and the next-tier line.
@Composable
fun SmilesBalance(points: String, progress: Float) {
  Column(
    Modifier.fillMaxWidth().height(EandSection.bodyHeightRow2)
      .background(EandColor.surfaceBaseInverse, RoundedCornerShape(EandRadius.radius6)),
  ) {
    Row(Modifier.padding(start = EandSpacing.lg, top = EandSpacing.lg, end = EandSpacing.lg)) {
      Column(Modifier.weight(1f)) {
        Text(points, style = EandTypography.headingXl.copy(lineHeight = 33.6.sp))   // heading/lg variables
        Text("Points", style = EandTypography.headingLg)
      }
      TierPill(Tier.Silver)
    }
    Spacer(Modifier.weight(1f))
    Column(Modifier.padding(horizontal = EandSpacing.lg), verticalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
      Box(Modifier.fillMaxWidth().height(EandScale.scale12).background(EandColor.surfaceSunkenInverse, CircleShape)) {
        Box(Modifier.fillMaxHeight().fillMaxWidth(progress).background(EandColor.textPositiveSubtle, CircleShape))
      }
      Text("Just 2,500 points to your Gold Tier", style = EandTypography.bodyMd)
    }
  }
}`,
    react: `import { SmilesBalance } from '@eand/react-design-system';

<SmilesBalance points="40,340" tier="silver" nextTier="gold"
  pointsToNext="2,500" progress={35} onInfo={showSmilesInfo} />
<SmilesBalance active={false} points="0" tier={null} />   {/* not activated yet */}`,
  },

  voucher: {
    swift: `import SwiftUI
import EandTokens

// Voucher: a fixed 144×144 ticket (r16). The outline, side notches and perforation are
// ONE exported Figma path (28278:13819) — import it as a vector asset; don't redraw it.
// Light = white ticket, dark = midnight-raised. Title title/xs over body/md, centred
// (padding 16/8), then the button/lg "Apply" action (padding 16/12).
struct Voucher: View {
  let title: String; let description: String
  var applied = false
  var onApply: () -> Void = {}
  var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 0) {
        Text(title).font(.system(size: EandTypography.titleXs.size, weight: EandTypography.titleXs.weight))
        Text(description).font(.system(size: EandTypography.bodyMd.size))
      }
      .foregroundColor(EandColor.textDefaultDefault)
      .multilineTextAlignment(.center)
      .padding(.vertical, EandSpacing.lg).padding(.horizontal, EandSpacing.sm)
      .frame(maxHeight: .infinity)
      Button(action: onApply) {
        HStack(spacing: EandSpacing.xs) {
          Text(applied ? "Applied" : "Apply")
            .font(.system(size: EandTypography.buttonLg.size, weight: EandTypography.buttonLg.weight))
          Image(systemName: applied ? "checkmark" : "plus.circle.fill").font(.system(size: EandIcon.xl))
        }
        .foregroundColor(applied ? EandColor.textPositiveSubtle : EandColor.buttonTertiaryTextMidnightDefault)
      }
      .disabled(applied)
      .padding(.vertical, EandSpacing.lg).padding(.horizontal, EandSpacing.md)
    }
    .frame(width: EandScale.scale144, height: EandScale.scale144)
    .background(Image("voucher-shape").renderingMode(.template).foregroundColor(EandColor.surfaceBaseInverse))
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// Voucher: fixed 144×144 ticket (r16) drawn from the exported Figma shape (one vector
// drawable with the notches + perforation). Centred title/xs + body/md, then "Apply".
@Composable
fun Voucher(title: String, description: String, applied: Boolean = false, onApply: () -> Unit = {}) {
  Box(Modifier.size(EandScale.scale144).clip(RoundedCornerShape(EandRadius.radius6))) {
    Icon(painterResource(R.drawable.voucher_shape), null, Modifier.matchParentSize(), tint = EandColor.surfaceBaseInverse)
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
      Column(
        Modifier.weight(1f).padding(horizontal = EandSpacing.sm, vertical = EandSpacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center,
      ) {
        Text(title, style = EandTypography.titleXs, color = EandColor.textDefaultDefault, textAlign = TextAlign.Center)
        Text(description, style = EandTypography.bodyMd, color = EandColor.textDefaultDefault, textAlign = TextAlign.Center)
      }
      Row(
        Modifier.clickable(enabled = !applied, onClick = onApply)
          .padding(horizontal = EandSpacing.md, vertical = EandSpacing.lg),
        horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs),
        verticalAlignment = Alignment.CenterVertically,
      ) {
        val ink = if (applied) EandColor.textPositiveSubtle else EandColor.buttonTertiaryTextMidnightDefault
        Text(if (applied) "Applied" else "Apply", style = EandTypography.buttonLg, color = ink)
        Icon(if (applied) Icons.Filled.Check else Icons.Filled.AddCircle, null, Modifier.size(EandIcon.xl), tint = ink)
      }
    }
  }
}`,
    react: `import { Voucher } from '@eand/react-design-system';

<Voucher title="AED 50 off" description="above AED 60+" onApply={applyVoucher} />
<Voucher display="dark" state="applied" title="Free delivery" description="on any device" />`,
  },

  tooltip: {
    swift: `import SwiftUI
import EandTokens

// Tooltip standard: 200 wide, r12, padding 12, white (surface/canvas/default), shadow/md,
// body/sm default ink, and a 12×6 caret facing the trigger (inset 32 when not centred).
// simple = r4, padding 4/12; rich = r20, padding 16 with title, media, body and a close.
// surface dark = surface/canvas/midnight with inverse ink.
struct Tooltip: View {
  let content: String
  var body: some View {
    VStack(spacing: 0) {
      Text(content)
        .font(.system(size: EandTypography.bodySm.size))
        .foregroundColor(EandColor.textDefaultDefault)
        .padding(EandSpacing.md)
        .frame(width: 200, alignment: .leading)
        .background(EandColor.surfaceCanvasDefault)
        .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius4))
      Caret().fill(EandColor.surfaceRaisedDefault)
        .frame(width: EandScale.scale12, height: 6)               // placement=top: caret below
    }
    .shadow(color: EandColor.midnightA10, radius: 22)              // shadow/md: blur 44
  }
}

struct Caret: Shape {
  func path(in r: CGRect) -> Path {
    Path { p in p.move(to: .zero); p.addLine(to: CGPoint(x: r.maxX, y: 0)); p.addLine(to: CGPoint(x: r.midX, y: r.maxY)) }
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.GenericShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.draw.shadow
import com.eand.tokens.*

// Tooltip standard: 200dp wide, r12, padding 12, white, shadow/md, body/sm, 12×6 caret.
private val Caret = GenericShape { size, _ -> moveTo(0f, 0f); lineTo(size.width, 0f); lineTo(size.width / 2, size.height) }

@Composable
fun Tooltip(content: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(
      content,
      style = EandTypography.bodySm,
      color = EandColor.textDefaultDefault,
      modifier = Modifier
        .width(200.dp)
        .shadow(22.dp, RoundedCornerShape(EandRadius.radius4), ambientColor = EandColor.midnightA10, spotColor = EandColor.midnightA10)
        .background(EandColor.surfaceCanvasDefault, RoundedCornerShape(EandRadius.radius4))
        .padding(EandSpacing.md),
    )
    Box(Modifier.size(EandScale.scale12, 6.dp).background(EandColor.surfaceRaisedDefault, Caret))
  }
}`,
    react: `import { Tooltip, Button } from '@eand/react-design-system';

<Tooltip content="Uses your Smiles Points" visible>
  <Button size="sm" variant="secondary">Redeem</Button>
</Tooltip>

<Tooltip size="rich" visible placement="bottom" caretAlign="start" onClose={dismissTip}
  title="New: split the bill" content="Share a plan's cost with up to 4 family members."
  steps="1 of 3" action={<Button size="sm">Next</Button>}>
  <Button size="sm" variant="tertiary">What's new</Button>
</Tooltip>`,
  },

  bottomsheet: {
    swift: `import SwiftUI
import EandTokens

// V1.2 bottom-sheet: surface/sunken/inverse, top radius 24, over the Scrim. Grabber 40×4
// (midnight glass 20%). Header 20/20/0 (bottom 20): optional 40pt r12 icon, a 20pt / 110%
// bold title, body/md description; close is a 40pt section-link button. Body padded
// 0/20/20 on surface/base/default; the footer is padded 20.
struct BottomSheet<Content: View>: View {
  let title: String
  var onClose: () -> Void = {}
  @ViewBuilder var content: Content
  var body: some View {
    VStack(spacing: 0) {
      Capsule().fill(EandColor.surfaceGlassMidnightMd)
        .frame(width: EandScale.scale40, height: EandScale.scale4)
        .padding(.top, EandSpacing.xs)
      HStack(alignment: .top, spacing: EandSpacing.md) {
        Text(title)
          .font(.system(size: EandTypography.headingMd.size, weight: EandTypography.headingMd.weight))
          .padding(.vertical, EandSpacing.xs)
        Spacer(minLength: 0)
        CloseLink(action: onClose)                          // solid white, 40pt, r14
      }
      .padding([.top, .horizontal], EandSpacing.xl).padding(.bottom, EandSpacing.xl)
      content
        .padding([.horizontal, .bottom], EandSpacing.xl)
        .frame(maxWidth: .infinity)
        .background(EandColor.surfaceBaseDefault)
    }
    .foregroundColor(EandColor.textDefaultDefault)
    .background(EandColor.surfaceSunkenInverse)
    .clipShape(UnevenRoundedRectangle(topLeadingRadius: EandRadius.radius8,
                                      topTrailingRadius: EandRadius.radius8))
  }
}`,
    kotlin: `import com.eand.tokens.*

// Prefer Material3 ModalBottomSheet; style the sheet, grabber and title with tokens.
// Material draws its own scrim — set scrimColor to the e& one.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EandBottomSheet(title: String, onDismiss: () -> Unit, content: @Composable () -> Unit) {
  ModalBottomSheet(
    onDismissRequest = onDismiss,
    containerColor = EandColor.surfaceSunkenInverse,
    scrimColor = EandColor.surfaceOverlayScrim,
    shape = RoundedCornerShape(topStart = EandRadius.radius8, topEnd = EandRadius.radius8),
    dragHandle = {
      Box(Modifier.padding(top = EandSpacing.xs).size(EandScale.scale40, EandScale.scale4)
        .background(EandColor.surfaceGlassMidnightMd, CircleShape))
    },
  ) {
    Row(Modifier.padding(EandSpacing.xl), verticalAlignment = Alignment.Top) {
      Text(title, style = EandTypography.headingMd, color = EandColor.textDefaultDefault,
        modifier = Modifier.weight(1f).padding(vertical = EandSpacing.xs))
      CloseLink(onClick = onDismiss)
    }
    Box(Modifier.fillMaxWidth().background(EandColor.surfaceBaseDefault)
      .padding(start = EandSpacing.xl, end = EandSpacing.xl, bottom = EandSpacing.xl)) { content() }
  }
}`,
    react: `import { BottomSheet, Button, Chip, Icon } from '@eand/react-design-system';

<BottomSheet open title="Choose a plan" description="Pick the data that suits you."
  icon={<Icon name="sim-filled" size={40} />}
  pills={<><Chip type="outline" selected>Monthly</Chip><Chip type="outline">Yearly</Chip></>}
  footer={<Button block size="lg">Confirm</Button>} onDismiss={close}>
  Plan options go here.
</BottomSheet>

<BottomSheet open type="system-message" title="Location access" onDismiss={close}
  footer={<Button block size="lg">Allow</Button>} />`,
  },

  picker: {
    swift: `import SwiftUI
import EandTokens

// V1.2 picker tile: fixed 106×72, r16, centred. Value title/sm over a body/xs caption
// (20pt top, 8pt sides). Selected swaps the fill to midnight-raised with inverse ink
// and adds a 20pt check-circle at 6,6 from the top-end. Optional neutral sm badge strip.
struct PickerOption: View {
  let value: String; let caption: String; let selected: Bool
  var body: some View {
    VStack(spacing: 0) {
      Text(value).font(.system(size: EandTypography.titleSm.size, weight: EandTypography.titleSm.weight))
      Text(caption).font(.system(size: EandTypography.bodyXs.size))
        .foregroundColor(selected ? EandColor.textDefaultInverse : EandColor.textDefaultSubtle)
      Spacer(minLength: 0)
    }
    .foregroundColor(selected ? EandColor.textDefaultInverse : EandColor.textDefaultDefault)
    .padding(.top, EandSpacing.xl).padding(.horizontal, EandSpacing.sm)
    .frame(width: 106, height: EandScale.scale72)
    .background(selected ? EandColor.surfaceRaisedMidnight : EandColor.surfaceSunkenDefault)
    .overlay(alignment: .topTrailing) {
      if selected {
        Image(systemName: "checkmark.circle.fill").font(.system(size: EandIcon.lg))
          .foregroundColor(EandColor.surfaceBaseInverse)
          .frame(width: EandIcon.xl, height: EandIcon.xl).padding(6)
      }
    }
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import com.eand.tokens.*

// V1.2 picker tile: 106×72, r16; selected = midnight-raised fill, inverse ink, check-circle.
@Composable
fun PickerOption(value: String, caption: String, selected: Boolean, onClick: () -> Unit) {
  val ink = if (selected) EandColor.textDefaultInverse else EandColor.textDefaultDefault
  Box(
    Modifier
      .size(106.dp, EandScale.scale72)
      .clip(RoundedCornerShape(EandRadius.radius6))
      .background(if (selected) EandColor.surfaceRaisedMidnight else EandColor.surfaceSunkenDefault)
      .selectable(selected, role = Role.RadioButton, onClick = onClick),
  ) {
    Column(
      Modifier.fillMaxWidth().padding(start = EandSpacing.sm, top = EandSpacing.xl, end = EandSpacing.sm),
      horizontalAlignment = Alignment.CenterHorizontally,
    ) {
      Text(value, style = EandTypography.titleSm, color = ink)
      Text(caption, style = EandTypography.bodyXs,
        color = if (selected) EandColor.textDefaultInverse else EandColor.textDefaultSubtle)
    }
    if (selected) Icon(Icons.Filled.CheckCircle, null,
      Modifier.align(Alignment.TopEnd).padding(6.dp).size(EandIcon.xl).padding(EandSpacing.spacing2xs),
      tint = EandColor.surfaceBaseInverse)
  }
}`,
    react: `import { Picker } from '@eand/react-design-system';

<Picker surface="default" defaultValue={1} onChange={(i) => setAmount(i)} options={[
  { value: '5', caption: 'AED', badge: '1 GB' },
  { value: '10', caption: 'AED', badge: '3 GB' },
  { value: '20', caption: 'AED', badge: '8 GB' },
]} />`,
  },

  dismiss: {
    swift: `import SwiftUI
import EandTokens

// dismiss: a TRANSPARENT 24pt box (sm 20) with 2pt padding, holding the icon-set
// dismiss-filled glyph at 20pt (sm 16) in color/dismiss/{default,inverse}. The X is
// knocked out, so the surface shows through — it is not drawn white.
struct Dismiss: View {
  var inverse = false
  var small = false
  var action: () -> Void
  var body: some View {
    Button(action: action) {
      Image(systemName: "xmark.circle.fill")       // same geometry as dismiss-filled
        .resizable()
        .foregroundStyle(inverse ? EandColor.dismissInverse : EandColor.dismissDefault)
        .frame(width: small ? EandIcon.md : EandIcon.lg, height: small ? EandIcon.md : EandIcon.lg)
        .padding(EandSpacing.spacing2xs)
    }
    .accessibilityLabel("Dismiss")
  }
}`,
    kotlin: `import com.eand.tokens.*

// dismiss: transparent 24dp box (sm 20), 2dp padding, a 20dp (sm 16) filled close-circle
// in color/dismiss/{default,inverse}; the X is knocked out, not white.
@Composable
fun Dismiss(inverse: Boolean = false, small: Boolean = false, onClick: () -> Unit) {
  IconButton(onClick = onClick, modifier = Modifier.size(if (small) EandIcon.lg else EandIcon.xl)) {
    Icon(
      Icons.Filled.Cancel, "Dismiss",                // same geometry as dismiss-filled
      tint = if (inverse) EandColor.dismissInverse else EandColor.dismissDefault,
      modifier = Modifier.padding(EandSpacing.spacing2xs),
    )
  }
}`,
    react: `import { Dismiss } from '@eand/react-design-system';

<Dismiss onClick={() => {}} />
<Dismiss size="sm" />
<Dismiss surface="inverse" />    {/* on dark surfaces */}`,
  },
};
