export interface LeadChannelStatus {
    active: boolean;
    statusText?: string;
    details?: string;
    dateAdded?: string;
}

export interface LeadItem {
    id: string;
    name: string;
    avatarUrl?: string;
    title: string;
    company: string;
    industry: string;
    location: string;
    headcount: string;
    email: string;
    phone?: string;
    linkedinUrl?: string;
    stage: "New Sourced" | "Contacted" | "In Conversation" | "Meeting Booked" | "Proposal Sent";
    lifecycleStage?: string;
    contactOwner?: string;
    createdDate?: string;
    campaign?: string;
    channels: {
        apollo: LeadChannelStatus;
        hubspot: LeadChannelStatus;
        reply: LeadChannelStatus;
        linkedhelper: LeadChannelStatus;
        zoho: LeadChannelStatus;
    };
    notes?: string[];
    timeline: { date: string; channel: string; event: string }[];
}

export interface IntegrationStatus {
    id: string;
    name: string;
    description: string;
    category: "Lead Sourcing" | "Email Outreach" | "LinkedIn Automation" | "CRM" | "Newsletter" | "Organic Social";
    status: "connected" | "warning" | "syncing" | "disconnected";
    lastSync: string;
    activeItems: string;
    apiLatency?: string;
}

export const integrationsData: IntegrationStatus[] = [
    {
        id: "apollo",
        name: "Apollo.io",
        description: "B2B contact database, lead enrichment & export lists",
        category: "Lead Sourcing",
        status: "connected",
        lastSync: "3 min ago",
        activeItems: "1,847 leads synced",
        apiLatency: "142ms",
    },
    {
        id: "linkedhelper",
        name: "LinkedHelper",
        description: "Automated LinkedIn sequences, invites & direct outreach",
        category: "LinkedIn Automation",
        status: "connected",
        lastSync: "12 min ago",
        activeItems: "3 active flows / 450 contacts",
        apiLatency: "Local webhook ok",
    },
    {
        id: "replyio",
        name: "Reply.io",
        description: "Cold email multithreaded sequences & deliverability monitor",
        category: "Email Outreach",
        status: "connected",
        lastSync: "Just now",
        activeItems: "4 live campaigns / 8 inboxes",
        apiLatency: "98ms",
    },
    {
        id: "hubspot",
        name: "HubSpot CRM",
        description: "Primary CRM sync: contacts, pipeline stages & meeting bookings",
        category: "CRM",
        status: "connected",
        lastSync: "15 min ago",
        activeItems: "24 new deals this month",
        apiLatency: "210ms",
    },
    {
        id: "zoho",
        name: "Zoho Campaigns",
        description: "Candidate talent pool updates & monthly client newsletters",
        category: "Newsletter",
        status: "syncing",
        lastSync: "Syncing now...",
        activeItems: "4,210 subscribers",
        apiLatency: "185ms",
    },
    {
        id: "linkedin-page",
        name: "Madiff LinkedIn Page",
        description: "Company page organic reach, post reactions & inbound analytics (manual log)",
        category: "Organic Social",
        status: "warning",
        lastSync: "Yesterday (manual entry)",
        activeItems: "8 posts tracked / +18.4% ER",
    },
];

export const recentSystemActivity = [
    { id: 1, source: "Apollo.io", event: "Exported 250 enriched CTO/VP leads to Reply.io", time: "14 min ago", status: "success" },
    { id: 2, source: "LinkedHelper", event: "Auto-accepted 18 connection requests & sent Step 2 follow-ups", time: "32 min ago", status: "success" },
    { id: 3, source: "HubSpot", event: "Deal moved to 'Demo Scheduled' from Reply.io incoming webhook", time: "1 hour ago", status: "accent" },
    { id: 4, source: "Zoho Campaigns", event: "Candidate talent digest campaign sent to 1,240 engineers", time: "3 hours ago", status: "info" },
    { id: 5, source: "Madiff LinkedIn", event: "Post metrics logged: 'AI Engineering in 2026' (4.2k views, 84 likes)", time: "Yesterday", status: "neutral" },
];

export const pendingHubTasks = [
    { id: 1, title: "Review Apollo filter: FinTech Founders (Series A-B in EU)", platform: "Apollo.io", priority: "high", due: "Today" },
    { id: 2, title: "Approve 4-step sequence template in Reply.io for AI Outbound", platform: "Reply.io", priority: "high", due: "Today" },
    { id: 3, title: "Sync LinkedIn organic post stats for Week 38 (Madiff Page)", platform: "LinkedIn Madiff", priority: "medium", due: "Tomorrow" },
    { id: 4, title: "Verify Zoho Campaigns bounce list cleanup (14 emails)", platform: "Zoho", priority: "low", due: "In 2 days" },
];

export const campaignPerformance = [
    { name: "Mon", sent: 340, opened: 155, replied: 32 },
    { name: "Tue", sent: 480, opened: 210, replied: 46 },
    { name: "Wed", sent: 420, opened: 195, replied: 38 },
    { name: "Thu", sent: 590, opened: 280, replied: 55 },
    { name: "Fri", sent: 510, opened: 230, replied: 49 },
    { name: "Sat", sent: 190, opened: 75, replied: 14 },
    { name: "Sun", sent: 160, opened: 68, replied: 12 },
];

export const outreachBreakdown = [
    { name: "Reply.io Emails", value: 4120, color: "#84a98c" },
    { name: "LinkedHelper Invites", value: 1450, color: "#52796f" },
    { name: "Zoho Newsletters", value: 3890, color: "#cad2c5" },
    { name: "Inbound via LinkedIn Page", value: 320, color: "#354f52" },
];

export const crmLeadsData: LeadItem[] = [
    {
        id: "lead-1",
        name: "Viktor Lindgren",
        title: "Chief Technology Officer",
        company: "NordicFin Solutions",
        industry: "Financial Services / FinTech",
        location: "Stockholm, Sweden",
        headcount: "50-200",
        email: "viktor.lindgren@nordicfin.io",
        phone: "+46 8 123 4567",
        linkedinUrl: "https://linkedin.com/in/viktor-lindgren",
        stage: "Proposal Sent",
        channels: {
            apollo: { active: true, statusText: "Enriched", details: "Verified Work Email (>98%)", dateAdded: "Sep 18, 2026" },
            hubspot: { active: true, statusText: "Deal Active", details: "Proposal Sent ($64,000)", dateAdded: "Sep 20, 2026" },
            reply: { active: true, statusText: "Replied", details: "Step 2: Positive Reply received", dateAdded: "Sep 19, 2026" },
            linkedhelper: { active: true, statusText: "Connected", details: "Accepted invite & replied", dateAdded: "Sep 19, 2026" },
            zoho: { active: false, statusText: "Not Subscribed", details: "Candidate pool only" },
        },
        notes: [
            "Needs dedicated Python/Rust pod for real-time risk engine.",
            "Met via cold sequence step 2. Very technical CTO, prefers architecture doc before commercial agreement.",
        ],
        timeline: [
            { date: "Sep 18, 2026", channel: "Apollo.io", event: "Imported verified CTO contact from EU FinTech list" },
            { date: "Sep 19, 2026", channel: "Reply.io", event: "Enrolled in sequence 'EU FinTech CTOs Acceleration'" },
            { date: "Sep 20, 2026", channel: "LinkedHelper", event: "Connection request accepted on LinkedIn" },
            { date: "Sep 21, 2026", channel: "HubSpot", event: "Created Deal: $64k Proposal Sent" },
        ],
    },
    {
        id: "lead-2",
        name: "Sarah Montgomery",
        title: "VP of Engineering",
        company: "ScaleWave Cloud",
        industry: "Cloud Infrastructure & DevOps",
        location: "London, UK",
        headcount: "100-500",
        email: "s.montgomery@scalewave.co.uk",
        phone: "+44 20 7946 0912",
        linkedinUrl: "https://linkedin.com/in/sarah-montgomery",
        stage: "Meeting Booked",
        channels: {
            apollo: { active: true, statusText: "Enriched", details: "Verified direct phone + email", dateAdded: "Sep 15, 2026" },
            hubspot: { active: true, statusText: "Discovery Scheduled", details: "Call on Friday 14:00 GMT", dateAdded: "Sep 21, 2026" },
            reply: { active: true, statusText: "Replied", details: "Booked demo via Calendly link", dateAdded: "Sep 16, 2026" },
            linkedhelper: { active: false, statusText: "Pending Invite", details: "Not yet sent to safety limits" },
            zoho: { active: false, statusText: "Not Subscribed" },
        },
        notes: [
            "ScaleWave is migrating Kubernetes clusters across 3 regions.",
            "Interested in Madiff's DevOps & autonomous observability pods.",
        ],
        timeline: [
            { date: "Sep 15, 2026", channel: "Apollo.io", event: "Targeted through YC Alumni filter" },
            { date: "Sep 16, 2026", channel: "Reply.io", event: "Sent Step 1 Email: 'Engineering Velocity Pods'" },
            { date: "Sep 17, 2026", channel: "Reply.io", event: "Calendly demo link clicked and slot selected" },
            { date: "Sep 21, 2026", channel: "HubSpot", event: "Discovery Call Deal generated ($48,500)" },
        ],
    },
    {
        id: "lead-3",
        name: "Alexandre Moreau",
        title: "Head of Infrastructure & AI",
        company: "PayFlow Europe",
        industry: "Payments & Web3",
        location: "Paris, France",
        headcount: "20-50",
        email: "alexandre@payflow.eu",
        linkedinUrl: "https://linkedin.com/in/alexandre-moreau",
        stage: "In Conversation",
        channels: {
            apollo: { active: true, statusText: "Enriched", details: "Verified Work Email", dateAdded: "Sep 20, 2026" },
            hubspot: { active: false, statusText: "Not Synced", details: "Needs qualification review" },
            reply: { active: false, statusText: "Not Enrolled", details: "Ready for French translation sequence" },
            linkedhelper: { active: true, statusText: "Step 2 InMail", details: "Message delivered yesterday", dateAdded: "Sep 21, 2026" },
            zoho: { active: false, statusText: "Not Subscribed" },
        },
        notes: [
            "Spoke on LinkedIn about high-throughput settlement systems.",
        ],
        timeline: [
            { date: "Sep 20, 2026", channel: "Apollo.io", event: "Sourced through Paris tech cluster search" },
            { date: "Sep 21, 2026", channel: "LinkedHelper", event: "LinkedIn InMail outreach triggered" },
        ],
    },
    {
        id: "lead-4",
        name: "Elena Vlasova",
        title: "Engineering Director",
        company: "DataVibe AI",
        industry: "Big Data & Machine Learning",
        location: "Berlin, Germany",
        headcount: "50-100",
        email: "elena@datavibe.de",
        linkedinUrl: "https://linkedin.com/in/elena-vlasova",
        stage: "New Sourced",
        channels: {
            apollo: { active: true, statusText: "Sourced", details: "Verified corporate email", dateAdded: "Sep 22, 2026" },
            hubspot: { active: false, statusText: "Not Synced" },
            reply: { active: false, statusText: "Not Enrolled" },
            linkedhelper: { active: false, statusText: "Not Connected" },
            zoho: { active: true, statusText: "Subscribed", details: "Talent digest #24 reader", dateAdded: "Sep 10, 2026" },
        },
        notes: [
            "Reads Madiff candidate newsletters, potential client transition.",
        ],
        timeline: [
            { date: "Sep 10, 2026", channel: "Zoho Campaigns", event: "Subscribed to Madiff Tech Talent newsletter" },
            { date: "Sep 22, 2026", channel: "Apollo.io", event: "Enriched title and confirmed current role at DataVibe" },
        ],
    },
    {
        id: "lead-5",
        name: "David Chen",
        title: "Founder & CTO",
        company: "HyperScale Logic",
        industry: "Enterprise AI & Agents",
        location: "Amsterdam, Netherlands",
        headcount: "10-50",
        email: "david@hyperscale.ai",
        linkedinUrl: "https://linkedin.com/in/david-chen",
        stage: "New Sourced",
        channels: {
            apollo: { active: true, statusText: "Sourced", details: "Freshly sourced from Apollo", dateAdded: "Today" },
            hubspot: { active: false, statusText: "Not Synced" },
            reply: { active: false, statusText: "Not Enrolled" },
            linkedhelper: { active: false, statusText: "Not Connected" },
            zoho: { active: false, statusText: "Not Subscribed" },
        },
        notes: [
            "Building multi-agent orchestrator. Excellent match for Madiff LLM pod.",
        ],
        timeline: [
            { date: "Today", channel: "Apollo.io", event: "Imported via ICP Search 'AI Founders Series A'" },
        ],
    },
];

export const aiCommunitiesList = [
    {
        id: "comm-1",
        name: "AI Engineers & Founders Club",
        platform: "Slack",
        iconType: "slack",
        members: "14,500+",
        focus: "LLM Orchestration, Agentic Workflows & Enterprise AI",
        ourRole: "Active Contributor / Sponsor",
        engagementLevel: "High (Daily)",
        url: "https://slack.com",
        recentTopic: "Benchmarking autonomous coding agents vs senior teams",
        keyContacts: "Mark Z. (Community Lead), Sophia T.",
    },
    {
        id: "comm-2",
        name: "MLOps World & GenAI Hub",
        platform: "Discord",
        iconType: "discord",
        members: "28,200+",
        focus: "Infrastructure, GPU Clusters, Fine-tuning & Production Deployment",
        ourRole: "Technical Member",
        engagementLevel: "Medium (Weekly)",
        url: "https://discord.com",
        recentTopic: "Zero-downtime model hot-swapping in EU fintech",
        keyContacts: "Alex R., Dmitri K.",
    },
    {
        id: "comm-3",
        name: "European Tech Founders & CTOs Network",
        platform: "LinkedIn Group",
        iconType: "linkedin",
        members: "8,900+",
        focus: "Tech Leadership, Distributed Engineering & Scaling",
        ourRole: "Thought Leader / Moderator",
        engagementLevel: "High (Bi-weekly posts)",
        url: "https://linkedin.com",
        recentTopic: "Why specialized pods beat monolithic dev shops",
        keyContacts: "Lars M., Anton D.",
    },
    {
        id: "comm-4",
        name: "Enterprise Generative AI Practitioners",
        platform: "Facebook Group",
        iconType: "facebook",
        members: "12,100+",
        focus: "B2B Implementations, ROI & Architecture case studies",
        ourRole: "Member",
        engagementLevel: "Low (Monitoring)",
        url: "https://facebook.com",
        recentTopic: "Security audit compliance for private LLM deployments",
        keyContacts: "Rachel B.",
    },
];