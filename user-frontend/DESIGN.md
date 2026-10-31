# Design System

Pachankaun is a bilingual local-business profile and discovery platform. The
public website and authenticated business tools share the app's typography and
utility system, with separate page layouts for their different tasks.

## Public website

The public homepage introduces Pachankaun to business owners and guides them
through account creation and business-profile setup. It must not look or read
like a Patidar Stone Crusher storefront.

### Visual direction

- Bright, modern, trustworthy interface using white and light-slate surfaces,
  with indigo/violet accents for actions and discovery.
- Clear, plain-language hierarchy; use generous spacing and responsive
  sections rather than oversized poster typography or decorative grain.
- Hero pairs the platform message and account-creation action with an
  illustrative profile/discovery preview.
- Follow with a simple three-step explanation and a profile-information
  section. Keep cards subtle, readable, and mobile-friendly.
- Use lucide icons consistently. Honor keyboard focus, readable contrast, and
  reduced-motion preferences.
- Keep all visitor-facing copy bilingual (Hindi/English) using the existing
  language toggle.

### Claims and trust

- Profile details describe a business's category, services, location, and
  other relevant information. Explain that these details can support discovery
  and relevant recommendations.
- Do not imply AI recommendations, business search, or public listing results
  are live until those features are implemented and verified.
- The hero's search/profile mockup is illustrative, not a real result. Do not
  invent businesses, customer counts, testimonials, or performance claims.
- The existing logo kit is Patidar Stone Crusher-branded and is intentionally
  not used for Pachankaun. Use the Pachankaun text mark until its own logo is
  provided.

### Routes and components

The public shell (`SiteHeader` and `SiteFooter`) lives in
`src/components/site/`. The homepage is `src/views/site/HomeView.tsx` and
uses `/register` as its primary action. Account registration is followed by
authenticated business onboarding at `/onboarding`.

Crusher-specific routes and copy still exist in the route tree and are not
part of the new homepage experience; review them separately before promoting
them through navigation or search.

## Authenticated tools

The `(app)` routes contain account and business-profile management. Continue
using high-contrast controls, clear form labels, generous touch targets, and
the shared Hindi/English language preference. Category-specific profile
questions are schema-driven and should remain understandable on mobile.

## Remaining product work

- A public directory/search experience and the AI recommendation feature are
  not confirmed as live; avoid presenting mock previews as functional results.
- Define and publish a clear explanation of how submitted business information
  is used before expanding recommendation features.
- Provide a Pachankaun logo and brand assets when available.
- Set `NEXT_PUBLIC_SITE_URL` when the canonical domain is confirmed.
