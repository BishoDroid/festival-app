import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: 'tabletsFilter'
})
export class TabletsFilterPipe implements PipeTransform {

    transform(items: any[], filter: Object): any {
       return null;
    }

}
