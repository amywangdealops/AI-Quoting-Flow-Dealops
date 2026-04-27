import React, { useState, useEffect } from 'react';
import {
  Search,
  Database,
  History,
  Zap,
  Package,
  FileText,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Info,
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
  Calendar,
  Lock,
  ChevronLeft,
  Monitor,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from './components/Button';
import Badge from './components/Badge';
import { Input } from './components/Input';
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

// --- Types ---

type StepId = 'context' | 'similar' | 'historical' | 'recommend' | 'mapping' | 'quote';

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

const IntelCard = ({ title, icon: Icon, children, isComplete, subtitle }: { title: string, icon: any, children: React.ReactNode, isComplete: boolean, subtitle?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className="intel-card mb-4"
  >
    <div className={cn(
      "px-5 py-4 flex items-center justify-between border-b border-ew-border/30",
      isComplete ? "bg-ew-muted/20" : "bg-brand-accent-gold/5"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500",
          isComplete ? "bg-ew-foreground/5 text-ew-foreground" : "bg-brand-accent-gold/10 text-brand-accent-gold animate-pulse"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ew-foreground">
              {title}
            </span>
            {subtitle && <span className="text-[10px] text-ew-muted-foreground font-mono">{subtitle}</span>}
          </div>
          {!isComplete && (
            <span className="text-[9px] text-brand-accent-gold font-bold uppercase tracking-wider block animate-pulse">Processing...</span>
          )}
        </div>
      </div>
      {isComplete && <CheckCircle2 className="w-4 h-4 text-ew-primary" />}
    </div>
    <div className="p-5 bg-white">
      {children}
    </div>
  </motion.div>
);

interface QuoteCardProps {
  quote: Quote;
  onClick?: () => void;
  key?: React.Key;
}

const QuoteCard = ({ quote, onClick }: QuoteCardProps) => (
  <div 
    onClick={onClick}
    className="bg-white border border-ew-border/50 rounded-2xl p-6 mb-4 hover:border-brand-accent-gold/50 transition-all group cursor-pointer shadow-sm hover:shadow-md">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border border-ew-border rounded flex items-center justify-center shrink-0">
          <div className="w-2.5 h-2.5 bg-ew-primary rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ew-foreground">{quote.title}</h3>
            <span className="text-[10px] text-ew-muted-foreground italic uppercase tracking-wider">{quote.updated}</span>
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
        <span className="font-bold text-ew-muted-foreground text-[11px] uppercase tracking-wider whitespace-nowrap min-w-[140px]">AI Generated Quote</span>
        <span className="text-ew-muted-foreground text-xs">Confidence</span>
        <Badge color="green">{quote.confidence}</Badge>
      </div>
      <p className="text-ew-muted-foreground leading-relaxed text-xs"><span className="font-bold text-ew-foreground uppercase text-[10px] tracking-wide mr-1">Evidence •</span>{quote.evidence}</p>
      <p className="text-ew-muted-foreground leading-relaxed text-xs"><span className="font-bold text-ew-foreground uppercase text-[10px] tracking-wide mr-1">Benchmark •</span>{quote.benchmark}</p>
      <p className="text-ew-muted-foreground leading-relaxed text-xs"><span className="font-bold text-ew-foreground uppercase text-[10px] tracking-wide mr-1">Strategy •</span>{quote.strategy}</p>
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
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-ew-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>Opportunities</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span>Al Mabrook - ABI</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-ew-foreground">{quoteName}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-4 mr-4 text-[10px] font-bold text-ew-muted-foreground uppercase tracking-widest">
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
        <div className="bg-white border-b border-ew-border px-8 py-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
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
              <h1 className="text-3xl font-bold tracking-tight text-ew-foreground mb-2">Select Products</h1>
              <p className="text-sm text-ew-muted-foreground font-medium">Select the products for your quote</p>
            </div>

            {PRODUCT_CATALOG.map((cat) => (
              <div key={cat.name} className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ew-muted-foreground/60">{cat.name}</h3>
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
                        <p className="text-[10px] text-ew-muted-foreground leading-snug font-medium opacity-60">
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

const QuoteDetailView = ({ onBack, onSelectProducts, onFinish, quoteName }: { onBack: () => void, onSelectProducts: () => void, onFinish: () => void, quoteName: string }) => {
  const [usageMinimum, setUsageMinimum] = useState(false);
  const [isRecapExpanded, setIsRecapExpanded] = useState(true);

  const chartData = [
    { name: 'No Commitment', total: 54988, color: '#006644' },
    { name: 'With Commitment', total: 32092, savings: 22896, color: '#006644' },
  ];

  const pricingRows = [
    { 
      id: 'auth',
      name: 'Auth', 
      vol: '833 / mo', 
      list: '$1.500', 
      l1: '$1.200', 
      quote: '$0.967', 
      discount: '35.49%', 
      revenue: '$725.78',
      reasoning: "Explicitly mentioned as a core product for bank account verification in Call 4 (10/15) and Call 6 (10/08).",
      priceReasoning: "Part of a $2/account bundled rate for Auth, Identity, and Balance (Call 4, 10/15). Price split proportionally using ratios from Binaxity deal (Auth: $1.38, Balance: $0.092, Identity: $1.38)."
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
      reasoning: "Explicitly mentioned for matching account holder to user in Call 6 (10/08) and as a core product in Call 4 (10/15).",
      priceReasoning: "Part of a $2/account bundled rate for Auth, Identity, and Balance (Call 4, 10/15). Price split proportionally using ratios from Binaxity deal (Auth: $1.38, Balance: $0.092, Identity: $1.38)."
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
      reasoning: "Unified provider for Balance (checking) for bank account linking as discussed in Call 6 (10/08).",
      priceReasoning: "Part of a $2/account bundled rate for Auth, Identity, and Balance (Call 4, 10/15). Price split proportionally using ratios from Binaxity deal (Auth: $1.38, Balance: $0.092, Identity: $1.38)."
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
      reasoning: "Customer agreed to a fixed platform fee of $1,000 per month in Call 4 (10/15).",
      priceReasoning: "Customer-agreed price of $1,000 per month from Call 4 (10/15)."
    }
  ];

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-ew-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-ew-border bg-white px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-ew-muted-foreground">
            <LayoutGrid className="w-4 h-4" />
            <span>Opportunities</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span>Al Mabrook - ABI</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-ew-foreground">{quoteName}</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-4 mr-4 text-[10px] font-bold text-ew-muted-foreground uppercase tracking-widest">
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
        <div className="bg-white border-b border-ew-border px-8 py-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
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
            <div className="bg-white border border-blue-200 rounded-[32px] overflow-hidden shadow-[0_2px_20px_rgba(59,130,246,0.08)]">
               {/* Header strip */}
               <button
                 onClick={() => setIsRecapExpanded(v => !v)}
                 className="w-full px-10 py-6 border-b border-blue-100 flex items-center justify-between bg-white hover:bg-ew-muted/20 transition-colors text-left"
               >
                 <div className="flex items-center gap-3">
                   <Sparkles className="w-4 h-4 text-black" />
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black">Quote Intelligence Recap</span>
                 </div>
                 <div className="flex items-center gap-4">
                   <span className="text-[10px] font-black text-ew-muted-foreground/50 uppercase tracking-widest">Confidence</span>
                   <Badge color="darkGreen">High</Badge>
                   <ChevronDown className={cn("w-4 h-4 text-ew-muted-foreground transition-transform duration-300", isRecapExpanded ? "rotate-0" : "-rotate-90")} />
                 </div>
               </button>

               <div className={cn("overflow-hidden transition-all duration-300", isRecapExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
               <div className="p-10 grid grid-cols-3 gap-12 relative">
                  {/* Visual Divider Lines */}
                  <div className="absolute top-10 bottom-10 left-1/3 w-px bg-ew-border/30" />
                  <div className="absolute top-10 bottom-10 left-2/3 w-px bg-ew-border/30" />

                  {/* Column 1: Scope & Selection */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest mb-4">Derived Scope</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Auth', 'Identity', 'Balance'].map(p => (
                          <span key={p} className="px-3 py-1.5 bg-ew-muted border border-ew-border rounded-xl text-xs font-bold text-ew-foreground">{p}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[11px] text-ew-muted-foreground leading-relaxed italic">
                        "Confirmed need for bank account linking and verification across 10/08/2025 and 10/15/2025 calls."
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-black text-ew-primary uppercase tracking-widest">
                        <Monitor className="w-3 h-3" />
                        <span>Source: 2 Call Transcripts</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Pricing Logic */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest mb-4">Pricing Strategy</h4>
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-ew-foreground tracking-tighter">$2.00</span>
                          <span className="text-[10px] font-bold text-ew-muted-foreground uppercase">/ Bundled Rate</span>
                        </div>
                        <p className="text-[11px] text-ew-muted-foreground leading-relaxed">
                          Applied a <span className="text-ew-foreground font-bold">55% discount</span> against List to match account-level expectations discussed in Discovery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Commitment & ACV */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest mb-4">Commitment Model</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-brand-accent-gold/5 border border-brand-accent-gold/20 rounded-2xl">
                           <div className="flex flex-col">
                             <span className="text-[9px] font-black text-brand-accent-gold uppercase tracking-widest">Factor</span>
                             <span className="text-xl font-black text-ew-foreground tracking-tighter">0.6x</span>
                           </div>
                           <div className="text-right flex flex-col">
                             <span className="text-[9px] font-black text-brand-accent-gold uppercase tracking-widest">Usage Commitment</span>
                             <span className="text-xl font-black text-ew-foreground tracking-tighter">$1,000/mo</span>
                           </div>
                        </div>
                        <p className="text-[11px] text-ew-muted-foreground leading-relaxed">
                          Projected <span className="font-bold text-ew-foreground">750 users/mo</span> commitment provides $12K annual baseline revenue.
                        </p>
                      </div>
                    </div>
                  </div>
               </div>

               {/* Detailed Intelligence Breakdown */}
               <div className="px-10 pb-10 border-t border-ew-border/50 pt-10">
                  <div className="grid grid-cols-1 gap-8">
                     <div className="space-y-6">
                        <div className="grid grid-cols-[120px_1fr] gap-8">
                           <span className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest pt-1">Evidence</span>
                           <div className="space-y-3">
                              {[
                                '[10/15/2025 Call]: Agreed to a $1,000/month platform fee and a discounted unit rate of $2 per account for Auth, Identity, and Balance.',
                                '[10/15/2025 Call]: Initial volume projection of 750 accounts/month for Q1/Q2.',
                                '[10/08/2025 Call]: Customer confirmed need for Auth, Identity, and Balance for bank account linking.'
                              ].map((item, i) => (
                                <div key={i} className="text-xs text-ew-muted-foreground/80 leading-relaxed">
                                   
                                   {item}
                                </div>
                              ))}
                           </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-8 border-t border-ew-border/30 pt-6">
                           <span className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest pt-1">Benchmark</span>
                           <p className="text-xs text-ew-muted-foreground/80 leading-relaxed">
                              Binaxity Holdings Inc. ($54K): Auth, Identity, Balance, and Platform Support Services were included, providing a general pricing structure.
                           </p>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-8 border-t border-ew-border/30 pt-6">
                           <span className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest pt-1">Strategy</span>
                           <p className="text-xs text-ew-muted-foreground/80 leading-relaxed">
                              Applied 0.6 pre-commitment factor: $2,000/month Qualified ACV - $1,000/month platform fee = $1,000/month usage commitment. Usage products quoted at $1,000 / 0.6 = $1,666.67/month total, distributed across Auth, Identity, and Balance at a $2/account bundled rate.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
               </div>{/* end collapsible */}
            </div>

            {/* Config Bar */}
            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-ew-muted-foreground uppercase tracking-widest">Start Date</label>
                  <div className="w-full h-11 bg-white border border-ew-border rounded-xl px-4 flex items-center justify-between text-sm font-bold">
                     <span>04/26/2026</span>
                     <Calendar className="w-4 h-4 text-ew-muted-foreground opacity-40" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black text-ew-muted-foreground uppercase tracking-widest">Subscription Terms</label>
                  <div className="w-full h-11 bg-white border border-ew-border rounded-xl px-4 flex items-center justify-between text-sm font-bold">
                     <span>12</span>
                     <span className="text-xs text-ew-muted-foreground font-medium uppercase tracking-widest">Months</span>
                  </div>
               </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-white border border-ew-border rounded-2xl overflow-hidden shadow-sm">
               <div className="p-4 bg-ew-muted/20 border-b border-ew-border grid grid-cols-[1fr_120px_100px_100px_120px_100px_100px_140px_40px] text-[9px] font-black text-ew-muted-foreground uppercase tracking-widest gap-4 items-center">
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
                    <div key={i} className="p-4 grid grid-cols-[1fr_120px_100px_100px_120px_100px_100px_140px_40px] gap-4 items-center group hover:bg-ew-background/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-ew-foreground">{row.name}</span>
                          <Tooltip as="span" location="TOP" text={row.reasoning}>
                            <Info className="w-3.5 h-3.5 text-ew-muted-foreground opacity-20 group-hover:opacity-60 cursor-help transition-opacity" />
                          </Tooltip>
                       </div>
                       <div className="h-9 border border-ew-border rounded-lg bg-ew-background/30 flex items-center justify-center text-xs font-bold font-mono">
                          {row.vol}
                       </div>
                       <div className="text-xs font-bold text-green-600 text-right font-mono">{row.list}</div>
                       <div className="text-xs font-bold text-brand-accent-gold text-right font-mono">{row.l1}</div>
                       <div className="h-9 border border-ew-border rounded-lg bg-white flex items-center justify-center text-xs font-bold font-mono ring-2 ring-brand-accent-gold/10 relative">
                          {row.quote}
                          <Tooltip as="span" location="TOP" text={row.priceReasoning} className="absolute -right-2 -top-2 z-10">
                            <Info className="w-3 h-3 text-ew-muted-foreground opacity-0 group-hover:opacity-40 cursor-help transition-opacity" />
                          </Tooltip>
                       </div>
                       <div className="text-xs font-bold text-ew-muted-foreground text-center font-mono opacity-60">{row.discount}</div>
                       <div className="flex justify-center">
                          <Badge color="green" size="small">None</Badge>
                       </div>
                       <div className="text-xs font-bold text-ew-foreground text-right font-mono">{row.revenue}</div>
                       <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4 text-red-400 cursor-pointer hover:text-red-500" />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-ew-background/40 border-t border-ew-border">
                  <Button color="white" icon="plus" label="Add / Edit Products" onClick={() => {}} />
               </div>
            </div>

            {/* Toggle Row */}
            <div className="flex items-center gap-4 pl-4">
               <Toggle enabled={usageMinimum} onToggle={setUsageMinimum} size="small" />
               <span className="text-[10px] font-black uppercase tracking-widest text-ew-muted-foreground opacity-80">Monthly usage minimum</span>
            </div>

            {/* Lower Grid: Breakdown and Chart */}
            <div className="grid grid-cols-[1fr_480px] gap-8 pb-32">
               {/* Left: Commit Comparison */}
               <div className="bg-white border border-ew-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="p-4 border-b border-ew-border grid grid-cols-[1fr_160px_160px] text-[9px] font-black text-ew-muted-foreground uppercase tracking-widest gap-4">
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
                          <span className="text-[11px] font-bold text-ew-muted-foreground">{row.name}</span>
                          <span className="text-[11px] font-bold text-ew-foreground text-right font-mono opacity-60">{row.no}</span>
                          <span className="text-[11px] font-black text-ew-foreground text-right font-mono">{row.with}</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Right: Savings Chart */}
               <div className="bg-white border border-ew-border rounded-2xl p-8 shadow-sm h-[320px] flex flex-col">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-ew-muted-foreground">Total</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-[#006644] rounded-sm opacity-30" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-ew-muted-foreground">Savings</span>
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
               <span className="text-[10px] font-black text-ew-muted-foreground uppercase tracking-widest">Total Contract Value</span>
               <span className="text-2xl font-black text-ew-foreground tracking-tighter">$32,091.96</span>
            </div>
            <div className="flex items-baseline gap-2 -mt-1">
               <span className="text-[9px] font-bold text-ew-muted-foreground uppercase tracking-widest opacity-60">First Year Revenue</span>
               <span className="text-sm font-black text-ew-foreground tracking-tight opacity-70">$32,091.96</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Button color="white" label="Back" onClick={onBack} />
             <Button color="primary" label="Finish" onClick={onFinish} />
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
  const [quoteName, setQuoteName] = useState('AI Quote - Al Mabrook - ABI');
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  
  const steps: Step[] = [
    { id: 'context', label: 'Context', status: 'pending', logos: ['https://storage.googleapis.com/context-builder-v2-input-artifacts/amy%40dealops.com/images/salesforce_logo_17.png'] },
    { id: 'similar', label: 'Accounts', status: 'pending', logos: ['https://storage.googleapis.com/context-builder-v2-input-artifacts/amy%40dealops.com/images/salesforce_logo_17.png', 'https://storage.googleapis.com/context-builder-v2-input-artifacts/amy%40dealops.com/images/gong_logo_18.png'] },
    { id: 'historical', label: 'Deals', status: 'pending', logos: ['https://storage.googleapis.com/context-builder-v2-input-artifacts/amy%40dealops.com/images/salesforce_logo_17.png'] },
    { id: 'recommend', label: 'Recommend', status: 'pending' },
    { id: 'mapping', label: 'Mapping', status: 'pending' },
    { id: 'quote', label: 'Quote', status: 'pending' },
  ];

  useEffect(() => {
    // Auto-progress stages from 0 to 4 (Context to Mapping)
    // We stop at 4 to allow the user to review the intelligence gathered
    if (isCopilotOpen && processStep >= 0 && processStep < 4) {
      const timer = setTimeout(() => {
        setProcessStep(prev => prev + 1);
      }, 4000); // 4s delay for better readability
      
      // Automatic selection when reaching mapping step
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
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-ew-muted-foreground">
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
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent-gold mb-2 block">Enterprise Opportunity</span>
              <h1 className="text-4xl font-light tracking-tight text-ew-foreground">Al Mabrook - ABI</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button color="white" label="Proposal package" onClick={() => {}} />
              <Button color="primary" label="Create a quote" onClick={() => setCurrentView('select-products')} />
            </div>
          </div>

          {/* Intelligence Hero Banner */}
          {!isCopilotOpen && processStep === -1 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-8 bg-ew-primary rounded-[32px] text-white flex items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-brand-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-8 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                  <Zap className="w-8 h-8 text-brand-accent-gold fill-current" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Portfolio Intelligence Engine</h3>
                  <p className="text-sm text-white/50 font-medium max-w-lg">Using AI to analyze historical deals, benchmark similar accounts, and draft optimized product configurations.</p>
                </div>
              </div>
              <Button
                color="accent"
                label="Run Quote Intelligence"
                onClick={handleGenerate}
                className="rounded-2xl text-sm font-medium px-8 py-4"
              />
            </motion.div>
          )}

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
            <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-ew-muted-foreground mb-8 font-sans">Standalone Quotes</h2>
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

      {/* Right Information Context - Standard Sidebar */}
      <aside className={cn(
        "w-85 border-l border-ew-border bg-ew-card p-8 shrink-0 transition-all duration-300 overflow-y-auto",
        isCopilotOpen ? "opacity-0 invisible w-0 p-0 overflow-hidden" : "opacity-100 visible"
      )}>
        <div className="mb-10">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent-gold mb-5">Opportunity Context</h3>
          <div className="bg-ew-muted/30 border border-ew-border/50 rounded-xl p-4 text-xs text-ew-muted-foreground leading-relaxed min-h-[120px]">
            AI quoting testing
          </div>
          <div className="text-right text-[10px] text-ew-muted-foreground/50 mt-2 font-mono tracking-widest">18/400</div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-ew-muted-foreground mb-8">Overview</h3>
          <div className="space-y-5">
            {Object.entries(OPPORTUNITY_DATA).map(([key, value]) => (
              <div key={key} className="flex justify-between items-baseline gap-4 border-b border-ew-border/30 pb-2">
                <span className="text-[9px] font-bold text-ew-muted-foreground uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-xs font-semibold text-ew-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3">
          <Button color="white" className="w-full justify-center" onClick={() => {}}>
            <RefreshCw className="w-4 h-4" />
            <span>Refresh data</span>
          </Button>
          <Button color="white" className="w-full justify-center" onClick={() => {}}>
            <ExternalLink className="w-4 h-4" />
            <span>Open in SFDC</span>
          </Button>
        </div>
      </aside>

      {/* AI Intelligence Copilot Panel (Modal) */}
      <AnimatePresence>
        {isCopilotOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
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
              className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white border border-ew-border shadow-2xl flex flex-col rounded-[32px] overflow-hidden"
            >
              {/* Copilot Header */}
              <div className="px-10 py-5 border-b border-ew-border flex items-center justify-between sticky top-0 z-10 bg-white/80 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ew-primary rounded-xl flex items-center justify-center shadow-lg shadow-black/5">
                    <Zap className="w-5 h-5 text-ew-primary-foreground fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-ew-foreground tracking-tight">Al Mabrook – ABI</h2>
                      <Badge color="green" className="flex items-center gap-1.5 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                        Generating quote
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ew-muted-foreground font-medium mt-0.5">
                      <span>New Customer</span>
                      <span className="w-1 h-1 rounded-full bg-ew-border" />
                      <span>Fintech</span>
                      <span className="w-1 h-1 rounded-full bg-ew-border" />
                      <span>$24K ACV</span>
                    </div>
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

              {/* Horizontal Pipeline Step Rail */}
              <div className="px-10 py-6 bg-ew-background/50 border-b border-ew-border">
                <div className="flex items-center justify-center max-w-4xl mx-auto w-full">
                  {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                      <div className="flex items-center gap-3 group px-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-500 shadow-sm grow-0 shrink-0",
                          processStep > idx ? "bg-ew-primary text-ew-background" :
                          processStep === idx ? "bg-brand-accent-gold text-ew-foreground ring-4 ring-brand-accent-gold/10 animate-pulse" :
                          "bg-white border border-ew-border text-ew-muted-foreground"
                        )}>
                          {processStep > idx ? "✓" : idx + 1}
                        </div>

                        {/* Stacking logos if present */}
                        {step.logos && step.logos.length > 0 && (
                          <div className="flex -space-x-2 shrink-0">
                            {step.logos.map((logo, lIdx) => (
                              <div key={lIdx} className="w-6 h-6 rounded-md bg-white border border-ew-border/50 flex items-center justify-center p-1 shadow-sm relative first:ml-0 -ml-2" style={{ zIndex: 10 - lIdx }}>
                                <img src={logo} alt="logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                            ))}
                          </div>
                        )}

                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 whitespace-nowrap",
                          processStep === idx ? "text-ew-foreground" :
                          processStep > idx ? "text-ew-primary" : "text-ew-muted-foreground"
                        )}>
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={cn(
                          "h-[1px] grow transition-colors duration-500 mx-2 min-w-[20px]",
                          processStep > idx ? "bg-ew-primary" : "bg-ew-border"
                        )} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Two Column Layout Context */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Intelligence Stream */}
                <div className="flex-1 overflow-y-auto p-12 space-y-8 custom-scrollbar border-r border-ew-border bg-white flex flex-col">
                  
                  {processStep >= 4 && (
                    <div className="space-y-6 order-1">
                       <div className="p-8 bg-white border border-ew-border/60 rounded-[32px] shadow-xl space-y-8 relative">
                          <div className="text-center space-y-2">
                             <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-ew-muted-foreground/60">Analysis Complete</span>
                             </div>
                             <h3 className="text-xl font-bold tracking-tight text-ew-foreground">What do you want to do next?</h3>
                          </div>
                          
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-ew-muted-foreground/60 px-1">Quote Name</label>
                                <Input
                                   type="text"
                                   value={quoteName}
                                   onChange={(e) => setQuoteName(e.target.value)}
                                   placeholder="Enter quote name..."
                                   className="w-full font-bold text-ew-foreground"
                                />
                             </div>

                             <Button
                               color="primary"
                               onClick={() => { setIsCopilotOpen(false); setCurrentView('pricing-options'); }}
                               className="w-full justify-between rounded-2xl py-5 px-6 h-auto"
                               textAlign="left"
                             >
                               <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                   <ArrowRight className="w-5 h-5" />
                                 </div>
                                 <div className="text-left">
                                   <p className="text-sm font-bold">Finalize & Create Quote</p>
                                   <p className="text-[11px] font-medium opacity-60">Apply AI recommendations and view detailed pricing</p>
                                 </div>
                               </div>
                               <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                             </Button>
                          </div>
                       </div>

                       <div className="p-7 bg-white border border-ew-border/50 shadow-sm rounded-[32px]">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-ew-primary/10 rounded-lg flex items-center justify-center">
                              <LayoutGrid className="w-4 h-4 text-ew-primary" />
                            </div>
                            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-ew-foreground">Mapping Products</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {['Auth', 'Identity', 'Balance', 'Platform Support', 'Income', 'Assets', 'Liabilities', 'Investments', 'Transactions', 'Recurring Transactions', 'Signal', 'Transfer', 'Employment', 'Statements', 'Sandbox'].map(item => (
                              <div key={item} className="px-3 py-1.5 bg-ew-background/50 rounded-full border border-ew-border/30 flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-ew-primary/40" />
                                 <span className="text-[10px] font-bold text-ew-foreground uppercase tracking-widest">{item}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  )}

                  {processStep >= 3 && (
                    <div className="order-2">
                       <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 bg-brand-accent-gold/10 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-brand-accent-gold fill-current" />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-ew-foreground">AI recommendation</h3>
                       </div>
                       <div className="bg-white border border-ew-border/40 rounded-[32px] overflow-hidden shadow-sm divide-y divide-ew-border/30">
                          {[
                            { name: 'Auth', confidence: 'HIGH', price: '$0.67', units: '833 units', detail: 'Customer explicitly stated need for bank account verification (Auth) as part of a bundled rate in 10/15/2025 Call and 10/08/2025 Call.' },
                            { name: 'Identity', confidence: 'HIGH', price: '$0.67', units: '833 units', detail: 'Customer explicitly stated need for Identity (matching account holder to user) as part of a bundled rate in 10/15/2025 Call and 10/08/2025 Call.' },
                            { name: 'Balance', confidence: 'MEDIUM', price: '$0.08', units: '833 units', detail: 'Determined based on sub-vertical benchmark and Discovery Stage conversation regarding account linking.' }
                          ].map((prod, i) => (
                            <div key={i} className="p-5 hover:bg-ew-background transition-colors group">
                               <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                     <h4 className="text-sm font-bold text-ew-foreground tracking-tight">{prod.name}</h4>
                                     <Badge color={prod.confidence === 'HIGH' ? 'green' : 'yellow'} size="small">{prod.confidence}</Badge>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-black text-ew-foreground tracking-tighter">{prod.price}</span>
                                    <span className="text-[9px] text-ew-muted-foreground ml-2 font-bold tracking-widest uppercase">/ {prod.units}</span>
                                  </div>
                               </div>
                               <div className="text-[11px] text-ew-muted-foreground leading-relaxed pl-4 border-l border-ew-border/30 italic">
                                  "{prod.detail}"
                                </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {processStep >= 2 && (
                    <div className="order-3">
                      <IntelCard title="Analyzing Historical Deals" icon={History} isComplete={processStep > 2}>
                        <div className="space-y-4">
                            <div className="p-6 bg-ew-background/50 border border-ew-border/50 rounded-2xl">
                              <div className="flex items-center justify-between mb-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white border border-ew-border rounded-lg flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-ew-primary" />
                                    </div>
                                    <h4 className="text-sm font-bold text-ew-foreground">Binaxity - Income, Assets, IDV</h4>
                                  </div>
                                  <div className="px-3 py-1 bg-white border border-ew-border/50 rounded-full text-[10px] font-bold text-ew-muted-foreground uppercase tracking-widest">
                                    <span className="text-ew-primary font-black">$54K</span> • New
                                  </div>
                              </div>
                              <div className="space-y-3">
                                  {[
                                    { label: 'Platform Support Services - Basic', vol: '1 vol', price: '$2000.0000' },
                                    { label: 'Auth', vol: '2,167 vol', price: '$1.3800' },
                                    { label: 'Balance', vol: '2,167 vol', price: '$0.0920' },
                                    { label: 'Identity', vol: '2,167 vol', price: '$1.3800' }
                                  ].map((row, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] border-b border-ew-border/20 pb-2 last:border-0 last:pb-0">
                                      <div className="flex flex-col">
                                        <span className="text-ew-foreground font-medium">{row.label}</span>
                                        <span className="text-[9px] text-ew-muted-foreground opacity-60 tracking-tighter">{row.vol}</span>
                                      </div>
                                      <span className={cn("font-bold font-mono tracking-tight", i === 0 ? "text-ew-primary" : "text-ew-foreground")}>{row.price}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                        </div>
                      </IntelCard>
                    </div>
                  )}

                  {processStep >= 1 && (
                    <div className="order-4">
                      <IntelCard title="3 similar accounts found" icon={Database} isComplete={processStep > 1} subtitle="3.2s">
                        <p className="text-[11px] text-ew-muted-foreground mb-5 opacity-80">Matched on vertical (Fintech), subvertical (Alternative Investments), deal size ($20K–30K range).</p>
                        <div className="w-full">
                          <div className="grid grid-cols-[1fr_60px_160px_80px] text-[9px] font-bold uppercase tracking-widest text-ew-muted-foreground/60 mb-3 px-2">
                            <span>Account</span>
                            <span>ACV</span>
                            <span>Products</span>
                            <span className="text-right">Match</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              { name: 'Binaxity Holdings', acv: '$54K', prods: 'Auth, Identity, Balance, Platform', match: 95 },
                              { name: 'NovaPay Labs', acv: '$31K', prods: 'Auth, Balance, Identity', match: 88 },
                              { name: 'Meridian Fintech', acv: '$22K', prods: 'Auth, Identity', match: 74 }
                            ].map((row, i) => (
                              <div key={i} className="grid grid-cols-[1fr_60px_160px_80px] items-center p-4 bg-ew-background/40 hover:bg-ew-background rounded-xl border border-ew-border/30 hover:border-ew-border/80 transition-all text-xs">
                                <span className="font-bold text-ew-foreground">{row.name}</span>
                                <span className="text-ew-muted-foreground font-medium">{row.acv}</span>
                                <span className="text-ew-muted-foreground text-[10px] opacity-70">{row.prods}</span>
                                <div className="flex items-center gap-2 justify-end">
                                  <div className="w-12 h-1 bg-ew-border/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-ew-primary shadow-[0_0_8px_rgba(0,0,0,0.2)]" style={{ width: `${row.match}%` }} />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </IntelCard>
                    </div>
                  )}

                  {processStep >= 0 && (
                    <div className="order-5">
                      <IntelCard title="Opportunity context loaded" icon={Monitor} isComplete={processStep > 0} subtitle="1.3s">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-bold text-ew-foreground">Al Mabrook – ABI <span className="font-normal text-ew-muted-foreground px-2 opacity-50">|</span> <span className="font-normal text-ew-muted-foreground text-xs uppercase tracking-wider">Fintech / Alternative Investments • SMB • USA</span></p>
                            <p className="text-xs text-ew-muted-foreground mt-2 font-medium tracking-tight">Qualified ACV $24,000 • 9 employees • Discovery stage</p>
                            <p className="text-xs text-ew-muted-foreground opacity-80">Platform fee: $1,000/mo • Usage commitment: $1,000/mo</p>
                          </div>
                        </div>
                      </IntelCard>
                    </div>
                  )}
                </div>

                {/* Right Column: Parameters & Evidence */}
                <div className="w-[360px] p-10 space-y-12 bg-white overflow-y-auto custom-scrollbar">
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-ew-muted-foreground/60 mb-8 pb-2 border-b border-ew-border/30">Deal Parameters</h3>
                    <div className="space-y-5">
                      {[
                        { label: 'Type', value: 'New Customer' },
                        { label: 'Stage', value: 'Discovery' },
                        { label: 'GTM', value: 'SMB' },
                        { label: 'Region', value: 'USA' },
                        { label: 'Vertical', value: 'Fintech' },
                        { label: 'Subvertical', value: 'Alt. Investments' }
                      ].map((param, i) => (
                        <div key={i} className="flex justify-between items-baseline group">
                          <span className="text-[11px] text-ew-muted-foreground font-medium group-hover:text-ew-foreground transition-colors">{param.label}</span>
                          <span className="text-xs font-black text-ew-foreground tracking-tight">{param.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-ew-muted-foreground/60 mb-8 pb-2 border-b border-ew-border/30">Evidence</h3>
                    <div className="space-y-8">
                      <div className="relative pl-6 border-l-2 border-ew-border hover:border-brand-accent-gold transition-colors py-1">
                        <p className="text-[10px] font-black text-ew-foreground mb-2 uppercase tracking-widest">10/15/2025 Call</p>
                        <p className="text-[12px] text-ew-muted-foreground leading-relaxed font-medium">
                          $1K/mo platform fee, $2/acct bundled rate, 750 users Q1/Q2
                        </p>
                      </div>
                      <div className="relative pl-6 border-l-2 border-ew-border hover:border-brand-accent-gold transition-colors py-1">
                        <p className="text-[10px] font-black text-ew-foreground mb-2 uppercase tracking-widest">10/08/2025 Call</p>
                        <p className="text-[12px] text-ew-muted-foreground leading-relaxed font-medium">
                          Unified provider for Identity, Balance (checking) for bank account linking
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Level Overlay when complete */}
              {processStep >= 5 && (
                <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-3xl flex items-center justify-center p-8">
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     className="p-14 bg-white border border-ew-border shadow-[0_64px_128px_-16px_rgba(0,0,0,0.12)] rounded-[56px] text-center max-w-2xl w-full border-t-white relative"
                  >
                     <div className="absolute inset-x-0 top-0 h-40 bg-brand-accent-gold/10 blur-[100px] pointer-events-none rounded-full" />
                     <div className="relative z-10">
                        <div className="w-24 h-24 bg-ew-primary rounded-full flex items-center justify-center mx-auto mb-10 ring-12 ring-ew-primary/5 shadow-2xl">
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-ew-foreground mb-4 tracking-tighter">Quote Generated Successfully</h2>
                        <p className="text-lg text-ew-muted-foreground mb-14 font-medium opacity-80">Your optimized quote is ready for review.</p>

                        <div className="grid grid-cols-4 gap-4 mb-14">
                           {[
                             { label: 'Confidence', value: 'HIGH', color: 'text-ew-primary' },
                             { label: 'Products', value: '4', color: 'text-ew-foreground' },
                             { label: 'Similar', value: '1', color: 'text-ew-foreground' },
                             { label: 'Recommended', value: '4', color: 'text-ew-foreground' }
                           ].map((stat, i) => (
                             <div key={i} className="p-6 bg-ew-background/50 border border-ew-border/50 rounded-[28px] shadow-sm">
                                <span className="text-[10px] uppercase font-black text-ew-muted-foreground/60 block mb-3 tracking-[0.2em]">{stat.label}</span>
                                <span className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
                             </div>
                           ))}
                        </div>

                        <div className="flex items-center gap-5">
                           <Button
                             color="white"
                             label="Close"
                             className="flex-1 justify-center"
                             onClick={() => { setIsCopilotOpen(false); setProcessStep(-1); }}
                           />
                           <Button
                             color="primary"
                             label="View Optimized Quote"
                             className="flex-1 justify-center"
                             onClick={() => { setIsCopilotOpen(false); setCurrentView('pricing-options'); }}
                           />
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

