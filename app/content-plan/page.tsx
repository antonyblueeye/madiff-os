"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    CalendarDays,
    CheckCircle2,
    Clock,
    Eye,
    X,
    User,
    Sparkles,
    FileText,
    Share2,
    ExternalLink,
    Filter,
    Calendar as CalendarIcon,
    Copy,
    Check,
    ArrowUpRight,
    CheckSquare,
    Square,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

function LinkedInIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
    );
}

export interface LinkedInPostItem {
    id: string;
    postNumber: number;
    week: string;
    weekTheme: string;
    proposedDate: string;
    contentPillar: string;
    topic: string;
    businessObjective: string;
    draftCopy: string;
    suggestedVisual: string;
    imageSrc: string;
    status: "Pending Review" | "Approved" | "Scheduled" | "Published";
    owner: string;
    reviewer: string;
    approver: string;
}

const defaultLinkedInPosts: LinkedInPostItem[] = [
    {
        id: "post-1",
        postNumber: 1,
        week: "Week 1 (Sep 27 – Oct 3)",
        weekTheme: "The Architecture Behind AI",
        proposedDate: "Tuesday, September 29, 2026",
        contentPillar: "AI & Technology Commentary (40%)",
        topic: "Your AI Application Is Only as Good as the Architecture Around It",
        businessObjective: "Reinforce Madiff as an engineering company that understands the full architecture required to make AI applications reliable.",
        draftCopy: `Everyone is talking about AI applications.

Far fewer people are talking about the architecture underneath them.

A production AI application needs much more than a model and an API.

It needs:

→ Reliable data flows
→ Scalable backend services
→ Secure access controls
→ Cloud infrastructure
→ Monitoring and observability
→ Model evaluation
→ Integration with existing systems
→ A clear path for future scaling

The model is only one component.

And in many enterprise environments, it isn't even the hardest one.

The real engineering challenge is making all of these components work together reliably.

That's why building an AI product is fundamentally a software architecture problem.

At Madiff, we help companies design and build the engineering foundations that turn AI capabilities into production systems.

Because great AI doesn't live in a notebook.

It lives inside great architecture.`,
        suggestedVisual: "Layered architecture diagram: AI Model → Application Layer → Data → Infrastructure → Security & Monitoring, with the AI model visually shown as only one layer.",
        imageSrc: "/posts_images/post_1.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-2",
        postNumber: 2,
        week: "Week 1 (Sep 27 – Oct 3)",
        weekTheme: "The Architecture Behind AI",
        proposedDate: "Thursday, October 1, 2026",
        contentPillar: "Engineering & Consultant Excellence (25%)",
        topic: "The Most Expensive Technical Decision Is Often the One You Don't Make",
        businessObjective: "Position Madiff's engineers as proactive technical partners rather than resource providers.",
        draftCopy: `Technical debt doesn't usually appear overnight.

It starts with small decisions.

"We'll fix the architecture later."

"We just need to get the MVP out."

"We can automate this manually for now."

"We'll deal with observability once we have users."

And sometimes those decisions are completely reasonable.

The problem is when temporary solutions become permanent infrastructure.

Six months later, teams are spending more time maintaining workarounds than building new features.

Good engineering isn't about avoiding every shortcut.

It's about knowing which shortcuts are safe — and which ones will become expensive later.

That requires experienced engineers who can see beyond the immediate task.

At Madiff, our teams work not only on what needs to be built today, but also on the technical decisions that determine how efficiently the product can evolve tomorrow.

Because engineering quality isn't just about shipping faster.

It's about avoiding the decisions that make future shipping slower.`,
        suggestedVisual: 'Timeline showing "Quick Fix" → "Temporary Solution" → "Technical Debt" → "Delivery Bottleneck", with a small intervention point early in the timeline.',
        imageSrc: "/posts_images/post_2.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-3",
        postNumber: 3,
        week: "Week 2 (Oct 4 – 10)",
        weekTheme: "Cloud, Cost & Scalability",
        proposedDate: "Tuesday, October 6, 2026",
        contentPillar: "AI & Technology Commentary (40%)",
        topic: "Cloud Scalability Doesn't Mean \"Just Add More Servers\"",
        businessObjective: "Demonstrate practical cloud engineering expertise and challenge simplistic assumptions around scalability.",
        draftCopy: `"Make it scalable."

Sounds simple.

It isn't.

Real scalability means answering questions like:

→ What happens when traffic increases 10x?
→ Which components become bottlenecks first?
→ How does the database behave under load?
→ What happens when an external service fails?
→ Can infrastructure scale automatically?
→ How do you prevent cloud costs from scaling at the same rate as usage?
→ Can the engineering team actually monitor all of this?

Adding more compute is only one part of the equation.

Sometimes the bottleneck is the database.

Sometimes it's an API.

Sometimes it's the architecture itself.

And sometimes the system technically scales — but becomes economically impossible to operate.

Good cloud engineering balances three things:

Performance. Reliability. Cost.

At Madiff, our engineering teams help companies build cloud environments designed not only to handle growth, but to handle it predictably.

Because scalability isn't about surviving a traffic spike.

It's about building a system that can grow without breaking the business.`,
        suggestedVisual: 'Three-way triangle: Performance / Reliability / Cost, with "Scalability" in the center.',
        imageSrc: "/posts_images/post_3.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-4",
        postNumber: 4,
        week: "Week 2 (Oct 4 – 10)",
        weekTheme: "Cloud, Cost & Scalability",
        proposedDate: "Thursday, October 8, 2026",
        contentPillar: "Engineering & Consultant Excellence (25%)",
        topic: "Why Senior Engineers Don't Just Write Better Code",
        businessObjective: "Differentiate Madiff's senior consultants from commodity development resources.",
        draftCopy: `The value of a senior engineer isn't simply that they write code faster.

It's that they make better decisions before the code is written.

They ask:

→ Do we actually need to build this?
→ What will happen when usage grows?
→ What is the simplest architecture that can work?
→ Where are the likely failure points?
→ How will this integrate with the existing system?
→ What will this cost to maintain?
→ What happens six months from now?

That perspective changes projects.

A junior engineer can implement a requirement.

A strong senior engineer can challenge the requirement, identify the hidden complexity, and design a better way to solve the underlying problem.

That's the difference between adding development capacity and adding engineering expertise.

At Madiff, we focus on connecting companies with experienced engineers who can contribute to the decisions behind the delivery — not just the tickets inside it.

Because sometimes the most valuable code is the code you decide not to write.`,
        suggestedVisual: 'Split graphic: "Writing Code" vs "Engineering Decisions", with the second side containing architecture, trade-offs, scalability, security, and maintainability.',
        imageSrc: "/posts_images/post_4.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-5",
        postNumber: 5,
        week: "Week 3 (Oct 11 – 17)",
        weekTheme: "Legacy Systems & Modernization",
        proposedDate: "Tuesday, October 13, 2026",
        contentPillar: "Company & Leadership (10%)",
        topic: "Your Legacy System Isn't the Problem. Your Inability to Change It Is.",
        businessObjective: "Position Madiff as a pragmatic modernization partner without pushing the \"replace everything\" narrative.",
        draftCopy: `Legacy systems get blamed for a lot.

Slow releases.

Complex integrations.

Security concerns.

High maintenance costs.

But legacy technology isn't automatically bad technology.

Some of the systems running the world's largest companies are decades old — and they work.

The real problem is when those systems prevent the business from changing.

You don't necessarily need to replace everything.

You might need to:

→ Modernize specific services
→ Introduce APIs around legacy systems
→ Move selected workloads to the cloud
→ Improve data accessibility
→ Decouple tightly connected components
→ Automate manual processes
→ Introduce new capabilities around existing infrastructure

Modernization isn't about destroying the old system.

It's about creating enough flexibility to build the new one.

At Madiff, we help engineering teams modernize existing environments while keeping business-critical systems running.

Because the best modernization strategy isn't always a clean rebuild.

Sometimes it's a carefully engineered evolution.`,
        suggestedVisual: '"Replace vs. Evolve" comparison. Show a large legacy system gradually transforming through modular modernization rather than being completely replaced.',
        imageSrc: "/posts_images/post_5.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-6",
        postNumber: 6,
        week: "Week 3 (Oct 11 – 17)",
        weekTheme: "Legacy Systems & Modernization",
        proposedDate: "Thursday, October 15, 2026",
        contentPillar: "Case Style / Client Value (15%)",
        topic: "The Hidden Bottleneck in Enterprise Software: Integration",
        businessObjective: "Highlight Madiff's ability to work across complex enterprise environments.",
        draftCopy: `Building a new application is often easier than connecting it to everything that already exists.

That's the reality of enterprise software.

A new product may need to communicate with:

→ Legacy databases
→ CRM platforms
→ ERP systems
→ Internal APIs
→ Cloud services
→ Third-party providers
→ Authentication systems
→ Data warehouses

And every connection introduces another dependency.

This is where many seemingly simple projects become complicated.

The challenge isn't just building the new system.

It's making the new system coexist with everything around it.

That requires strong API design, integration architecture, data engineering, security, testing, and infrastructure expertise.

At Madiff, our engineering teams work across these layers to help companies connect new technology with the systems that already run their business.

Because enterprise software doesn't exist in isolation.

It exists in an ecosystem.`,
        suggestedVisual: 'Central "New Product" connected to multiple surrounding systems: CRM, ERP, Database, APIs, Cloud, Data Warehouse, Authentication.',
        imageSrc: "/posts_images/post_6.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-7",
        postNumber: 7,
        week: "Week 4 (Oct 18 – 24)",
        weekTheme: "Security, Reliability & Production",
        proposedDate: "Tuesday, October 20, 2026",
        contentPillar: "AI & Technology Commentary (40%)",
        topic: "A Production System Has to Assume Something Will Go Wrong",
        businessObjective: "Establish Madiff's engineering mindset around resilience, reliability, and production readiness.",
        draftCopy: `The best production systems aren't designed around the assumption that everything will work.

They're designed around the assumption that something eventually won't.

A database will become unavailable.

An API will time out.

A deployment will fail.

Traffic will spike.

A third-party service will go down.

A model will produce an unexpected result.

The question isn't whether something will go wrong.

The question is what happens when it does.

Reliable engineering means designing for failure:

→ Monitoring
→ Alerts
→ Automated recovery
→ Backups
→ Redundancy
→ Rate limiting
→ Graceful degradation
→ Clear incident processes

This matters even more as companies introduce AI and increasingly distributed architectures into critical business processes.

Production engineering isn't about creating systems that never fail.

It's about creating systems that fail predictably — and recover quickly.

That's the kind of engineering foundation Madiff helps companies build.`,
        suggestedVisual: "System diagram showing several controlled failure scenarios and the corresponding resilience mechanisms.",
        imageSrc: "/posts_images/post_7.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-8",
        postNumber: 8,
        week: "Week 4 (Oct 18 – 24)",
        weekTheme: "Security, Reliability & Production",
        proposedDate: "Thursday, October 22, 2026",
        contentPillar: "Engineering & Consultant Excellence (25%)",
        topic: "What Enterprise Teams Should Expect From an External Engineering Partner",
        businessObjective: "Move the conversation from \"outsourcing\" toward strategic engineering partnership.",
        draftCopy: `Hiring an external engineering team shouldn't mean handing over a ticket backlog and hoping for the best.

A strong engineering partner should bring more than additional hands.

They should bring:

Ownership — taking responsibility for outcomes, not just assigned tasks.

Technical judgment — challenging assumptions when necessary.

Transparency — making risks and trade-offs visible early.

Communication — working naturally with internal teams.

Adaptability — adjusting as priorities change.

Engineering discipline — maintaining quality even when delivery pressure increases.

The goal isn't to create two teams.

It's to create one engineering organization that happens to include external expertise.

That's how distributed delivery works best.

At Madiff, we build teams around the technical and business challenges our clients need to solve — and integrate them directly into the delivery environment.

Because the best external engineering team should eventually feel less like an external team.

And more like part of yours.`,
        suggestedVisual: "Two organizational circles, Internal Engineering Team + Madiff Engineering Team, merging into one Unified Delivery Team.",
        imageSrc: "/posts_images/post_8.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-9",
        postNumber: 9,
        week: "Week 5 (Oct 25 – 31)",
        weekTheme: "From Technology to Business Outcomes",
        proposedDate: "Tuesday, October 27, 2026",
        contentPillar: "Company & Leadership (10%)",
        topic: "Technology Projects Should Have a Definition of \"Done\" Beyond Launch",
        businessObjective: "Shift Madiff's positioning toward measurable business outcomes rather than technical delivery alone.",
        draftCopy: `A software project isn't successful because it launched.

Launch is the beginning.

The real questions come afterwards:

Did users adopt it?

Did operational costs improve?

Did the process become faster?

Did revenue increase?

Did customer experience improve?

Did the system reduce manual work?

Did the engineering team become more productive?

Too many technology projects measure success by technical milestones:

✓ Feature completed
✓ Application deployed
✓ Infrastructure migrated
✓ Model integrated

But business value lives beyond the deployment pipeline.

Engineering teams need to understand what the technology is supposed to change.

At Madiff, we believe strong delivery starts with understanding the business outcome behind the technical requirement.

Because shipping software is a capability.

Creating measurable impact is the goal.`,
        suggestedVisual: 'A journey from Code → Deployment → Adoption → Operational Impact → Business Value, with "Launch" shown as the midpoint rather than the finish line.',
        imageSrc: "/posts_images/post_9.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
    {
        id: "post-10",
        postNumber: 10,
        week: "Week 5 (Oct 25 – 31)",
        weekTheme: "From Technology to Business Outcomes",
        proposedDate: "Thursday, October 29, 2026",
        contentPillar: "Case Style / Client Value (15%)",
        topic: "The Best Engineering Teams Make Complexity Look Simple",
        businessObjective: "Close the month with a strong, broad positioning statement around Madiff's core value proposition.",
        draftCopy: `The hardest engineering work often looks simple from the outside.

A smooth product launch.

A fast application.

A reliable cloud environment.

A working AI feature.

A seamless integration.

What users don't see is everything underneath.

The architecture decisions.

The data pipelines.

The infrastructure.

The testing.

The security controls.

The monitoring.

The failed experiments.

The technical trade-offs.

The hundreds of small decisions that make the final experience feel effortless.

That's what great engineering does.

It absorbs complexity so the business doesn't have to.

For more than [X] years, Madiff has helped companies build the engineering capacity needed to solve complex technology challenges — from AI and data engineering to cloud, software development, and modernization.

The end result isn't supposed to look complicated.

That's the point.

Great engineering makes complex things work.`,
        suggestedVisual: "Minimalist \"iceberg\" graphic. Above water: Simple User Experience. Below water: Architecture / Data / Cloud / Security / QA / DevOps / Engineering.",
        imageSrc: "/posts_images/post_10.jpeg",
        status: "Pending Review",
        owner: "Anton (PA / Content Lead)",
        reviewer: "Robert Jaskolowski",
        approver: "Robert / Michał / Fernando",
    },
];

export default function ContentPlanPage() {
    const [posts, setPosts] = useState<LinkedInPostItem[]>(defaultLinkedInPosts);
    const [selectedPost, setSelectedPost] = useState<LinkedInPostItem | null>(null);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [filterPillar, setFilterPillar] = useState<string>("All");
    const [filterWeek, setFilterWeek] = useState<string>("All");
    const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

    // Database sync for is_posted statuses
    const [dbStatuses, setDbStatuses] = useState<Record<string, { is_posted: boolean; posted_at?: string; status?: string }>>({});
    const [isUpdatingDb, setIsUpdatingDb] = useState(false);

    // Load saved statuses from PostgreSQL
    const loadDbStatuses = async () => {
        try {
            const res = await fetch("/api/content-posts");
            if (res.ok) {
                const data = await res.json();
                const map: Record<string, any> = {};
                (data.posts || []).forEach((p: any) => {
                    map[p.id] = {
                        is_posted: Boolean(p.is_posted),
                        posted_at: p.posted_at,
                        status: p.status,
                    };
                });
                setDbStatuses(map);
            }
        } catch (e) {
            console.error("Failed to load db statuses:", e);
        }
    };

    useEffect(() => {
        loadDbStatuses();
    }, []);

    // Toggle Posted status and save directly to PostgreSQL
    const togglePostStatus = async (post: LinkedInPostItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const current = dbStatuses[post.id]?.is_posted || false;
        const newStatus = !current;

        // Optimistic UI update
        setDbStatuses((prev) => ({
            ...prev,
            [post.id]: {
                is_posted: newStatus,
                posted_at: newStatus ? new Date().toISOString() : undefined,
                status: newStatus ? "Published" : "Pending Review",
            },
        }));

        try {
            setIsUpdatingDb(true);
            await fetch("/api/content-posts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: post.id,
                    postNumber: post.postNumber,
                    isPosted: newStatus,
                    status: newStatus ? "Published" : "Pending Review",
                }),
            });
        } catch (err) {
            console.error("Could not save post status:", err);
        } finally {
            setIsUpdatingDb(false);
        }
    };

    const pillars = [
        "All",
        "AI & Technology Commentary (40%)",
        "Engineering & Consultant Excellence (25%)",
        "Case Style / Client Value (15%)",
        "Company & Leadership (10%)",
    ];

    const weeks = [
        "All",
        "Week 1 (Sep 27 – Oct 3)",
        "Week 2 (Oct 4 – 10)",
        "Week 3 (Oct 11 – 17)",
        "Week 4 (Oct 18 – 24)",
        "Week 5 (Oct 25 – 31)",
    ];

    const filteredPosts = posts.filter((post) => {
        if (filterPillar !== "All" && post.contentPillar !== filterPillar) return false;
        if (filterWeek !== "All" && post.week !== filterWeek) return false;
        return true;
    });

    const handleCopyText = (text: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopiedPostId(id);
        setTimeout(() => setCopiedPostId(null), 2500);
    };

    // Calculate published count from DB
    const publishedCount = Object.values(dbStatuses).filter((s) => s.is_posted).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eaedf3] pb-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0077b5] text-white shadow-xs">
                            <LinkedInIcon className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-extrabold tracking-tight text-[#1f2d3d]">
                            Madiff LinkedIn Content Calendar
                        </h1>
                        <Badge variant="accent">Sep 27 – Oct 31, 2026</Badge>
                    </div>
                    <p className="text-xs text-[#6e84a3]">
                        Strategic enterprise thought-leadership pipeline • Publishing Cadence: Every Tuesday & Thursday • Target: C-level, CTOs & VPs of Engineering
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Published to LinkedIn</span>
                        <span className="text-xs font-extrabold text-emerald-700">
                            {publishedCount} of {posts.length} posts published
                        </span>
                    </div>

                    <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] px-3.5 py-2 text-right">
                        <span className="text-[10px] uppercase font-bold text-[#6e84a3] block">Workflow Governance</span>
                        <span className="text-xs font-bold text-[#1f2d3d]">Draft: Anton → Review: Robert → Final: Michał / Fernando</span>
                    </div>
                </div>
            </div>

            {/* Strategic Monthly Mix Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3.5 space-y-1 bg-white border-[#eaedf3]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">AI & Technology</span>
                        <span className="text-xs font-bold text-[#0077b5]">40%</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#1f2d3d]">3 Posts (1, 3, 7)</p>
                    <span className="text-[10px] text-[#95aac9] block">Architecture, Cloud scale, Resilience</span>
                </Card>

                <Card className="p-3.5 space-y-1 bg-white border-[#eaedf3]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Consultant Excellence</span>
                        <span className="text-xs font-bold text-emerald-600">25%</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#1f2d3d]">3 Posts (2, 4, 8)</p>
                    <span className="text-[10px] text-[#95aac9] block">Tech debt, Senior judgment, Delivery</span>
                </Card>

                <Card className="p-3.5 space-y-1 bg-white border-[#eaedf3]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Case / Client Value</span>
                        <span className="text-xs font-bold text-amber-600">15%</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#1f2d3d]">2 Posts (6, 10)</p>
                    <span className="text-[10px] text-[#95aac9] block">Enterprise integration, Complexity</span>
                </Card>

                <Card className="p-3.5 space-y-1 bg-white border-[#eaedf3]">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">Company & Leadership</span>
                        <span className="text-xs font-bold text-purple-600">10%</span>
                    </div>
                    <p className="text-sm font-extrabold text-[#1f2d3d]">2 Posts (5, 9)</p>
                    <span className="text-[10px] text-[#95aac9] block">Legacy evolution, Business impact</span>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#eaedf3] rounded-xl p-3 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#6e84a3] flex items-center gap-1.5 mr-1">
                        <Filter className="h-3.5 w-3.5 text-[#354f52]" />
                        <span>Filter by Week:</span>
                    </span>
                    {weeks.map((w) => (
                        <button
                            key={w}
                            onClick={() => setFilterWeek(w)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                                filterWeek === w
                                    ? "bg-[#354f52] text-white shadow-xs"
                                    : "bg-[#f8fafc] text-[#6e84a3] hover:text-[#1f2d3d] border border-[#eaedf3]"
                            }`}
                        >
                            {w === "All" ? "All Weeks (10 Posts)" : w.split(" (")[0]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filterPillar}
                        onChange={(e) => setFilterPillar(e.target.value)}
                        className="rounded-lg border border-[#eaedf3] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#1f2d3d] outline-none cursor-pointer focus:border-[#354f52]"
                    >
                        {pillars.map((p) => (
                            <option key={p} value={p}>
                                {p === "All" ? "All Content Pillars" : p}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Compact List View */}
            <div className="space-y-3">
                {filteredPosts.map((post) => {
                    const dbStatus = dbStatuses[post.id];
                    const isPosted = Boolean(dbStatus?.is_posted);
                    const isExpanded = expandedPostId === post.id;

                    return (
                        <Card
                            key={post.id}
                            className={`p-0 overflow-hidden transition-all duration-200 border ${
                                isPosted
                                    ? "border-emerald-300 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-200"
                                    : "border-[#eaedf3] bg-white hover:border-[#0077b5]/50 shadow-2xs"
                            }`}
                        >
                            {/* Compact Row Header */}
                            <div
                                onClick={() => setSelectedPost(post)}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 cursor-pointer hover:bg-[#f8fafc] transition-colors"
                            >
                                {/* Left Section: Post # + Checkbox + Date + Topic */}
                                <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                                    {/* Mark as Posted Checkbox Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => togglePostStatus(post, e)}
                                        title={isPosted ? "Click to mark as not posted" : "Click to mark as Published on LinkedIn"}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                                            isPosted
                                                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs hover:bg-emerald-700"
                                                : "bg-[#f8fafc] text-[#6e84a3] border-[#eaedf3] hover:border-emerald-500 hover:text-emerald-700"
                                        }`}
                                    >
                                        {isPosted ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-white" />
                                                <span>Posted</span>
                                            </>
                                        ) : (
                                            <>
                                                <Square className="h-3.5 w-3.5 text-[#95aac9]" />
                                                <span>Mark Posted</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Thumbnail Preview */}
                                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-[#eaedf3] bg-slate-900 shadow-2xs">
                                        <Image
                                            src={post.imageSrc}
                                            alt={post.topic}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Topic + Details */}
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-mono font-bold text-[#6e84a3]">
                                                #{post.postNumber} • {post.week.split(" ")[0]} {post.week.split(" ")[1]}
                                            </span>
                                            <span className="text-[11px] font-semibold text-[#52796f] flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                {post.proposedDate.split(", ")[1]}
                                            </span>
                                            <Badge variant={isPosted ? "success" : "accent"}>
                                                {isPosted ? "Published to LinkedIn" : post.status}
                                            </Badge>
                                            <span className="text-[10px] font-semibold text-[#0077b5] uppercase bg-[#0077b5]/10 px-2 py-0.2 rounded">
                                                {post.contentPillar.split(" (")[0]}
                                            </span>
                                        </div>

                                        <h3 className={`text-sm font-extrabold truncate ${isPosted ? "text-emerald-950 font-black" : "text-[#1f2d3d]"}`}>
                                            {post.topic}
                                        </h3>
                                    </div>
                                </div>

                                {/* Right Section: Quick Action Buttons */}
                                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedPostId(isExpanded ? null : post.id);
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f1f5f9] transition-colors"
                                        title={isExpanded ? "Collapse inline preview" : "Expand full post inline"}
                                    >
                                        <span>{isExpanded ? "Collapse" : "Preview"}</span>
                                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                    </button>

                                    <button
                                        onClick={(e) => handleCopyText(post.draftCopy, post.id, e)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1f2d3d] hover:bg-[#f1f5f9] transition-colors"
                                        title="Copy full post text"
                                    >
                                        {copiedPostId === post.id ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-emerald-700">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5 text-[#6e84a3]" />
                                                <span>Copy</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPost(post);
                                        }}
                                        className="inline-flex items-center gap-1 text-[#0077b5] font-bold text-xs bg-[#0077b5]/10 hover:bg-[#0077b5]/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <span>Full Post</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Inline Expandable Body */}
                            {isExpanded && (
                                <div className="border-t border-[#eaedf3] bg-[#fafbfc] p-4 space-y-4 animate-in fade-in duration-150">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                                        {/* Image Display */}
                                        <div className="md:col-span-5 space-y-2">
                                            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#eaedf3] bg-slate-900 shadow-xs">
                                                <Image
                                                    src={post.imageSrc}
                                                    alt={post.topic}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 400px"
                                                    className="object-contain"
                                                />
                                            </div>
                                            <p className="text-[11px] text-[#6e84a3] italic">
                                                Visual Concept: {post.suggestedVisual}
                                            </p>
                                        </div>

                                        {/* Full Copy Text */}
                                        <div className="md:col-span-7 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6e84a3]">
                                                    Full Post Draft
                                                </span>
                                                <button
                                                    onClick={(e) => handleCopyText(post.draftCopy, post.id, e)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0077b5] hover:underline"
                                                >
                                                    <Copy className="h-3 w-3" />
                                                    <span>{copiedPostId === post.id ? "Copied!" : "Copy Draft"}</span>
                                                </button>
                                            </div>
                                            <div className="rounded-xl border border-[#eaedf3] bg-white p-3.5 text-xs font-sans text-[#1f2d3d] leading-relaxed whitespace-pre-wrap select-all max-h-72 overflow-y-auto">
                                                {post.draftCopy}
                                            </div>
                                            <div className="text-[11px] text-[#6e84a3]">
                                                <strong>Objective:</strong> {post.businessObjective}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Slide-over Post Detail Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                    <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl border border-[#eaedf3] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#eaedf3] px-6 py-4 bg-[#fafbfc]">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0077b5] text-white font-bold text-sm">
                                    #{selectedPost.postNumber}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold text-[#1f2d3d]">
                                            {selectedPost.week} — {selectedPost.proposedDate}
                                        </h2>
                                        <Badge variant={dbStatuses[selectedPost.id]?.is_posted ? "success" : "accent"}>
                                            {dbStatuses[selectedPost.id]?.is_posted ? "Published to LinkedIn" : selectedPost.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-[#0077b5] font-semibold">{selectedPost.contentPillar}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => togglePostStatus(selectedPost, e)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                        dbStatuses[selectedPost.id]?.is_posted
                                            ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                                            : "bg-white text-[#1f2d3d] border-[#eaedf3] hover:border-emerald-500"
                                    }`}
                                >
                                    {dbStatuses[selectedPost.id]?.is_posted ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                            <span>Published</span>
                                        </>
                                    ) : (
                                        <>
                                            <Square className="h-3.5 w-3.5 text-[#95aac9]" />
                                            <span>Mark as Published</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="rounded-lg p-1.5 text-[#95aac9] hover:bg-[#e2e8f0] hover:text-[#1f2d3d]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Topic Title */}
                            <div>
                                <h3 className="text-base font-extrabold text-[#1f2d3d]">{selectedPost.topic}</h3>
                                <p className="text-xs text-[#6e84a3] mt-1">
                                    <strong>Business Objective:</strong> {selectedPost.businessObjective}
                                </p>
                            </div>

                            {/* Image Preview */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">
                                    Attached LinkedIn Image ({selectedPost.imageSrc})
                                </label>
                                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[#eaedf3] bg-slate-900 shadow-sm">
                                    <Image
                                        src={selectedPost.imageSrc}
                                        alt={selectedPost.topic}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 800px"
                                        className="object-contain"
                                    />
                                </div>
                                <p className="text-[11px] text-[#6e84a3] italic">
                                    Visual Concept: {selectedPost.suggestedVisual}
                                </p>
                            </div>

                            {/* Full Copy Text */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6e84a3]">
                                        Full LinkedIn Post Copy
                                    </label>
                                    <button
                                        onClick={(e) => handleCopyText(selectedPost.draftCopy, selectedPost.id, e)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaedf3] bg-white px-2.5 py-1 text-xs font-bold text-[#1f2d3d] hover:bg-[#f1f5f9] transition-colors shadow-2xs"
                                    >
                                        {copiedPostId === selectedPost.id ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                <span className="text-emerald-700">Copied to Clipboard!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5 text-[#354f52]" />
                                                <span>Copy Full Copy</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="rounded-xl border border-[#eaedf3] bg-[#f8fafc] p-4 text-xs font-sans text-[#1f2d3d] leading-relaxed whitespace-pre-wrap select-all">
                                    {selectedPost.draftCopy}
                                </div>
                            </div>

                            {/* Workflow Metadata */}
                            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#eaedf3] bg-white p-3 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-[#95aac9] block">Draft Owner</span>
                                    <span className="font-semibold text-[#1f2d3d]">{selectedPost.owner}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-[#95aac9] block">Reviewer</span>
                                    <span className="font-semibold text-[#1f2d3d]">{selectedPost.reviewer}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-[#95aac9] block">Final Approver</span>
                                    <span className="font-semibold text-[#1f2d3d]">{selectedPost.approver}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-[#eaedf3] bg-[#fafbfc] px-6 py-3 flex items-center justify-between">
                            <span className="text-xs text-[#6e84a3]">
                                Publishing Channel: <strong>Madiff LinkedIn Company Page</strong>
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="rounded-lg border border-[#eaedf3] bg-white px-3.5 py-1.5 text-xs font-bold text-[#6e84a3] hover:bg-[#f1f5f9] transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={(e) => handleCopyText(selectedPost.draftCopy, selectedPost.id, e)}
                                    className="rounded-lg bg-[#0077b5] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#005f93] transition-colors shadow-xs flex items-center gap-1.5"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy for LinkedIn</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
