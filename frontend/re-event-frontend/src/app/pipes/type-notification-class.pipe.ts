import {Pipe, PipeTransform} from '@angular/core';
import {typeNotificationClassMap} from '../utils/type-notification-class';
import {NotificationType} from '../core/notification.interface';

@Pipe({
  name: 'typeNotificationClass'
})
export class TypeNotificationClassPipe implements PipeTransform {
  #defaultClass = 're-icon-notification';

  transform(value: NotificationType): string {
    return typeNotificationClassMap.get(value) ?? this.#defaultClass;
  }
}
