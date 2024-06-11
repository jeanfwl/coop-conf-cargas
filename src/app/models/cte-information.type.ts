import { Complements } from './complements.type';
import { EmissionIdentification } from './emission-identification.type';

export type Nfe = {
  chave: string;
};

type CteInformation = {
  ide: EmissionIdentification;
  compl: Complements;
  vPrest: {
    vTPrest: number;
    vRec: number;
  };
  imp: {
    ICMS: {
      ICMS00: {
        pICMS: number;
        vICMS: number;
      };
    };
  };
  infCTeNorm: {
    infCarga: {
      vCarga: number;
      proPred: string;
    };
    infDoc: {
      infNFe: Nfe[] | Nfe;
    };
  };
  infCteComp: {
    chCTe: string;
  };
};

export type CteXml = {
  cteProc: {
    CTe: {
      infCte: CteInformation;
    };
  };
};

export enum Produtos {
  APARAS = 'APARAS DE PAPEL',
  CELULOSE = 'CELULOSE',
  ROLOS = 'ROLOS',
  PAPEL_HIGIENICO = 'PAPEL HIGIENICO',
  BOBINA = 'BOBINA',
}

export type Cte = {
  motorista: string;
  carga: string;
  dataEmissao: Date;
  valorFrete: number;
  valorIcms: number;
  valorCarga: number;
  produto: Produtos;
  notas: string | number;
  origem: string;
  destino: string;
  numero: number;
  cheques?: string[];
  dataPagamento?: Date;
  descontos?: Desconto[];
  contrato?: number;
  isComplemento: boolean;
  isRetorno: boolean;
};

export type Desconto = {
  descricao: string;
  preco: number | null;
};

export type Carga = {
  ctes: Cte[];
} & Pick<Cte, 'dataPagamento' | 'motorista' | 'contrato' | 'cheques' | 'descontos'>;
