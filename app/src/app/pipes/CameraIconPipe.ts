import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cameraicon' })
export class CameraIconPipe implements PipeTransform {
  transform(status: boolean) {
    return status ? 'videocam' : 'videocam_off';
  }
}