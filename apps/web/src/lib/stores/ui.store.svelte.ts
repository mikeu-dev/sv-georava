/**
 * UI state store using Svelte 5 Runes with Class pattern.
 * Manages theme, sidebar, and application-level UI state.
 */
import type { Theme, SidebarTab, ValidationStatus } from '$lib/types/ui.types';

class UiStore {
	theme = $state<Theme>('light');
	activeTab = $state<SidebarTab>('json');
	validationStatus = $state<ValidationStatus>('idle');
	validationFeedback = $state('');
	isCopied = $state(false);
	isLinkCopied = $state(false);
	sidebarCollapsed = $state(false);

	constructor() {
		this.initTheme();
	}

	initTheme() {
		if (typeof window === 'undefined') return;
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initialTheme = (savedTheme as Theme) || (prefersDark ? 'dark' : 'light');
		this.theme = initialTheme;
		this.applyTheme(initialTheme);
	}

	applyTheme(t: Theme) {
		if (typeof document === 'undefined') return;
		if (t === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	toggleTheme() {
		const newTheme: Theme = this.theme === 'light' ? 'dark' : 'light';
		this.theme = newTheme;
		localStorage.setItem('theme', newTheme);
		this.applyTheme(newTheme);
	}

	setActiveTab(tab: SidebarTab) {
		this.activeTab = tab;
	}

	setValidation(status: ValidationStatus, feedback: string = '') {
		this.validationStatus = status;
		this.validationFeedback = feedback;
	}

	resetValidation() {
		this.validationStatus = 'idle';
		this.validationFeedback = '';
	}

	flashCopied() {
		this.isCopied = true;
		setTimeout(() => (this.isCopied = false), 2000);
	}

	flashLinkCopied() {
		this.isLinkCopied = true;
		setTimeout(() => (this.isLinkCopied = false), 2000);
	}

	toggleSidebar() {
		this.sidebarCollapsed = !this.sidebarCollapsed;
	}
}

export const uiStore = new UiStore();
