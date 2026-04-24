/**
 * Undo/Redo history store using Svelte 5 Runes.
 * Manages a bounded stack of past and future states.
 */

import { UNDO_HISTORY_LIMIT } from '$lib/config/constants';

function createHistoryStore<T>(initialState: T) {
	let current = $state<T>(initialState);
	let past = $state<T[]>([]);
	let future = $state<T[]>([]);

	const canUndo = $derived(past.length > 0);
	const canRedo = $derived(future.length > 0);

	function set(newState: T) {
		if (newState === current) return;

		const prev = current;
		const newPast = [...past, prev];
		past = newPast.length > UNDO_HISTORY_LIMIT ? newPast.slice(1) : newPast;
		current = newState;
		future = [];
	}

	function undo(): T | undefined {
		if (past.length === 0) return undefined;

		const previous = past[past.length - 1];
		const newPast = past.slice(0, past.length - 1);

		future = [current, ...future];
		past = newPast;
		current = previous;

		return previous;
	}

	function redo(): T | undefined {
		if (future.length === 0) return undefined;

		const next = future[0];
		const newFuture = future.slice(1);

		past = [...past, current];
		future = newFuture;
		current = next;

		return next;
	}

	function reset(newState: T) {
		current = newState;
		past = [];
		future = [];
	}

	return {
		get state() { return current; },
		get canUndo() { return canUndo; },
		get canRedo() { return canRedo; },
		set,
		undo,
		redo,
		reset
	};
}

export { createHistoryStore };
