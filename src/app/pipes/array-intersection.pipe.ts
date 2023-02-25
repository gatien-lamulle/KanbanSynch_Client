import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayIntersection'
})
export class ArrayIntersectionPipe implements PipeTransform {

  transform(possibleHolders: Array<string>, existingHolders: Array<string>): Array<string> {
    return possibleHolders.filter(x => !existingHolders.includes(x));
  }

}
