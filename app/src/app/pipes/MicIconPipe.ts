import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'micicon' })
export class MicIconPipe implements PipeTransform {
  transform(status: boolean) {
    return status ? 'mic' : 'mic_off';
  }
}