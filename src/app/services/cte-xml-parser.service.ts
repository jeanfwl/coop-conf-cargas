import { Injectable } from '@angular/core';
import { Cte, CteXml, Nfe } from '../models/cte-information.type';
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
    const nfes = this.getCteInvoices(infCte.infCTeNorm.infDoc.infNFe);

    return {
      numero: infCte.ide.nCT,
      dataEmissao: emissionDate,
      origem: infCte.ide.xMunIni,
      destino: infCte.ide.xMunFim,
      carga: loadCode,
      motorista: driverName,
      valorFrete: infCte.vPrest.vRec,
      valorIcms: infCte.imp.ICMS?.ICMS00?.vICMS ?? 0,
      valorCarga: infCte.infCTeNorm.infCarga.vCarga,
      produto: infCte.infCTeNorm.infCarga.proPred,
      notas: nfes,
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

  createCteExcel(cargas: Cte[][]): void {
    let excelRow = 1;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('COOP');
    console.log('LINHA INICIAL', excelRow);

    cargas.forEach((ctes, index) => {
      const ctesCarga = ctes.length;
      excelRow = index === 0 ? excelRow : excelRow + 1;
      console.log('LINHA CARGA', excelRow);
      const [totalFrete, totalIcms, totalCarga] = ctes.reduce(
        (totais, cte) => {
          totais[0] += cte.valorFrete;
          totais[1] += cte.valorIcms;
          totais[2] += cte.valorCarga;
          return totais;
        },
        [0, 0, 0]
      );
      const rows = this.generateExcelMergedRows(ctes);
      worksheet.addRows(rows);
      console.log(rows);

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

      ctes.forEach((cte, i) => {
        excelRow = i === 0 ? excelRow : excelRow + i;
        // VALORES
        const valorCargaCell = worksheet.getCell(`T${excelRow}`);
        valorCargaCell.value = totalCarga;
        valorCargaCell.numFmt = currencyFormat;

        worksheet.getCell(`C${excelRow}`).numFmt = currencyFormat;
        worksheet.getCell(`Q${excelRow}`).value = cte.contrato;
        worksheet.getCell(`R${excelRow}`).value = cte.dataPagamento;
        worksheet.getCell(`S${excelRow}`).value = cte.cheque;
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
          worksheet.getCell(`K${excelRow}`).value = { formula: `SUM(I${excelRow}-J${excelRow})*0.03` };

          worksheet.getCell(`L${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`L${excelRow}`).value = { formula: `SUM(I${excelRow}-J${excelRow})*0.97` };

          worksheet.getCell(`M${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`M${excelRow}`).value = { formula: `L${excelRow}*0.04` };

          worksheet.getCell(`N${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`N${excelRow}`).value = { formula: `L${excelRow}*0.005` };

          worksheet.getCell(`P${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`P${excelRow}`).value = {
            formula: `SUM(L${excelRow})-(M${excelRow}+N${excelRow}+O${excelRow})`,
          };

          worksheet.getCell(`U${excelRow}`).numFmt = currencyFormat;
          worksheet.getCell(`U${excelRow}`).value = {
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

    // Definindo as mesclagens

    //   worksheet.getCell(`B1`).numFmt = 'dd/mmm';
    //   for (const index of Array.from({ length: qtdCtes }).map((_, i) => i)) {
    //     worksheet.getCell(`C${index + 1}`).numFmt = currencyFormat;
    //   }

    //   worksheet.getCell(`I1`).numFmt = currencyFormat;

    //   worksheet.getCell(`J1`).numFmt = currencyFormat;
    //   worksheet.getCell(`O1`).value = 0;
    //   worksheet.getCell(`O1`).numFmt = currencyFormat;

    //   //FORMULAS
    //   worksheet.getCell(`K1`).numFmt = currencyFormat;
    //   worksheet.getCell(`K1`).value = { formula: `SUM(I$${excelRow}-J$${excelRow})*0.03` };

    //   worksheet.getCell(`L1`).numFmt = currencyFormat;
    //   worksheet.getCell(`L1`).font = {
    //     bold: true,
    //     italic: true,
    //     size: 10,
    //   };
    //   worksheet.getCell(`L1`).value = { formula: `SUM(I$${excelRow}-J$${excelRow})*0.97` };

    //   worksheet.getCell(`M1`).numFmt = currencyFormat;
    //   worksheet.getCell(`M1`).value = { formula: `L$${excelRow}*0.04` };

    //   worksheet.getCell(`N1`).numFmt = currencyFormat;
    //   worksheet.getCell(`N1`).value = { formula: `L$${excelRow}*0.005` };
    //   worksheet.getCell(`N1`).font = {
    //     bold: true,
    //     italic: true,
    //     size: 10,
    //   };

    //   worksheet.getCell(`P1`).numFmt = currencyFormat;
    //   worksheet.getCell(`P1`).value = {
    //     formula: `SUM(L$${excelRow})-(M$${excelRow}+N$${excelRow}+O$${excelRow})`,
    //   };
    //   worksheet.getCell(`P1`).font = {
    //     bold: true,
    //     italic: true,
    //     size: 10,
    //   };

    //   worksheet.getCell(`U1`).numFmt = currencyFormat;
    //   worksheet.getCell(`U1`).value = {
    //     formula: `SUM(T$${excelRow}*0.00015)*0.0738+(T$${excelRow}*0.00015)`,
    //   };

    //   worksheet.getCell(`X1`).numFmt = currencyFormat;
    //   worksheet.getCell(`X1`).value = {
    //     formula: `SUM(W$${excelRow}*0.04)*(7.38%)+(W$${excelRow}*0.04%)`,
    //   };

    //   worksheet.getCell(`Y1`).numFmt = currencyFormat;
    //   worksheet.getCell(`Y1`).value = {
    //     formula: `SUM(P$${excelRow}+X$${excelRow})-(U$${excelRow}+W$${excelRow})`,
    //   };
    //   worksheet.getCell(`Y1`).font = {
    //     bold: true,
    //     italic: true,
    //     size: 10,
    //   };
    // } else {

    // }

    // Escrevendo o arquivo Excel
    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        // Cria um Blob a partir do buffer
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        // Cria um URL para o Blob
        const url = window.URL.createObjectURL(blob);
        // Cria um link para o URL
        const link = document.createElement('a');
        link.href = url;
        // Define o nome do arquivo
        link.download = 'ctes.xlsx';
        // Adiciona o link ao documento
        // Simula um clique no link para iniciar o download
        link.click();
        // Limpa o URL criado
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Erro ao gerar a planilha:', error);
      });
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
        // cte.valorFrete,
        // cte.valorIcms,
      ];
    });
  }

  generateExcelMergedRows(ctes: Cte[]): (string | number | Date)[][] {
    const cteRows = this.generateExcelRows(ctes);

    // cteRows.forEach((row) => row.splice(row.length - 2, 2));

    return cteRows;
  }
}