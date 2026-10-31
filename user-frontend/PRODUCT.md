# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 App Router (React 19) + Tailwind CSS 4, user-frontend of the patidar-stone-crasher monorepo; Express/Sequelize/Postgres backend. Bilingual (Hindi/English) throughout.

## Users

- **Business owners:** register an account, create a category-specific business profile, and keep their public business information up to date.
- **People looking for businesses:** discover local businesses using relevant business information and, as the recommendation experience is built, AI-assisted recommendations.

## Product Purpose

Pachankaun is a local business discovery platform. Business owners register, choose a category, and provide details that describe their products or services. Those structured profiles support business discovery and are intended to inform relevant AI recommendations. The public homepage (`/`) explains the platform and guides owners to create an account and business profile. Do not imply the AI recommendation feature is live unless its implementation and availability are verified.

## Positioning

A straightforward way for local businesses to describe what they do and be discovered by people looking for relevant services.

## Operating Context

- Business categories determine which profile details owners are asked to provide.
- Profile information is intended to help Pachankaun understand and recommend relevant businesses.
- User-facing registration and business profile setup are separate steps: account creation, then authenticated onboarding.

## Capabilities and Constraints

- Public page must be bilingual hi/en (default hi) with the language toggle.
- `/` is the public platform homepage; `/register` creates an account; business onboarding is authenticated.
- Business profile fields are category-driven and submitted for review.
- AI recommendations are a product intent, not a confirmed live capability; communicate them as planned or evolving until verified.
- Do not invent business listings, customer statistics, testimonials, or live recommendation results.

## Brand Commitments

Name: Pachankaun (पचानकौन).

## Evidence on Hand

- Do not fabricate business listings, platform usage figures, testimonials, or recommendation results.
- Business information is collected for profile creation and intended discovery/recommendation features; explain its use transparently.

## Product Principles

1. Make it easy for a business owner to create and maintain a useful profile.
2. Keep the profile flow category-aware; ask for relevant details rather than one generic form.
3. Use profile data to improve business discovery and relevant recommendations as those capabilities become available.
4. Keep language clear, bilingual, mobile-first, and transparent about how information is used.

## Open Decisions

- Confirm the AI recommendation implementation, rollout, and user-facing explanation of how profile data is used.
- Define the public business-search/browse experience and business profile visibility controls.
