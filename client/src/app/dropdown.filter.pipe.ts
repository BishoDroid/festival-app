import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dropdownFilter'
})
export class DropdownFilterPipe implements PipeTransform {

  transform(items: any[]): any {
    if (!items ) {
      return items;
    }
    return items.filter(item => !item.taken);
  }

}
