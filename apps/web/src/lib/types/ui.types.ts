/**
 * UI-specific types for the application interface.
 */

export type Theme = 'light' | 'dark';

export type SidebarTab = 'json' | 'features' | 'layers' | 'projects' | 'spatial' | 'help';

export type ValidationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ToastMessage {
	readonly title: string;
	readonly description?: string;
	readonly variant?: 'default' | 'destructive';
	readonly duration?: number;
}
