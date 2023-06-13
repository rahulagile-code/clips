import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { forkJoin, last, switchMap, combineLatest } from 'rxjs';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  alertColor = 'blue';
  showAlert = false;
  alertMsg = 'Please wait! Your clip is being uploaded.';
  isSubmission: boolean = false;
  isDragover: boolean = false;
  file: File | null = null;
  nextStep: boolean = false;
  percentage: number = 0;
  showPercentage: boolean = false;
  user: firebase.User | null = null;
  taskUpload?: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenShot: string = '';
  screenshotTask?: AngularFireUploadTask;

  title = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });

  form = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenShot = this.screenshots[0];
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  ngOnDestroy(): void {
    this.taskUpload?.cancel();
  }

  async onSubmit() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! video is uploading.';
    this.alertColor = 'blue';
    this.isSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromUrl(
      this.selectedScreenShot
    );

    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.taskUpload = this.storage.upload(clipPath, this.file);
    const clipRefrence = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRefrence = this.storage.ref(screenshotPath);

    combineLatest([
      this.taskUpload.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = total / 200;
    });

    forkJoin([
      this.taskUpload.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([
            clipRefrence.getDownloadURL(),
            screenshotRefrence.getDownloadURL(),
          ])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipUrl,
            screenshotUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            screenshotFileName: `${clipFileName}.png`
          };

          const clipDocumentRefrence = await this.clipsService.createClip(clip);

          this.alertMsg =
            'Success! Your clip is now ready to share with the world.';
          this.alertColor = 'green';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['clip', `${clipDocumentRefrence.id}`]);
          }, 1000);
        },
        error: () => {
          this.alertMsg = 'Upload failed! Please try again later.';
          this.alertColor = 'red';
          this.showPercentage = false;
          this.isSubmission = false;
        },
      });
  }
}
