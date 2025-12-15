import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";

// Manager Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerFinanceiro from "./pages/manager/ManagerFinanceiro";
import NovaBarbearia from "./pages/manager/NovaBarbearia";

// Barbearia Login
import BarbeariaLogin from "./pages/barbearia/BarbeariaLogin";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import Servicos from "./pages/admin/Servicos";
import Barbeiros from "./pages/admin/Barbeiros";
import Financeiro from "./pages/admin/Financeiro";
import Agenda from "./pages/admin/Agenda";
import Horarios from "./pages/admin/Horarios";
import PixConfig from "./pages/admin/PixConfig";
import Configuracoes from "./pages/admin/Configuracoes";

// Booking Pages
import AgendarServico from "./pages/booking/AgendarServico";
import AgendarBarbeiro from "./pages/booking/AgendarBarbeiro";
import AgendarData from "./pages/booking/AgendarData";
import AgendarHorario from "./pages/booking/AgendarHorario";
import Pagamento from "./pages/booking/Pagamento";
import Sucesso from "./pages/booking/Sucesso";

import TesteConexao from "./pages/TesteConexao";
import TesteUpdate from "./pages/TesteUpdate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/teste-conexao" element={<TesteConexao />} />
          <Route path="/teste-update" element={<TesteUpdate />} />
          <Route path="/" element={<Index />} />
          <Route path="/auth/login" element={<Login />} />

          {/* Manager Panel (Developer) */}
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/barbearias" element={<ManagerDashboard />} />
          <Route path="/manager/barbearias/nova" element={<NovaBarbearia />} />
          <Route path="/manager/financeiro" element={<ManagerFinanceiro />} />

          {/* Barbearia Login */}
          <Route path="/barbearia/:slug/login" element={<BarbeariaLogin />} />

          {/* Admin Panel */}
          <Route path="/admin/:slug" element={<AdminDashboard />} />
          <Route path="/admin/:slug/servicos" element={<Servicos />} />
          <Route path="/admin/:slug/barbeiros" element={<Barbeiros />} />
          <Route path="/admin/:slug/financeiro" element={<Financeiro />} />
          <Route path="/admin/:slug/agenda" element={<Agenda />} />
          <Route path="/admin/:slug/horarios" element={<Horarios />} />
          <Route path="/admin/:slug/pix" element={<PixConfig />} />
          <Route path="/admin/:slug/configuracoes" element={<Configuracoes />} />

          {/* Booking Flow */}
          <Route path="/agendar/:slug" element={<AgendarServico />} />
          <Route path="/agendar/:slug/barbeiro" element={<AgendarBarbeiro />} />
          <Route path="/agendar/:slug/data" element={<AgendarData />} />
          <Route path="/agendar/:slug/horario" element={<AgendarHorario />} />
          <Route path="/agendar/:slug/pagamento" element={<Pagamento />} />
          <Route path="/agendar/:slug/sucesso" element={<Sucesso />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
