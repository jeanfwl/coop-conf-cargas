import { CteXmlParserService } from './services/cte-xml-parser.service';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { OrderListModule } from 'primeng/orderlist';
import { DragDropModule } from 'primeng/dragdrop';
import { ButtonModule } from 'primeng/button';
import { TreeModule, TreeNodeDropEvent } from 'primeng/tree';
import { ChipsModule } from 'primeng/chips';
import { MessageService, PrimeNGConfig, TreeDragDropService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Observable, delay, from, mergeMap, toArray } from 'rxjs';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Carga, Cte, CteXml, Desconto } from './models/cte-information.type';
import { X2jOptions, XMLParser } from 'fast-xml-parser';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';

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
    ChipsModule,
    InputNumberModule,
    DividerModule,
    SelectButtonModule,
    DialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [TreeDragDropService, MessageService],
})
export class AppComponent implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly cteXmlService = inject(CteXmlParserService);
  private readonly config = inject(PrimeNGConfig);

  filesNode: TreeNode<Cte>[] = [];
  isLoading = false;
  visible = false;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.preventDefault();
    $event.returnValue = true;
  }

  ngOnInit(): void {
    this.scheduleSave();

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

  onLoadSavedData(): void {
    this.visible = true;
    if (window.localStorage.getItem('ctes')) {
      setTimeout(() => {
        const ctes = JSON.parse(window.localStorage.getItem('ctes')!);
        ctes.forEach((cte: any) => {
          cte.data.dataPagamento = new Date(cte.data.dataPagamento);
        });
        this.filesNode = ctes;
        this.visible = false;
      }, 300);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Você ainda não salvou nenhum progresso',
        life: 3000,
      });
    }
  }

  onSaveData(): void {
    if (this.filesNode.length) {
      const filesNodeCleared = this.filesNode.map((f) => {
        if (f.children) {
          f.children.forEach((c) => delete c.parent);
        }
        return f;
      });
      window.localStorage.setItem('ctes', JSON.stringify(filesNodeCleared));
      this.messageService.add({
        severity: 'success',
        summary: 'Alerta',
        detail: 'Progresso atual salvo com sucesso!',
        life: 3000,
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não adianta tentar salvar o que ainda nem fez',
        life: 3000,
      });
    }
  }

  scheduleSave(): void {
    setTimeout(() => {
      this.onSaveData();
      this.scheduleSave();
    }, 300000); // 5 minutes
  }

  onFilesSelected(event: FileSelectEvent): void {
    const files = Array.from(event.files).slice();
    event.files = [];
    this.isLoading = true;

    const files$: Observable<string[]> = from(files).pipe(
      delay(1000),
      mergeMap((file) => from(file.text())),
      toArray()
    );
    files$.subscribe({
      next: (xmls) => {
        const ctes = xmls.map((content) => {
          const xmlContentParsedAsJSON: CteXml = new XMLParser(parsingOptions).parse(content);
          return this.cteXmlService.extractCteXmlInfo(xmlContentParsedAsJSON);
        });

        const currentNodes = this.filesNode.slice();

        const currentCtes = currentNodes
          .flatMap((f) => {
            if (f.droppable) return f.children!;
            else return [f];
          })
          .map((f) => f.data?.numero);

        const newCtes = ctes
          .filter((cte) => currentCtes.includes(cte.numero) === false)
          .sort((a, b) => (+a.numero > +b.numero ? 1 : -1));

        const newNodes = newCtes.map((cte) => {
          cte.cheques = [];
          return {
            key: String(crypto.randomUUID()),
            icon: 'pi pi-file',
            label: cte.numero.toString(),
            data: cte,
            droppable: false,
          };
        });

        if (newNodes.length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Os arquivos selecionados já estão carregados na lista',
            life: 3000,
          });
          return;
        }

        if (newNodes.length !== files.length) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Alerta',
            detail: `${files.length - newNodes.length} arquivos foram ignorados, pois já estão na lista`,
            life: 3000,
          });
        }

        this.filesNode = currentNodes.concat(newNodes);

        this.messageService.add({
          severity: 'success',
          summary: 'Importação',
          detail: 'Arquivos importados com sucesso',
        });
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => (this.isLoading = false),
    });
  }

  addNodeGroupBeforeNode(nodeKey: string): void {
    const nodeIndex = this.filesNode.findIndex((f) => f.key === nodeKey);
    if (nodeIndex !== -1) {
      this.addNodeGroup(nodeIndex);
    }
  }

  addNodeGroup(index: number | null = null): void {
    const dataPagamento = new Date();
    dataPagamento.setDate(dataPagamento.getDate() + 6);
    const newNode = {
      data: {
        dataPagamento,
        cheques: [] as string[],
        descontos: [] as Desconto[],
        taxas: {
          contrato: 0.97,
          cooperativa: 0.03,
        },
      } as Carga,
      key: crypto.randomUUID(),
      label: 'Carga',
      icon: 'pi pi-truck',
      droppable: true,
      children: [],
    } as TreeNode;

    if (index === null) {
      this.filesNode.unshift(newNode);
    } else {
      this.filesNode.splice(index, 0, newNode);
    }
  }

  scrollPage(scrollToTop: boolean): void {
    const scrollConfig = {
      top: scrollToTop ? 0 : document.body.scrollHeight,
      left: 0,
      behavior: 'smooth',
    } as ScrollToOptions;

    window.scroll(scrollConfig);
  }

  onAddNewDesconto(item: Cte | Carga): void {
    item.descontos?.push({
      descricao: '',
      preco: null,
    });
  }

  onRemoveDesconto(item: Cte | Carga, index: number): void {
    item.descontos?.splice(index, 1);
  }

  uppercaseMotorista(motorista: string, item: Cte | Carga): void {
    item.motorista = motorista.trim().toUpperCase();
  }

  generateExcel(): void {
    if (this.filesNode.some((n) => n.children?.length === 0)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alerta',
        detail: 'Não pode existir cargas sem nenhum xml agrupado',
        life: 2000,
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
