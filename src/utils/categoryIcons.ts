import {
  Bus,
  Gift,
  GraduationCap,
  Home,
  MoreHorizontal,
  PiggyBank,
  ShieldCheck,
  ShoppingBag,
  Utensils,
  Wallet,
  Wifi,
} from 'lucide-react-native';

export function getCategoryIcon(category: string) {
  switch (category) {
    case 'Food':
      return Utensils;
    case 'Transport':
      return Bus;
    case 'School':
      return GraduationCap;
    case 'Bills':
      return Home;
    case 'Health':
      return ShieldCheck;
    case 'Shopping':
      return ShoppingBag;
    case 'Data':
      return Wifi;
    case 'Savings':
      return PiggyBank;
    case 'Salary':
    case 'Allowance':
    case 'Business':
      return Wallet;
    case 'Gift':
      return Gift;
    default:
      return MoreHorizontal;
  }
}
