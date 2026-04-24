/**
 * UI-specific types for the application interface.
 */

export type Theme = 'light' | 'dark';

export type SidebarTab = 'json' | 'features' | 'layers' | 'help';

export type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid';

export interface ToastMessage {
	readonly title: string;
	readonly description?: string;
	readonly variant?: 'default' | 'destructive';
	readonly duration?: number;
}
