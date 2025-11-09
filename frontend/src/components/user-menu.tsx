import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, ChevronDown, BookOpen, Trophy, Plus, GraduationCap, LogOut } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Role: <span className="capitalize font-medium">{user.role}</span>
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/courses')}>
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Courses
        </DropdownMenuItem>
        {user.role === 'student' && user.level && (
          <DropdownMenuItem disabled>
            <Trophy className="mr-2 h-4 w-4" />
            Level: <span className="capitalize ml-1">{user.level}</span>
          </DropdownMenuItem>
        )}
        {user.role === 'student' && (
          <DropdownMenuItem onClick={() => navigate('/diagnostic-selection')}>
            <GraduationCap className="mr-2 h-4 w-4" />
            {!user.level ? 'Take Diagnostic Quiz' : 'Retake Diagnostic'}
          </DropdownMenuItem>
        )}
        {user.role === 'teacher' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/create-course')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/create-diagnostic-quiz')}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Create Diagnostic Quiz
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
