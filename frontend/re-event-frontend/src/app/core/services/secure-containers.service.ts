import {ComponentRef, Injectable, Type, ViewContainerRef} from '@angular/core';

@Injectable({ providedIn: 'root'})
export class SecureContainersService {
  readonly #viewContainers = new Map<string, ViewContainerRef>();

  register(name: string, viewContainerRef: ViewContainerRef): void {
    this.#viewContainers.set(name, viewContainerRef);
  }

  unregister(name: string): void {
    this.#viewContainers.delete(name);
  }

  get(name: string): ViewContainerRef | undefined {
    return this.#viewContainers.get(name);
  }

  createComponent<T>(name: string, componentType: Type<T>): ComponentRef<T> {
    const viewContainerRef = this.get(name);
    if (!viewContainerRef) {
      throw new Error(`View container for component ${name} not found`);
    }
    return viewContainerRef.createComponent(componentType);
  }
}
