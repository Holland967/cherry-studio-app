import React from 'react'
import {
  Save,
  Store,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  AtSign,
  AudioLines,
  BrushCleaning,
  Camera,
  Check,
  ChevronDown,
  ChevronsRight,
  CircleCheck,
  CircleDollarSign,
  CirclePause,
  Cloud,
  Copy,
  Copyright,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Folder,
  FolderClosed,
  FolderOpen,
  FolderSearch2,
  Github,
  Globe,
  HardDrive,
  HeartPulse,
  Palette,
  Image,
  Hammer,
  ImageOff,
  Info,
  Languages,
  Lightbulb,
  CircleUserRound,
  LucideIcon,
  Mail,
  Menu,
  MessageSquareDiff,
  MessageSquareMore,
  Minus,
  MoreHorizontal,
  Package,
  PenLine,
  Plus,
  SquareFunction,
  RefreshCw,
  Repeat2,
  Rocket,
  RotateCcw,
  Rss,
  ScanQrCode,
  Search,
  Settings,
  Settings2,
  ChevronRight,
  Share,
  ShieldCheck,
  Sparkles,
  Wrench,
  TextSelect,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  Wifi,
  ArrowUp,
  X,
  XCircle
} from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import { cn } from 'heroui-native'

function interopIcon(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true
      }
    }
  })
}

interopIcon(Save)
interopIcon(Store)
interopIcon(ArrowUp)
interopIcon(ArrowLeft)
interopIcon(ArrowLeftRight)
interopIcon(ArrowUpRight)
interopIcon(AtSign)
interopIcon(AudioLines)
interopIcon(BrushCleaning)
interopIcon(Camera)
interopIcon(Check)
interopIcon(ChevronDown)
interopIcon(ChevronsRight)
interopIcon(CircleCheck)
interopIcon(CircleDollarSign)
interopIcon(CirclePause)
interopIcon(CircleUserRound)
interopIcon(Cloud)
interopIcon(Copy)
interopIcon(Hammer)
interopIcon(Copyright)
interopIcon(Download)
interopIcon(Edit3)
interopIcon(Eye)
interopIcon(EyeOff)
interopIcon(FileText)
interopIcon(Folder)
interopIcon(FolderClosed)
interopIcon(FolderOpen)
interopIcon(FolderSearch2)
interopIcon(Github)
interopIcon(Globe)
interopIcon(HardDrive)
interopIcon(HeartPulse)
interopIcon(Palette)
interopIcon(Image)
interopIcon(ImageOff)
interopIcon(Info)
interopIcon(Languages)
interopIcon(Lightbulb)
interopIcon(Mail)
interopIcon(Menu)
interopIcon(MessageSquareDiff)
interopIcon(MessageSquareMore)
interopIcon(Minus)
interopIcon(MoreHorizontal)
interopIcon(Package)
interopIcon(PenLine)
interopIcon(Plus)
interopIcon(SquareFunction)
interopIcon(RefreshCw)
interopIcon(Repeat2)
interopIcon(Rocket)
interopIcon(RotateCcw)
interopIcon(Rss)
interopIcon(ScanQrCode)
interopIcon(Search)
interopIcon(Settings2)
interopIcon(ChevronRight)
interopIcon(Share)
interopIcon(ShieldCheck)
interopIcon(Sparkles)
interopIcon(Wrench)
interopIcon(TextSelect)
interopIcon(ThumbsUp)
interopIcon(Trash2)
interopIcon(TriangleAlert)
interopIcon(Wifi)
interopIcon(X)
interopIcon(XCircle)
interopIcon(Settings)

function withDefaultIconClass<T extends LucideIcon>(Icon: T): T {
  const Wrapped = (({ className, ...props }: any) => (
    <Icon className={cn('text-black dark:text-white', className)} {...props} />
  )) as unknown as T
  return Wrapped
}

const SaveIcon = withDefaultIconClass(Save)
const StoreIcon = withDefaultIconClass(Store)
const HammerIcon = withDefaultIconClass(Hammer)
const ArrowUpIcon = withDefaultIconClass(ArrowUp)
const ArrowLeftIcon = withDefaultIconClass(ArrowLeft)
const ArrowLeftRightIcon = withDefaultIconClass(ArrowLeftRight)
const ArrowUpRightIcon = withDefaultIconClass(ArrowUpRight)
const AtSignIcon = withDefaultIconClass(AtSign)
const AudioLinesIcon = withDefaultIconClass(AudioLines)
const BrushCleaningIcon = withDefaultIconClass(BrushCleaning)
const CameraIcon = withDefaultIconClass(Camera)
const CheckIcon = withDefaultIconClass(Check)
const ChevronDownIcon = withDefaultIconClass(ChevronDown)
const ChevronsRightIcon = withDefaultIconClass(ChevronsRight)
const CircleCheckIcon = withDefaultIconClass(CircleCheck)
const CircleDollarSignIcon = withDefaultIconClass(CircleDollarSign)
const CirclePauseIcon = withDefaultIconClass(CirclePause)
const CloudIcon = withDefaultIconClass(Cloud)
const CopyIcon = withDefaultIconClass(Copy)
const CopyrightIcon = withDefaultIconClass(Copyright)
const DownloadIcon = withDefaultIconClass(Download)
const Edit3Icon = withDefaultIconClass(Edit3)
const EyeIcon = withDefaultIconClass(Eye)
const EyeOffIcon = withDefaultIconClass(EyeOff)
const FileTextIcon = withDefaultIconClass(FileText)
const FolderIcon = withDefaultIconClass(Folder)
const FolderClosedIcon = withDefaultIconClass(FolderClosed)
const FolderOpenIcon = withDefaultIconClass(FolderOpen)
const FolderSearch2Icon = withDefaultIconClass(FolderSearch2)
const GithubIcon = withDefaultIconClass(Github)
const GlobeIcon = withDefaultIconClass(Globe)
const HardDriveIcon = withDefaultIconClass(HardDrive)
const HeartPulseIcon = withDefaultIconClass(HeartPulse)
const PaletteIcon = withDefaultIconClass(Palette)
const ImageIcon = withDefaultIconClass(Image)
const ImageOffIcon = withDefaultIconClass(ImageOff)
const InfoIcon = withDefaultIconClass(Info)
const LanguagesIcon = withDefaultIconClass(Languages)
const LightbulbIcon = withDefaultIconClass(Lightbulb)
const CircleUserRoundIcon = withDefaultIconClass(CircleUserRound)
const MailIcon = withDefaultIconClass(Mail)
const MenuIcon = withDefaultIconClass(Menu)
const MessageSquareDiffIcon = withDefaultIconClass(MessageSquareDiff)
const MessageSquareMoreIcon = withDefaultIconClass(MessageSquareMore)
const MinusIcon = withDefaultIconClass(Minus)
const MoreHorizontalIcon = withDefaultIconClass(MoreHorizontal)
const PackageIcon = withDefaultIconClass(Package)
const PenLineIcon = withDefaultIconClass(PenLine)
const PlusIcon = withDefaultIconClass(Plus)
const SquareFunctionIcon = withDefaultIconClass(SquareFunction)
const RefreshCwIcon = withDefaultIconClass(RefreshCw)
const Repeat2Icon = withDefaultIconClass(Repeat2)
const RocketIcon = withDefaultIconClass(Rocket)
const RotateCcwIcon = withDefaultIconClass(RotateCcw)
const RssIcon = withDefaultIconClass(Rss)
const ScanQrCodeIcon = withDefaultIconClass(ScanQrCode)
const SearchIcon = withDefaultIconClass(Search)
const Settings2Icon = withDefaultIconClass(Settings2)
const ChevronRightIcon = withDefaultIconClass(ChevronRight)
const ShareIcon = withDefaultIconClass(Share)
const ShieldCheckIcon = withDefaultIconClass(ShieldCheck)
const SparklesIcon = withDefaultIconClass(Sparkles)
const WrenchIcon = withDefaultIconClass(Wrench)
const TextSelectIcon = withDefaultIconClass(TextSelect)
const ThumbsUpIcon = withDefaultIconClass(ThumbsUp)
const Trash2Icon = withDefaultIconClass(Trash2)
const TriangleAlertIcon = withDefaultIconClass(TriangleAlert)
const WifiIcon = withDefaultIconClass(Wifi)
const XIcon = withDefaultIconClass(X)
const XCircleIcon = withDefaultIconClass(XCircle)
const SettingsIcon = withDefaultIconClass(Settings)

export {
  SaveIcon as Save,
  StoreIcon as Store,
  ArrowUpIcon as ArrowUp,
  ArrowLeftIcon as ArrowLeft,
  ArrowLeftRightIcon as ArrowLeftRight,
  ArrowUpRightIcon as ArrowUpRight,
  AtSignIcon as AtSign,
  AudioLinesIcon as AudioLines,
  BrushCleaningIcon as BrushCleaning,
  CameraIcon as Camera,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  ChevronsRightIcon as ChevronsRight,
  CircleCheckIcon as CircleCheck,
  CircleDollarSignIcon as CircleDollarSign,
  CirclePauseIcon as CirclePause,
  CloudIcon as Cloud,
  CopyIcon as Copy,
  CopyrightIcon as Copyright,
  DownloadIcon as Download,
  Edit3Icon as Edit3,
  EyeIcon as Eye,
  EyeOffIcon as EyeOff,
  FileTextIcon as FileText,
  FolderIcon as Folder,
  FolderClosedIcon as FolderClosed,
  FolderOpenIcon as FolderOpen,
  FolderSearch2Icon as FolderSearch2,
  GithubIcon as Github,
  GlobeIcon as Globe,
  HardDriveIcon as HardDrive,
  HeartPulseIcon as HeartPulse,
  PaletteIcon as Palette,
  ImageIcon as Image,
  ImageOffIcon as ImageOff,
  HammerIcon as Hammer,
  InfoIcon as Info,
  LanguagesIcon as Languages,
  LightbulbIcon as Lightbulb,
  CircleUserRoundIcon as CircleUserRound,
  MailIcon as Mail,
  MenuIcon as Menu,
  MessageSquareDiffIcon as MessageSquareDiff,
  MessageSquareMoreIcon as MessageSquareMore,
  MinusIcon as Minus,
  MoreHorizontalIcon as MoreHorizontal,
  PackageIcon as Package,
  PenLineIcon as PenLine,
  PlusIcon as Plus,
  SquareFunctionIcon as SquareFunction,
  RefreshCwIcon as RefreshCw,
  Repeat2Icon as Repeat2,
  RocketIcon as Rocket,
  RotateCcwIcon as RotateCcw,
  RssIcon as Rss,
  ScanQrCodeIcon as ScanQrCode,
  SearchIcon as Search,
  Settings2Icon as Settings2,
  ChevronRightIcon as ChevronRight,
  ShareIcon as Share,
  ShieldCheckIcon as ShieldCheck,
  SparklesIcon as Sparkles,
  WrenchIcon as Wrench,
  TextSelectIcon as TextSelect,
  ThumbsUpIcon as ThumbsUp,
  Trash2Icon as Trash2,
  TriangleAlertIcon as TriangleAlert,
  WifiIcon as Wifi,
  XIcon as X,
  XCircleIcon as XCircle,
  SettingsIcon as Settings
}
