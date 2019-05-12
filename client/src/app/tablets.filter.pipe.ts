import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'tabletsFilter'
})
export class TabletsFilterPipe implements PipeTransform {

    transform(items: any[], filter: String): any {
        if (!items || !filter) {
            return items;
        }
        return items.filter(item => item.type.indexOf(filter) === -1);
    }

}
