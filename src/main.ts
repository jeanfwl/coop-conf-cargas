import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/pt';
import localeBrExtra from '@angular/common/locales/extra/pt';

registerLocaleData(localeBr, 'pt-BR', localeBrExtra);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
