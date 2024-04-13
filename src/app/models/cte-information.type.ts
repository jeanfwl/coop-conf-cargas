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
};

export type CteXml = {
  cteProc: {
    CTe: {
      infCte: CteInformation;
    };
  };
};

export type Cte = {
  motorista: string;
  carga: string;
  dataEmissao: Date;
  valorFrete: number;
  valorIcms: number;
  valorCarga: number;
  produto: string;
  notas: string | number;
  origem: string;
  destino: string;
  numero: number;
  cheque?: number;
  dataPagamento?: Date;
  contrato?: number;
};
