import { Injectable } from '@angular/core';
import { Carga, Cte, CteXml, Desconto, Nfe, Produtos } from '../models/cte-information.type';
import { ComplementObservation, Complements } from '../models/complements.type';
import * as ExcelJS from 'exceljs';

const currencyFormat = '_-"R$" * #,##0.00_-;-"R$" * #,##0.00_-;_-"R$" * "-"??_-;_-@_-';

@Injectable({
  providedIn: 'root',
})
export class CteXmlParserService {
  extractCteXmlInfo(cteXml: CteXml): Cte {
    const infCte = cteXml.cteProc.CTe.infCte;

    const emissionDate = new Date(infCte.ide.dhEmi);
    const [loadCode, driverName] = this.getCteObservationData(infCte.compl);
    const nfes = this.getCteInvoices(infCte.infCTeNorm?.infDoc.infNFe ?? []);
    const dataPagamento = new Date();
    dataPagamento.setDate(dataPagamento.getDate() + 6);

    return {
      numero: infCte.ide.nCT,
      dataEmissao: emissionDate,
      origem: infCte.ide.xMunIni,
      destino: infCte.ide.xMunFim,
      carga: loadCode,
      motorista: driverName,
      isComplemento: !!infCte.infCteComp,
      isRetorno: infCte.ide.xMunFim.toUpperCase() === 'MALLET',
      valorFrete: infCte.vPrest.vRec,
      valorIcms: infCte.imp.ICMS?.ICMS00?.vICMS ?? 0,
      valorCarga: infCte.infCTeNorm?.infCarga.vCarga ?? 0,
      produto: infCte.infCTeNorm?.infCarga.proPred as Produtos,
      notas: nfes,
      dataPagamento: dataPagamento,
      descontos: [],
    };
  }

  getCteDriverName(observations: ComplementObservation[]): string {
    const driverRegex = /Subcontr:\s\d+-([^-]+)\s-/;
    const driverObsValue =
      (observations.find((obs) => obs.xCampo === 'Subcontratado:')?.xTexto as string) ?? '';

    const driverRegexMatch = driverObsValue.match(driverRegex);
    return driverRegexMatch ? driverRegexMatch[1].trim() : 'NÃO ENCONTRADO';
  }

  getCteLoadCode(observation: string): string {
    const loadRegex = /(?<=carga:?\s?)\d+/gi;
    const loadRegexMatch = observation.match(loadRegex);

    return loadRegexMatch ? loadRegexMatch[0] : 'NÃO ENCONTRADO';
  }

  getCteObservationData(complements: Complements) {
    return [this.getCteLoadCode(complements.xObs), this.getCteDriverName(complements.ObsCont)];
  }

  getCteInvoices(nfes: Nfe | Nfe[]): string | number {
    const invoices = [];
    if (Array.isArray(nfes)) {
      invoices.push(...nfes.map((nf) => nf.chave));
    } else {
      invoices.push(nfes.chave);
    }

    const invoicesConverted = invoices.map((nf) => +nf.slice(25, 34).replace(/^0+/, ''));

    return invoicesConverted.length === 1 ? +invoicesConverted[0] : invoicesConverted.join(', ');
  }

  createCteExcel(itens: (Cte | Carga)[]): void {
    let excelRow = 1;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('COOP');

    itens.forEach((item, index) => {
      let ctesCarga = 1;
      let totalFrete = 0,
        totalIcms = 0,
        totalCarga = 0;

      let dataPagamento,
        contrato,
        cheques: string[] = [],
        descontos: Desconto[] = [],
        produtos: Produtos[] = [],
        motorista,
        isComplemento = false,
        isRetorno = false;

      let ctes: Cte[];
      if (this.isCarga(item)) {
        const carga = <Carga>item;
        ctes = carga.ctes.slice();
        ctesCarga = carga.ctes.length;

        [dataPagamento, contrato, cheques, motorista, descontos, produtos, isComplemento, isRetorno] = [
          carga.dataPagamento,
          carga.contrato,
          carga.cheques as string[],
          carga.motorista,
          carga.descontos as Desconto[],
          carga.ctes.map((cte) => cte.produto),
          carga.ctes.some((cte) => cte.isComplemento),
          carga.ctes.some((cte) => cte.isRetorno),
        ];
        [totalFrete, totalIcms, totalCarga] = carga.ctes.reduce(
          (totais, cte) => {
            totais[0] += cte.valorFrete;
            totais[1] += cte.valorIcms;
            totais[2] += cte.valorCarga;
            return totais;
          },
          [0, 0, 0]
        );
      } else {
        const cte = <Cte>item;
        ctes = [cte];
        [dataPagamento, contrato, cheques, motorista, descontos, produtos, isComplemento, isRetorno] = [
          cte.dataPagamento,
          cte.contrato,
          cte.cheques as string[],
          cte.motorista,
          cte.descontos as Desconto[],
          [cte.produto],
          cte.isComplemento,
          cte.isRetorno,
        ];
        [totalFrete, totalIcms, totalCarga] = [cte.valorFrete, cte.valorIcms, cte.valorCarga];
      }

      // padrão ter 3% de taxa, caso for retorno e os produtos forem celulose e bobina, mantém a taxa, senão, remove
      let taxaCoop: number | null = 0.03;
      if (
        isRetorno &&
        (produtos.includes(Produtos.CELULOSE) || produtos.includes(Produtos.BOBINA)) === false
      ) {
        taxaCoop = null;
      }

      descontos = descontos
        .filter((desconto) => desconto.descricao && desconto.preco)
        .sort((a, b) => a.descricao.localeCompare(b.descricao));

      excelRow = index === 0 ? excelRow : excelRow + 1;

      const rows = this.generateExcelMergedRows(ctes);
      worksheet.addRows(rows);

      worksheet.eachRow((row) => {
        row.font = {
          size: 10,
        };
        Array.from({ length: 25 }).forEach((_, i) => {
          const cell = row.getCell(i + 1);
          cell.border = {
            top: { style: 'double', color: { argb: '000' } },
            left: { style: 'double', color: { argb: '000' } },
            bottom: { style: 'double', color: { argb: '000' } },
            right: { style: 'double', color: { argb: '000' } },
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F4B084' },
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center',
          };
        });
      });

      let mergesV2 = [];

      let mergeCarga = ctesCarga === 1 ? 0 : ctesCarga - 1;
      mergesV2 = [
        { start: { row: excelRow, col: 1 }, end: { row: excelRow + mergeCarga, col: 1 } }, // Merge A1 to A(n)
        { start: { row: excelRow, col: 2 }, end: { row: excelRow + mergeCarga, col: 2 } }, // Merge B1 to B(n)
        { start: { row: excelRow, col: 4 }, end: { row: excelRow + mergeCarga, col: 4 } }, // Merge D1 to D(n)
        { start: { row: excelRow, col: 6 }, end: { row: excelRow + mergeCarga, col: 6 } }, // Merge F1 to F(n)
        ...Array.from({ length: 17 }).map((_, i) => {
          return {
            start: { row: excelRow, col: i + 9 },
            end: { row: excelRow + mergeCarga, col: i + 9 },
          };
        }),
      ];
      mergesV2.forEach((merge) =>
        worksheet.mergeCells(merge.start.row, merge.start.col, merge.end.row, merge.end.col)
      );

      ctes.forEach((_, i) => {
        excelRow = i === 0 ? excelRow : excelRow + 1;
        // VALORES
        const valorCargaCell = worksheet.getCell(`T${excelRow}`);
        valorCargaCell.value = totalCarga;
        valorCargaCell.numFmt = currencyFormat;

        worksheet.getCell(`A${excelRow}`).value = motorista;
        worksheet.getCell(`C${excelRow}`).numFmt = currencyFormat;
        worksheet.getCell(`R${excelRow}`).numFmt = 'dd/mmm';

        worksheet.getCell(`Q${excelRow}`).value = contrato;
        worksheet.getCell(`R${excelRow}`).value = dataPagamento;
        worksheet.getCell(`S${excelRow}`).value =
          cheques.length === 1 ? +cheques[0] : cheques.join(' - ');

        worksheet.getCell(`V${excelRow}`).value = descontos
          .map((d) => d.descricao.toUpperCase())
          .join(', ');
        worksheet.getCell(`W${excelRow}`).value = descontos
          .map((d) => +d.preco!)
          .reduce((it, acc) => {
            return it + acc;
          }, 0);
        worksheet.getCell(`W${excelRow}`).numFmt = currencyFormat;

        // Se nao for mesclagem
        if (!(ctesCarga > 1 && i > 0)) {
          worksheet.getCell(`B${excelRow}`).numFmt = 'dd/mmm';
          worksheet.getCell(`I${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`I${excelRow}`).value = totalFrete;

          worksheet.getCell(`J${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`J${excelRow}`).value = totalIcms;
          worksheet.getCell(`O${excelRow}`).value = 0;
          worksheet.getCell(`O${excelRow}`).numFmt = currencyFormat;

          //FORMULAS
          worksheet.getCell(`K${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`K${excelRow}`).value = {
            formula: `(I${excelRow}-J${excelRow})${taxaCoop ? `*${taxaCoop}` : ''}`,
          };

          worksheet.getCell(`L${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`L${excelRow}`).value = { formula: `(I${excelRow}-J${excelRow})*0.97` };

          worksheet.getCell(`M${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`M${excelRow}`).value = isComplemento ? 0 : { formula: `L${excelRow}*0.04` };

          worksheet.getCell(`N${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`N${excelRow}`).value = isComplemento
            ? 0
            : { formula: `L${excelRow}*0.005` };

          worksheet.getCell(`P${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`P${excelRow}`).value = {
            formula: `SUM(L${excelRow})-(M${excelRow}+N${excelRow}+O${excelRow})`,
          };

          worksheet.getCell(`U${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`U${excelRow}`).value = isComplemento
            ? 0
            : {
                formula: `SUM(T${excelRow}*0.00015)*0.0738+(T${excelRow}*0.00015)`,
              };

          worksheet.getCell(`X${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`X${excelRow}`).value = {
            formula: `SUM(W${excelRow}*0.04)*(7.38%)+(W${excelRow}*0.04%)`,
          };

          worksheet.getCell(`Y${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`Y${excelRow}`).value = {
            formula: `SUM(P${excelRow}+X${excelRow})-(U${excelRow}+W${excelRow})`,
          };
        }
      });
    });

    // Escrevendo o arquivo Excel
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        // Cria um Blob a partir do buffer
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cargas.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Erro ao gerar a planilha:', error);
      });
  }

  private isCarga(item: Cte | Carga): boolean {
    return 'ctes' in item;
  }

  cellsConfig = {
    A: {
      numberFormat: currencyFormat,
      alignment: {
        horizontal: 'center',
        vertical: 'middle',
      },
      border: {
        top: { style: 'double', color: { rgb: '000' } },
        left: { style: 'double', color: { rgb: '000' } },
        bottom: { style: 'double', color: { rgb: '000' } },
        right: { style: 'double', color: { rgb: '000' } },
      },
      fill: {},
    },
  };

  generateExcelRows(ctes: Cte[]): (string | number | Date)[][] {
    return ctes.map((cte) => {
      return [
        cte.motorista,
        cte.dataEmissao,
        cte.valorFrete,
        cte.produto,
        cte.notas,
        cte.origem,
        cte.destino,
        cte.numero,
      ];
    });
  }

  generateExcelMergedRows(ctes: Cte[]): (string | number | Date)[][] {
    const cteRows = this.generateExcelRows(ctes);

    // cteRows.forEach((row) => row.splice(row.length - 2, 2));

    return cteRows;
  }
}
