// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

// Types for the project data structure
export interface Project {
	id: number;
	name: string;
	description: string;
	icon: string;
	href: string;
	tags: string[];
	status: string;
	display_order?: number;
	created_at?: string;
	updated_at?: string;
}

// Types for profile data structure
export interface Profile {
	name: string;
	intro: string;
	twitter_url: string;
	twitter_label: string;
}