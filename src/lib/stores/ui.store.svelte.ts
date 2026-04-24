/**
 * UI state store using Svelte 5 Runes.
 * Manages theme, sidebar, and application-level UI state.
 */

import type { Theme, SidebarTab, ValidationStatus } from '$lib/types/ui.types';

function createUiStore() {
	let theme = $state<Theme>('light');
	let activeTab = $state<SidebarTab>('json');
	let validationStatus = $state<ValidationStatus>('idle');
	let validationFeedback = $state('');
	let isCopied = $state(false);
	let isLinkCopied = $state(false);

	function initTheme() {
		if (typeof window === 'undefined') return;
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const initialTheme = (savedTheme as Theme) || (prefersDark ? 'dark' : 'light');
		theme = initialTheme;
		applyTheme(initialTheme);
	}

	function applyTheme(t: Theme) {
		if (typeof document === 'undefined') return;
		if (t === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function toggleTheme() {
		const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
		theme = newTheme;
		localStorage.setItem('theme', newTheme);
		applyTheme(newTheme);
	}

	function setActiveTab(tab: SidebarTab) {
		activeTab = tab;
	}

	function setValidation(status: ValidationStatus, feedback: string = '') {
		validationStatus = status;
		validationFeedback = feedback;
	}

	function resetValidation() {
		validationStatus = 'idle';
		validationFeedback = '';
	}

	function flashCopied() {
		isCopied = true;
		setTimeout(() => (isCopied = false), 2000);
	}

	function flashLinkCopied() {
		isLinkCopied = true;
		setTimeout(() => (isLinkCopied = false), 2000);
	}

	return {
		get theme() { return theme; },
		get activeTab() { return activeTab; },
		get validationStatus() { return validationStatus; },
		get validationFeedback() { return validationFeedback; },
		get isCopied() { return isCopied; },
		get isLinkCopied() { return isLinkCopied; },

		initTheme,
		toggleTheme,
		setActiveTab,
		setValidation,
		resetValidation,
		flashCopied,
		flashLinkCopied
	};
}

export const uiStore = createUiStore();
