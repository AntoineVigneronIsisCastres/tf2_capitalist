import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bigvalue'
})
export class BigvaluePipe implements PipeTransform {

  transform(valeur: number, args?: any): unknown {
    const units = ['', 'K', 'M', 'Md', 'T', 'Td'];
    let absValue = Math.abs(valeur);
    let i = 0;
    while (absValue >= 1e3 && i < units.length - 1) {
      absValue /= 1e3;
      i++;
    }
    const formattedValue = "$"+absValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    });
    return formattedValue + units[i];
  }
}