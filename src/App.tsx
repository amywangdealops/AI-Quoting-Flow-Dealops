import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Database,
  History,
  Zap,
  FileText,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Plus,
  LayoutGrid,
  FileBox,
  Users,
  Settings,
  HelpCircle,
  Menu,
  ChevronDown,
  Trash2,
  Lock,
  Monitor,
  Check,
  Sparkles,
  Copy
} from 'lucide-react';
import { Button } from './components/Button';
import Badge from './components/Badge';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Tooltip from './components/Tooltip';
import Toggle from './components/Toggle';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

const toSentenceCase = (value: string) =>
  value.length > 0 ? value.charAt(0) + value.slice(1).toLowerCase() : value;

const LOGO_SALESFORCE = '/salesforce.png';
const LOGO_GONG = '/gong.png';

// --- Types ---

type StepId = 'context' | 'similar' | 'historical' | 'recommend' | 'quote';

interface Step {
  id: StepId;
  label: string;
  status: 'pending' | 'loading' | 'complete';
  details?: React.ReactNode;
  logos?: string[];
}

// --- Mock Data ---

const OPPORTUNITY_DATA = {
  name: 'Al Mabrook - ABI',
  type: 'New Customer',
  owner: 'yijun@dealops.com',
  stage: 'Discovery',
  segment: 'SMB',
  region: 'USA',
  acv: '24,000',
  vertical: 'Fintech',
  subvertical: 'Alternative investments',
  employees: 9
};

const OPPORTUNITY_OVERVIEW_ROWS: { key: keyof typeof OPPORTUNITY_DATA; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'owner', label: 'Owner' },
  { key: 'stage', label: 'Stage' },
  { key: 'segment', label: 'GTM Segment' },
  { key: 'region', label: 'Product Region' },
  { key: 'acv', label: 'Qualified ACV' },
  { key: 'vertical', label: 'Vertical' },
  { key: 'subvertical', label: 'Subvertical' },
  { key: 'employees', label: 'Employee Count' },
];

const BENCHMARK_HISTORICAL_ROWS: {
  label: string;
  vol: string;
  price: string;
}[] = [
  { label: 'Platform Support Services - Basic', vol: '1 vol', price: '$2000.0000' },
  { label: 'Auth', vol: '2,167 vol', price: '$1.3800' },
  { label: 'Balance', vol: '2,167 vol', price: '$0.0920' },
  { label: 'Identity', vol: '2,167 vol', price: '$1.3800' },
];

type RecConfidence = 'HIGH' | 'MEDIUM';

const RECOMMENDED_PRODUCT_BY_LABEL: Record<
  string,
  { confidence: RecConfidence; price: string; units: string; detail: string }
> = {
  Auth: {
    confidence: 'HIGH',
    price: '$0.6700',
    units: '833 units',
    detail: 'Bundled rate on 10/15 and 10/08 calls; bank account verification required.',
  },
  Identity: {
    confidence: 'HIGH',
    price: '$0.6700',
    units: '833 units',
    detail: 'Same bundle; account-holder matching required.',
  },
  Balance: {
    confidence: 'MEDIUM',
    price: '$0.0800',
    units: '833 units',
    detail: 'Inferred from peer benchmarks and account-linking discussion.',
  },
};

interface Quote {
  id: string | number;
  title: string;
  updated: string;
  status: string;
  confidence: string;
  evidence: string;
  benchmark: string;
  strategy: string;
}

const INITIAL_QUOTES: Quote[] = [
  {
    id: 1,
    title: 'AI Quote - Al Mabrook - ABI',
    updated: 'Updated 23 minutes ago',
    status: 'Draft',
    confidence: 'HIGH',
    evidence: '[10/15/2025 Call]: Agreed to a $1,000/month platform fee and a discounted unit rate of $2 per account for Auth, Identity, and Balance. Initial volume projection of 750 accounts/month for Q1/Q2.',
    benchmark: 'Binaxity Holdings Inc. ($54K): Auth, Identity, Balance, and Platform Support Services were included.',
    strategy: 'Applied 0.6 pre-commitment factor: $2,000/month Qualified ACV...'
  },
  {
    id: 2,
    title: 'AI Quote - Al Mabrook - ABI',
    updated: 'Updated 13 minutes ago',
    status: 'Draft',
    confidence: 'HIGH',
    evidence: '[10/15/2025 Call]: Customer agreed to a $1,000/month platform fee and a $2/account bundled rate...',
    benchmark: 'Binaxity Holdings Inc. ($54K)',
    strategy: 'Applied 0.6 pre-commitment factor...'
  }
];

// --- Components ---

const Sidebar = () => (
  <div className="w-16 border-r border-ew-border bg-ew-background flex flex-col items-center py-6 gap-8 shrink-0">
    <div className="w-8 h-8 bg-ew-primary rounded-lg flex items-center justify-center shadow-md">
      <div className="w-4 h-4 border-2 border-ew-background transform rotate-45" />
    </div>
    <div className="flex flex-col gap-6 text-ew-muted-foreground/60">
      <LayoutGrid className="w-5 h-5 cursor-pointer hover:text-ew-foreground transition-colors" />
      <Users className="w-5 h-5 cursor-pointer hover:text-ew-foreground transition-colors" />
      <FileBox className="w-5 h-5 text-ew-foreground cursor-pointer" />
      <Monitor className="w-5 h-5 cursor-pointer hover:text-ew-foreground transition-colors" />
    </div>
    <div className="mt-auto flex flex-col gap-6 text-ew-muted-foreground/60">
      <Settings className="w-5 h-5 cursor-pointer hover:text-ew-foreground transition-colors" />
      <HelpCircle className="w-5 h-5 cursor-pointer hover:text-ew-foreground transition-colors" />
    </div>
  </div>
);

const IntelCard = ({
  title,
  icon: Icon,
  children,
  isComplete,
  subtitle,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isComplete: boolean;
  subtitle?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="intel-card"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between border-b border-ew-border/30 px-4 py-3 text-left transition-colors hover:bg-black/[0.02]',
          isComplete ? 'bg-ew-muted/20' : 'bg-brand-accent-gold/5',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500',
              isComplete
                ? 'bg-ew-foreground/5 text-ew-foreground'
                : 'bg-brand-accent-gold/10 text-brand-accent-gold animate-pulse',
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold leading-snug tracking-tight text-ew-foreground">
                {title}
              </span>
              {subtitle && (
                <span className="text-xs text-ew-muted-foreground">{subtitle}</span>
              )}
            </div>
            {!isComplete && (
              <span className="mt-0.5 block text-xs font-medium tracking-tight text-ew-muted-foreground">
                Processing…
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-2">
          <ChevronDown
            className={cn(
              'h-4 w-4 text-ew-muted-foreground transition-transform duration-200',
              open ? 'rotate-0' : '-rotate-90',
            )}
            aria-hidden
          />
          {isComplete && <CheckCircle2 className="h-4 w-4 shrink-0 text-ew-primary" />}
        </div>
      </button>
      {open && <div className="bg-white p-3.5">{children}</div>}
    </motion.div>
  );
};

const COPILOT_ACTIVITY_MESSAGES = [
  'Fetching opportunity context... Fintech | $24K',
  'Found 3 similar accounts (28.7s)',
  'Analyzing 2 historical deals with 13 products',
  'Generating recommendations for 4 products...',
] as const;

const ActivityFeedLine = ({
  text,
  isComplete,
  isActive,
}: {
  text: string;
  isComplete: boolean;
  isActive: boolean;
}) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (isComplete) {
      setDisplayed(text);
      return;
    }
    if (!isActive) {
      setDisplayed('');
      return;
    }
    setDisplayed('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
      }
    }, 14);
    return () => window.clearInterval(id);
  }, [text, isComplete, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-2.5"
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
        {isComplete ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} />
        ) : isActive ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-ew-primary" />
        ) : null}
      </span>
      <span
        className={cn(
          'min-w-0 flex-1 text-[11px] leading-snug tracking-tight md:text-xs',
          isComplete && 'text-ew-muted-foreground',
          isActive && 'font-semibold text-ew-foreground',
        )}
      >
        {displayed}
      </span>
    </motion.div>
  );
};

const CopilotActivityFeed = ({ processStep }: { processStep: number }) => {
  if (processStep < 0 || processStep >= 5) return null;

  const collapsed = processStep >= 4;
  const visibleCount = Math.min(processStep + 1, COPILOT_ACTIVITY_MESSAGES.length);

  return (
    <div className="shrink-0 border-b border-ew-border bg-gradient-to-b from-ew-muted/25 to-white/90">
      <AnimatePresence mode="wait">
        {collapsed ? (
          <motion.div
            key="summary"
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 py-2.5 md:px-6"
          >
            <div className="mx-auto flex w-full max-w-full items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
              <span className="text-xs font-semibold leading-snug tracking-tight text-ew-foreground">
                4 products recommended · HIGH confidence · 1 similar account found
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-2 md:px-6"
          >
            <div className="mx-auto flex w-full max-w-full flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ew-muted-foreground/75">
                Live activity
              </span>
              <div className="flex max-h-[7rem] flex-col gap-2 overflow-y-auto overscroll-contain pr-0.5">
                {COPILOT_ACTIVITY_MESSAGES.slice(0, visibleCount).map((msg, i) => (
                  <React.Fragment key={i}>
                    <ActivityFeedLine
                      text={msg}
                      isComplete={i < processStep}
                      isActive={i === processStep}
                    />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface QuoteCardProps {
  quote: Quote;
  onClick?: () => void;
  key?: React.Key;
}

const QuoteCard = ({ quote, onClick }: QuoteCardProps) => (
  <div 
    onClick={onClick}
    className="group mb-4 cursor-pointer rounded-2xl border border-ew-border/50 bg-white p-6 transition-colors hover:border-brand-accent-gold/50">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border border-ew-border rounded flex items-center justify-center shrink-0">
          <div className="w-2.5 h-2.5 bg-ew-primary rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ew-foreground">{quote.title}</h3>
            <span className="text-xs text-ew-muted-foreground italic tracking-tight">{quote.updated}</span>
          </div>
          <Badge color="gray" className="mt-1">{quote.status}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="p-2 hover:bg-ew-muted rounded-lg transition-colors">
          <Monitor className="w-4 h-4 text-ew-muted-foreground" />
        </div>
        <div className="p-2 hover:bg-ew-muted rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-ew-muted-foreground" />
        </div>
        <ChevronRight className="w-4 h-4 text-ew-muted-foreground" />
      </div>
    </div>
    
    <div className="space-y-3 text-sm">
      <div className="flex items-baseline gap-2">
        <span className="min-w-[140px] whitespace-nowrap text-sm font-bold tracking-tight text-ew-muted-foreground">AI generated quote</span>
        <span className="text-ew-muted-foreground text-xs">Confidence</span>
        <Badge color="green">{toSentenceCase(quote.confidence)}</Badge>
      </div>
      <p className="text-ew-muted-foreground leading-relaxed text-xs"><span className="mr-1 text-xs font-bold tracking-tight text-ew-foreground">Evidence •</span>{quote.evidence}</p>
      <p className="text-ew-muted-foreground leading-relaxed text-xs"><span className="mr-1 text-xs font-bold tracking-tight text-ew-foreground">Benchmark •</span>{quote.benchmark}</p>
      <p className="text-ew-muted-foreground leading-relaxed text-xs"><span className="mr-1 text-xs font-bold tracking-tight text-ew-foreground">Strategy •</span>{quote.strategy}</p>
    </div>
  </div>
);

// --- Types & Constants ---

interface Product {
  id: string;
  name: string;
  desc: string;
}

interface Category {
  name: string;
  products: Product[];
}

const PRODUCT_CATALOG: Category[] = [
  {
    name: "Payments",
    products: [
      { id: "identity", name: "Identity", desc: "Per successful Identity Request" },
      { id: "auth", name: "Auth", desc: "Per successful Auth request" },
      { id: "transfer-same-day", name: "Transfer (Same-day ACH) - Vanilla Originators - Fixed", desc: "Per transfer with status = posted (Same-day ACH)" },
      { id: "transfer-standard", name: "Transfer (Standard ACH) - Vanilla Originators - Fixed", desc: "Per transfer with status = posted (Standard ACH)" },
      { id: "transfer-standard-high", name: "Transfer (Standard ACH) - High Risk Customers - Fixed", desc: "Per transfer with status = \"posted\" (standard ACH)" },
      { id: "transfer-same-day-high", name: "Transfer (Same-day ACH) - High Risk Customers - Fixed", desc: "Per transfer with status = \"posted\" (Same-day ACH)" },
      { id: "transfer-instant", name: "Transfer (Instant Payouts) - Fixed", desc: "Per transfer with status = \"posted\" (RTP)" },
      { id: "auth-identity", name: "Auth & Identity", desc: "Per successful merged request" },
      { id: "balance", name: "Balance", desc: "Per successful Balance request" },
    ]
  },
  {
    name: "Financial Management",
    products: [
      { id: "enrich", name: "Enrich", desc: "Per Number of '000 Enriched Transactions / month" },
      { id: "investments", name: "Investments Transactions and Holdings", desc: "Per Connected Account per Month" },
      { id: "transactions", name: "Transactions", desc: "Per Connected Account per month" },
    ]
  },
  {
    name: "PFM",
    products: [
      { id: "recurring", name: "Recurring Transactions", desc: "Per Connected Account per month" },
      { id: "refresh", name: "Transactions Refresh", desc: "Per Call" },
      { id: "holdings", name: "Investment Holdings", desc: "Per Connected Account per Month" },
    ]
  },
  {
    name: "Mortgage Lending",
    products: [
      { id: "impl-4", name: "Implementation Services (Custom) - 4 months", desc: "Implementation Services - Launch Package" },
      { id: "impl-3", name: "Implementation Services (Standard) - 3 months", desc: "Implementation Services - Launch Package" },
      { id: "income-auto", name: "Income: Payroll (Auto Lending)", desc: "Per successful verification" },
      { id: "income-personal", name: "Income: Payroll (Personal Lending)", desc: "Per successful verification" },
      { id: "hosted-link-text", name: "Hosted Link - Delivery (Text)", desc: "Per delivered text" },
      { id: "income-mortgage", name: "Income: Payroll (Mortgage Lending)", desc: "Per successful verification" },
      { id: "impl-5", name: "Implementation Services (Custom) - 5 months", desc: "Implementation Services - Launch Package" },
      { id: "income-parsing", name: "Document Income: Parsing (ex-Bank Statements)", desc: "Per Document" },
      { id: "platform-basic", name: "Platform Support Services - Basic", desc: "Monthly flat fee" },
      { id: "income-fintech", name: "Income: Payroll (Fintech and Small Dollar Lending)", desc: "Per successful verification" },
      { id: "platform-premium", name: "Platform Support Services - Premium", desc: "Monthly flat fee" },
      { id: "liabilities", name: "Liabilities", desc: "Per Connected Account per month" },
      { id: "hosted-link-email", name: "Hosted Link - Delivery (Email)", desc: "Per delivered email" },
      { id: "income-screening", name: "Income: Payroll (Employment Screening)", desc: "Per successful verification" },
      { id: "assets-5", name: "Assets-5", desc: "Per five (5) Accounts in each Asset Report" },
      { id: "income-fraud", name: "Document Income: Fraud", desc: "Per Document" },
      { id: "impl-6", name: "Implementation Services (Custom) - 6 months", desc: "Implementation Services - Launch Package" },
      { id: "platform-plus", name: "Platform Support Services - Plus", desc: "Monthly flat fee" },
      { id: "income-tenant", name: "Income: Payroll (Tenant Screening)", desc: "Per successful verification" },
    ]
  }
];

// --- Select Products View Component ---

const SelectProductsView = ({ 
  selectedIds, 
  onToggle, 
  onNext, 
  onBack,
  quoteName
}: { 
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  quoteName: string;
}) => {
  return (
    <div className="flex h-screen w-full bg-white text-ew-foreground font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-ew-border bg-white px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight text-ew-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>Opportunities</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span>Al Mabrook - ABI</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-ew-foreground">{quoteName}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-4 mr-4 text-xs font-bold text-ew-muted-foreground tracking-tight">
                <Badge color="gray">Draft</Badge>
             </div>
            <Button color="white" icon="info" label="Info" onClick={() => {}} />
            <Button color="white" onClick={() => {}}>
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </Button>
          </div>
        </header>

        {/* Wizard Progress */}
        <div className="bg-white border-b border-ew-border px-8 py-3 flex items-center gap-4 text-xs font-bold tracking-tight">
           <span className="text-ew-muted-foreground cursor-pointer hover:text-ew-primary" onClick={onBack}>Quote Configuration</span>
           <ChevronRight className="w-3 h-3 text-ew-muted-foreground opacity-30" />
           <span className="text-ew-foreground border-b-2 border-ew-primary pb-0.5">Select Products</span>
           <ChevronRight className="w-3 h-3 text-ew-muted-foreground opacity-30" />
           <span className="text-ew-muted-foreground cursor-pointer hover:text-ew-primary" onClick={onNext}>Pricing Options</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-12 bg-[#fcfcfd] custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ew-foreground mb-2">Select Products</h1>
              <p className="text-sm text-ew-muted-foreground font-medium">Select the products for your quote</p>
            </div>

            {PRODUCT_CATALOG.map((cat) => (
              <div key={cat.name} className="space-y-6">
                <h3 className="text-xs font-black tracking-tight text-ew-muted-foreground/60">{cat.name}</h3>
                <div className="grid grid-cols-3 gap-4">
                  {cat.products.map((prod) => (
                    <div 
                      key={prod.id} 
                      onClick={() => onToggle(prod.id)}
                      className={cn(
                        "p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 group",
                        selectedIds.has(prod.id) 
                          ? "bg-white border-ew-primary shadow-sm" 
                          : "bg-white border-ew-border hover:border-ew-primary/30"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                        selectedIds.has(prod.id) ? "bg-ew-primary border-ew-primary" : "bg-white border-ew-border group-hover:border-ew-primary/50"
                      )}>
                        {selectedIds.has(prod.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-xs font-bold transition-colors", selectedIds.has(prod.id) ? "text-ew-foreground" : "text-ew-muted-foreground group-hover:text-ew-foreground")}>
                          {prod.name}
                        </p>
                        <p className="text-xs text-ew-muted-foreground leading-snug font-medium opacity-60">
                          {prod.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="h-20 bg-white border-t border-ew-border flex items-center justify-end px-12 shrink-0">
          <Button color="primary" label="Next" onClick={onNext} />
        </footer>
      </div>
    </div>
  );
};


// --- Quote Detail View Component ---

const EST_MONTHLY_USAGE_REV = 1674.33;
const USAGE_MIN_PERCENT_DEFAULT = 67;

const QuoteDetailView = ({ onBack, onSelectProducts, onFinish, quoteName }: { onBack: () => void, onSelectProducts: () => void, onFinish: () => void, quoteName: string }) => {
  const suggestedUsageMinimum =
    Math.round(((EST_MONTHLY_USAGE_REV * USAGE_MIN_PERCENT_DEFAULT) / 100) * 100) / 100;
  const [usageMinimum, setUsageMinimum] = useState(true);
  const [quoteMinimumInput, setQuoteMinimumInput] = useState(() => suggestedUsageMinimum.toFixed(2));
  const [isRecapExpanded, setIsRecapExpanded] = useState(true);

  const [quoteTerms, setQuoteTerms] = useState({
    startDate: '2026-04-26',
    endDate: '2028-04-30',
    billingFrequency: 'semi-annual',
    paymentTerms: 'net-30',
    subscriptionMonths: '12',
    offerExpiration: '2026-05-26',
    autoRenew: 'yes',
    waivedOverages: 'none',
  });

  const chartData = [
    { name: 'No Commitment', total: 54988, color: '#006644' },
    { name: 'With Commitment', total: 32092, savings: 22896, color: '#006644' },
  ];

  const pricingRows: {
    id: string;
    name: string;
    vol: string;
    list: string;
    l1: string;
    quote: string;
    discount: string;
    revenue: string;
    reasoning: string;
    priceReasoning: string;
    tiered?: boolean;
  }[] = [
    {
      id: 'auth',
      name: 'Auth',
      vol: '833 / mo',
      list: '$1.500',
      l1: '$1.200',
      quote: '$0.967',
      discount: '35.49%',
      revenue: '$725.78',
      reasoning:
        'Explicitly mentioned as a core product for bank account verification in Call 4 (10/15) and Call 6 (10/08).',
      priceReasoning:
        'Part of a $2/account bundled rate for Auth, Identity, and Balance (Call 4, 10/15). Price split proportionally using ratios from Binaxity deal (Auth: $1.38, Balance: $0.092, Identity: $1.38).',
      tiered: true,
    },
    {
      id: 'identity',
      name: 'Identity',
      vol: '833 / mo',
      list: '$1.500',
      l1: '$1.200',
      quote: '$0.967',
      discount: '35.49%',
      revenue: '$725.78',
      reasoning:
        'Explicitly mentioned for matching account holder to user in Call 6 (10/08) and as a core product in Call 4 (10/15).',
      priceReasoning:
        'Part of a $2/account bundled rate for Auth, Identity, and Balance (Call 4, 10/15). Price split proportionally using ratios from Binaxity deal (Auth: $1.38, Balance: $0.092, Identity: $1.38).',
      tiered: true,
    },
    {
      id: 'balance',
      name: 'Balance',
      vol: '833 / mo',
      list: '$0.100',
      l1: '$0.080',
      quote: '$0.064',
      discount: '35.50%',
      revenue: '$48.38',
      reasoning: 'Unified provider for Balance (checking) for bank account linking as discussed in Call 6 (10/08).',
      priceReasoning:
        'Part of a $2/account bundled rate for Auth, Identity, and Balance (Call 4, 10/15). Price split proportionally using ratios from Binaxity deal (Auth: $1.38, Balance: $0.092, Identity: $1.38).',
    },
    {
      id: 'platform',
      name: 'Platform Support Services - Basic',
      vol: '1 / mo',
      list: '$2,000.000',
      l1: '$1,600.000',
      quote: '$1,000.000',
      discount: '50.00%',
      revenue: '$1,000.00',
      reasoning: 'Customer agreed to a fixed platform fee of $1,000 per month in Call 4 (10/15).',
      priceReasoning: 'Customer-agreed price of $1,000 per month from Call 4 (10/15).',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-ew-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-ew-border bg-white px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight text-ew-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>Opportunities</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span>Al Mabrook - ABI</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-ew-foreground">{quoteName}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-4 mr-4 text-xs font-bold text-ew-muted-foreground tracking-tight">
                <Badge color="gray">Draft</Badge>
             </div>
            <Button color="white" icon="info" label="Info" onClick={() => {}} />
            <Button color="white" onClick={() => {}}>
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </Button>
          </div>
        </header>

        {/* Wizard Progress */}
        <div className="bg-white border-b border-ew-border px-8 py-3 flex items-center gap-4 text-xs font-bold tracking-tight">
           <span className="text-ew-muted-foreground cursor-pointer hover:text-ew-primary" onClick={onBack}>Quote Configuration</span>
           <ChevronRight className="w-3 h-3 text-ew-muted-foreground opacity-30" />
           <span className="text-ew-muted-foreground cursor-pointer hover:text-ew-primary" onClick={onSelectProducts}>Select Products</span>
           <ChevronRight className="w-3 h-3 text-ew-muted-foreground opacity-30" />
           <span className="text-ew-foreground border-b-2 border-ew-primary pb-0.5">Pricing Options</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#f8f9fa] custom-scrollbar">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* AI Intelligence Recap Header */}
            <div className="bg-white border border-[#b2a593] rounded-[32px] overflow-hidden shadow-[0_2px_20px_rgba(150,142,132,0.12)]">
               {/* Header strip */}
               <button
                 onClick={() => setIsRecapExpanded(v => !v)}
                 className="w-full px-10 py-6 border-b border-[#968e84]/30 flex items-center justify-between bg-white hover:bg-ew-muted/20 transition-colors text-left"
               >
                 <div className="flex items-center gap-3">
                   <Sparkles className="w-4 h-4 text-black" />
                   <span className="text-xs font-black tracking-tight text-black">Quote Intelligence Recap</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="text-xs font-black text-ew-muted-foreground/50 tracking-tight">Confidence</span>
                   <Badge color="darkGreen">High</Badge>
                   <ChevronDown className={cn("w-4 h-4 text-ew-muted-foreground transition-transform duration-300", isRecapExpanded ? "rotate-0" : "-rotate-90")} />
                 </div>
               </button>

               <div className={cn("overflow-hidden transition-all duration-300", isRecapExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
               <div className="relative grid grid-cols-3 gap-12 p-10">
                  {/* Visual Divider Lines */}
                  <div className="absolute top-10 bottom-10 left-1/3 w-px bg-ew-border/30" />
                  <div className="absolute top-10 bottom-10 left-2/3 w-px bg-ew-border/30" />

                  {/* Column 1: Evidence */}
                  <div className="min-w-0 space-y-4">
                    <h4 className="mb-1 text-xs font-black tracking-tight text-ew-muted-foreground">
                      Evidence
                    </h4>
                    <ul className="list-none space-y-3">
                      {[
                        '[10/15/2025 Call]: Agreed to a $1,000/month platform fee and a discounted unit rate of $2 per account for Auth, Identity, and Balance.',
                        '[10/15/2025 Call]: Initial volume projection of 750 accounts/month for Q1/Q2.',
                        '[10/08/2025 Call]: Customer confirmed need for Auth, Identity, and Balance for bank account linking.',
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="relative pl-3 text-xs leading-relaxed text-ew-muted-foreground/90 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-ew-border"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: Benchmark */}
                  <div className="min-w-0 space-y-4">
                    <h4 className="mb-1 text-xs font-black tracking-tight text-ew-muted-foreground">
                      Benchmark
                    </h4>
                    <p className="text-xs leading-relaxed text-ew-muted-foreground/90">
                      Binaxity Holdings Inc. ($54K): Auth, Identity, Balance, and Platform Support Services were included,
                      providing a general pricing structure.
                    </p>
                  </div>

                  {/* Column 3: Strategy */}
                  <div className="min-w-0 space-y-4">
                    <h4 className="mb-1 text-xs font-black tracking-tight text-ew-muted-foreground">
                      Strategy
                    </h4>
                    <p className="text-xs leading-relaxed text-ew-muted-foreground/90">
                      Applied 0.6 pre-commitment factor: $2,000/month Qualified ACV - $1,000/month platform fee =
                      $1,000/month usage commitment. Usage products quoted at $1,000 / 0.6 = $1,666.67/month total,
                      distributed across Auth, Identity, and Balance at a $2/account bundled rate.
                    </p>
                  </div>
               </div>
               </div>{/* end collapsible */}
            </div>

            {/* Commercial terms — all editable (white fields) */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold tracking-tight text-ew-muted-foreground">Commercial terms</h3>
              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label htmlFor="qt-start" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Start date
                  </label>
                  <input
                    id="qt-start"
                    type="date"
                    value={quoteTerms.startDate}
                    onChange={(e) => setQuoteTerms((t) => ({ ...t, startDate: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-ew-border bg-white px-4 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-end" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    End date
                  </label>
                  <input
                    id="qt-end"
                    type="date"
                    value={quoteTerms.endDate}
                    onChange={(e) => setQuoteTerms((t) => ({ ...t, endDate: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-ew-border bg-white px-4 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-billing" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Billing frequency
                  </label>
                  <div className="relative">
                    <select
                      id="qt-billing"
                      value={quoteTerms.billingFrequency}
                      onChange={(e) => setQuoteTerms((t) => ({ ...t, billingFrequency: e.target.value }))}
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-ew-border bg-white py-2 pl-4 pr-10 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="semi-annual">Semi-annually</option>
                      <option value="annual">Annually</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ew-muted-foreground opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-pay" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Payment terms
                  </label>
                  <div className="relative">
                    <select
                      id="qt-pay"
                      value={quoteTerms.paymentTerms}
                      onChange={(e) => setQuoteTerms((t) => ({ ...t, paymentTerms: e.target.value }))}
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-ew-border bg-white py-2 pl-4 pr-10 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                    >
                      <option value="net-15">Net 15</option>
                      <option value="net-30">Net 30</option>
                      <option value="net-45">Net 45</option>
                      <option value="net-60">Net 60</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ew-muted-foreground opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-sub" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Subscription length
                  </label>
                  <div className="flex h-11 overflow-hidden rounded-xl border border-ew-border bg-white shadow-sm focus-within:border-ew-primary focus-within:ring-2 focus-within:ring-ew-primary/15">
                    <input
                      id="qt-sub"
                      type="number"
                      min={1}
                      max={120}
                      value={quoteTerms.subscriptionMonths}
                      onChange={(e) => setQuoteTerms((t) => ({ ...t, subscriptionMonths: e.target.value }))}
                      className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm font-semibold text-ew-foreground outline-none"
                    />
                    <span className="flex shrink-0 items-center border-l border-ew-border bg-white px-3 text-xs font-medium text-ew-muted-foreground">
                      Months
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-offer" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Offer expiration
                  </label>
                  <input
                    id="qt-offer"
                    type="date"
                    value={quoteTerms.offerExpiration}
                    onChange={(e) => setQuoteTerms((t) => ({ ...t, offerExpiration: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-ew-border bg-white px-4 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-auto" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Auto renew
                  </label>
                  <div className="relative">
                    <select
                      id="qt-auto"
                      value={quoteTerms.autoRenew}
                      onChange={(e) => setQuoteTerms((t) => ({ ...t, autoRenew: e.target.value }))}
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-ew-border bg-white py-2 pl-4 pr-10 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ew-muted-foreground opacity-60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="qt-waived" className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                    Waived overages
                  </label>
                  <div className="relative">
                    <select
                      id="qt-waived"
                      value={quoteTerms.waivedOverages}
                      onChange={(e) => setQuoteTerms((t) => ({ ...t, waivedOverages: e.target.value }))}
                      className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-ew-border bg-white py-2 pl-4 pr-10 text-sm font-semibold text-ew-foreground shadow-sm outline-none transition-colors focus-visible:border-ew-primary focus-visible:ring-2 focus-visible:ring-ew-primary/15"
                    >
                      <option value="none">None</option>
                      <option value="first-month">First month</option>
                      <option value="q1">Q1 only</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ew-muted-foreground opacity-60" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-white border border-ew-border rounded-2xl overflow-hidden shadow-sm">
               <div className="grid grid-cols-[minmax(140px,1fr)_120px_100px_100px_152px_100px_100px_140px_40px] gap-4 items-center border-b border-ew-border bg-ew-muted/20 p-4 text-xs font-black tracking-tight text-ew-muted-foreground">
                  <span>Products</span>
                  <span className="text-center">Volume</span>
                  <span className="text-right">List Price</span>
                  <span className="text-right">L1 Price</span>
                  <span className="text-center">Quote Price</span>
                  <span className="text-center">Discount</span>
                  <span className="text-center">Approval</span>
                  <span className="text-right">Est. Monthly Revenue</span>
                  <span />
               </div>
               <div className="divide-y divide-ew-border/50">
                  {pricingRows.map((row, i) => (
                    <div key={i} className="group grid grid-cols-[minmax(140px,1fr)_120px_100px_100px_152px_100px_100px_140px_40px] gap-4 items-center p-4 transition-colors hover:bg-ew-background/50">
                       <Tooltip as="div" location="TOP" text={row.reasoning} className="min-w-0 cursor-default">
                          <div className="text-xs font-bold text-ew-foreground">{row.name}</div>
                       </Tooltip>
                       <div className="flex h-9 items-center justify-center rounded-lg border border-ew-border bg-ew-background/30 text-xs font-bold">
                          {row.vol}
                       </div>
                       <div className="text-right text-xs font-bold text-green-600">{row.list}</div>
                       <div className="text-right text-xs font-bold text-brand-accent-gold">{row.l1}</div>
                       {row.tiered ? (
                         <div className="flex h-9 items-stretch justify-end gap-1.5">
                           <Tooltip
                             as="span"
                             className="flex min-w-0 flex-1 cursor-default"
                             location="TOP"
                             text={row.priceReasoning}
                           >
                             <button
                               type="button"
                               className="flex h-full w-full min-w-0 items-center justify-end rounded-lg border border-ew-border bg-white px-2 py-1.5 text-xs font-semibold text-ew-muted-foreground shadow-sm ring-2 ring-brand-accent-gold/10 hover:bg-ew-background/60"
                             >
                               Tiered
                             </button>
                           </Tooltip>
                           <button
                             type="button"
                             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ew-border bg-white text-ew-muted-foreground shadow-sm hover:bg-ew-background/80"
                             aria-label="Tier settings"
                           >
                             <Settings className="h-3.5 w-3.5" />
                           </button>
                         </div>
                       ) : (
                         <Tooltip
                           as="div"
                           location="TOP"
                           text={row.priceReasoning}
                           className="flex h-9 cursor-default items-center justify-center rounded-lg border border-ew-border bg-white text-xs font-bold ring-2 ring-brand-accent-gold/10"
                         >
                            {row.quote}
                         </Tooltip>
                       )}
                       <div className="text-center text-xs font-bold text-ew-muted-foreground opacity-60">{row.discount}</div>
                       <div className="flex justify-center">
                          <Badge color="green" size="small">None</Badge>
                       </div>
                       <div className="text-right text-xs font-bold text-ew-foreground">{row.revenue}</div>
                       <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                          <Trash2 className="h-4 w-4 cursor-pointer text-red-400 hover:text-red-500" />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-ew-background/40 border-t border-ew-border">
                  <Button color="white" icon="plus" label="Add / Edit Products" onClick={() => {}} />
               </div>
            </div>

            {/* Monthly usage minimum */}
            <div className="flex flex-col gap-4 pl-4">
              <div className="flex items-center gap-4">
                <Toggle enabled={usageMinimum} onToggle={setUsageMinimum} size="small" />
                <span className="text-xs font-black tracking-tight text-ew-muted-foreground opacity-80">
                  Monthly usage minimum
                </span>
              </div>
              {usageMinimum && (
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-ew-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                      Suggested minimum
                    </span>
                    <div className="flex h-11 items-center justify-end rounded-lg border-2 border-emerald-600/35 bg-white px-3 text-sm font-semibold text-ew-foreground">
                      {suggestedUsageMinimum.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="quote-minimum-input"
                      className="text-xs font-semibold tracking-tight text-ew-muted-foreground"
                    >
                      Quote minimum
                    </Label>
                    <div className="relative w-full">
                      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-muted-foreground">
                        $
                      </span>
                      <ShadcnInput
                        id="quote-minimum-input"
                        type="text"
                        inputMode="decimal"
                        value={quoteMinimumInput}
                        onChange={(e) => setQuoteMinimumInput(e.target.value)}
                        className="h-11 border-ew-border pl-8 text-sm font-semibold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                      Est. monthly usage rev.
                    </span>
                    <div className="flex h-11 items-center justify-end rounded-lg border border-ew-border bg-ew-background/40 px-3 text-sm font-semibold text-ew-foreground">
                      {EST_MONTHLY_USAGE_REV.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-tight text-ew-muted-foreground">
                      % of est. monthly usage rev.
                    </span>
                    <div className="flex h-11 items-center justify-end rounded-lg border border-ew-border bg-ew-background/40 px-3 text-sm font-semibold text-ew-foreground">
                      {USAGE_MIN_PERCENT_DEFAULT.toFixed(2)}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lower Grid: Breakdown and Chart */}
            <div className="grid grid-cols-[1fr_480px] gap-8 pb-32">
               {/* Left: Commit Comparison */}
               <div className="bg-white border border-ew-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-4 border-b border-ew-border grid grid-cols-[1fr_160px_160px] text-xs font-black text-ew-muted-foreground tracking-tight gap-4">
                     <span>Product</span>
                     <span className="text-right">No Commitment</span>
                     <span className="text-right">With Commitment</span>
                  </div>
                  <div className="divide-y divide-ew-border/40 flex-1">
                     {[
                       { name: 'Auth', no: '$1.50', with: '$0.67' },
                       { name: 'Identity', no: '$1.50', with: '$0.67' },
                       { name: 'Balance', no: '$0.10', with: '$0.67' },
                       { name: 'Platform Support Services - Basic', no: '$2,000.00', with: '$1,000.00' }
                     ].map((row, i) => (
                       <div key={i} className="p-4 grid grid-cols-[1fr_160px_160px] gap-4 items-center">
                          <span className="text-sm font-bold text-ew-muted-foreground">{row.name}</span>
                          <span className="text-sm font-bold text-ew-foreground text-right opacity-60">{row.no}</span>
                          <span className="text-sm font-black text-ew-foreground text-right">{row.with}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Right: Savings Chart */}
               <div className="bg-white border border-ew-border rounded-2xl p-8 shadow-sm h-[320px] flex flex-col">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight="bold" axisLine={false} tickLine={false} />
                        <RechartsTooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={80}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#1a1a1a' : '#006644'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-8 mt-6">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-ew-primary rounded-full" />
                        <span className="text-xs font-black tracking-tight text-ew-muted-foreground">Total</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#006644] rounded-sm opacity-30" />
                        <span className="text-xs font-black tracking-tight text-ew-muted-foreground">Savings</span>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>

        {/* Floating Footer */}
        <footer className="h-24 bg-white border-t border-ew-border flex items-center justify-between px-12 shrink-0 z-20">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
               <span className="text-xs font-black text-ew-muted-foreground tracking-tight">Total Contract Value</span>
               <span className="text-2xl font-black text-ew-foreground tracking-tighter">$32,091.96</span>
            </div>
            <div className="flex items-baseline gap-2 -mt-1">
               <span className="text-xs font-bold text-ew-muted-foreground tracking-tight opacity-60">First Year Revenue</span>
               <span className="text-sm font-black text-ew-foreground tracking-tight opacity-70">$32,091.96</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <ShadcnButton type="button" variant="outline" className="h-10 px-4" onClick={onBack}>
               Back
             </ShadcnButton>
             <ShadcnButton type="button" className="h-10 bg-ew-primary px-4 text-ew-primary-foreground hover:bg-ew-primary/90" onClick={onFinish}>
               Finish
             </ShadcnButton>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function App() {
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [processStep, setProcessStep] = useState<number>(-1);
  const [currentView, setCurrentView] = useState<'dashboard' | 'select-products' | 'pricing-options'>('dashboard');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [quoteName, setQuoteName] = useState('AI Quote');
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [opportunityContextNotes, setOpportunityContextNotes] = useState('AI quoting testing');
  const [quoteCreateMenuOpen, setQuoteCreateMenuOpen] = useState(false);
  const quoteCreateMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!quoteCreateMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (quoteCreateMenuRef.current && !quoteCreateMenuRef.current.contains(e.target as Node)) {
        setQuoteCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [quoteCreateMenuOpen]);

  const steps: Step[] = [
    { id: 'context', label: 'Context', status: 'pending', logos: [LOGO_SALESFORCE, LOGO_GONG] },
    { id: 'similar', label: 'Accounts', status: 'pending', logos: [LOGO_SALESFORCE, LOGO_GONG] },
    { id: 'historical', label: 'Deals', status: 'pending', logos: [LOGO_SALESFORCE] },
    { id: 'recommend', label: 'Recommend', status: 'pending' },
    { id: 'quote', label: 'Quote Ready', status: 'pending' },
  ];

  useEffect(() => {
    // Auto-progress stages 0–3 (Context → Recommend), then stop on Quote for review
    if (isCopilotOpen && processStep >= 0 && processStep < 4) {
      const timer = setTimeout(() => {
        setProcessStep(prev => prev + 1);
      }, 4000); // 4s delay for better readability
      
      // Automatic selection before final review step
      if (processStep === 3) {
        setSelectedProductIds(new Set(['identity', 'auth', 'balance', 'platform-basic']));
      }
      
      return () => clearTimeout(timer);
    }
  }, [isCopilotOpen, processStep]);

  const handleGenerate = () => {
    setProcessStep(0);
    setIsCopilotOpen(true);
  };

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (currentView === 'pricing-options') {
    return (
      <QuoteDetailView 
        onBack={() => setCurrentView('dashboard')} 
        onSelectProducts={() => setCurrentView('select-products')} 
        onFinish={() => {
          const newQuote: Quote = {
            id: Date.now().toString(),
            title: quoteName,
            updated: 'Just now',
            status: 'Draft',
            confidence: 'HIGH',
            evidence: '[10/15/2025 Call]: Agreed to a $1,000/month platform fee and a discounted unit rate of $2 per account for Auth, Identity, and Balance.',
            benchmark: 'Binaxity Holdings Inc. ($54K)',
            strategy: 'Applied 0.6 pre-commitment factor...'
          };
          setQuotes([newQuote, ...quotes]);
          setCurrentView('dashboard');
        }}
        quoteName={quoteName}
      />
    );
  }

  if (currentView === 'select-products') {
    return (
      <SelectProductsView 
        selectedIds={selectedProductIds}
        onToggle={toggleProduct}
        onNext={() => setCurrentView('pricing-options')}
        onBack={() => setCurrentView('dashboard')}
        quoteName={quoteName}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-ew-background text-ew-foreground font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* subtle gradient */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-brand-accent-gold/5 blur-[140px] pointer-events-none" />

        {/* Navigation */}
        <header className="h-14 border-b border-ew-border bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight text-ew-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>Opportunities</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-ew-foreground">Al Mabrook - ABI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button color="white" icon="info" label="Info" onClick={() => {}} />
            <Button color="white" onClick={() => {}}>
              <MessageSquare className="w-4 h-4" />
              <span>Comments</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full z-0">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold tracking-tight text-brand-accent-gold mb-2 block">Enterprise Opportunity</span>
              <h1 className="text-2xl font-light tracking-tight text-ew-foreground">Al Mabrook - ABI</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button color="white" label="Proposal package" onClick={() => {}} />
              <div className="relative" ref={quoteCreateMenuRef}>
              <button
                type="button"
                onClick={() => setQuoteCreateMenuOpen((o) => !o)}
                aria-expanded={quoteCreateMenuOpen}
                aria-haspopup="menu"
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-ew-primary bg-ew-primary px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-ew-primary/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ew-primary'
                )}
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>Create a quote</span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 opacity-90 transition-transform', quoteCreateMenuOpen && 'rotate-180')}
                />
              </button>
              {quoteCreateMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[260px] overflow-hidden rounded-xl border border-ew-border bg-white py-1 shadow-md shadow-black/5"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-ew-foreground transition-colors hover:bg-ew-background"
                    onClick={() => {
                      setCurrentView('select-products');
                      setQuoteCreateMenuOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 shrink-0 text-ew-muted-foreground" />
                    Create from scratch
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-ew-foreground transition-colors hover:bg-ew-background"
                    onClick={() => setQuoteCreateMenuOpen(false)}
                  >
                    <Copy className="h-4 w-4 shrink-0 text-ew-muted-foreground" />
                    Clone existing
                  </button>
                  <div className="my-1 h-px bg-ew-border/80" />
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-ew-foreground transition-colors hover:bg-ew-background"
                    onClick={() => {
                      handleGenerate();
                      setQuoteCreateMenuOpen(false);
                    }}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-brand-accent-gold" />
                    Run Quote Intelligence
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm text-ew-foreground font-medium">Proposal Feb 03, 2026, 03:10 PM</p>
            <span className="w-1 h-1 rounded-full bg-ew-border" />
            <span className="text-xs text-ew-muted-foreground italic">Updated 13 minutes ago</span>
          </div>

          <div className="flex gap-2 mb-8">
            <Button color="white" onClick={() => {}}>
              <RefreshCw className="w-3 h-3" />
              <span>Compare</span>
            </Button>
            <Button color="white" label="Edit" onClick={() => setCurrentView('pricing-options')} />
          </div>

          <div className="space-y-4 mb-16">
            {quotes.map(quote => (
              <QuoteCard 
                key={quote.id} 
                quote={quote} 
                onClick={() => {
                  setQuoteName(quote.title);
                  setCurrentView('pricing-options');
                }}
              />
            ))}
          </div>

          <div className="border-t border-ew-border pt-10">
            <h2 className="mb-8 font-sans text-sm font-bold tracking-tight text-ew-muted-foreground">Standalone Quotes</h2>
            <div className="space-y-4">
              {quotes.map(quote => (
                 <QuoteCard 
                   key={`standalone-${quote.id}`} 
                   quote={quote} 
                   onClick={() => {
                     setQuoteName(quote.title);
                     setCurrentView('pricing-options');
                   }}
                 />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Right Information Context — DealOps-style panels */}
      <aside
        className={cn(
          'w-85 shrink-0 overflow-y-auto border-l border-ew-border bg-ew-muted/50 px-4 py-5 transition-all duration-300 custom-scrollbar',
          isCopilotOpen ? 'invisible w-0 overflow-hidden border-0 p-0 opacity-0' : 'visible opacity-100',
        )}
      >
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-ew-border bg-white p-4">
            <h3 className="border-b border-ew-border pb-3 text-sm font-bold tracking-tight text-ew-foreground">
              Opportunity context
            </h3>
            <div className="pt-3">
              <textarea
                value={opportunityContextNotes}
                onChange={(e) => setOpportunityContextNotes(e.target.value.slice(0, 400))}
                maxLength={400}
                rows={5}
                spellCheck
                className="min-h-[100px] w-full resize-y border-0 bg-transparent text-sm leading-relaxed text-ew-foreground placeholder:text-ew-muted-foreground/60 focus:outline-none"
                placeholder="Add context for this opportunity…"
                aria-label="Opportunity context notes"
              />
              <p className="mt-2 text-right text-xs text-ew-muted-foreground">
                {opportunityContextNotes.length}/400
              </p>
            </div>
          </section>

          <section className="flex flex-col rounded-lg border border-ew-border bg-white p-4">
            <h3 className="border-b border-ew-border pb-3 text-sm font-bold tracking-tight text-ew-foreground">
              Overview
            </h3>
            <div className="divide-y divide-ew-border/80 pt-1">
              {OPPORTUNITY_OVERVIEW_ROWS.map(({ key, label }) => {
                const raw = OPPORTUNITY_DATA[key];
                const display =
                  key === 'acv' ? `$${raw}` : typeof raw === 'number' ? String(raw) : raw;
                return (
                  <div key={key} className="flex items-baseline justify-between gap-6 py-2.5">
                    <span className="shrink-0 text-sm font-bold tracking-tight text-ew-muted-foreground">
                      {label}
                    </span>
                    <span className="min-w-0 text-right text-sm font-normal text-ew-foreground">{display}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-ew-border pt-4">
              <div className="flex gap-2">
                <Button
                  color="white"
                  className="flex-1 justify-center rounded-lg border-ew-border py-2.5 text-sm font-semibold text-ew-foreground shadow-none"
                  onClick={() => {}}
                >
                  <RefreshCw className="h-4 w-4 shrink-0" />
                  <span>Refresh data</span>
                </Button>
                <Button
                  color="white"
                  className="flex-1 justify-center rounded-lg border-ew-border py-2.5 text-sm font-semibold text-ew-foreground shadow-none"
                  onClick={() => {}}
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>Open in SFDC</span>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </aside>

      {/* AI Intelligence Copilot Panel (Modal) */}
      <AnimatePresence>
        {isCopilotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCopilotOpen(false)}
               className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative flex h-auto min-h-[min(58vh,620px)] max-h-[min(82vh,800px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-ew-border bg-white shadow-md"
            >
              {/* Copilot Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ew-border bg-white/80 px-5 py-3 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ew-border bg-white shadow-sm">
                    <img
                      src="/dealops-symbol.png"
                      alt="DealOps"
                      className="h-6 w-6 object-contain"
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight text-ew-foreground md:text-2xl">Al Mabrook – ABI</h2>
                    <Badge color="green" className="flex items-center gap-1.5 tracking-tight">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                      Generating quote
                    </Badge>
                  </div>
                </div>
                
                <Button
                  color="ghost-gray"
                  onClick={() => setIsCopilotOpen(false)}
                  className="w-10 h-10 rounded-full !p-0 justify-center"
                >
                  <Plus className="w-5 h-5 transform rotate-45" />
                </Button>
              </div>

              {/* Vertical pipeline: step 1 (Context) at top → step 5 (Quote Ready) at bottom */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-row overflow-hidden">
                <nav
                  aria-label="Quote generation steps"
                  className="flex min-h-0 w-[108px] shrink-0 flex-col items-center overflow-y-auto overflow-x-hidden border-r border-ew-border/60 bg-ew-background/30 px-1.5 py-3 custom-scrollbar md:w-[118px]"
                >
                  {steps.map((step, idx) => {
                    const isLastStep = idx === steps.length - 1;
                    const stepComplete =
                      processStep > idx || (processStep === idx && isLastStep);
                    return (
                      <React.Fragment key={step.id}>
                        <div className="flex w-full flex-col items-center gap-1 px-0.5">
                          <div
                            className={cn(
                              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold shadow-none transition-all duration-500 md:h-6 md:w-6 md:text-[10px]',
                              stepComplete
                                ? 'bg-ew-muted text-ew-muted-foreground'
                                : processStep === idx
                                  ? 'border border-ew-border/80 bg-white text-ew-foreground shadow-sm ring-1 ring-ew-border/60'
                                  : 'border border-ew-border/70 bg-white/90 text-ew-muted-foreground/90',
                            )}
                          >
                            {stepComplete ? '✓' : idx + 1}
                          </div>
                          <span
                            className={cn(
                              'max-w-full text-center text-[10px] font-semibold leading-tight tracking-tight transition-colors duration-300 md:text-xs',
                              stepComplete
                                ? 'text-ew-muted-foreground'
                                : processStep === idx
                                  ? 'text-ew-foreground/90'
                                  : 'text-ew-muted-foreground/85',
                            )}
                          >
                            {step.label}
                          </span>
                          {step.logos && step.logos.length > 0 && (
                            <div
                              className="mt-0.5 flex flex-wrap items-center justify-center gap-0.5"
                              aria-label="Data sources"
                            >
                              {step.logos.map((logo, lIdx) => (
                                <div
                                  key={lIdx}
                                  className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded border border-ew-border/40 bg-white/90 p-px md:h-[18px] md:w-[18px] md:p-0.5"
                                >
                                  <img
                                    src={logo}
                                    alt={logo.includes('gong') ? 'Gong' : 'Salesforce'}
                                    className="h-full w-full object-contain opacity-[0.72] saturate-[0.85]"
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {idx < steps.length - 1 && (
                          <div
                            className={cn(
                              'my-1.5 h-5 w-[2px] shrink-0 rounded-full transition-colors duration-500 md:my-2 md:h-6',
                              processStep > idx ? 'bg-ew-muted-foreground/25' : 'bg-ew-border/70',
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>

                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                  <CopilotActivityFeed processStep={processStep} />

                  {/* Main stream — IntelCard tabs */}
                  <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white p-5 custom-scrollbar md:p-6">
                      <div className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-4">
                  {processStep >= 0 && (
                    <div>
                      <IntelCard
                        title="Opportunity context loaded"
                        icon={Monitor}
                        isComplete={processStep > 0}
                        subtitle="1.3s"
                      >
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-1.5">
                            {['Alternative investments', 'SMB', 'USA'].map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-ew-border/50 bg-ew-background/60 px-2 py-0.5 text-sm font-medium text-ew-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium tracking-tight text-ew-muted-foreground/90">
                                Stage
                              </p>
                              <p className="text-sm font-medium text-ew-foreground">Discovery</p>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-medium tracking-tight text-ew-muted-foreground/90">
                                Employees
                              </p>
                              <p className="text-sm font-medium text-ew-foreground">9</p>
                            </div>
                          </div>
                          <div className="space-y-2 border-t border-ew-border/30 pt-3">
                            <div className="flex items-baseline justify-between gap-4">
                              <span className="shrink-0 text-xs font-medium text-ew-muted-foreground">
                                Platform fee
                              </span>
                              <span className="text-right text-sm font-medium text-ew-foreground">
                                $1,000/mo
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between gap-4">
                              <span className="shrink-0 text-xs font-medium text-ew-muted-foreground">
                                Usage commitment
                              </span>
                              <span className="text-right text-sm font-medium text-ew-foreground">
                                $1,000/mo
                              </span>
                            </div>
                          </div>
                        </div>
                      </IntelCard>
                    </div>
                  )}

                  {processStep >= 1 && (
                    <div>
                      <IntelCard title="3 similar accounts found" icon={Database} isComplete={processStep > 1} subtitle="3.2s">
                        <div className="space-y-4">
                          <p className="text-xs font-medium leading-relaxed tracking-tight text-ew-muted-foreground/90">
                            Ranked by fit to this opportunity’s size band ($20K–$30K) and product footprint.
                          </p>
                          <div className="w-full min-w-0 overflow-x-auto">
                            <div className="mb-0 grid grid-cols-[1fr_56px_1fr_80px] gap-x-3 text-xs font-medium tracking-tight text-ew-muted-foreground/90 min-[480px]:grid-cols-[1fr_60px_160px_80px] min-[480px]:gap-x-4">
                              <span>Account</span>
                              <span>ACV</span>
                              <span>Products</span>
                              <span className="text-right">Match</span>
                            </div>
                            <div className="mt-2 divide-y divide-ew-border/30">
                              {[
                                { name: 'Binaxity Holdings', acv: '$54K', prods: 'Auth, Identity, Balance, Platform', match: 95 },
                                { name: 'NovaPay Labs', acv: '$31K', prods: 'Auth, Balance, Identity', match: 88 },
                                { name: 'Meridian Fintech', acv: '$22K', prods: 'Auth, Identity', match: 74 },
                              ].map((row, i) => (
                                <div
                                  key={i}
                                  className="grid grid-cols-[1fr_56px_1fr_80px] items-center gap-x-3 py-3 text-sm min-[480px]:grid-cols-[1fr_60px_160px_80px] min-[480px]:gap-x-4"
                                >
                                  <span className="min-w-0 font-medium text-ew-foreground">{row.name}</span>
                                  <span className="font-medium text-ew-foreground">{row.acv}</span>
                                  <span className="min-w-0 text-xs font-medium text-ew-muted-foreground/90">
                                    {row.prods}
                                  </span>
                                  <span className="text-right text-sm font-medium text-ew-foreground">
                                    {row.match}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </IntelCard>
                    </div>
                  )}

                  {processStep >= 2 && (
                    <div>
                      <IntelCard title="Analyzing Historical Deals" icon={History} isComplete={processStep > 2}>
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ew-border/50 bg-ew-background/30">
                                <FileText className="h-4 w-4 text-ew-foreground" />
                              </div>
                              <h4 className="truncate text-sm font-semibold leading-tight text-ew-foreground">
                                Benchmark: Income, Assets, IDV
                              </h4>
                            </div>
                            <div className="shrink-0 rounded-full border border-ew-border/40 bg-ew-background/30 px-3 py-1 text-xs font-medium text-ew-foreground sm:ml-auto">
                              $54K <span className="text-ew-muted-foreground">·</span> New
                            </div>
                          </div>

                          <div className="overflow-x-auto overflow-y-hidden rounded-lg border border-ew-border/30 bg-white">
                            <div
                              className={cn(
                                'grid gap-x-5 border-b border-ew-border/30 bg-ew-background/20 px-3 py-2.5 text-xs font-medium tracking-tight text-ew-muted-foreground/90',
                                processStep >= 3
                                  ? 'grid-cols-[minmax(0,1fr)_6.5rem_17rem] sm:grid-cols-[minmax(0,1fr)_7.5rem_16rem]'
                                  : 'grid-cols-[minmax(0,1fr)_6.5rem] sm:grid-cols-[minmax(0,1fr)_7.5rem]',
                                'items-end',
                              )}
                            >
                              <span className="min-w-0">Product</span>
                              <span
                                className={cn('text-right', processStep >= 3 && 'border-r border-ew-border/20 pr-4 sm:pr-5')}
                              >
                                Historical
                              </span>
                              {processStep >= 3 && (
                                <motion.span
                                  initial={{ opacity: 0, x: 4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.18 }}
                                  className="inline-flex items-center justify-end gap-1.5 text-right"
                                >
                                  <Zap className="h-3.5 w-3.5 shrink-0 fill-current text-black" aria-hidden />
                                  Recommended
                                </motion.span>
                              )}
                            </div>
                            <div>
                              {BENCHMARK_HISTORICAL_ROWS.map((row, i) => {
                                const rec = RECOMMENDED_PRODUCT_BY_LABEL[row.label];
                                const showRecColumn = processStep >= 3;
                                return (
                                  <div
                                    key={row.label}
                                    className={cn(
                                      'grid items-start gap-x-5 border-b border-ew-border/25 px-3 py-3.5 last:border-b-0 odd:bg-ew-background/15',
                                      showRecColumn
                                        ? 'grid-cols-[minmax(0,1fr)_6.5rem_17rem] sm:grid-cols-[minmax(0,1fr)_7.5rem_16rem]'
                                        : 'grid-cols-[minmax(0,1fr)_6.5rem] sm:grid-cols-[minmax(0,1fr)_7.5rem]',
                                    )}
                                  >
                                    <div className="min-w-0 pr-1">
                                      <p className="text-sm font-medium text-ew-foreground">{row.label}</p>
                                      <p className="mt-0.5 text-xs font-medium text-ew-muted-foreground/85">{row.vol}</p>
                                    </div>
                                    <span
                                      className={cn(
                                        'pt-0.5 text-right text-sm font-medium text-ew-foreground',
                                        showRecColumn && 'border-r border-ew-border/20 pr-4 sm:pr-5',
                                      )}
                                    >
                                      {row.price}
                                    </span>
                                    {showRecColumn && (
                                      <motion.div
                                        key={`rec-${row.label}`}
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: i * 0.03 }}
                                        className="min-w-0 pl-0.5 text-right"
                                      >
                                        {rec ? (
                                          <div className="flex flex-col items-stretch gap-2 sm:items-end sm:text-right">
                                            <div className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                                              <Badge color={rec.confidence === 'HIGH' ? 'green' : 'yellow'} size="small">
                                                {toSentenceCase(rec.confidence)}
                                              </Badge>
                                              <span className="whitespace-nowrap text-sm font-medium text-ew-foreground">
                                                {rec.price}
                                              </span>
                                              <span className="text-xs font-medium text-ew-muted-foreground/90">
                                                / {rec.units}
                                              </span>
                                            </div>
                                            <p className="max-w-[20rem] text-left text-xs font-normal leading-snug text-ew-muted-foreground/90 sm:text-right">
                                              {rec.detail}
                                            </p>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-end gap-0.5">
                                            <span className="text-sm text-ew-muted-foreground/40 sm:text-right">—</span>
                                            <span className="text-xs text-ew-muted-foreground/70">No change</span>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </IntelCard>
                    </div>
                  )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {processStep >= 4 && processStep < 5 && (
                <div className="relative z-20 flex shrink-0 flex-col gap-2 border-t border-ew-border bg-white px-5 py-2.5 md:flex-row md:items-end md:gap-3 md:px-6 md:py-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label
                      htmlFor="copilot-quote-name"
                      className="block text-xs font-black tracking-tight text-ew-muted-foreground/60"
                    >
                      Quote name
                    </Label>
                    <ShadcnInput
                      id="copilot-quote-name"
                      type="text"
                      value={quoteName}
                      onChange={(e) => setQuoteName(e.target.value)}
                      placeholder="Enter quote name…"
                      className="h-9 w-full font-semibold text-ew-foreground"
                    />
                  </div>
                  <div className="flex shrink-0 justify-stretch md:justify-end">
                    <ShadcnButton
                      type="button"
                      className={cn(
                        'w-full gap-2 bg-ew-primary px-4 py-2 text-sm font-semibold text-ew-primary-foreground shadow-sm hover:bg-ew-primary/90 md:w-auto',
                        processStep === 4 &&
                          'relative ring-2 ring-brand-accent-gold/55 animate-copilot-finalize-glow',
                      )}
                      onClick={() => {
                        setIsCopilotOpen(false);
                        setCurrentView('pricing-options');
                      }}
                    >
                      <span>Finalize and Review Quote</span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </ShadcnButton>
                  </div>
                </div>
              )}

              {/* Full Level Overlay when complete */}
              {processStep >= 5 && (
                <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-3xl flex items-center justify-center p-8">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="relative w-full max-w-2xl rounded-[56px] border border-ew-border bg-white p-14 text-center shadow-md border-t-white"
                  >
                     <div className="absolute inset-x-0 top-0 h-40 bg-brand-accent-gold/10 blur-[100px] pointer-events-none rounded-full" />
                     <div className="relative z-10">
                        <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-ew-primary shadow-md ring-12 ring-ew-primary/5">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="mb-4 text-2xl font-black tracking-tighter text-ew-foreground">Quote generated successfully</h2>
                        <p className="mb-14 text-sm font-medium text-ew-muted-foreground opacity-80">Your optimized quote is ready for review.</p>

                        <div className="grid grid-cols-4 gap-4 mb-14">
                           {[
                             { label: 'Confidence', value: 'High', color: 'text-ew-primary' },
                             { label: 'Products', value: '4', color: 'text-ew-foreground' },
                             { label: 'Similar', value: '1', color: 'text-ew-foreground' },
                             { label: 'Recommended', value: '4', color: 'text-ew-foreground' }
                           ].map((stat, i) => (
                             <div key={i} className="rounded-[28px] border border-ew-border/50 bg-ew-background/50 p-6">
                                <span className="mb-3 block text-xs font-black tracking-tight text-ew-muted-foreground/60">{stat.label}</span>
                                <span className={cn("text-2xl font-black tracking-tighter", stat.color)}>
                                  {stat.label === 'Confidence' ? toSentenceCase(String(stat.value)) : stat.value}
                                </span>
                             </div>
                           ))}
                        </div>

                        <div className="flex items-center gap-5">
                           <ShadcnButton
                             type="button"
                             variant="outline"
                             className="flex-1 justify-center"
                             onClick={() => { setIsCopilotOpen(false); setProcessStep(-1); }}
                           >
                             Close
                           </ShadcnButton>
                           <ShadcnButton
                             type="button"
                             className="flex-1 justify-center bg-ew-primary text-ew-primary-foreground hover:bg-ew-primary/90"
                             onClick={() => { setIsCopilotOpen(false); setCurrentView('pricing-options'); }}
                           >
                             View Optimized Quote
                           </ShadcnButton>
                        </div>
                     </div>
                  </motion.div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

