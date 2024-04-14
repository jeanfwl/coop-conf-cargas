import { CteXmlParserService } from './services/cte-xml-parser.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { OrderListModule } from 'primeng/orderlist';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonModule } from 'primeng/button';
import { TreeModule, TreeNodeDropEvent } from 'primeng/tree';
import { MessageService, PrimeNGConfig, TreeDragDropService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Observable, delay, from, mergeMap, toArray } from 'rxjs';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Carga, Cte, CteXml } from './models/cte-information.type';
import { X2jOptions, XMLParser } from 'fast-xml-parser';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
const parsingOptions = {
  ignoreAttributes: false,
  processEntities: true,
  htmlEntities: true,
  attributeNamePrefix: '',
  numberParseOptions: {
    hex: false,
    skipLike: /\+[0-9]{10}/,
    eNotation: false,
  },
} as X2jOptions;

const currencyFormat = '_-"R$" * #,##0.00_-;-"R$" * #,##0.00_-;_-"R$" * "-"??_-;_-@_-';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ProgressSpinnerModule,
    FileUploadModule,
    DragDropModule,
    ButtonModule,
    TreeModule,
    TooltipModule,
    OverlayPanelModule,
    CalendarModule,
    OrderListModule,
    ToastModule,
    InputTextModule,
    FormsModule,
    MessageModule,
    FloatLabelModule,
    InputNumberModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [TreeDragDropService, MessageService],
})
export class AppComponent implements OnInit {
  filesNode: TreeNode<Cte>[] = [];
  isLoading = false;

  constructor(
    private messageService: MessageService,
    private cteXmlService: CteXmlParserService,
    private config: PrimeNGConfig
  ) {}

  ngOnInit(): void {
    this.config.setTranslation({
      clear: 'Limpar',
      today: 'Hoje',
      dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      monthNames: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ],
      monthNamesShort: [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez',
      ],
    });
  }

  onFilesSelected(event: FileSelectEvent): void {
    const files = Array.from(event.files).slice();
    event.files = [];

    const currentFilesNode = this.filesNode.slice();
    const newFilesNode = files.map((file, i) => {
      return {
        // key: `${currentFilesNode.length + i}`,
        key: crypto.randomUUID(),
        icon: 'pi pi-file',
        label: file.name,
        data: file,
        droppable: false,
      };
    });

    this.isLoading = true;

    const files$: Observable<string[]> = from(files).pipe(
      delay(1000),
      mergeMap((file) => from(file.text())),
      toArray()
    );
    files$.subscribe({
      next: (xmls) => {
        // this.filesNode = currentFilesNode.concat(newFilesNode);

        const ctes = xmls.map((content, i) => {
          const xmlContentParsedAsJSON: CteXml = new XMLParser(parsingOptions).parse(content);
          console.log(i);
          return this.cteXmlService.extractCteXmlInfo(xmlContentParsedAsJSON);
        });

        this.filesNode = ctes.map((cte) => {
          return {
            key: String(crypto.randomUUID()),
            icon: 'pi pi-file',
            label: cte.numero.toString(),
            data: cte,
            droppable: false,
          };
        });
      },
      complete: () => (this.isLoading = false),
    });
  }

  addNodeGroup(): void {
    const dataPagamento = new Date();
    dataPagamento.setDate(dataPagamento.getDate() + 6);
    this.filesNode.push({
      // key: `${this.filesNode.length}`,
      data: {
        dataPagamento,
      } as Carga,
      key: crypto.randomUUID(),
      label: 'Carga',
      icon: 'pi pi-truck',
      droppable: true,
      children: [],
    } as TreeNode);
  }

  generateExcel(): void {
    if (this.filesNode.some((n) => n.children?.length === 0)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erro na validação',
        detail: 'Não pode existir cargas sem nenhum xml agrupado',
      });
    }

    const cargas = this.filesNode.map((file) => {
      if (file.children?.length! > 0) {
        return {
          ...file.data!,
          ctes: <Cte[]>file.children?.map((c) => c.data).filter((c) => c !== undefined),
        } as Carga;
      } else {
        return file.data!;
      }
    });

    this.cteXmlService.createCteExcel(cargas);
  }

  deleteNode(node: TreeNode<File>): void {
    const nodeBkp = { ...node };
    const bkpNodes = this.filesNode.slice();

    if (nodeBkp.droppable) {
      //fazer validacao
      nodeBkp.children = [];
      const keyIndex = bkpNodes.findIndex((n) => n.key === nodeBkp.key);
      if (keyIndex != -1) {
        bkpNodes.splice(keyIndex, 1);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Remoção',
          detail: 'Mova a carga para o topo da lista e tente novamente',
        });
        return;
      }
    } else {
      if (nodeBkp.parent) {
        const nodeParent = bkpNodes.find((n) => n.key === nodeBkp.parent?.key);
        const keyIndex = nodeParent?.children?.findIndex((c) => c.key === nodeBkp.key);
        nodeParent?.children?.splice(keyIndex!, 1);
      } else {
        bkpNodes.splice(
          bkpNodes.findIndex((n) => n.key === nodeBkp.key),
          1
        );
      }
    }

    this.filesNode = bkpNodes.slice();

    this.messageService.add({
      severity: 'success',
      summary: 'Remoção',
      detail: node.droppable ? 'Carga removida com sucesso!' : 'CT-e removido com sucesso!',
    });
  }

  cancel(event: TreeNodeDropEvent) {
    if (event.dragNode?.droppable && event.dropNode?.droppable) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ordenação',
        detail:
          'Cuidado! Não agrupe cargas dentro de cargas, estas serão ignoradas na hora de gerar o excel!',
        life: 6000,
      });
    }
  }
}
