import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { WorkspaceComponent } from './features/workspace/workspace.component';
import { BoardComponent } from './features/board/board.component';
import { CardDetailComponent } from './features/card/card-detail.component';
import { MyTasksComponent } from './features/my-tasks/my-tasks.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'workspaces',
    component: WorkspaceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'my-tasks',
    component: MyTasksComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'boards/:id',
    component: BoardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cards/:id',
    component: CardDetailComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];
