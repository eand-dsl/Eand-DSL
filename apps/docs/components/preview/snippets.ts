import type { Snippet } from './code-tabs';

// Native snippets show how to build the e& look from @eand/tokens-native (EandColor /
// EandSpacing / EandRadius / EandTypography). React shows the @eand/react-design-system
// component used in the Figma Make kit. Tokens are real names from the generated files.
export const snippets: Record<string, Snippet> = {
  button: {
    swift: `import SwiftUI
import EandTokens

struct EandButton: View {
  let title: String
  var action: () -> Void
  var body: some View {
    Button(action: action) {
      Text(title)
        .font(.system(size: EandTypography.buttonMd.size, weight: .semibold))
        .foregroundColor(EandColor.textDefaultInverse)
        .frame(maxWidth: .infinity)
        .padding(.vertical, EandSpacing.md)
    }
    .background(EandColor.surfaceBaseBrand)
    .clipShape(Capsule())
  }
}`,
    kotlin: `import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import com.eand.tokens.EandColor

@Composable
fun EandButton(title: String, onClick: () -> Unit) {
  Button(
    onClick = onClick,
    shape = CircleShape,
    colors = ButtonDefaults.buttonColors(containerColor = EandColor.surfaceBaseBrand),
    modifier = Modifier.fillMaxWidth(),
  ) { Text(title, style = EandTypography.buttonMd, color = EandColor.textDefaultInverse) }
}`,
    react: `import { Button } from '@eand/react-design-system';

<Button variant="primary">Make your own deal</Button>
<Button variant="secondary">Overview</Button>`,
  },

  badge: {
    swift: `import SwiftUI
import EandTokens

struct OfferBadge: View {
  let text: String
  var body: some View {
    Text(text)
      .font(.system(size: EandTypography.bodyXs.size, weight: .semibold))
      .foregroundColor(EandColor.badgeTextOffersNewPlan)
      .padding(.horizontal, EandSpacing.sm)
      .padding(.vertical, EandSpacing.spacing2xs)
      .background(EandColor.badgeSurfaceOffersNewPlan)
      .clipShape(Capsule())
  }
}`,
    kotlin: `import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import com.eand.tokens.EandColor

@Composable
fun OfferBadge(text: String) {
  Text(
    text,
    style = EandTypography.bodyXs,
    color = EandColor.badgeTextOffersNewPlan,
    modifier = Modifier
      .background(EandColor.badgeSurfaceOffersNewPlan, CircleShape)
      .padding(horizontal = EandSpacing.sm, vertical = EandSpacing.spacing2xs),
  )
}`,
    react: `import { Badge } from '@eand/react-design-system';

<Badge offer="new-plan">New</Badge>          // green
<Badge offer="discount">20% off</Badge>      // red
<Badge status="positive">3 active</Badge>`,
  },

  chip: {
    swift: `import SwiftUI
import EandTokens

struct EandChip: View {
  let label: String; let selected: Bool
  var body: some View {
    Text(label)
      .font(.system(size: EandTypography.bodySm.size, weight: .medium))
      .foregroundColor(selected ? EandColor.textBrandDefault : EandColor.textDefaultDefault)
      .padding(.horizontal, EandSpacing.md)
      .padding(.vertical, EandSpacing.sm)
      .overlay(Capsule().stroke(
        selected ? EandColor.surfaceBaseBrand : EandColor.borderInteractiveDefaultDefault))
      .clipShape(Capsule())
  }
}`,
    kotlin: `import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.AssistChip
import com.eand.tokens.EandColor

@Composable
fun EandChip(label: String, selected: Boolean) {
  AssistChip(
    onClick = {},
    label = { Text(label, style = EandTypography.bodySm) },
    shape = CircleShape,
    border = BorderStroke(1.dp,
      if (selected) EandColor.surfaceBaseBrand else EandColor.borderInteractiveDefaultDefault),
  )
}`,
    react: `import { Chip } from '@eand/react-design-system';

<Chip selected>Manage my Plan</Chip>
<Chip>Change Plan</Chip>`,
  },

  topbar: {
    swift: `import SwiftUI
import EandTokens

// Brand hero header: top row (back + logo + icon buttons), big-title block, bottom slot.
struct TopBar: View {
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.md) {
      HStack {
        CircleButton(icon: "chevron.left")
        Spacer(); EandLogo(version: .white); Spacer()
        CircleButton(icon: "sparkles"); CircleButton(icon: "bell")
      }
      VStack(alignment: .leading, spacing: EandSpacing.spacing2xs) {
        Text("Overline").font(.system(size: EandTypography.titleXs.size, weight: .semibold))
        Text("Large title goes here")
          .font(.system(size: EandTypography.headingLg.size, weight: .bold))
        Text("Lorem ipsum dolor sit amet.")
          .foregroundColor(EandColor.textDefaultInverseSubtle)
      }
      Searchbar(query: .constant(""))   // bottom slot
    }
    .foregroundColor(.white)
    .padding(.horizontal, EandSpacing.lg).padding(.bottom, EandSpacing.lg)
    .background(EandColor.surfaceBaseBrand)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

// Brand hero header: top row + big-title block + bottom slot.
@Composable
fun TopBar() {
  Column(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceBaseBrand,
        RoundedCornerShape(bottomStart = EandRadius.radius6, bottomEnd = EandRadius.radius6))
      .padding(horizontal = EandSpacing.lg).padding(bottom = EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Row(verticalAlignment = Alignment.CenterVertically) {
      CircleButton(Icons.Filled.ChevronLeft)
      Spacer(Modifier.weight(1f)); EandLogo(LogoVersion.White); Spacer(Modifier.weight(1f))
      CircleButton(Icons.Filled.AutoAwesome); CircleButton(Icons.Filled.Notifications)
    }
    Column(verticalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs)) {
      Text("Overline", color = Color.White, style = EandTypography.titleXs)
      Text("Large title goes here", color = Color.White, style = EandTypography.headingLg)
      Text("Lorem ipsum dolor sit amet.", color = EandColor.textDefaultInverseSubtle)
    }
    Searchbar("", {})   // bottom slot
  }
}`,
    react: `import { TopBar, Searchbar, Chip, Icon } from '@eand/react-design-system';

<TopBar
  surface="brand"
  logo
  leading={<Icon name="chevron-left" color="#fff" />}
  actions={[<Icon name="magic-wand" color="#fff" />, <Icon name="notification" color="#fff" />]}
  eyebrow="Overline"
  bigTitle="Large title goes here"
  chevron
  subtext="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
>
  <Searchbar placeholder="Search for feature" />
  <div style={{ display: 'flex', gap: 8 }}>
    <Chip type="glass" check>All</Chip>
    <Chip type="glass">Plans</Chip>
  </div>
</TopBar>`,
  },

  section: {
    swift: `import SwiftUI
import EandTokens

// Rounded container: header (title · context · trigger) + body slot sized by row.
struct EandSection<Content: View>: View {
  let title: String; let context: String
  var size: CGFloat = 224   // xs 72 · sm 148 · md 224 · lg 300 · xl 452
  @ViewBuilder var content: Content
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: EandSpacing.xs) {
          Text(title).font(.system(size: EandTypography.headingLg.size, weight: .bold))
          Text(context).font(.system(size: EandTypography.bodyMd.size))
            .foregroundColor(EandColor.textDefaultSubtle)
        }
        Spacer()
        SectionLink()   // 40pt chevron trigger
      }
      .padding(.top, EandSpacing.spacing2xl).padding(.horizontal, EandSpacing.lg)
      content
        .frame(maxWidth: .infinity, minHeight: size, alignment: .topLeading)
        .padding(EandSpacing.lg)
    }
    .background(EandColor.surfaceBaseDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

// Rounded container: header + body slot. size reserves the row height per card type.
@Composable
fun EandSection(
  title: String, context: String, size: Dp = 224.dp,   // xs 72 … xl 452
  content: @Composable ColumnScope.() -> Unit,
) {
  Column(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius7)),
  ) {
    Row(
      Modifier.padding(top = EandSpacing.spacing2xl, start = EandSpacing.lg, end = EandSpacing.lg),
      verticalAlignment = Alignment.Top,
    ) {
      Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(EandSpacing.xs)) {
        Text(title, style = EandTypography.headingLg)
        Text(context, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
      }
      SectionLink()   // 40dp chevron trigger
    }
    Column(Modifier.heightIn(min = size).padding(EandSpacing.lg), content = content)
  }
}`,
    react: `import { Section, DealCard } from '@eand/react-design-system';

<Section title="Section" context="Cover these with your Smiles Points"
  surface="default" trigger="chevron" size="md">
  <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
    <DealCard title="Control from anywhere" width={166} />
    <DealCard title="Manage plans" width={166} />
  </div>
</Section>`,
  },

  listrow: {
    swift: `import SwiftUI
import EandTokens

struct PlanRow: View {
  let label: String; let value: String
  var body: some View {
    HStack {
      Text(label).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
      Spacer()
      Text(value).foregroundColor(EandColor.textDefaultMuted)
    }
    .padding(EandSpacing.lg)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun PlanRow(label: String, value: String) {
  Row(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius5))
      .padding(EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Text(label, style = EandTypography.titleSm)
    Spacer(Modifier.weight(1f))
    Text(value, color = EandColor.textDefaultMuted)
  }
}`,
    react: `import { ListRow } from '@eand/react-design-system';

<ListRow label="2 GB left" value="Local Data" chevron={false} />`,
  },

  quickaction: {
    swift: `import SwiftUI
import EandTokens

struct QuickActionCell: View {
  let label: String; let icon: Image
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.md) {
      icon.frame(width: EandIcon.lg, height: EandIcon.lg)
        .padding(10)
        .background(EandColor.surfaceBaseDefault)            // grey square
        .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius3))
      Spacer()
      Text(label).font(.system(size: EandTypography.titleXs.size, weight: .semibold))
    }
    .padding(EandSpacing.md)
    .frame(minHeight: 104, alignment: .leading)
    .background(EandColor.surfaceCanvasDefault)              // white card, NO border
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun QuickActionCell(label: String, icon: Painter) {
  Column(
    Modifier
      .background(EandColor.surfaceCanvasDefault, RoundedCornerShape(EandRadius.radius6))  // no border
      .padding(EandSpacing.md)
      .heightIn(min = 104.dp),
    verticalArrangement = Arrangement.SpaceBetween,
  ) {
    Box(Modifier.background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius3)).padding(10.dp)) {
      Icon(icon, null, Modifier.size(EandIcon.lg))
    }
    Text(label, style = EandTypography.titleXs)
  }
}`,
    react: `import { QuickAction, Icon, Badge } from '@eand/react-design-system';

<QuickAction columns={2} items={[
  { label: 'Add-ons', icon: <Icon name="puzzle"/>, badge: <Badge status="positive" size="sm">3 active</Badge> },
  { label: 'mParking', icon: <Icon name="car"/> },
]} />`,
  },

  navbar: {
    swift: `// Floating glass pill over a midnight scrim. Active tab = solid white pill with red
// icon + label; a 'special' mShop tab is a detached glass circle to the left.
import SwiftUI
import EandTokens

struct NavTab: View {
  let title: String; let icon: Image; let active: Bool
  var body: some View {
    VStack(spacing: 3) {
      icon.frame(width: 24, height: 24)
      Text(title).font(.system(size: 11, weight: .semibold))
    }
    .foregroundColor(active ? EandColor.textBrandDefault : .white)
    .padding(.horizontal, active ? 18 : 14)
    .frame(height: active ? 56 : 64)
    .background(active ? Color.white : .clear)
    .clipShape(Capsule())
  }
}`,
    kotlin: `// Frosted white-15% pill; active tab = white pill + red icon/label; mShop = detached circle.
import com.eand.tokens.EandColor

@Composable
fun NavTab(title: String, icon: Painter, active: Boolean) {
  Column(
    Modifier
      .then(if (active) Modifier.background(Color.White, CircleShape) else Modifier)
      .padding(horizontal = if (active) 18.dp else 14.dp)
      .height(if (active) 56.dp else 64.dp),
    horizontalAlignment = Alignment.CenterHorizontally,
  ) {
    Icon(icon, null, Modifier.size(24.dp),
      tint = if (active) EandColor.textBrandDefault else Color.White)
    Text(title, color = if (active) EandColor.textBrandDefault else Color.White)
  }
}`,
    react: `import { NavBar, Icon } from '@eand/react-design-system';

<NavBar items={[
  { label: 'mShop', icon: <Icon name="store"/>, special: true },
  { label: 'Home', icon: <Icon name="home"/>, active: true },
  { label: 'Support', icon: <Icon name="support"/> },
  { label: 'Profile', icon: <Icon name="user"/> },
  { label: 'Shop', icon: <Icon name="shop"/> },
]} />`,
  },

  plancard: {
    swift: `import SwiftUI
import EandTokens

struct PlanCard: View {
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.sm) {
      Text("POSTPAID").font(.system(size: EandTypography.bodyXs.size, weight: .bold))
        .foregroundColor(EandColor.textBrandDefault)
      Text("Freedom Live 200").font(.system(size: EandTypography.titleMd.size, weight: .bold))
      Text("from AED 200/mo").foregroundColor(EandColor.textDefaultMuted)
    }
    .padding(EandSpacing.lg)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun PlanCard() {
  Column(
    Modifier
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.sm),
  ) {
    Text("POSTPAID", color = EandColor.textBrandDefault, style = EandTypography.bodyXs)
    Text("Freedom Live 200", style = EandTypography.titleMd)
    Text("from AED 200/mo", color = EandColor.textDefaultMuted)
  }
}`,
    react: `import { PlanCard } from '@eand/react-design-system';

<PlanCard variant="default" category="Postpaid" name="Freedom Live 200"
  price="200" period="/mo" />`,
  },

  ctabar: {
    swift: `import SwiftUI
import EandTokens

// Sticky bottom CTA footer: status ribbon, price, T&C, button group, home indicator.
struct CtaFooter: View {
  var body: some View {
    VStack(spacing: 0) {
      StatusRibbon(status: .success, message: "Payment method saved", action: "View")
      VStack(spacing: EandSpacing.lg) {
        HStack(alignment: .firstTextBaseline) {
          Text("Total amount").foregroundColor(EandColor.textDefaultSubtle)
          Spacer()
          Text("AED 1,250").font(.system(size: EandTypography.titleSm.size, weight: .bold))
        }
        EandButton(title: "Continue") {}   // 48pt block button
      }
      .padding(.horizontal, EandSpacing.xl)   // 20pt side padding
      .padding(.vertical, EandSpacing.lg)
    }
    .background(EandColor.surfaceCanvasDefault)
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

// Sticky bottom CTA footer: ribbon + price + T&C + button group + home indicator.
@Composable
fun CtaFooter() {
  Column(Modifier.fillMaxWidth().background(EandColor.surfaceCanvasDefault)) {
    StatusRibbon(RibbonStatus.Success, "Payment method saved", action = "View")
    Column(
      Modifier.padding(horizontal = EandSpacing.xl, vertical = EandSpacing.lg),  // 20dp sides
      verticalArrangement = Arrangement.spacedBy(EandSpacing.lg),
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Text("Total amount", color = EandColor.textDefaultSubtle)
        Spacer(Modifier.weight(1f))
        Text("AED 1,250", style = EandTypography.titleSm)
      }
      EandButton("Continue", Modifier.fillMaxWidth()) {}
    }
  }
}`,
    react: `import { CtaFooter, StatusRibbon, ButtonGroup, PaymentRow, Button, Checkbox } from '@eand/react-design-system';

<CtaFooter
  rounded
  ribbon={<StatusRibbon status="success" action="View">Payment method saved</StatusRibbon>}
  price={{ label: 'Total amount', value: 'AED 1,250', note: 'Incl. VAT' }}
  terms={<Checkbox label="I accept the Terms & Conditions" />}
  actions={
    <ButtonGroup
      primary={<Button block>Continue</Button>}
      secondary={<Button block variant="secondary">Secondary</Button>}
      tertiary={<Button variant="tertiary">Not now</Button>}
    />
  }
  homeIndicator
/>`,
  },

  snackbar: {
    swift: `import SwiftUI
import EandTokens

struct Snackbar: View {
  let message: String
  var body: some View {
    HStack(spacing: EandSpacing.md) {
      Image(systemName: "checkmark.circle.fill").foregroundColor(EandColor.statusPositive)
      Text(message).foregroundColor(.white).fontWeight(.semibold)
      Spacer()
    }
    .padding(.horizontal, EandSpacing.lg)
    .padding(.vertical, EandSpacing.md)
    .background(EandColor.surfaceOverlayFloatingInverse)   // midnight pill
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Snackbar(message: String) {
  Row(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceOverlayFloatingInverse, RoundedCornerShape(EandRadius.radius7))
      .padding(horizontal = EandSpacing.lg, vertical = EandSpacing.md),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Icon(Icons.Filled.CheckCircle, null, tint = EandColor.statusPositive)
    Text(message, color = Color.White, fontWeight = FontWeight.SemiBold)
  }
}`,
    react: `import { Snackbar } from '@eand/react-design-system';

<Snackbar tone="positive" message="Your changes were saved" onDismiss={() => {}} />
<Snackbar tone="loading" message="Saving…" />`,
  },

  alert: {
    swift: `import SwiftUI
import EandTokens

// Inline tinted banner: soft surface + strong text by tone.
struct Alert: View {
  let title: String; let body: String
  var body: some View {
    HStack(alignment: .top, spacing: EandSpacing.md) {
      Image(systemName: "checkmark.circle.fill").foregroundColor(EandColor.alertMessageTextSuccess)
      VStack(alignment: .leading, spacing: EandSpacing.spacing2xs) {
        Text(title).fontWeight(.bold).foregroundColor(EandColor.alertMessageTextSuccess)
        Text(body).font(.system(size: EandTypography.bodySm.size))
          .foregroundColor(EandColor.alertMessageTextSuccess).opacity(0.85)
      }
    }
    .padding(EandSpacing.lg)
    .background(EandColor.alertMessageSurfaceSuccess)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Alert(title: String, body: String) {
  Row(
    Modifier
      .background(EandColor.alertMessageSurfaceSuccess, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.lg),
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Icon(Icons.Filled.CheckCircle, null, tint = EandColor.alertMessageTextSuccess)
    Column(verticalArrangement = Arrangement.spacedBy(EandSpacing.spacing2xs)) {
      Text(title, fontWeight = FontWeight.Bold, color = EandColor.alertMessageTextSuccess)
      Text(body, style = EandTypography.bodySm, color = EandColor.alertMessageTextSuccess)
    }
  }
}`,
    react: `import { Alert } from '@eand/react-design-system';

<Alert tone="positive" title="You're all set!" action="Done">
  Your request was completed successfully.
</Alert>`,
  },

  alertmodal: {
    swift: `import SwiftUI
import EandTokens

struct AlertModal: View {
  let title: String; let body: String
  var body: some View {
    VStack(spacing: EandSpacing.md) {
      Image(systemName: "exclamationmark.triangle.fill")
        .font(.system(size: EandIcon.xl)).foregroundColor(EandColor.statusWarning)
      Text(title).font(.system(size: EandTypography.headingSm.size, weight: .bold))
      Text(body).foregroundColor(EandColor.textDefaultSubtle).multilineTextAlignment(.center)
      EandButton(title: "Got it") {}
    }
    .padding(EandSpacing.xl)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun AlertModal(title: String, body: String) {
  Column(
    Modifier
      .widthIn(max = 360.dp)
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.xl),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Icon(Icons.Filled.Warning, null, Modifier.size(EandIcon.xl), tint = EandColor.statusWarning)
    Text(title, style = EandTypography.headingSm)
    Text(body, color = EandColor.textDefaultSubtle, textAlign = TextAlign.Center)
    EandButton("Got it", Modifier.fillMaxWidth()) {}
  }
}`,
    react: `import { AlertModal, Button } from '@eand/react-design-system';

<AlertModal open tone="warning" title="Confirm your plan change"
  body="Your new plan starts on the next billing cycle."
  actions={<>
    <Button block>Confirm</Button>
    <Button block variant="secondary">Cancel</Button>
  </>} />`,
  },

  tabs: {
    swift: `import SwiftUI
import EandTokens

// Pill tabs: default surface vs inverse. Active = brand-tinted pill.
struct PillTab: View {
  let title: String; let active: Bool
  var body: some View {
    Text(title)
      .font(.system(size: EandTypography.buttonSm.size, weight: .semibold))
      .foregroundColor(active ? EandColor.textBrandDefault : EandColor.textDefaultMuted)
      .padding(.horizontal, EandSpacing.md)
      .frame(height: 40)
      .background(active ? EandColor.surfaceCanvasBrandMuted : EandColor.surfaceBaseDefault)
      .clipShape(Capsule())
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun PillTab(title: String, active: Boolean) {
  Text(
    title,
    style = EandTypography.buttonSm,
    color = if (active) EandColor.textBrandDefault else EandColor.textDefaultMuted,
    modifier = Modifier
      .background(
        if (active) EandColor.surfaceCanvasBrandMuted else EandColor.surfaceBaseDefault,
        CircleShape)
      .height(40.dp)
      .padding(horizontal = EandSpacing.md),
  )
}`,
    react: `import { Tabs } from '@eand/react-design-system';

<Tabs tabs={['For you', 'Account', 'Loyalty']} defaultValue={0}
  onChange={(i) => console.log(i)} />`,
  },

  checkbox: {
    swift: `import SwiftUI
import EandTokens

// Unified mark: square (checkbox) or circle (radio=yes). Same tick + colours.
struct EandCheckbox: View {
  let label: String; @Binding var on: Bool
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      ZStack {
        RoundedRectangle(cornerRadius: EandRadius.radius1)
          .fill(on ? EandColor.surfaceBaseBrand : .clear)
          .overlay(RoundedRectangle(cornerRadius: EandRadius.radius1)
            .stroke(on ? .clear : EandColor.textDefaultMuted, lineWidth: 1.5))
          .frame(width: 20, height: 20)
        if on { Image(systemName: "checkmark").font(.system(size: 12, weight: .bold))
          .foregroundColor(EandColor.textDefaultInverse) }
      }
      Text(label)
    }
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun EandCheckbox(label: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
  Row(verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
    Checkbox(
      checked = checked,
      onCheckedChange = onCheckedChange,
      colors = CheckboxDefaults.colors(checkedColor = EandColor.surfaceBaseBrand),
    )
    Text(label)
  }
}`,
    react: `import { Checkbox } from '@eand/react-design-system';

<Checkbox label="I accept the Terms & Conditions" />
<Checkbox label="Radio option" radio />
<Checkbox label="On midnight" inverse defaultChecked />`,
  },

  radio: {
    swift: `import SwiftUI
import EandTokens

struct EandRadio: View {
  let label: String; let selected: Bool
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      Circle()
        .stroke(selected ? EandColor.borderInteractiveAccentDefault
                          : EandColor.borderInteractiveDefaultDefault, lineWidth: 1)
        .frame(width: 24, height: 24)
        .overlay(selected ? Circle().fill(EandColor.surfaceBaseBrand).frame(width: 12, height: 12) : nil)
      Text(label)
    }
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun EandRadio(label: String, selected: Boolean, onSelect: () -> Unit) {
  Row(verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
    RadioButton(
      selected = selected,
      onClick = onSelect,
      colors = RadioButtonDefaults.colors(selectedColor = EandColor.borderInteractiveAccentDefault),
    )
    Text(label)
  }
}`,
    react: `import { Radio } from '@eand/react-design-system';

<Radio name="plan" label="Postpaid" defaultChecked />
<Radio name="plan" label="Prepaid" />`,
  },

  switcher: {
    swift: `import SwiftUI
import EandTokens

// On track = brand red; knob always white; sizes lg 56x24 / sm 48x20.
struct EandSwitcher: View {
  @Binding var on: Bool
  var body: some View {
    Toggle("", isOn: $on)
      .labelsHidden()
      .tint(EandColor.surfaceBaseBrand)
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun EandSwitcher(checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
  Switch(
    checked = checked,
    onCheckedChange = onCheckedChange,
    colors = SwitchDefaults.colors(
      checkedTrackColor = EandColor.surfaceBaseBrand,
      checkedThumbColor = Color.White,
    ),
  )
}`,
    react: `import { Switcher } from '@eand/react-design-system';

<Switcher defaultChecked onChange={(on) => console.log(on)} />
<Switcher size="sm" />`,
  },

  filterpill: {
    swift: `import SwiftUI
import EandTokens

// Hug-width pill, 40pt, 1px border, trailing 16pt chevron. Focused = filled.
struct FilterPill: View {
  let label: String; let selected: Bool
  var body: some View {
    HStack(spacing: EandSpacing.xs) {
      Text(label)
      Image(systemName: "chevron.down").font(.system(size: EandIcon.md))
    }
    .foregroundColor(selected ? EandColor.textDefaultDefault : EandColor.textDefaultMuted)
    .padding(.horizontal, EandSpacing.md).frame(height: 40)
    .background(selected ? EandColor.surfaceBaseDefault : EandColor.surfaceCanvasDefault)
    .overlay(Capsule().stroke(EandColor.borderSolidDefault, lineWidth: 1))
    .clipShape(Capsule())
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun FilterPill(label: String, selected: Boolean) {
  Row(
    Modifier
      .height(40.dp)
      .background(
        if (selected) EandColor.surfaceBaseDefault else EandColor.surfaceCanvasDefault,
        CircleShape)
      .border(1.dp, EandColor.borderSolidDefault, CircleShape)
      .padding(horizontal = EandSpacing.md),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Text(label)
    Icon(Icons.Filled.KeyboardArrowDown, null, Modifier.size(EandIcon.md))
  }
}`,
    react: `import { FilterPill } from '@eand/react-design-system';

<FilterPill selected>Category</FilterPill>
<FilterPill inverse>On dark</FilterPill>`,
  },

  searchbar: {
    swift: `import SwiftUI
import EandTokens

struct Searchbar: View {
  @Binding var query: String
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      Image(systemName: "magnifyingglass").frame(width: EandIcon.lg, height: EandIcon.lg)
      TextField("Search", text: $query)
      Button { } label: { Image(systemName: "mic.fill") }
        .foregroundColor(EandColor.textDefaultMuted)
    }
    .padding(.horizontal, EandSpacing.lg).frame(height: 52)
    .background(EandColor.surfaceBaseDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Searchbar(query: String, onQueryChange: (String) -> Unit) {
  Row(
    Modifier
      .fillMaxWidth().height(52.dp)
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius5))
      .padding(horizontal = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm),
  ) {
    Icon(Icons.Filled.Search, null, Modifier.size(EandIcon.lg))
    BasicTextField(query, onQueryChange, Modifier.weight(1f))
    Icon(Icons.Filled.Mic, null, tint = EandColor.textDefaultMuted)
  }
}`,
    react: `import { Searchbar } from '@eand/react-design-system';

<Searchbar placeholder="Search" onMic={() => {}} />`,
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
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun AISearch(query: String, onQueryChange: (String) -> Unit) {
  Row(
    Modifier
      .fillMaxWidth().height(52.dp)
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius5))
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
    kotlin: `import com.eand.tokens.EandColor

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

// V1.1 filled field: 56pt, 16pt radius, floating label, state border.
struct EandInput: View {
  let label: String; @Binding var value: String
  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text(label).font(.system(size: EandTypography.bodySm.size))
        .foregroundColor(EandColor.inputFieldTextDefaultLabelDefault)
      TextField("", text: $value)
        .font(.system(size: EandTypography.bodyLg.size))
        .foregroundColor(EandColor.inputFieldTextDefaultValueActive)
    }
    .padding(.horizontal, EandSpacing.md).frame(minHeight: 56)
    .background(EandColor.inputFieldSurfaceDefaultDefault)
    .overlay(RoundedRectangle(cornerRadius: EandRadius.radius5)
      .stroke(EandColor.inputFieldBorderDefault, lineWidth: 1.5))
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun EandInput(label: String, value: String, onValueChange: (String) -> Unit) {
  Column(
    Modifier
      .fillMaxWidth().heightIn(min = 56.dp)
      .background(EandColor.inputFieldSurfaceDefaultDefault, RoundedCornerShape(EandRadius.radius5))
      .border(1.5.dp, EandColor.inputFieldBorderDefault, RoundedCornerShape(EandRadius.radius5))
      .padding(horizontal = EandSpacing.md, vertical = EandSpacing.sm),
  ) {
    Text(label, style = EandTypography.bodySm, color = EandColor.inputFieldTextDefaultLabelDefault)
    BasicTextField(value, onValueChange, textStyle = EandTypography.bodyLg)
  }
}`,
    react: `import { Input, OtpInput } from '@eand/react-design-system';

<Input label="Email address" clearable helper="We'll never share it." />
<Input label="Plan" type="dropdown" defaultValue="Postpaid — Unlimited" />
<Input label="Add a comment" type="comment" />
<OtpInput length={4} />`,
  },

  progressbar: {
    swift: `import SwiftUI
import EandTokens

// 300x4 track, rounded fill. Default fill = positive subtle green.
struct ProgressBar: View {
  let value: Double   // 0…1
  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        Capsule().fill(EandColor.surfaceSunkenDefault)
        Capsule().fill(EandColor.textPositiveSubtle).frame(width: geo.size.width * value)
      }
    }
    .frame(height: 4)
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun ProgressBar(value: Float) {   // 0..1
  Box(Modifier.fillMaxWidth().height(4.dp).clip(CircleShape)
    .background(EandColor.surfaceSunkenDefault)) {
    Box(Modifier.fillMaxHeight().fillMaxWidth(value).clip(CircleShape)
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

// Segmented step progress: 6pt-tall pills, 8pt gap, completed ones filled.
struct Stepper: View {
  let steps: Int; let progress: Int
  var body: some View {
    HStack(spacing: EandSpacing.sm) {
      ForEach(0..<steps, id: \\.self) { i in
        Capsule()
          .fill(i < progress ? EandColor.stepperDefaultActive : EandColor.stepperDefaultDefault)
          .frame(height: 6).frame(maxWidth: .infinity)
      }
    }
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Stepper(steps: Int, progress: Int) {
  Row(Modifier.fillMaxWidth().height(6.dp),
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
    repeat(steps) { i ->
      Box(Modifier.weight(1f).fillMaxHeight().clip(CircleShape)
        .background(if (i < progress) EandColor.stepperDefaultActive else EandColor.stepperDefaultDefault))
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

// 285x52 dashed pill "add" affordance, 20pt icon, single-line label.
struct AddTrigger: View {
  let label: String
  var body: some View {
    HStack(spacing: EandSpacing.xs) {
      Image(systemName: "plus").font(.system(size: EandIcon.lg))
      Text(label)
    }
    .foregroundColor(EandColor.textBrandDefault)
    .padding(.horizontal, EandSpacing.lg).frame(height: 52)
    .overlay(RoundedRectangle(cornerRadius: EandRadius.radius5)
      .strokeBorder(EandColor.borderDefault, style: StrokeStyle(lineWidth: 1, dash: [4])))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun AddTrigger(label: String) {
  Row(
    Modifier
      .height(52.dp)
      .dashedBorder(1.dp, EandColor.borderDefault, RoundedCornerShape(EandRadius.radius5))
      .padding(horizontal = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Icon(Icons.Filled.Add, null, Modifier.size(EandIcon.lg), tint = EandColor.textBrandDefault)
    Text(label, color = EandColor.textBrandDefault)
  }
}`,
    react: `import { AddTrigger } from '@eand/react-design-system';

<AddTrigger label="Add a line" onClick={() => {}} />`,
  },

  logo: {
    swift: `import SwiftUI
import EandTokens

// e& logo asset in 4 versions — default / white / midnight / red.
struct EandLogo: View {
  enum Version { case defaultV, white, midnight, red }
  let version: Version
  var body: some View {
    Image("eand-logo-\\(version)")   // from the asset catalog
      .resizable().scaledToFit().frame(width: 96, height: 96)
  }
}`,
    kotlin: `import com.eand.tokens.R

// e& logo asset in 4 versions — default / white / midnight / red.
@Composable
fun EandLogo(version: LogoVersion = LogoVersion.Default) {
  Image(
    painterResource(when (version) {
      LogoVersion.White -> R.drawable.eand_logo_white
      LogoVersion.Midnight -> R.drawable.eand_logo_midnight
      LogoVersion.Red -> R.drawable.eand_logo_red
      else -> R.drawable.eand_logo_default
    }),
    contentDescription = "e&",
    modifier = Modifier.size(96.dp),
  )
}`,
    react: `import { Logo } from '@eand/react-design-system';

<Logo />`,
  },

  logorow: {
    swift: `import SwiftUI
import EandTokens

// Row of partner logos, sizes sm 24 / md 32 / lg 40, +N overflow chip.
struct LogoRow: View {
  let logos: [Image]; let size: CGFloat = 32
  var body: some View {
    HStack(spacing: EandSpacing.lg) {
      ForEach(Array(logos.enumerated()), id: \\.offset) { _, logo in
        logo.resizable().scaledToFit().frame(height: size)
      }
    }
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun LogoRow(logos: List<Painter>, size: Dp = 32.dp) {
  Row(horizontalArrangement = Arrangement.spacedBy(EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically) {
    logos.forEach { Image(it, null, Modifier.height(size)) }
  }
}`,
    react: `import { LogoRow } from '@eand/react-design-system';

<LogoRow logos={[<img src="/etisalat.svg" />, <img src="/smiles.svg" />]} />`,
  },

  smilesrow: {
    swift: `import SwiftUI
import EandTokens

// Overlapping avatar cluster with a +N chip.
struct SmilesRow: View {
  let count: Int; let plus: Int; let size: CGFloat = 28
  var body: some View {
    HStack(spacing: -8) {
      ForEach(0..<count, id: \\.self) { _ in
        Circle().fill(Color(hex: "#6C3FD6")).frame(width: size, height: size)
          .overlay(Circle().stroke(.white, lineWidth: 1.5))
      }
      if plus > 0 {
        Text("+\\(plus)").font(.system(size: 11, weight: .semibold)).foregroundColor(.white)
          .frame(width: size, height: size).background(Color(hex: "#C0BFC8")).clipShape(Circle())
      }
    }
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun SmilesRow(count: Int, plus: Int, size: Dp = 28.dp) {
  Row(horizontalArrangement = Arrangement.spacedBy((-8).dp)) {
    repeat(count) {
      Box(Modifier.size(size).clip(CircleShape).background(Color(0xFF6C3FD6))
        .border(1.5.dp, Color.White, CircleShape))
    }
    if (plus > 0) Box(Modifier.size(size).clip(CircleShape).background(Color(0xFFC0BFC8)),
      contentAlignment = Alignment.Center) { Text("+" + plus, color = Color.White) }
  }
}`,
    react: `import { SmilesRow } from '@eand/react-design-system';

<SmilesRow count={2} plus={4} />`,
  },

  atomsurface: {
    swift: `import SwiftUI
import EandTokens

// Surface panel by level — canvas / base / raised / sunken.
struct AtomSurface<Content: View>: View {
  let level: Color   // e.g. EandColor.surfaceBaseDefault
  @ViewBuilder var content: Content
  var body: some View {
    content
      .background(level)
      .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun AtomSurface(level: Color = EandColor.surfaceBaseDefault, content: @Composable () -> Unit) {
  Box(Modifier.background(level, RoundedCornerShape(EandRadius.radius5))) { content() }
}`,
    react: `import { AtomSurface } from '@eand/react-design-system';

<AtomSurface level="raised">Content on a raised surface</AtomSurface>`,
  },

  accordion: {
    swift: `import SwiftUI
import EandTokens

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
    .overlay(Rectangle().frame(height: 1).foregroundColor(EandColor.borderSolidSubtle), alignment: .bottom)
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

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
    Divider(color = EandColor.borderSolidSubtle)
  }
}`,
    react: `import { Accordion } from '@eand/react-design-system';

<Accordion title="What's included in this plan?" defaultOpen>
  200 GB data, unlimited local minutes, 5G access.
</Accordion>`,
  },

  card: {
    swift: `import SwiftUI
import EandTokens

struct EandCard<Content: View>: View {
  let title: String; let body: String
  @ViewBuilder var action: Content
  var content: some View {
    VStack(alignment: .leading, spacing: EandSpacing.xs) {
      Text(title).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
      Text(body).foregroundColor(EandColor.textDefaultSubtle)
      action.padding(.top, EandSpacing.sm)
    }
    .padding(EandSpacing.lg)
    .background(EandColor.surfaceRaisedDefault)
    .overlay(RoundedRectangle(cornerRadius: EandRadius.radius5)
      .stroke(EandColor.borderSolidSubtle, lineWidth: 1))
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
  var body: some View { content }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun EandCard(title: String, body: String, action: @Composable () -> Unit) {
  Column(
    Modifier
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius5))
      .border(1.dp, EandColor.borderSolidSubtle, RoundedCornerShape(EandRadius.radius5))
      .padding(EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Text(title, style = EandTypography.titleSm)
    Text(body, color = EandColor.textDefaultSubtle)
    action()
  }
}`,
    react: `import { Card, Button } from '@eand/react-design-system';

<Card title="Refer a friend" body="Give AED 50, get AED 50."
  action={<Button size="sm">Invite</Button>} />`,
  },

  actionbar: {
    swift: `import SwiftUI
import EandTokens

// 72pt bar: 40pt leading tile + title/subtitle + one trailing action.
struct ActionBar: View {
  let title: String; let subtitle: String
  var body: some View {
    HStack(spacing: EandSpacing.md) {
      RoundedRectangle(cornerRadius: EandRadius.radius3)
        .fill(EandColor.surfaceBaseDefault).frame(width: 40, height: 40)
      VStack(alignment: .leading) {
        Text(title).font(.system(size: EandTypography.titleXs.size, weight: .semibold))
        Text(subtitle).font(.system(size: EandTypography.bodyMd.size))
          .foregroundColor(EandColor.textDefaultSubtle)
      }
      Spacer()
      Image(systemName: "chevron.right")
    }
    .padding(.horizontal, EandSpacing.lg).frame(height: 72)
    .background(EandColor.surfaceBaseInverse)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun ActionBar(title: String, subtitle: String) {
  Row(
    Modifier
      .fillMaxWidth().height(72.dp)
      .background(EandColor.surfaceBaseInverse, RoundedCornerShape(EandRadius.radius6))
      .padding(horizontal = EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Box(Modifier.size(40.dp).background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius3)))
    Column(Modifier.weight(1f)) {
      Text(title, style = EandTypography.titleXs)
      Text(subtitle, style = EandTypography.bodyMd, color = EandColor.textDefaultSubtle)
    }
    Icon(Icons.Filled.ChevronRight, null)
  }
}`,
    react: `import { ActionBar, Button, Icon } from '@eand/react-design-system';

<ActionBar surface="default" icon={<Icon name="podcast" />}
  title="Now playing" subtitle="e& podcast · Ep 12"
  action={<Button size="sm">Play</Button>} />`,
  },

  sectionlink: {
    swift: `import SwiftUI
import EandTokens

// Section header row: title left, "See all" link + chevron right.
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
    kotlin: `import com.eand.tokens.EandColor

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

// 48px filled block: the fill shows what is LEFT, the amount reads inside it,
// the category sits in the track opposite. Green normally, orange on low data.
struct PlanUsageBar: View {
  let label: String; let remaining: Double; let total: Double; let unit: String
  var note: String? = nil
  var lowData: Bool = false

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        RoundedRectangle(cornerRadius: EandRadius.radius3)
          .fill(EandColor.surfaceCanvasInverse)
        RoundedRectangle(cornerRadius: EandRadius.radius3)
          .fill(lowData ? EandColor.orange500 : EandColor.green550)
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
    kotlin: `import com.eand.tokens.EandColor

// 48px filled block: the fill shows what is LEFT, the amount reads inside it,
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
      .clip(RoundedCornerShape(EandRadius.radius3))
      .background(EandColor.surfaceCanvasInverse)
  ) {
    Box(
      Modifier.fillMaxWidth(fraction).fillMaxHeight()
        .clip(RoundedCornerShape(EandRadius.radius3))
        .background(if (lowData) EandColor.orange500 else EandColor.green550)
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

// 229x300 feature card: image top, title, "from" price.
struct ProductCard: View {
  let title: String; let price: String
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.md) {
      RoundedRectangle(cornerRadius: EandRadius.radius3)
        .fill(EandColor.surfaceBaseDefault).frame(height: 140)
      Text(title).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
      Spacer()
      VStack(alignment: .leading) {
        Text("from").font(.system(size: EandTypography.bodySm.size))
          .foregroundColor(EandColor.textDefaultMuted)
        Text(price).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
      }
    }
    .padding(EandSpacing.lg).frame(width: 200)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun ProductCard(title: String, price: String) {
  Column(
    Modifier
      .width(200.dp)
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius5))
      .padding(EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.md),
  ) {
    Box(Modifier.fillMaxWidth().height(140.dp)
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius3)))
    Text(title, style = EandTypography.titleSm)
    Text("from", style = EandTypography.bodySm, color = EandColor.textDefaultMuted)
    Text(price, style = EandTypography.titleSm)
  }
}`,
    react: `import { ProductCard, Badge } from '@eand/react-design-system';

<ProductCard title="iPhone Clear Case" price="AED 200" period="/mo"
  discount="20%" image={<img src="/case.png" />} />`,
  },

  dealcard: {
    swift: `import SwiftUI
import EandTokens

struct DealCard: View {
  let title: String; let subtitle: String
  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      RoundedRectangle(cornerRadius: EandRadius.radius3)
        .fill(EandColor.surfaceBaseDefault).frame(height: 120).padding(EandSpacing.sm)
      VStack(alignment: .leading) {
        Text(title).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
        Text(subtitle).font(.system(size: EandTypography.bodySm.size))
          .foregroundColor(EandColor.textDefaultMuted)
      }.padding(.horizontal, EandSpacing.lg).padding(.bottom, EandSpacing.lg)
    }
    .frame(width: 240)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun DealCard(title: String, subtitle: String) {
  Column(
    Modifier
      .width(240.dp)
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius5)),
  ) {
    Box(Modifier.padding(EandSpacing.sm).fillMaxWidth().height(120.dp)
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius3)))
    Column(Modifier.padding(horizontal = EandSpacing.lg).padding(bottom = EandSpacing.lg)) {
      Text(title, style = EandTypography.titleSm)
      Text(subtitle, style = EandTypography.bodySm, color = EandColor.textDefaultMuted)
    }
  }
}`,
    react: `import { DealCard, Badge } from '@eand/react-design-system';

<DealCard title="2 for 1 cinema" subtitle="Every weekend"
  badge={<Badge offer="mega-deals" size="sm">Mega deal</Badge>} />`,
  },

  newcard: {
    swift: `import SwiftUI
import EandTokens

// 137x224 full-bleed image card with a title strip.
struct NewCard: View {
  let title: String
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      RoundedRectangle(cornerRadius: 0).fill(EandColor.surfaceBaseDefault).frame(height: 140)
      Text(title).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
        .padding(EandSpacing.md)
    }
    .frame(width: 200)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun NewCard(title: String) {
  Column(
    Modifier
      .width(200.dp)
      .clip(RoundedCornerShape(EandRadius.radius5))
      .background(EandColor.surfaceRaisedDefault),
  ) {
    Box(Modifier.fillMaxWidth().height(140.dp).background(EandColor.surfaceBaseDefault))
    Text(title, style = EandTypography.titleSm, modifier = Modifier.padding(EandSpacing.md))
  }
}`,
    react: `import { NewCard } from '@eand/react-design-system';

<NewCard title="New on e&" image={<img src="/story.png" />} />`,
  },

  servicecard: {
    swift: `import SwiftUI
import EandTokens

// Square tile: 3D icon + centred label, optional offer badge.
struct ServiceCard: View {
  let label: String
  var body: some View {
    VStack(spacing: EandSpacing.sm) {
      Image("service-3d-icon").resizable().scaledToFit().frame(width: 50, height: 50)
      Text(label).font(.system(size: EandTypography.bodySm.size)).multilineTextAlignment(.center)
    }
    .padding(EandSpacing.md).frame(minHeight: 116)
    .background(EandColor.surfaceCanvasDefault)
    .overlay(RoundedRectangle(cornerRadius: EandRadius.radius5)
      .stroke(EandColor.borderSolidSubtle, lineWidth: 1))
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun ServiceCard(label: String, icon: Painter) {
  Column(
    Modifier
      .heightIn(min = 116.dp)
      .background(EandColor.surfaceCanvasDefault, RoundedCornerShape(EandRadius.radius5))
      .border(1.dp, EandColor.borderSolidSubtle, RoundedCornerShape(EandRadius.radius5))
      .padding(EandSpacing.md),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(EandSpacing.sm),
  ) {
    Image(icon, null, Modifier.size(50.dp))
    Text(label, style = EandTypography.bodySm, textAlign = TextAlign.Center)
  }
}`,
    react: `import { ServiceCard, Badge } from '@eand/react-design-system';

<ServiceCard icon="📺" label="eLife TV"
  badge={<Badge offer="new-plan" size="sm">New</Badge>} />`,
  },

  highlight: {
    swift: `import SwiftUI
import EandTokens

// Full-bleed banner with a bottom gradient scrim + headline.
struct Highlight: View {
  let title: String; let subtitle: String
  var body: some View {
    ZStack(alignment: .bottomLeading) {
      LinearGradient(colors: [Color(hex: "#3A3340"), Color(hex: "#191329")],
                     startPoint: .top, endPoint: .bottom)
      LinearGradient(colors: [.clear, Color(hex: "#140F21").opacity(0.78)],
                     startPoint: .top, endPoint: .bottom)
      VStack(alignment: .leading, spacing: EandSpacing.sm) {
        Text(title).font(.system(size: EandTypography.headingSm.size, weight: .bold)).foregroundColor(.white)
        Text(subtitle).foregroundColor(.white.opacity(0.85))
      }.padding(EandSpacing.lg)
    }
    .frame(height: 340)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Highlight(title: String, subtitle: String) {
  Box(
    Modifier
      .fillMaxWidth().height(340.dp)
      .clip(RoundedCornerShape(EandRadius.radius6))
      .background(Brush.verticalGradient(listOf(Color(0xFF3A3340), Color(0xFF191329)))),
    contentAlignment = Alignment.BottomStart,
  ) {
    Column(Modifier.padding(EandSpacing.lg), verticalArrangement = Arrangement.spacedBy(EandSpacing.sm)) {
      Text(title, style = EandTypography.headingSm, color = Color.White)
      Text(subtitle, color = Color.White.copy(alpha = .85f))
    }
  }
}`,
    react: `import { Highlight } from '@eand/react-design-system';

<Highlight tone="image" title="Smiles Unlimited"
  subtitle="Exclusive venue deals" cta="Play now" />`,
  },

  smilesbalance: {
    swift: `import SwiftUI
import EandTokens

struct SmilesBalance: View {
  let points: String
  var body: some View {
    HStack {
      VStack(alignment: .leading) {
        Text("Smiles balance").font(.system(size: EandTypography.bodySm.size))
          .foregroundColor(Color(hex: "#191329").opacity(0.7))
        Text(points).font(.system(size: EandTypography.headingSm.size, weight: .bold))
      }
      Spacer()
      EandButton(title: "Redeem") {}
    }
    .padding(EandSpacing.lg)
    .background(LinearGradient(colors: [Color(hex: "#E2C668"), Color(hex: "#D9B14A")],
                               startPoint: .topLeading, endPoint: .bottomTrailing))
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun SmilesBalance(points: String) {
  Row(
    Modifier
      .fillMaxWidth()
      .background(Brush.linearGradient(listOf(Color(0xFFE2C668), Color(0xFFD9B14A))),
        RoundedCornerShape(EandRadius.radius5))
      .padding(EandSpacing.lg),
    verticalAlignment = Alignment.CenterVertically,
  ) {
    Column(Modifier.weight(1f)) {
      Text("Smiles balance", style = EandTypography.bodySm)
      Text(points, style = EandTypography.headingSm)
    }
    EandButton("Redeem") {}
  }
}`,
    react: `import { SmilesBalance } from '@eand/react-design-system';

<SmilesBalance points="12,450 Smiles" cta="Redeem" />`,
  },

  voucher: {
    swift: `import SwiftUI
import EandTokens

// Ticket-style card with a dashed edge, value, code + status.
struct Voucher: View {
  let value: String; let code: String
  var body: some View {
    HStack {
      VStack(alignment: .leading, spacing: 2) {
        Text(value).font(.system(size: EandTypography.headingXs.size, weight: .bold))
        Text("Code: \\(code)").font(.system(size: EandTypography.bodySm.size))
          .foregroundColor(EandColor.textDefaultMuted)
      }
      Spacer()
    }
    .padding(EandSpacing.lg)
    .background(EandColor.surfaceRaisedDefault)
    .overlay(RoundedRectangle(cornerRadius: EandRadius.radius5)
      .strokeBorder(EandColor.borderSolidDefault, style: StrokeStyle(lineWidth: 1, dash: [4])))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Voucher(value: String, code: String) {
  Row(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceRaisedDefault, RoundedCornerShape(EandRadius.radius5))
      .dashedBorder(1.dp, EandColor.borderSolidDefault, RoundedCornerShape(EandRadius.radius5))
      .padding(EandSpacing.lg),
  ) {
    Column {
      Text(value, style = EandTypography.headingXs)
      Text("Code: " + code, style = EandTypography.bodySm, color = EandColor.textDefaultMuted)
    }
  }
}`,
    react: `import { Voucher } from '@eand/react-design-system';

<Voucher value="AED 50 off" code="EAND50" status="active" />`,
  },

  tooltip: {
    swift: `import SwiftUI
import EandTokens

// Dark bubble anchored above/below its target.
struct Tooltip: View {
  let content: String
  var body: some View {
    Text(content)
      .font(.system(size: EandTypography.bodySm.size))
      .foregroundColor(EandColor.textDefaultInverse)
      .padding(.horizontal, EandSpacing.sm).padding(.vertical, EandSpacing.xs)
      .background(EandColor.surfaceOverlayFloatingInverse)
      .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius2))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun Tooltip(content: String) {
  Text(
    content,
    style = EandTypography.bodySm,
    color = EandColor.textDefaultInverse,
    modifier = Modifier
      .background(EandColor.surfaceOverlayFloatingInverse, RoundedCornerShape(EandRadius.radius2))
      .padding(horizontal = EandSpacing.sm, vertical = EandSpacing.xs),
  )
}`,
    react: `import { Tooltip, Button } from '@eand/react-design-system';

<Tooltip content="Uses your Smiles Points" visible>
  <Button size="sm" variant="secondary">Redeem</Button>
</Tooltip>`,
  },

  bottomsheet: {
    swift: `import SwiftUI
import EandTokens

// Modal sheet: grabber + title + scrollable body + footer.
struct BottomSheet<Content: View>: View {
  let title: String; @ViewBuilder var content: Content
  var body: some View {
    VStack(spacing: EandSpacing.sm) {
      Capsule().fill(EandColor.borderSolidStrong).frame(width: 40, height: 4).padding(.top, EandSpacing.sm)
      Text(title).font(.system(size: EandTypography.headingXs.size, weight: .bold))
        .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, EandSpacing.lg)
      content.padding(.horizontal, EandSpacing.lg)
    }
    .padding(.bottom, EandSpacing.lg)
    .background(EandColor.surfaceRaisedDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius7))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

// Prefer Material3 ModalBottomSheet; style the handle + surface with tokens.
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EandBottomSheet(title: String, onDismiss: () -> Unit, content: @Composable () -> Unit) {
  ModalBottomSheet(onDismissRequest = onDismiss, containerColor = EandColor.surfaceRaisedDefault) {
    Text(title, style = EandTypography.headingXs, modifier = Modifier.padding(horizontal = EandSpacing.lg))
    Box(Modifier.padding(EandSpacing.lg)) { content() }
  }
}`,
    react: `import { BottomSheet, Button } from '@eand/react-design-system';

<BottomSheet open title="Choose a plan"
  footer={<Button block>Confirm</Button>} onDismiss={() => {}}>
  Sheet content goes here.
</BottomSheet>`,
  },

  picker: {
    swift: `import SwiftUI
import EandTokens

// Selectable option tile: value + caption + status badge. Selected = accent border.
struct PickerOption: View {
  let value: String; let caption: String; let selected: Bool
  var body: some View {
    VStack(alignment: .leading, spacing: EandSpacing.xs) {
      VStack(alignment: .leading) {
        Text(value).font(.system(size: EandTypography.titleSm.size, weight: .semibold))
        Text(caption).font(.system(size: EandTypography.bodyXs.size))
          .foregroundColor(EandColor.textDefaultSubtle)
      }
      OfferBadge(text: "neutral")
    }
    .padding(EandSpacing.sm).frame(minWidth: 96, minHeight: 72, alignment: .topLeading)
    .background(EandColor.surfaceSunkenDefault)
    .overlay(RoundedRectangle(cornerRadius: EandRadius.radius5)
      .stroke(selected ? EandColor.borderInteractiveAccentDefault : .clear, lineWidth: 1.5))
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius5))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun PickerOption(value: String, caption: String, selected: Boolean, onClick: () -> Unit) {
  Column(
    Modifier
      .clip(RoundedCornerShape(EandRadius.radius5))
      .background(EandColor.surfaceSunkenDefault)
      .border(1.5.dp,
        if (selected) EandColor.borderInteractiveAccentDefault else Color.Transparent,
        RoundedCornerShape(EandRadius.radius5))
      .clickable(onClick = onClick)
      .widthIn(min = 96.dp).heightIn(min = 72.dp)
      .padding(EandSpacing.sm),
    verticalArrangement = Arrangement.spacedBy(EandSpacing.xs),
  ) {
    Text(value, style = EandTypography.titleSm)
    Text(caption, style = EandTypography.bodyXs, color = EandColor.textDefaultSubtle)
    OfferBadge("neutral")
  }
}`,
    react: `import { Picker, Badge } from '@eand/react-design-system';

<Picker surface="default" defaultValue={1} onChange={(i) => console.log(i)} options={[
  { value: '5', caption: 'AED', badge: <Badge status="neutral" size="sm">1 GB</Badge> },
  { value: '10', caption: 'AED', badge: <Badge status="neutral" size="sm">3 GB</Badge> },
  { value: '20', caption: 'AED', badge: <Badge status="neutral" size="sm">8 GB</Badge> },
]} />`,
  },

  dismiss: {
    swift: `import SwiftUI
import EandTokens

// Circular close button: filled circle in the dismiss colour, white X.
struct Dismiss: View {
  var surface: DismissSurface = .default
  var size: CGFloat = 24            // sm = 20
  var action: () -> Void
  var body: some View {
    Button(action: action) {
      Image(systemName: "xmark")
        .font(.system(size: size * 0.5, weight: .bold))
        .foregroundColor(.white)
        .frame(width: size, height: size)
        .background(surface == .inverse ? EandColor.dismissInverse : EandColor.dismissDefault)
        .clipShape(Circle())
    }
    .accessibilityLabel("Dismiss")
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

// Circular close button: filled circle in the dismiss colour, white X.
@Composable
fun Dismiss(surface: DismissSurface = DismissSurface.Default, size: Dp = 24.dp, onClick: () -> Unit) {
  IconButton(onClick = onClick, modifier = Modifier.size(size)) {
    Box(
      Modifier
        .fillMaxSize()
        .clip(CircleShape)
        .background(if (surface == DismissSurface.Inverse) EandColor.dismissInverse else EandColor.dismissDefault),
      contentAlignment = Alignment.Center,
    ) {
      Icon(Icons.Filled.Close, "Dismiss", tint = Color.White, modifier = Modifier.size(size * 0.6f))
    }
  }
}`,
    react: `import { Dismiss } from '@eand/react-design-system';

<Dismiss onClick={() => {}} />
<Dismiss size="sm" />
<Dismiss surface="inverse" />    // on dark surfaces`,
  },
};
