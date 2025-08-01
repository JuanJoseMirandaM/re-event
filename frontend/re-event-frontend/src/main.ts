import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { configureAmplify } from "./app/core/config/amplify-config";

configureAmplify();
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
