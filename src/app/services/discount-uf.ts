import { UF } from '../models/emission-identification.type';

export function getTaxes(ufOrigem: UF, ufDestino: UF): number {
  const indexIni = ufsOrder.indexOf(ufOrigem);
  const indexFim = ufsOrder.indexOf(ufDestino);
  return taxes[indexIni][indexFim];
}

const ufsOrder: UF[] = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
];

const taxes = [
  [
    0.04, 0.3, 0.09, 0.26, 0.3, 0.28, 0.18, 0.26, 0.18, 0.28, 0.22, 0.16, 0.12, 0.24, 0.3, 0.3, 0.26,
    0.24, 0.26, 0.3, 0.05, 0.14, 0.28, 0.26, 0.3, 0.24, 0.23,
  ],
  [
    0.3, 0.04, 0.3, 0.16, 0.06, 0.07, 0.14, 0.11, 0.14, 0.1, 0.11, 0.22, 0.2, 0.14, 0.05, 0.05, 0.08,
    0.18, 0.14, 0.05, 0.26, 0.32, 0.22, 0.2, 0.05, 0.16, 0.12,
  ],
  [
    0.09, 0.3, 0.08, 0.26, 0.3, 0.28, 0.2, 0.28, 0.2, 0.28, 0.24, 0.2, 0.18, 0.24, 0.3, 0.3, 0.24, 0.26,
    0.28, 0.3, 0.09, 0.09, 0.3, 0.28, 0.32, 0.26, 0.2,
  ],
  [
    0.26, 0.16, 0.26, 0.08, 0.16, 0.11, 0.14, 0.22, 0.14, 0.09, 0.2, 0.26, 0.2, 0.09, 0.16, 0.16, 0.09,
    0.22, 0.22, 0.16, 0.22, 0.3, 0.28, 0.24, 0.16, 0.2, 0.13,
  ],
  [
    0.3, 0.05, 0.3, 0.16, 0.05, 0.08, 0.14, 0.08, 0.14, 0.1, 0.09, 0.18, 0.16, 0.12, 0.07, 0.06, 0.08,
    0.14, 0.1, 0.08, 0.26, 0.32, 0.18, 0.16, 0.06, 0.12, 0.11,
  ],
  [
    0.28, 0.07, 0.28, 0.11, 0.08, 0.04, 0.18, 0.14, 0.18, 0.07, 0.16, 0.24, 0.24, 0.1, 0.05, 0.06, 0.07,
    0.22, 0.18, 0.05, 0.26, 0.32, 0.26, 0.24, 0.08, 0.2, 0.13,
  ],
  [
    0.18, 0.14, 0.2, 0.14, 0.14, 0.18, 0.03, 0.09, 0.05, 0.16, 0.06, 0.08, 0.07, 0.12, 0.16, 0.16, 0.18,
    0.09, 0.09, 0.18, 0.14, 0.26, 0.11, 0.09, 0.12, 0.06, 0.07,
  ],
  [
    0.26, 0.11, 0.28, 0.22, 0.08, 0.14, 0.09, 0.03, 0.09, 0.16, 0.05, 0.12, 0.14, 0.2, 0.12, 0.12, 0.14,
    0.09, 0.04, 0.14, 0.22, 0.32, 0.12, 0.1, 0.09, 0.07, 0.14,
  ],
  [
    0.18, 0.14, 0.2, 0.14, 0.14, 0.18, 0.05, 0.09, 0.05, 0.16, 0.06, 0.08, 0.07, 0.12, 0.16, 0.16, 0.18,
    0.09, 0.09, 0.18, 0.14, 0.26, 0.11, 0.09, 0.12, 0.06, 0.08,
  ],
  [
    0.28, 0.1, 0.28, 0.09, 0.1, 0.07, 0.16, 0.16, 0.16, 0.06, 0.16, 0.24, 0.2, 0.09, 0.11, 0.1, 0.07,
    0.24, 0.2, 0.1, 0.24, 0.32, 0.28, 0.26, 0.11, 0.2, 0.11,
  ],
  [
    0.22, 0.11, 0.24, 0.2, 0.09, 0.16, 0.06, 0.05, 0.06, 0.16, 0.04, 0.05, 0.1, 0.18, 0.14, 0.14, 0.14,
    0.07, 0.05, 0.14, 0.2, 0.3, 0.1, 0.08, 0.1, 0.05, 0.13,
  ],
  [
    0.16, 0.22, 0.2, 0.26, 0.18, 0.24, 0.08, 0.12, 0.08, 0.24, 0.09, 0.09, 0.07, 0.18, 0.24, 0.24, 0.2,
    0.07, 0.09, 0.26, 0.14, 0.26, 0.11, 0.09, 0.2, 0.07, 0.14,
  ],
  [
    0.12, 0.2, 0.18, 0.2, 0.16, 0.24, 0.07, 0.14, 0.07, 0.2, 0.1, 0.07, 0.06, 0.14, 0.22, 0.22, 0.18,
    0.11, 0.14, 0.24, 0.09, 0.24, 0.16, 0.12, 0.18, 0.11, 0.1,
  ],
  [
    0.24, 0.14, 0.24, 0.09, 0.12, 0.1, 0.12, 0.2, 0.12, 0.09, 0.18, 0.18, 0.14, 0.08, 0.14, 0.12, 0.09,
    0.2, 0.2, 0.12, 0.2, 0.28, 0.26, 0.22, 0.14, 0.18, 0.12,
  ],
  [
    0.3, 0.05, 0.3, 0.16, 0.07, 0.05, 0.16, 0.12, 0.16, 0.11, 0.14, 0.24, 0.22, 0.14, 0.04, 0.05, 0.08,
    0.2, 0.16, 0.05, 0.28, 0.32, 0.24, 0.22, 0.05, 0.18, 0.13,
  ],
  [
    0.3, 0.05, 0.3, 0.16, 0.06, 0.06, 0.16, 0.12, 0.16, 0.1, 0.14, 0.24, 0.22, 0.12, 0.05, 0.04, 0.08,
    0.2, 0.16, 0.05, 0.26, 0.32, 0.24, 0.24, 0.05, 0.16, 0.12,
  ],
  [
    0.26, 0.08, 0.24, 0.09, 0.08, 0.07, 0.18, 0.14, 0.18, 0.07, 0.14, 0.2, 0.18, 0.09, 0.08, 0.08, 0.06,
    0.2, 0.16, 0.08, 0.22, 0.3, 0.24, 0.22, 0.09, 0.18, 0.1,
  ],
  [
    0.24, 0.18, 0.26, 0.22, 0.14, 0.22, 0.09, 0.09, 0.09, 0.24, 0.07, 0.07, 0.11, 0.2, 0.2, 0.2, 0.2,
    0.03, 0.06, 0.22, 0.2, 0.3, 0.06, 0.04, 0.16, 0.04, 0.18,
  ],
  [
    0.26, 0.14, 0.28, 0.22, 0.1, 0.18, 0.09, 0.04, 0.09, 0.2, 0.05, 0.09, 0.14, 0.2, 0.16, 0.16, 0.16,
    0.06, 0.02, 0.18, 0.22, 0.32, 0.1, 0.08, 0.12, 0.04, 0.14,
  ],
  [
    0.3, 0.05, 0.3, 0.16, 0.08, 0.05, 0.18, 0.14, 0.18, 0.1, 0.14, 0.26, 0.24, 0.12, 0.05, 0.05, 0.08,
    0.22, 0.18, 0.04, 0.28, 0.32, 0.26, 0.24, 0.06, 0.18, 0.13,
  ],
  [
    0.05, 0.26, 0.09, 0.22, 0.26, 0.26, 0.14, 0.22, 0.14, 0.24, 0.2, 0.14, 0.09, 0.2, 0.28, 0.26, 0.22,
    0.2, 0.22, 0.28, 0.04, 0.1, 0.24, 0.22, 0.28, 0.2, 0.2,
  ],
  [
    0.14, 0.32, 0.09, 0.3, 0.32, 0.32, 0.26, 0.32, 0.26, 0.32, 0.3, 0.26, 0.24, 0.28, 0.32, 0.32, 0.3,
    0.3, 0.32, 0.32, 0.1, 0.08, 0.32, 0.32, 0.32, 0.3, 0.24,
  ],
  [
    0.28, 0.22, 0.3, 0.28, 0.18, 0.26, 0.11, 0.12, 0.11, 0.28, 0.1, 0.11, 0.16, 0.26, 0.24, 0.24, 0.24,
    0.06, 0.1, 0.26, 0.24, 0.32, 0.03, 0.04, 0.2, 0.07, 0.2,
  ],
  [
    0.26, 0.2, 0.28, 0.24, 0.16, 0.24, 0.09, 0.1, 0.09, 0.26, 0.08, 0.09, 0.12, 0.22, 0.22, 0.24, 0.22,
    0.04, 0.08, 0.24, 0.22, 0.32, 0.04, 0.03, 0.18, 0.05, 0.18,
  ],
  [
    0.3, 0.05, 0.32, 0.16, 0.06, 0.08, 0.12, 0.09, 0.12, 0.11, 0.1, 0.2, 0.18, 0.14, 0.05, 0.05, 0.09,
    0.16, 0.12, 0.06, 0.28, 0.32, 0.2, 0.18, 0.04, 0.14, 0.11,
  ],
  [
    0.24, 0.16, 0.26, 0.2, 0.12, 0.2, 0.06, 0.07, 0.06, 0.2, 0.05, 0.07, 0.11, 0.18, 0.18, 0.16, 0.18,
    0.04, 0.04, 0.18, 0.2, 0.3, 0.07, 0.05, 0.14, 0.02, 0.14,
  ],
  [
    0.23, 0.12, 0.2, 0.13, 0.11, 0.13, 0.07, 0.14, 0.08, 0.11, 0.13, 0.14, 0.1, 0.12, 0.13, 0.12, 0.1,
    0.18, 0.14, 0.13, 0.2, 0.24, 0.2, 0.18, 0.11, 0.14, 0.06,
  ],
];
