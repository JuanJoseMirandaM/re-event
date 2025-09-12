import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
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
export default class SessionsComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  activeFilter = signal<string>('upcoming');
  availableTags = signal<string[]>([]);
  selectedTag = signal<string>(''); // Single tag selection
  selectedTags = signal<string[]>([]); // Keep for compatibility with sessions-list

  ngOnInit() {
    // Handle query params for sessionId
    this.#route.queryParams.subscribe(params => {
      if (params['sessionId']) {
        // This will be handled by the sessions-list component
        // to open the rating panel for the specific session
      }
    });
  }

  onFilterChange(filter: string) {
    this.activeFilter.set(filter);
  }

  onTagChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedTag = target.value;
    this.selectedTag.set(selectedTag);
    
    // Update selectedTags array for compatibility with sessions-list
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
