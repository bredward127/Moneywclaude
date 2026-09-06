import type { VideoConfig } from "./videos";
import { SELLER_VIDEO, BUYER_VIDEO } from "./videos";

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
}

export interface Article {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  audience: "seller" | "buyer";
  readTime: string;
  intro: string;
  sections: ArticleSection[];
  video: VideoConfig;
  ctaHref: string;
  ctaLabel: string;
}

export const ARTICLES: Article[] = [
  {
    slug: "how-to-sell-an-inherited-house-without-stress",
    title: "How to Sell an Inherited House Without Stress",
    shortTitle: "Selling an Inherited House",
    description:
      "Inheriting a house comes with probate paperwork, family logistics, and a property you may never have seen up close. Here's how to work through it calmly, step by step.",
    audience: "seller",
    readTime: "6 min read",
    intro:
      "Inheriting a house is rarely just about the property. It usually comes bundled with probate court, other heirs, decades of belongings, and grief you haven't had time to process. None of that has to turn into a crisis — most of it just needs a clear order of operations.",
    sections: [
      {
        heading: "Confirm where the property stands legally first",
        paragraphs: [
          "Before anything else, find out whether the home needs to go through probate — the court process that legally transfers ownership from the deceased to their heirs. If the home was in a living trust, or was jointly owned with rights of survivorship, you may be able to skip probate entirely. If it wasn't, expect the process to take anywhere from a couple of months to over a year depending on your state and whether the will is contested.",
          "You generally can't sell the home until you (or the estate's executor) have the legal authority to do so — either through Letters Testamentary from the probate court or a completed trust transfer. An estate attorney can usually tell you where you stand in a single conversation, which is worth it before you invest time in cleaning, repairs, or listing.",
        ],
      },
      {
        heading: "Get everyone with a stake on the same page early",
        paragraphs: [
          "Most inherited-house stress doesn't come from the house — it comes from the people who share ownership of it. If you have siblings or other co-heirs, have the sell-or-keep conversation before you start making decisions unilaterally. A short written agreement on how proceeds will be split, who handles logistics, and what happens if someone wants to keep the home instead of selling can prevent a lot of friction later.",
          "If a co-heir genuinely can't be reached or refuses to cooperate, that's a legal problem worth solving with an attorney rather than something to work around — a sale without clear authority from every owner can be unwound later.",
        ],
      },
      {
        heading: "Decide what to do with what's inside",
        paragraphs: [
          "Clearing out a lifetime of belongings is often the single most emotionally and physically draining part of this process. Give yourself permission to go slowly on sentimental items, but set a real deadline for the bulk of it — estate sale companies, junk removal services, and donation pickups can clear a house in days once you're ready.",
          "You don't need the home fully empty to sell it. Many buyers of inherited or distressed properties will purchase a home with furniture and belongings still inside, which can remove this step from your timeline entirely if it's the part holding you back.",
        ],
      },
      {
        heading: "Understand the tax side before you sign anything",
        paragraphs: [
          "Inherited property usually gets a \"stepped-up basis\" — its value is reset to its fair market value on the date of death, not what the original owner paid decades ago. That often means little or no capital gains tax if you sell reasonably soon after inheriting, but the exact numbers depend on your situation. A quick conversation with a tax professional before closing is worth far more than guessing after the fact.",
        ],
      },
      {
        heading: "Weigh a traditional listing against a direct sale",
        paragraphs: [
          "An inherited home is often outdated, needs repairs, or is simply far from where the heirs live — all things that make a traditional listing more work than it looks like from the outside: repairs, showings, financing contingencies, and a closing timeline you don't control. Selling directly, as-is, trades some sale price for a faster, more predictable process with far less coordination across everyone involved.",
          "There's no universally right answer — it depends on the property's condition, how much time you and any co-heirs have, and what matters more to your family: maximizing the number on the check, or closing the chapter with the least amount of stress.",
        ],
      },
    ],
    video: SELLER_VIDEO,
    ctaHref: "/sell",
    ctaLabel: "Tell us about the property",
  },
  {
    slug: "selling-a-home-that-needs-major-repairs",
    title: "Selling a Home That Needs Major Repairs",
    shortTitle: "Selling a Home That Needs Repairs",
    description:
      "A failing roof, old wiring, or foundation cracks don't have to mean months of contractor bids before you can sell. Here's what your real options actually look like.",
    audience: "seller",
    readTime: "5 min read",
    intro:
      "A home that needs major work puts sellers in an unusual spot: the repairs that would help it sell for more are often the exact repairs you can't afford to make, or don't want to manage. It helps to understand why traditional buyers struggle with these homes, and where your actual options are.",
    sections: [
      {
        heading: "Why financed buyers struggle with fixer-uppers",
        paragraphs: [
          "Most buyers use a mortgage, and most mortgages require an appraisal and, for FHA and USDA loans, a minimum condition standard — no exposed wiring, a functioning roof, no active safety hazards. A home with a failing roof, foundation issues, or serious code violations can cause a financed buyer's loan to fall through late in the process, after weeks of a \"pending\" sale that never closes.",
          "That's the core reason distressed homes often sit on the market longer and see more deals collapse — it's rarely that no one wants the house, it's that traditional financing wasn't built for it.",
        ],
      },
      {
        heading: "What major repairs actually tend to cost",
        paragraphs: [
          "A full roof replacement typically runs several thousand to over $15,000 depending on size and material. Foundation repairs can range from a few thousand dollars for minor crack sealing to well over $20,000 for structural underpinning. HVAC replacement, knob-and-tube or aluminum wiring updates, and sewer line repairs each commonly land in the $5,000–$15,000 range. Multiply two or three of those together and it's easy to see why sellers who can't self-fund repairs feel stuck.",
          "Contractors are also in short supply in a lot of markets, which means even sellers who can afford repairs may be looking at a multi-month wait before work even starts — time that carries its own holding costs.",
        ],
      },
      {
        heading: "You're not obligated to fix anything before you sell",
        paragraphs: [
          "Selling \"as-is\" is a completely normal, common path — it means you're not promising to make repairs or credits for every inspection finding, not that you're hiding anything. Most states still require you to disclose known material defects regardless of an as-is sale, so be upfront about what you know rather than treating \"as-is\" as a way around disclosure.",
        ],
      },
      {
        heading: "Where cash buyers fit in",
        paragraphs: [
          "Cash buyers and investors aren't relying on an appraisal-contingent mortgage, so a failing roof or dated electrical panel isn't a deal-breaker the way it is for a retail buyer. That typically means a faster close (often two to four weeks instead of thirty-plus days), no financing contingency to fall through, and no expectation that you'll complete repairs first. The tradeoff is usually a lower price than a fully renovated home would fetch on the open market — you're trading some equity for speed, certainty, and skipping the repair process entirely.",
        ],
      },
      {
        heading: "How to decide which path fits your situation",
        paragraphs: [
          "If you have the time, cash, and appetite to manage contractors, a full renovation before listing traditionally will usually net the highest sale price. If you don't have one or more of those, a cash or as-is sale removes the repair burden entirely and gives you a firm closing date instead of an open-ended timeline. Getting a no-obligation offer costs you nothing and gives you a real number to compare against the cost and hassle of repairing and listing traditionally.",
        ],
      },
    ],
    video: SELLER_VIDEO,
    ctaHref: "/sell",
    ctaLabel: "Get a no-obligation offer",
  },
  {
    slug: "how-first-time-real-estate-investors-find-deals",
    title: "How First-Time Real Estate Investors Find Deals",
    shortTitle: "Finding Your First Investment Deal",
    description:
      "The best investment properties rarely show up on the MLS. Here's where experienced investors actually look, and how to evaluate a deal once you find one.",
    audience: "buyer",
    readTime: "7 min read",
    intro:
      "New investors often start by scrolling the same listing sites everyone else is watching, then wonder why every property seems overpriced or already under contract. The properties with real margin are usually found off-market, before they're widely visible — here's how that actually works.",
    sections: [
      {
        heading: "Why off-market deals matter so much",
        paragraphs: [
          "A property listed on the open market has already been priced by an agent to attract multiple offers — that's the agent's job, and they're generally good at it. Off-market deals (sellers who haven't listed publicly) exist because the seller values speed, certainty, or simplicity over squeezing out the highest possible price: an inherited property, a landlord tired of managing tenants, someone facing foreclosure, or an owner who just wants to be done. That's where the negotiating room tends to live.",
        ],
      },
      {
        heading: "Where experienced investors actually source deals",
        paragraphs: [
          "Wholesalers who specialize in finding distressed or motivated-seller properties and assigning the contract to an investor are one of the fastest ways to see deals as a beginner, without building your own lead pipeline first. Driving for dollars — physically looking for visibly neglected properties and tracking down the owner — still works, especially in specific neighborhoods you already know well. Public records (probate filings, tax delinquency lists, code violation notices) surface motivated sellers before they ever talk to an agent. And simply telling everyone you know that you're looking to buy investment property generates more leads than most new investors expect.",
          "None of these require a large network or years of experience to start — they require consistency, since most of them are a numbers game rather than a single lucky find.",
        ],
      },
      {
        heading: "Run the numbers before you get attached",
        paragraphs: [
          "For a flip, the widely used 70% rule is a fast filter: don't pay more than 70% of the After-Repair Value (ARV) minus repair costs. If a home will be worth $300,000 fully renovated and needs $40,000 in work, your maximum offer is roughly $170,000 ($300,000 × 0.70 − $40,000). It's a rough screening tool, not a guarantee of profit, but it filters out most deals that would never have worked before you spend time on a full analysis.",
          "For a rental, cap rate (annual net operating income divided by purchase price) and cash-on-cash return tell you more than the sale price alone ever will. A property that looks cheap can still be a bad deal if rents in the area don't support it, and a property that looks expensive can be a great deal if it cash-flows well from day one.",
        ],
      },
      {
        heading: "Understand your financing options before you need them",
        paragraphs: [
          "Conventional mortgages work for move-in-ready rentals but rarely for properties needing significant repair, since lenders want the home in livable condition at closing. Hard money loans close fast and don't require the property to be in great shape, but carry higher interest rates and shorter terms, so they're best suited to flips or bridge financing rather than long-term holds. House hacking — buying a small multifamily property, living in one unit, and renting the others — lets first-time investors qualify for owner-occupant financing with lower down payments while still building a rental portfolio.",
          "Knowing which financing path fits your strategy before you find a property means you can move quickly and credibly the moment a real deal appears, instead of losing it while you figure out how to pay for it.",
        ],
      },
      {
        heading: "Red flags that should slow you down",
        paragraphs: [
          "A seller pushing for an unusually fast close with no time for inspection, numbers that only work if every renovation estimate is the best-case scenario, and any deal you can't walk away from without financial strain are all signs to slow down rather than speed up. The investors who last in this business are the ones who pass on ten mediocre deals to get to one great one — not the ones who force every deal to work.",
        ],
      },
    ],
    video: BUYER_VIDEO,
    ctaHref: "/buy",
    ctaLabel: "Share your investment criteria",
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
