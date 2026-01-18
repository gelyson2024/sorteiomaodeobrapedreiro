
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, TicketStatus, BuyerInfo } from './types';
import { RAFFLE_INFO, STATUS_COLORS, MOCK_PIX_KEY } from './constants';
import RaffleHeader from './components/RaffleHeader';
import NumberGrid from './components/NumberGrid';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboard from './components/AdminDashboard';
import { CheckCircleIcon, UserIcon, ShieldCheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [lastNotification, setLastNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const ADMIN_PASSWORD = '25254141Ge@';

  // Initialize tickets (000-299)
  useEffect(() => {
    const saved = localStorage.getItem('raffle_tickets');
    if (saved) {
      const parsed = JSON.parse(saved) as Ticket[];
      // Check for expired reservations
      const now = Date.now();
      const updated = parsed.map(t => {
        if (t.status === TicketStatus.RESERVED && t.reservedAt && (now - t.reservedAt > 48 * 60 * 60 * 1000)) {
          return { ...t, status: TicketStatus.AVAILABLE, reservedAt: undefined, buyer: undefined };
        }
        return t;
      });
      setTickets(updated);
    } else {
      const initialTickets: Ticket[] = Array.from({ length: 300 }, (_, i) => ({
        number: i.toString().padStart(3, '0'),
        status: TicketStatus.AVAILABLE
      }));
      setTickets(initialTickets);
    }
  }, []);

  // Save tickets to localStorage
  useEffect(() => {
    if (tickets.length > 0) {
      localStorage.setItem('raffle_tickets', JSON.stringify(tickets));
    }
  }, [tickets]);

  const toggleNumber = (num: string) => {
    const ticket = tickets.find(t => t.number === num);
    if (!ticket || ticket.status !== TicketStatus.AVAILABLE) return;

    setSelectedNumbers(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleCheckout = (buyer: BuyerInfo) => {
    const now = Date.now();
    const updatedTickets = tickets.map(t => {
      if (selectedNumbers.includes(t.number)) {
        return {
          ...t,
          status: TicketStatus.RESERVED,
          reservedAt: now,
          buyer: buyer
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    const reservedNums = [...selectedNumbers];
    setSelectedNumbers([]);
    setIsCheckoutOpen(false);
    setLastNotification({
      message: "Seu número foi RESERVADO por 48 horas. Realize o pagamento via PIX para garantir participação.",
      type: 'info'
    });
    
    // Redirect to WhatsApp for receipt
    const msg = encodeURIComponent(`Olá, reservei o(s) número(s) ${reservedNums.join(', ')} para o sorteio do pedreiro. Segue o comprovante do pagamento.\n\nNome: ${buyer.name}`);
    window.open(`https://wa.me/5537988285460?text=${msg}`, '_blank');
  };

  const confirmPayment = (numbers: string[]) => {
    const updatedTickets = tickets.map(t => {
      if (numbers.includes(t.number)) {
        return { ...t, status: TicketStatus.PAID };
      }
      return t;
    });
    setTickets(updatedTickets);
    setLastNotification({
      message: `Pagamento confirmado! Seu(s) número(s) para o sorteio é/são: ${numbers.join(', ')}. Boa sorte!`,
      type: 'success'
    });
  };

  const handleAdminToggle = () => {
    if (isAdminOpen) {
      setIsAdminOpen(false);
      setIsAdminAuthenticated(false);
      setAdminPasswordInput('');
    } else {
      setIsAdminOpen(true);
    }
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
    } else {
      alert('Senha incorreta!');
      setAdminPasswordInput('');
    }
  };

  const stats = useMemo(() => {
    return {
      available: tickets.filter(t => t.status === TicketStatus.AVAILABLE).length,
      reserved: tickets.filter(t => t.status === TicketStatus.RESERVED).length,
      paid: tickets.filter(t => t.status === TicketStatus.PAID).length
    };
  }, [tickets]);

  return (
    <div className="min-h-screen pb-24">
      <RaffleHeader />

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">Livre ({stats.available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span className="text-sm font-medium">Reservado ({stats.reserved})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium">Pago ({stats.paid})</span>
            </div>
            <button 
              onClick={handleAdminToggle}
              className="text-xs text-gray-400 hover:text-orange-500 flex items-center gap-1"
            >
              <ShieldCheckIcon className="w-4 h-4" /> Admin
            </button>
          </div>

          {lastNotification && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-pulse ${
              lastNotification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
              <p className="text-sm font-medium">{lastNotification.message}</p>
              <button onClick={() => setLastNotification(null)} className="ml-auto text-xs opacity-50 underline">fechar</button>
            </div>
          )}

          <NumberGrid 
            tickets={tickets} 
            selectedNumbers={selectedNumbers} 
            onToggle={toggleNumber} 
          />
        </div>

        {isAdminOpen && !isAdminAuthenticated && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <LockClosedIcon className="w-5 h-5 text-gray-500" /> Acesso Restrito
                </h3>
                <button onClick={handleAdminToggle} className="text-gray-400 hover:text-gray-600 font-bold">X</button>
              </div>
              <form onSubmit={handleAdminAuth} className="space-y-4">
                <input 
                  autoFocus
                  type="password"
                  placeholder="Digite a senha"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition"
                >
                  Entrar
                </button>
              </form>
            </div>
          </div>
        )}

        {isAdminOpen && isAdminAuthenticated && (
          <AdminDashboard 
            tickets={tickets} 
            onConfirm={confirmPayment} 
            onClose={handleAdminToggle}
          />
        )}
      </main>

      {selectedNumbers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl flex items-center justify-between px-6 z-40">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-medium">
              {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número selecionado' : 'números selecionados'}
            </span>
            <span className="text-xl font-bold text-orange-600">
              R$ {(selectedNumbers.length * RAFFLE_INFO.price).toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg active:scale-95"
          >
            Reservar Agora
          </button>
        </div>
      )}

      {isCheckoutOpen && (
        <CheckoutModal 
          selectedNumbers={selectedNumbers}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={handleCheckout}
        />
      )}
    </div>
  );
};

export default App;
