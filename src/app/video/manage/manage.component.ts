import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';
@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modalService: ModalService
  ) {
    this.sort$ = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    });
    this.clipService.getUserClips(this.sort$).subscribe((docs) => {
      this.clips = [];

      docs.forEach((doc) => {
        this.clips.push({
          docId: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  async sort(event: Event) {
    const { value } = event.target as HTMLSelectElement;

    // await this.router.navigateByUrl(`/manage?sort=${value}`);
    await this.router.navigate([], {
      queryParams: {
        sort: value,
      },
    });
  }

  openModal($event: Event, clip: IClip) {
    $event.preventDefault();

    this.modalService.toggleModal('editClip');
    this.activeClip = clip;
  }

  update(activeClip: IClip) {
    this.clips.forEach((clip, index) => {
      if (clip.docId === activeClip.docId) {
        this.clips[index].title = activeClip.title;
      }
    });
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();

    this.clipService.deleteClip(clip);

    this.clips.forEach((element, index) => {
      if (element.docId === clip.docId) {
        this.clips.splice(index, 1);
      }
    });
  }

  async copyToClipboard($event: Event, docId: string | undefined) {
    $event.preventDefault();

    if (!docId) {
      return;
    }

    const url = `${location.origin}/clip/${docId}`;

    await navigator.clipboard.writeText(url);

    alert('Link Copied!')
  }
}
