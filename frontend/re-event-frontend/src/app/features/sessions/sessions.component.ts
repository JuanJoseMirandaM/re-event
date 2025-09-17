import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import SessionsListComponent from './sessions-list/sessions-list.component';

@Component({
  selector: 'app-sessions',
  imports: [
    CommonModule,
    TranslatePipe,
    SessionsListComponent
  ],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class SessionsComponent {
  activeFilter = signal<string>('upcoming');
  availableTags = signal<string[]>([]);
  selectedTag = signal<string>('');
  selectedTags = signal<string[]>([]);

  onFilterChange(filter: string) {
    this.activeFilter.set(filter);
  }

  onTagChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedTag = target.value;
    this.selectedTag.set(selectedTag);

    if (selectedTag) {
      this.selectedTags.set([selectedTag]);
    } else {
      this.selectedTags.set([]);
    }
  }

  onTagsLoaded(tags: string[]) {
    this.availableTags.set(tags);
  }
}
