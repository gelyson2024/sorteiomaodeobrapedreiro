
import React from 'react';
import { RaffleInfo } from './types';

export const RAFFLE_INFO: RaffleInfo = {
  title: "🔨 SORTEIO – 1 SEMANA DE MÃO DE OBRA DE PEDREIRO",
  prize: "1 semana completa de mão de obra (Segunda a sexta, das 07h às 16h)",
  price: 30.00,
  rules: [
    "O prêmio refere-se exclusivamente à mão de obra",
    "Ajudante NÃO incluso (por conta do ganhador)",
    "Material por conta do ganhador",
    "Serviço para obras residenciais",
    "Agendamento após o sorteio",
    "Cidades inclusas: Divinópolis, Felixlândia e Ermida",
    "Demais cidades: combinar despesas de deslocamento",
    "Sorteio pelo sorteador.com.br",
    "Ao vivo pelo Instagram: @gelyson_thales",
    "Data: 1 de Maio - Dia do Trabalhador às 10h"
  ]
};

export const MOCK_PIX_KEY = "37999363068";

export const STATUS_COLORS = {
  AVAILABLE: 'bg-green-500 hover:bg-green-600 text-white',
  RESERVED: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  PAID: 'bg-red-500 text-white cursor-not-allowed',
  UNAVAILABLE: 'bg-gray-400 text-white cursor-not-allowed'
};
