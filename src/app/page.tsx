'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Star,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  TrendingUp,
  Truck,
  ArrowLeft,
  Settings,
} from 'lucide-react';

/**
 * TYPES & INTERFACES
 */
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
  unit: string;
}

interface CartItem extends Product {
  qty: number;
}

interface CheckoutData {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

interface Order {
  id: string;
  date: string;
  customer: CheckoutData;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Paid' | 'Completed' | 'Waiting for Payment';
  paymentMethod: string;
  paymentDetails?: {
    accountName: string;
    vaNumber: string;
    expiryTime: string;
  };
}

interface PaymentMethodOption {
  id: string;
  name: string;
  icon: string;
  type: 'VA' | 'EWALLET' | 'COD';
}

type ViewState =
  | 'home'
  | 'shop'
  | 'product_detail'
  | 'cart'
  | 'checkout'
  | 'success'
  | 'admin';
type UserRole = 'customer' | 'admin' | null;
type AdminTabState = 'overview' | 'products' | 'orders';

/**
 * MOCK DATA & CONSTANTS
 */
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Telur Ayam Kampung Premium',
    price: 45000,
    category: 'Telur',
    image:
      'https://images.unsplash.com/photo-1563822248828-fd50acca9ad0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Telur ayam kampung asli, kaya omega 3, dipanen setiap pagi. Cocok untuk kesehatan keluarga.',
    stock: 50,
    unit: 'tray (30 butir)',
  },
  {
    id: 2,
    name: 'Dada Ayam Fillet Segar',
    price: 55000,
    category: 'Daging Ayam',
    image:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
    description:
      'Dada ayam tanpa tulang dan kulit, rendah lemak, tinggi protein. Potongan bersih dan higienis.',
    stock: 25,
    unit: 'kg',
  },
  {
    id: 3,
    name: 'Paha Ayam Utuh (Thigh)',
    price: 42000,
    category: 'Daging Ayam',
    image:
      'https://images.unsplash.com/photo-1759493321741-883fbf9f433c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'Bagian paha ayam yang juicy dan lembut. Sangat cocok untuk ayam bakar atau goreng.',
    stock: 40,
    unit: 'kg',
  },
  {
    id: 4,
    name: 'Telur Omega 3 Gold',
    price: 38000,
    category: 'Telur',
    image:
      'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    description:
      'Telur dengan kandungan Omega 3 tinggi, kuning telur berwarna oranye pekat.',
    stock: 100,
    unit: 'pack (10 butir)',
  },
  {
    id: 5,
    name: 'Ayam Utuh Karkas (0.8 - 1.0kg)',
    price: 35000,
    category: 'Daging Ayam',
    image:
      // 'https://images.unsplash.com/photo-1672787153652-b3b9d92f3e8c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1672787153720-e85fe802fd9f?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Ayam utuh segar, pemotongan syariah, bersih dari bulu.',
    stock: 15,
    unit: 'ekor',
  },
];

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'bca_va',
    name: 'BCA Virtual Account (Midtrans)',
    icon: '🏦',
    type: 'VA',
  },
  {
    id: 'permata_va',
    name: 'Permata Virtual Account (Midtrans)',
    icon: '💳',
    type: 'VA',
  },
  { id: 'gopay', name: 'GoPay / QRIS (Midtrans)', icon: '📱', type: 'EWALLET' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', type: 'COD' },
];

/**
 * UTILS
 */
const formatIDR = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

// SIMULASI MIDTRANS PAYMENT GENERATION
const generatePaymentDetails = (
  methodId: string,
  total: number
): Order['paymentDetails'] => {
  const baseDetails = {
    expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(
      'id-ID',
      {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    ), // 24 hours expiry
  };

  switch (methodId) {
    case 'bca_va':
      return {
        ...baseDetails,
        accountName: 'BCA',
        vaNumber: '7008890123456789',
      };
    case 'permata_va':
      return {
        ...baseDetails,
        accountName: 'Permata Bank',
        vaNumber: '852029876543210',
      };
    case 'gopay':
      return {
        ...baseDetails,
        accountName: 'GOPAY',
        vaNumber: 'QR Code Generated (Simulasi)',
      };
    default:
      return undefined;
  }
};

/**
 * COMPONENTS
 */

// 1. UI PRIMITIVES
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyle =
    'px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const variants = {
    primary:
      'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200',
    secondary:
      'bg-white text-orange-600 border-2 border-orange-100 hover:border-orange-200 hover:bg-orange-50',
    outline: 'border border-stone-300 text-stone-600 hover:bg-stone-50',
    ghost: 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'blue' | 'stone' | 'white';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'green',
  className = '',
}) => {
  const colors = {
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
    stone: 'bg-stone-100 text-stone-700',
    white: 'bg-white text-stone-700',
  };
  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-medium ${colors[color]} ${className}`}
    >
      {children}
    </span>
  );
};

// 2. MAIN APPLICATION COMPONENT
export default function App() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState<ViewState>('home');
  const [user, setUser] = useState<UserRole>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null); // NEW STATE FOR ORDER DATA
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Admin Dashboard States
  const [adminTab, setAdminTab] = useState<AdminTabState>('overview');

  // Checkout Form State
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    name: '',
    phone: '',
    address: '',
    paymentMethod: '',
  });

  // --- SEARCH LOGIC FIX ---
  // Gunakan useEffect untuk mengubah tampilan SAAT query sudah berubah dan hanya jika perlu
  useEffect(() => {
    // Jika ada query pencarian dan tampilan BUKAN Shop, pindahkan ke Shop.
    // Ini mencegah input kehilangan fokus karena state view diubah saat on change.
    if (searchQuery.length > 0 && view !== 'shop') {
      // Mengatur view dalam timeout 0ms memungkinkan event onChange menyelesaikan prosesnya
      // sebelum state view berubah, menjaga fokus.
      const timer = setTimeout(() => {
        setView('shop');
      }, 0);
      return () => clearTimeout(timer);
    }
    // Jika query kosong dan tampilan saat ini adalah Shop, kita tidak perlu otomatis pindah ke Home.
    // Membiarkan user di Shop setelah menghapus query adalah UX yang baik.
  }, [searchQuery, view]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Logika pindah halaman sekarang ditangani di useEffect di atas.
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // --- ACTIONS ---

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setView('checkout');
  };

  const processPayment = () => {
    const selectedMethod = PAYMENT_METHODS.find(
      (m) => m.id === checkoutData.paymentMethod
    );
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const isMidtrans = selectedMethod?.type !== 'COD';

    setTimeout(() => {
      const paymentDetails = isMidtrans
        ? generatePaymentDetails(checkoutData.paymentMethod, total)
        : undefined;

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        date: new Date().toLocaleDateString('id-ID'),
        customer: checkoutData,
        items: cart,
        total: total,
        status: isMidtrans ? 'Waiting for Payment' : 'Pending',
        paymentMethod: selectedMethod?.name || 'Unknown',
        paymentDetails: paymentDetails,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);

      // FIX: Use the new state variable setLastOrder for the Order object.
      setLastOrder(newOrder);
      setSelectedProduct(null); // Clear selected product just in case

      setView('success');
    }, 1500);
  };

  // --- VIEWS ---

  const Navbar = () => (
    <nav className='sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-20'>
          {/* Logo */}
          <div
            className='flex items-center gap-2 cursor-pointer'
            onClick={() => setView('home')}
          >
            <div className='w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white'>
              <ShoppingBag size={20} fill='currentColor' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-stone-800 leading-none'>
                Segar<span className='text-orange-500'>Farm</span>
              </h1>
              <p className='text-xs text-stone-500 font-medium'>
                Fresh Eggs & Meat
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className='hidden md:flex items-center space-x-8'>
            <button
              onClick={() => {
                setView('home');
                clearSearch();
              }}
              className={`text-sm font-medium ${view === 'home' ? 'text-orange-500' : 'text-stone-600 hover:text-orange-500'}`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setView('shop');
                clearSearch();
              }}
              className={`text-sm font-medium ${view === 'shop' ? 'text-orange-500' : 'text-stone-600 hover:text-orange-500'}`}
            >
              Shop
            </button>
            {user === 'admin' && (
              <button
                onClick={() => setView('admin')}
                className='text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full'
              >
                Dashboard
              </button>
            )}
          </div>

          {/* Actions */}
          <div className='flex items-center gap-4'>
            <div className='hidden md:flex relative group'>
              {/* Penting: Tambahkan key agar elemen input tidak di-reset saat state berubah */}
              <input
                key='desktop-search'
                type='text'
                placeholder='Cari ayam, telur...'
                className='pl-10 pr-10 py-2 rounded-full bg-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 w-48 transition-all focus:w-64'
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search
                className='absolute left-3 top-2.5 text-stone-400'
                size={18}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className='absolute right-3 top-2.5 text-stone-400 hover:text-stone-600'
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div
              className='relative cursor-pointer'
              onClick={() => setView('cart')}
            >
              <ShoppingBag
                className='text-stone-700 hover:text-orange-500 transition-colors'
                size={24}
              />
              {cart.length > 0 && (
                <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm'>
                  {cart.length}
                </span>
              )}
            </div>

            {user ? (
              <div className='relative group'>
                <div className='w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center cursor-pointer'>
                  <User size={18} className='text-orange-600' />
                </div>
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 hidden group-hover:block p-2'>
                  <div className='px-4 py-2 text-xs font-semibold text-stone-400 uppercase'>
                    Account
                  </div>
                  <button
                    onClick={() => setUser(null)}
                    className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2'
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant='ghost'
                className='hidden md:flex'
                onClick={() => setUser('customer')}
              >
                Masuk
              </Button>
            )}

            <button
              className='md:hidden'
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden bg-white border-b border-stone-100 px-4 py-4 space-y-4'>
          <input
            key='mobile-search'
            type='text'
            placeholder='Search...'
            className='w-full pl-4 pr-4 py-2 rounded-lg bg-stone-100 text-sm'
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className='flex flex-col space-y-2'>
            <button
              onClick={() => {
                setView('home');
                clearSearch();
                setIsMobileMenuOpen(false);
              }}
              className='text-left font-medium py-2'
            >
              Home
            </button>
            <button
              onClick={() => {
                setView('shop');
                clearSearch();
                setIsMobileMenuOpen(false);
              }}
              className='text-left font-medium py-2'
            >
              Shop
            </button>
            <button
              onClick={() => {
                setUser('admin');
                setView('admin');
                setIsMobileMenuOpen(false);
              }}
              className='text-left font-medium py-2 text-orange-500'
            >
              Login as Admin (Demo)
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  const HeroSection = () => (
    <div className='relative bg-orange-50 overflow-hidden'>
      <div className='absolute top-0 right-0 w-1/2 h-full bg-orange-100/50 rounded-l-[100px] transform translate-x-20' />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <Badge color='orange'>Fresh from Farm</Badge>
            <h1 className='text-5xl md:text-6xl font-bold text-stone-800 leading-tight'>
              Kualitas Terbaik untuk{' '}
              <span className='text-orange-500'>Keluarga Sehat</span>
            </h1>
            <p className='text-lg text-stone-600 max-w-md leading-relaxed'>
              Kami menyediakan daging ayam segar dan telur pilihan langsung dari
              peternakan modern yang higienis. 100% Halal & Alami.
            </p>
            <div className='flex gap-4 pt-4'>
              <Button
                onClick={() => setView('shop')}
                className='shadow-orange-300/50 shadow-lg'
              >
                Belanja Sekarang
              </Button>
              <Button variant='secondary'>Tentang Kami</Button>
            </div>
            <div className='flex items-center gap-6 pt-8'>
              <div className='flex -space-x-3'>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className='w-10 h-10 rounded-full border-2 border-white bg-stone-200 overflow-hidden'
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt='user'
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className='flex text-yellow-400 text-sm'>
                  <Star fill='currentColor' size={16} />
                  <Star fill='currentColor' size={16} />
                  <Star fill='currentColor' size={16} />
                  <Star fill='currentColor' size={16} />
                  <Star fill='currentColor' size={16} />
                </div>
                <p className='text-sm text-stone-500 font-medium'>
                  1.5k+ Happy Moms
                </p>
              </div>
            </div>
          </div>
          <div className='relative'>
            <div className='absolute inset-0 bg-orange-300 rounded-full filter blur-3xl opacity-20 transform scale-90 animate-pulse'></div>
            <img
              src='https://images.unsplash.com/photo-1598103356248-243743125c5a?auto=format&fit=crop&w=800&q=80'
              alt='Chicken and Eggs'
              className='relative rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500'
            />
            <div className='absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce'>
              <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600'>
                <Truck size={20} />
              </div>
              <div>
                <p className='text-xs text-stone-400'>Pengiriman</p>
                <p className='text-sm font-bold text-stone-800'>Cepat & Aman</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <div className='group bg-white rounded-2xl border border-stone-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden flex flex-col h-full'>
      <div
        className='relative h-48 overflow-hidden bg-stone-100 cursor-pointer'
        onClick={() => {
          setSelectedProduct(product);
          setView('product_detail');
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
        />
        <div className='absolute top-3 left-3'>
          <Badge
            color='white'
            className='shadow-sm backdrop-blur-sm bg-white/90'
          >
            {product.category}
          </Badge>
        </div>
      </div>
      <div className='p-5 flex flex-col flex-1'>
        <div
          className='flex-1 cursor-pointer'
          onClick={() => {
            setSelectedProduct(product);
            setView('product_detail');
          }}
        >
          <h3 className='font-bold text-stone-800 text-lg mb-1 group-hover:text-orange-600 transition-colors'>
            {product.name}
          </h3>
          <p className='text-stone-500 text-sm line-clamp-2 mb-3'>
            {product.description}
          </p>
        </div>
        <div className='mt-4 flex items-center justify-between'>
          <div>
            <span className='text-xs text-stone-400'>
              Harga per {product.unit}
            </span>
            <p className='text-xl font-bold text-orange-600'>
              {formatIDR(product.price)}
            </p>
          </div>
          <button
            onClick={() => addToCart(product)}
            className='w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all shadow-sm'
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const ShopView = () => {
    // Filter logika pencarian (Nama atau Kategori)
    const filteredProducts = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='flex flex-col md:flex-row justify-between items-end mb-8 gap-4'>
          <div>
            <h2 className='text-3xl font-bold text-stone-800'>
              {searchQuery
                ? `Hasil Pencarian: "${searchQuery}"`
                : 'Belanja Produk Segar'}
            </h2>
            <p className='text-stone-500 mt-2'>
              {searchQuery
                ? `Ditemukan ${filteredProducts.length} produk`
                : 'Pilih produk favoritmu hari ini'}
            </p>
          </div>
          {!searchQuery && (
            <div className='flex gap-2 overflow-x-auto pb-2'>
              {['Semua', 'Telur', 'Daging Ayam'].map((cat) => (
                // Simulasi filter kategori sederhana (tidak diimplementasikan)
                <button
                  key={cat}
                  className='px-4 py-2 rounded-full border border-stone-200 text-sm font-medium hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 whitespace-nowrap bg-white'
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className='text-center py-20 text-stone-500'>
            <p className='mb-4'>
              Produk tidak ditemukan untuk kata kunci: **{searchQuery}**.
            </p>
            <Button variant='ghost' onClick={clearSearch}>
              Hapus Pencarian
            </Button>
          </div>
        )}
      </div>
    );
  };

  const ProductDetailView = () => {
    if (!selectedProduct) return null;
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <button
          onClick={() => setView('shop')}
          className='mb-6 text-stone-500 hover:text-orange-600 flex items-center gap-2'
        >
          <ArrowLeft size={20} /> Kembali
        </button>
        <div className='bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-stone-100'>
          <div className='grid md:grid-cols-2 gap-12'>
            <div className='rounded-2xl overflow-hidden bg-stone-100 h-[400px]'>
              <img
                src={selectedProduct.image}
                className='w-full h-full object-cover'
                alt={selectedProduct.name}
              />
            </div>
            <div className='flex flex-col justify-center space-y-6'>
              <div>
                <Badge color='orange'>{selectedProduct.category}</Badge>
                <h1 className='text-3xl md:text-4xl font-bold text-stone-800 mt-3 mb-2'>
                  {selectedProduct.name}
                </h1>
                <p className='text-2xl font-bold text-orange-600'>
                  {formatIDR(selectedProduct.price)}{' '}
                  <span className='text-sm text-stone-400 font-normal'>
                    / {selectedProduct.unit}
                  </span>
                </p>
              </div>

              <p className='text-stone-600 leading-relaxed'>
                {selectedProduct.description}
              </p>

              <div className='border-t border-b border-stone-100 py-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600'>
                    <CheckCircle size={16} />
                  </div>
                  <span className='text-sm text-stone-600'>
                    Stok Tersedia: <strong>{selectedProduct.stock}</strong>
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600'>
                    <Truck size={16} />
                  </div>
                  <span className='text-sm text-stone-600'>
                    Pengiriman Instant tersedia (Gojek/Grab)
                  </span>
                </div>
              </div>

              <div className='flex gap-4'>
                <Button
                  className='flex-1 h-12 text-lg'
                  onClick={() => {
                    addToCart(selectedProduct);
                    setView('cart');
                  }}
                >
                  <ShoppingBag size={20} /> Masukkan Keranjang
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartView = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    return (
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <h2 className='text-2xl font-bold text-stone-800 mb-8'>
          Keranjang Belanja Anda
        </h2>

        {cart.length === 0 ? (
          <div className='text-center py-20 bg-stone-50 rounded-2xl border-dashed border-2 border-stone-200'>
            <div className='w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400'>
              <ShoppingBag size={32} />
            </div>
            <p className='text-stone-500 mb-6'>Keranjang masih kosong nih.</p>
            <Button onClick={() => setView('shop')}>Mulai Belanja</Button>
          </div>
        ) : (
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='md:col-span-2 space-y-4'>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className='bg-white p-4 rounded-xl border border-stone-100 flex gap-4 items-center'
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className='w-20 h-20 rounded-lg object-cover bg-stone-100'
                  />
                  <div className='flex-1'>
                    <h4 className='font-bold text-stone-800'>{item.name}</h4>
                    <p className='text-orange-600 font-medium text-sm'>
                      {formatIDR(item.price)}
                    </p>
                  </div>
                  <div className='flex items-center gap-3 bg-stone-50 rounded-lg p-1'>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      disabled={item.qty <= 1}
                      className='w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-stone-600 hover:bg-orange-100 hover:text-orange-600 disabled:opacity-50'
                    >
                      <Minus size={14} />
                    </button>
                    <span className='text-sm font-bold w-4 text-center'>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className='w-7 h-7 rounded-md bg-white shadow-sm flex items-center justify-center text-stone-600 hover:bg-orange-100 hover:text-orange-600'
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className='text-stone-400 hover:text-red-500 p-2'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className='h-fit space-y-6'>
              <div className='bg-white p-6 rounded-2xl border border-stone-100 shadow-sm'>
                <h3 className='font-bold text-lg mb-4'>Ringkasan</h3>
                <div className='space-y-3 mb-6 border-b border-stone-100 pb-6'>
                  <div className='flex justify-between text-sm text-stone-600'>
                    <span>Subtotal</span>
                    <span>{formatIDR(total)}</span>
                  </div>
                  <div className='flex justify-between text-sm text-stone-600'>
                    <span>Biaya Layanan (Midtrans Simulasi)</span>
                    <span>Rp 2.500</span>
                  </div>
                </div>
                <div className='flex justify-between font-bold text-lg text-stone-800 mb-6'>
                  <span>Total</span>
                  <span className='text-orange-600'>
                    {formatIDR(total + 2500)}
                  </span>
                </div>
                <Button className='w-full' onClick={handleCheckout}>
                  Checkout Sekarang
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CheckoutView = () => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalFinal = total + 2500; // Total + Biaya Layanan
    const [loading, setLoading] = useState(false);

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      processPayment();
    };

    return (
      <div className='max-w-3xl mx-auto px-4 py-12'>
        <button
          onClick={() => setView('cart')}
          className='mb-6 text-stone-500 hover:text-orange-600 flex items-center gap-2'
        >
          <ArrowLeft size={20} /> Kembali ke Keranjang
        </button>
        <div className='bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden'>
          <div className='p-6 md:p-8 bg-orange-500 text-white'>
            <h2 className='text-2xl font-bold'>Checkout & Pengiriman</h2>
            <p className='text-orange-100'>
              Lengkapi data untuk menyelesaikan pesanan.
            </p>
          </div>

          <form onSubmit={onSubmit} className='p-6 md:p-8 space-y-8'>
            {/* Section 1: Data Diri */}
            <div className='space-y-4'>
              <h3 className='font-bold text-stone-800 flex items-center gap-2'>
                <User size={20} className='text-orange-500' /> Informasi
                Penerima
              </h3>
              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-medium text-stone-500 mb-1'>
                    Nama Lengkap
                  </label>
                  <input
                    required
                    type='text'
                    className='w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all'
                    value={checkoutData.name}
                    onChange={(e) =>
                      setCheckoutData({ ...checkoutData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className='block text-xs font-medium text-stone-500 mb-1'>
                    Nomor WhatsApp
                  </label>
                  <input
                    required
                    type='tel'
                    className='w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all'
                    value={checkoutData.phone}
                    onChange={(e) =>
                      setCheckoutData({
                        ...checkoutData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className='block text-xs font-medium text-stone-500 mb-1'>
                  Alamat Lengkap
                </label>
                <textarea
                  required
                  rows={3}
                  className='w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all'
                  value={checkoutData.address}
                  onChange={(e) =>
                    setCheckoutData({
                      ...checkoutData,
                      address: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>

            {/* Section 2: Payment */}
            <div className='space-y-4'>
              <h3 className='font-bold text-stone-800 flex items-center gap-2'>
                <CreditCard size={20} className='text-orange-500' /> Metode
                Pembayaran (Midtrans Simulasi)
              </h3>
              <div className='grid md:grid-cols-3 gap-4'>
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    onClick={() =>
                      setCheckoutData({
                        ...checkoutData,
                        paymentMethod: method.id,
                      })
                    }
                    className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center gap-2 text-center transition-all ${checkoutData.paymentMethod === method.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-stone-100 hover:border-orange-200'}`}
                  >
                    <span className='text-2xl'>{method.icon}</span>
                    <span className='text-sm font-bold'>{method.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className='bg-stone-50 p-6 rounded-xl space-y-2'>
              <div className='flex justify-between text-stone-600'>
                <span>Subtotal</span>
                <span>{formatIDR(total)}</span>
              </div>
              <div className='flex justify-between text-stone-600 border-b border-stone-200 pb-2'>
                <span>Biaya Layanan</span>
                <span>{formatIDR(2500)}</span>
              </div>
              <div className='flex justify-between text-lg font-bold text-stone-800 pt-2'>
                <span>Total Bayar</span>
                <span className='text-orange-600'>{formatIDR(totalFinal)}</span>
              </div>
            </div>

            <Button
              type='submit'
              disabled={loading || !checkoutData.paymentMethod}
              className='w-full h-14 text-lg'
            >
              {loading
                ? 'Memproses Pesanan...'
                : `Bayar ${formatIDR(totalFinal)}`}
            </Button>
          </form>
        </div>
      </div>
    );
  };

  const SuccessView = () => {
    // FIX: Menggunakan state 'lastOrder' yang benar
    if (!lastOrder) return null;

    const isVaPayment =
      lastOrder.paymentDetails?.vaNumber &&
      lastOrder.paymentDetails.accountName !== 'GOPAY';
    const isEwallet = lastOrder.paymentDetails?.accountName === 'GOPAY';
    const isCod = lastOrder.paymentMethod === 'Cash on Delivery';

    return (
      <div className='max-w-3xl mx-auto px-4 py-12'>
        <div className='bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden text-center'>
          <div
            className={`p-8 ${isCod ? 'bg-orange-500' : 'bg-green-500'} text-white`}
          >
            <div className='w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle size={32} className='text-white' />
            </div>
            <h2 className='text-3xl font-bold mb-1'>
              Pesanan Berhasil Dibuat!
            </h2>
            <p className='font-medium'>
              {isCod ? 'Menunggu Konfirmasi' : 'Langkah Pembayaran'}
            </p>
          </div>

          <div className='p-8 text-left space-y-6'>
            <div className='bg-stone-50 p-4 rounded-xl space-y-1'>
              <p className='text-xs text-stone-400'>ID Pesanan</p>
              <p className='font-bold text-lg text-stone-800'>{lastOrder.id}</p>
              <p className='text-xs text-stone-400'>
                Tanggal: {lastOrder.date}
              </p>
            </div>

            <div className='border border-stone-100 rounded-xl p-4'>
              <div className='flex justify-between items-center mb-3 border-b border-stone-100 pb-3'>
                <h3 className='font-bold text-stone-800'>Total Bayar</h3>
                <span className='text-2xl font-bold text-orange-600'>
                  {formatIDR(lastOrder.total + 2500)}
                </span>
              </div>

              <h3 className='font-bold text-stone-800 mb-3'>
                Metode: {lastOrder.paymentMethod}
              </h3>

              {isVaPayment && (
                <div className='bg-orange-50 p-4 rounded-lg space-y-2'>
                  <p className='text-xs font-medium text-stone-500'>
                    Nomor Virtual Account (
                    {lastOrder.paymentDetails?.accountName})
                  </p>
                  <div className='flex justify-between items-center'>
                    <span className='text-xl font-extrabold text-orange-700'>
                      {lastOrder.paymentDetails?.vaNumber}
                    </span>
                    <Button variant='outline' className='py-1 px-3 text-sm'>
                      Salin
                    </Button>
                  </div>
                  <p className='text-xs text-red-500'>
                    Batas Waktu Pembayaran: **
                    {lastOrder.paymentDetails?.expiryTime}**
                  </p>
                </div>
              )}

              {isEwallet && (
                <div className='bg-orange-50 p-4 rounded-lg text-center'>
                  <p className='text-sm font-medium text-orange-700 mb-2'>
                    Segera buka aplikasi GoPay/E-Wallet Anda.
                  </p>
                  <p className='text-xs text-stone-600'>
                    Anda akan diminta untuk scan QRIS atau konfirmasi pembayaran
                    dalam waktu **{lastOrder.paymentDetails?.expiryTime}**.
                  </p>
                </div>
              )}

              {isCod && (
                <div className='bg-green-50 p-4 rounded-lg text-center'>
                  <p className='text-sm font-medium text-green-700'>
                    Pembayaran Tunai (Cash on Delivery) akan dilakukan saat
                    pesanan tiba.
                  </p>
                  <p className='text-xs text-stone-600 mt-1'>
                    Siapkan uang tunai sebesar{' '}
                    {formatIDR(lastOrder.total + 2500)}.
                  </p>
                </div>
              )}
            </div>

            <div className='flex gap-4 pt-4'>
              <Button onClick={() => setView('shop')} className='flex-1'>
                Belanja Lagi
              </Button>
              <Button
                variant='outline'
                onClick={() => setView('home')}
                className='flex-1'
              >
                Kembali ke Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- ADMIN DASHBOARD ---
  const AdminDashboard = () => {
    // Stats
    const totalSales = orders
      .filter((o) => o.status !== 'Waiting for Payment')
      .reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    const OrderRow = ({ order }: { order: Order }) => {
      const getStatusColor = (status: Order['status']) => {
        switch (status) {
          case 'Paid':
          case 'Completed':
            return 'green';
          case 'Waiting for Payment':
          case 'Pending':
            return 'orange';
          default:
            return 'stone';
        }
      };
      return (
        <tr className='hover:bg-stone-50 transition-colors'>
          <td className='py-3 font-medium'>{order.id}</td>
          <td className='py-3'>{order.customer.name}</td>
          <td className='py-3 text-orange-600 font-bold'>
            {formatIDR(order.total + 2500)}
          </td>
          <td className='py-3'>
            <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
          </td>
        </tr>
      );
    };

    return (
      <div className='flex min-h-screen bg-stone-50'>
        {/* Sidebar */}
        <div className='w-64 bg-white border-r border-stone-200 p-6 hidden md:block'>
          <div className='flex items-center gap-2 mb-10 text-stone-800 font-bold text-xl'>
            <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white'>
              <LayoutDashboard size={18} />
            </div>
            Admin
          </div>
          <div className='space-y-2'>
            <button
              onClick={() => setAdminTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${adminTab === 'overview' ? 'bg-orange-50 text-orange-600' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              <TrendingUp size={18} /> Overview
            </button>
            <button
              onClick={() => setAdminTab('products')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${adminTab === 'products' ? 'bg-orange-50 text-orange-600' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              <Package size={18} /> Products
            </button>
            <button
              onClick={() => setAdminTab('orders')}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${adminTab === 'orders' ? 'bg-orange-50 text-orange-600' : 'text-stone-500 hover:bg-stone-100'}`}
            >
              <ShoppingBag size={18} /> Orders
            </button>
          </div>
          <div className='mt-auto pt-10'>
            <button
              onClick={() => {
                setUser(null);
                setView('home');
              }}
              className='flex items-center gap-2 text-red-500 text-sm font-medium hover:text-red-600'
            >
              <LogOut size={16} /> Exit Admin
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 p-8 overflow-y-auto'>
          <div className='max-w-5xl mx-auto'>
            <div className='flex justify-between items-center mb-8'>
              <h2 className='text-2xl font-bold text-stone-800 capitalize'>
                {adminTab} Dashboard
              </h2>
              <div className='flex items-center gap-3'>
                <div className='text-right'>
                  <p className='text-sm font-bold text-stone-800'>Admin User</p>
                  <p className='text-xs text-stone-400'>Owner</p>
                </div>
                <div className='w-10 h-10 bg-stone-200 rounded-full overflow-hidden'>
                  <img src='https://i.pravatar.cc/100?img=60' alt='admin' />
                </div>
              </div>
            </div>

            {/* Overview Tab */}
            {adminTab === 'overview' && (
              <div className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <Card className='p-6 flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600'>
                      <CreditCard />
                    </div>
                    <div>
                      <p className='text-stone-500 text-sm'>
                        Total Sales (Paid)
                      </p>
                      <h3 className='text-2xl font-bold text-stone-800'>
                        {formatIDR(totalSales)}
                      </h3>
                    </div>
                  </Card>
                  <Card className='p-6 flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600'>
                      <ShoppingBag />
                    </div>
                    <div>
                      <p className='text-stone-500 text-sm'>Total Orders</p>
                      <h3 className='text-2xl font-bold text-stone-800'>
                        {totalOrders}
                      </h3>
                    </div>
                  </Card>
                  <Card className='p-6 flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600'>
                      <Package />
                    </div>
                    <div>
                      <p className='text-stone-500 text-sm'>Products Active</p>
                      <h3 className='text-2xl font-bold text-stone-800'>
                        {products.length}
                      </h3>
                    </div>
                  </Card>
                </div>
                <Card className='p-6'>
                  <h3 className='font-bold text-stone-800 mb-4'>
                    Recent Orders
                  </h3>
                  {orders.length === 0 ? (
                    <p className='text-stone-400 text-sm'>
                      Belum ada order masuk.
                    </p>
                  ) : (
                    <div className='overflow-x-auto'>
                      <table className='w-full text-sm text-left'>
                        <thead className='text-stone-400 font-medium border-b border-stone-100'>
                          <tr>
                            <th className='pb-3'>ID</th>
                            <th className='pb-3'>Customer</th>
                            <th className='pb-3'>Total</th>
                            <th className='pb-3'>Status</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-stone-100'>
                          {orders.slice(0, 5).map((o) => (
                            <OrderRow key={o.id} order={o} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Products Tab */}
            {adminTab === 'products' && (
              <Card className='p-6'>
                <div className='flex justify-between items-center mb-6'>
                  <h3 className='font-bold text-stone-800'>
                    Inventory Management
                  </h3>
                  <Button size='sm'>
                    <Plus size={16} /> Add Product
                  </Button>
                </div>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm text-left'>
                    <thead className='bg-stone-50 text-stone-500 font-medium rounded-lg'>
                      <tr>
                        <th className='p-3 rounded-l-lg'>Product</th>
                        <th className='p-3'>Category</th>
                        <th className='p-3'>Price</th>
                        <th className='p-3'>Stock</th>
                        <th className='p-3 rounded-r-lg'>Action</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-stone-100'>
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className='hover:bg-stone-50 transition-colors'
                        >
                          <td className='p-3 flex items-center gap-3'>
                            <img
                              src={p.image}
                              className='w-10 h-10 rounded-lg object-cover bg-stone-200'
                              alt=''
                            />
                            <span className='font-medium text-stone-800'>
                              {p.name}
                            </span>
                          </td>
                          <td className='p-3 text-stone-500'>{p.category}</td>
                          <td className='p-3 text-stone-800 font-bold'>
                            {formatIDR(p.price)}
                          </td>
                          <td className='p-3'>
                            <Badge color={p.stock < 10 ? 'orange' : 'green'}>
                              {p.stock} {p.unit}
                            </Badge>
                          </td>
                          <td className='p-3 flex gap-2'>
                            <button className='p-2 text-blue-500 hover:bg-blue-50 rounded-lg'>
                              <Settings size={16} />
                            </button>
                            <button className='p-2 text-red-500 hover:bg-red-50 rounded-lg'>
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Orders Tab */}
            {adminTab === 'orders' && (
              <Card className='p-6'>
                <h3 className='font-bold text-stone-800 mb-6'>
                  Order History ({orders.length} Total)
                </h3>
                {orders.length === 0 ? (
                  <div className='text-center py-12 text-stone-400'>
                    No orders yet.
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm text-left'>
                      <thead className='text-stone-400 font-medium border-b border-stone-100'>
                        <tr>
                          <th className='pb-3'>ID</th>
                          <th className='pb-3'>Customer</th>
                          <th className='pb-3'>Total</th>
                          <th className='pb-3'>Status</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-stone-100'>
                        {orders.map((o) => (
                          <OrderRow key={o.id} order={o} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Footer = () => (
    <footer className='bg-white border-t border-stone-100 pt-16 pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid md:grid-cols-4 gap-8 mb-12'>
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white'>
                <ShoppingBag size={16} />
              </div>
              <h2 className='text-xl font-bold text-stone-800'>SegarFarm</h2>
            </div>
            <p className='text-stone-500 max-w-sm leading-relaxed'>
              Platform e-commerce terpercaya untuk kebutuhan protein harian
              Anda. Ayam segar dan telur berkualitas, langsung dari peternakan
              ke dapur Anda.
            </p>
          </div>
          <div>
            <h4 className='font-bold text-stone-800 mb-4'>Produk</h4>
            <ul className='space-y-2 text-stone-500 text-sm'>
              <li className='hover:text-orange-500 cursor-pointer'>
                Telur Ayam Kampung
              </li>
              <li className='hover:text-orange-500 cursor-pointer'>
                Daging Dada Fillet
              </li>
              <li className='hover:text-orange-500 cursor-pointer'>
                Paha Ayam
              </li>
              <li className='hover:text-orange-500 cursor-pointer'>
                Paket Hemat
              </li>
            </ul>
          </div>
          <div>
            <h4 className='font-bold text-stone-800 mb-4'>Bantuan</h4>
            <ul className='space-y-2 text-stone-500 text-sm'>
              <li className='hover:text-orange-500 cursor-pointer'>
                Cara Pemesanan
              </li>
              <li className='hover:text-orange-500 cursor-pointer'>
                Info Pengiriman
              </li>
              <li className='hover:text-orange-500 cursor-pointer'>
                Hubungi Kami
              </li>
              <li
                className='cursor-pointer text-orange-600 font-medium'
                onClick={() => {
                  setUser('admin');
                  setView('admin');
                }}
              >
                Admin Login Demo
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-stone-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400'>
          <p>
            © {new Date().getFullYear()} SegarFarm Indonesia. All rights
            reserved.
          </p>
          <div className='flex gap-4'>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );

  // --- MAIN RENDER ---
  if (view === 'admin' && user === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className='min-h-screen bg-white font-sans text-stone-800 selection:bg-orange-100'>
      <Navbar />
      <main className='min-h-screen pb-20'>
        {/* Render Home or Shop based on query and view state */}
        {view === 'home' && searchQuery.length === 0 && <HeroSection />}
        {(view === 'home' || view === 'shop') && <ShopView />}

        {view === 'product_detail' && <ProductDetailView />}
        {view === 'cart' && <CartView />}
        {view === 'checkout' && <CheckoutView />}
        {view === 'success' && <SuccessView />}
      </main>
      <Footer />
    </div>
  );
}
