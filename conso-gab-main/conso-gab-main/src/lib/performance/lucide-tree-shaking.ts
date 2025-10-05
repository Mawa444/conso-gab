/**
 * Tree-shaking pour lucide-react
 * 
 * Ce fichier centralise tous les imports d'icônes lucide
 * pour assurer un tree-shaking optimal du bundle
 * 
 * IMPORTANT: Toujours importer les icônes depuis ce fichier
 * au lieu de les importer directement depuis 'lucide-react'
 */

// Navigation & UI
export { 
  Home,
  Search,
  MapPin,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Settings,
  User,
  LogOut,
  LogIn
} from 'lucide-react';

// Business & Commerce
export {
  Store,
  Building,
  Building2,
  ShoppingCart,
  ShoppingBag,
  Package,
  Briefcase,
  Users,
  UserPlus,
  Crown,
  Award
} from 'lucide-react';

// Communication
export {
  MessageCircle,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Share2,
  Bell,
  BellRing,
  Video,
  Mic,
  Image as ImageIcon,
  File,
  Paperclip
} from 'lucide-react';

// Actions & Status
export {
  Heart,
  Star,
  ThumbsUp,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  RefreshCw,
  MoreVertical,
  MoreHorizontal,
  Edit,
  Edit2,
  Trash,
  Trash2,
  Copy,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';

// Media & Content
export {
  Camera,
  Film,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

// Layout & Organization
export {
  Grid,
  Grid3x3,
  List,
  Filter,
  SlidersHorizontal,
  Calendar,
  Clock,
  Tag,
  Bookmark,
  Folder,
  FolderOpen
} from 'lucide-react';

// Location & Map
export {
  Navigation,
  Compass,
  Map as MapIcon,
  Target,
  Navigation2
} from 'lucide-react';

// Payment & Finance
export {
  CreditCard,
  DollarSign,
  Wallet,
  Receipt,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart
} from 'lucide-react';

// Security & Privacy
export {
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Key,
  Fingerprint
} from 'lucide-react';

// Utility
export {
  Link,
  Link2,
  Copy as CopyIcon,
  Clipboard,
  QrCode,
  Scan,
  Zap,
  Wifi,
  WifiOff,
  Power,
  Battery,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

/**
 * NOTE: Pour ajouter une nouvelle icône:
 * 1. L'importer ici depuis lucide-react
 * 2. L'exporter dans la catégorie appropriée
 * 3. L'utiliser via cet import centralisé dans vos composants
 * 
 * Exemple:
 * import { Home, Search } from '@/lib/performance/lucide-tree-shaking';
 */
