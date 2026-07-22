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

struct AccountHeader: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 2) {
      Text("Hi, Ahmed")
        .font(.system(size: EandTypography.bodySm.size))
        .foregroundColor(EandColor.textDefaultInverse.opacity(0.85))
      Text("050 123 4567")
        .font(.system(size: EandTypography.titleMd.size, weight: .bold))
        .foregroundColor(EandColor.textDefaultInverse)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(EandSpacing.lg)
    .background(EandColor.surfaceBaseBrand)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun AccountHeader() {
  Column(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceBaseBrand,
        RoundedCornerShape(bottomStart = EandRadius.radius6, bottomEnd = EandRadius.radius6))
      .padding(EandSpacing.lg),
  ) {
    Text("Hi, Ahmed", color = EandColor.textDefaultInverse.copy(alpha = .85f), style = EandTypography.bodySm)
    Text("050 123 4567", color = EandColor.textDefaultInverse, style = EandTypography.titleMd)
  }
}`,
    react: `import { TopBar, Icon } from '@eand/react-design-system';

<TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567"
  actions={[<Icon name="magic-wand"/>, <Icon name="notification"/>]} />`,
  },

  section: {
    swift: `import SwiftUI
import EandTokens

struct EandSection<Content: View>: View {
  let title: String
  @ViewBuilder var content: Content
  var body: some View {
    VStack(alignment: .leading, spacing: 4) {   // slots share a 4pt gap
      Text(title).font(.system(size: EandTypography.headingSm.size, weight: .bold))
      content
    }
    .padding(EandSpacing.lg)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(EandColor.surfaceBaseDefault)
    .clipShape(RoundedRectangle(cornerRadius: EandRadius.radius6))
  }
}`,
    kotlin: `import com.eand.tokens.EandColor

@Composable
fun EandSection(title: String, content: @Composable ColumnScope.() -> Unit) {
  Column(
    Modifier
      .fillMaxWidth()
      .background(EandColor.surfaceBaseDefault, RoundedCornerShape(EandRadius.radius6))
      .padding(EandSpacing.lg),
    verticalArrangement = Arrangement.spacedBy(4.dp),   // slots share a 4dp gap
  ) {
    Text(title, style = EandTypography.headingSm)
    content()
  }
}`,
    react: `import { Section, ListRow } from '@eand/react-design-system';

<Section title="My Plan" context="Freedom Live Plan 200">
  <ListRow label="2 GB left" value="Local Data" chevron={false} />
  <ListRow label="200 min left" value="Minutes" chevron={false} />
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
};
